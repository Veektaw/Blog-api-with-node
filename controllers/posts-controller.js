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
            // Extract the authenticated user's ID from the token payload
            const userId = req.payload.aud;
    
            // Extract query parameters for pagination (page and limit)
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10; // Adjust the limit as needed
    
            // Query the database for posts by the user and paginate the results
            const options = {
                page,
                limit,
            };
    
            const userPosts = await Post.paginate({ user: userId }, options);
    
            res.status(200).json(userPosts);
        } catch (error) {
            console.error('Error fetching user posts:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },
    getPostById: async (req, res) => {
        try {
            const postId = req.params.postId;
    
            // Query the database to find the post by its ID
            const post = await Post.findById(postId);
    
            if (!post) {
                return res.status(404).json({ message: 'Post not found' });
            }
    
            res.status(200).json(post);
        } catch (error) {
            console.error('Error fetching post by ID:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}