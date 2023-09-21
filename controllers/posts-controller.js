const mongoose = require('mongoose');
const User = require('../models/user.model');
const Post = require('../models/post.model');
const client = require('../helpers/init_redis');


module.exports = {
    makePosts: async (req, res) => {
        try {
            const userId = req.payload.aud; // aud is the id in the database
            const userExists = await User.findOne({ _id: userId });
    
            if (!userExists) {
                return res.status(404).json({ message: 'User not found' });
            }
            const { title, content } = req.body;

            const post = new Post({
                title,
                content,
                user: userId,
            });

            const savedPost = await post.save();
            res.status(201).json(savedPost);

        } catch (error) {
            console.error('Error creating post:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    getPosts: async (req, res) => {
        try {
          const userId = req.payload.aud; // aud is the same as id in this case
      
          // Check if the requested data is in the cache
          const cacheKey = req.url;
          client.get(cacheKey, async (err, cachedData) => {
            if (err) {
              console.error('Redis error:', err);
            }
      
            if (cachedData !== null) {
              // If data is found in the cache, send it as the response
              res.status(200).json(JSON.parse(cachedData));
            } else {
              // If data is not found in the cache, fetch and cache it
              const page = parseInt(req.query.page) || 1;
              const limit = parseInt(req.query.limit) || 5; // Adjust the limit as needed
      
              const options = {
                page,
                limit,
              };
      
              const userPosts = await Post.paginate({ user: userId }, options);
      
              // Cache the fetched data with a one-minute expiration time
              client.SETEX(cacheKey, 60, JSON.stringify(userPosts));
      
              // Send the response
              res.status(200).json(userPosts);
            }
          });
        } catch (error) {
          console.error('Error fetching user posts:', error);
          res.status(500).json({ message: 'Internal server error' });
        }
      },
    getPostById: async (req, res) => {
        try {
            const postId = req.params.postId;
            const post = await Post.findById(postId);
    
            if (!post) {
                return res.status(404).json({ message: 'Post not found' });
            }
    
            res.status(200).json(post);

        } catch (error) {
            console.error('Error fetching post by ID:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },
    updatePost: async (req, res) => {
        try {
            const postId = req.params.postId;
            const post = await Post.findById(postId);
    
            if (!post) {
                return res.status(404).json({ message: 'Post not found' });
            }
    
            if (post.user.toString() !== req.payload.id) {
                return res.status(403).json({ message: 'Permission denied' });
            }

            post.title = req.body.title || post.title;
            post.content = req.body.content || post.content;

            await post.save();
    
            res.status(200).json(post);

        } catch (error) {
            console.error('Error updating post:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },
    deletePost: async (req, res) => {
        try {
            const postId = req.params.postId;
    
            const post = await Post.findById(postId);
    
            if (!post) {
                return res.status(404).json({ message: 'Post not found' });
            }
    
            if (post.user.toString() !== req.payload.aud) {
                return res.status(403).json({ message: 'Permission denied' });
            }
    
            await post.deleteOne();
    
            res.status(200).json({ message: 'Post deleted successfully' });
        } catch (error) {
            console.error('Error deleting post:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },
    search: async (req, res) => {
        try {
            const { title, content } = req.body;
            
            if (!title && !content) {
                return res.status(400).json({ message: 'Search query is required' });
            }

            const searchQuery = {};
            if (title) {
                searchQuery.title = { $regex: title, $options: 'i' };
            }
            if (content) {
                searchQuery.content = { $regex: content, $options: 'i' };
            }

            const searchResults = await Post.find(searchQuery);
    
            res.status(200).json({ results: searchResults });
        } catch (error) {
            console.error('Error performing search:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}