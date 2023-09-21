const express = require('express');
const router = express.Router();
const postsControl = require('../controllers/posts-controller');
const { verifyAccessToken } = require('../helpers/jwt.helper');
const cacheMiddleware = require('../middleware/cache')


router.post('/post', verifyAccessToken, postsControl.makePosts);

router.get('/posts', verifyAccessToken, cacheMiddleware, postsControl.getPosts)

router.get('/:postId', verifyAccessToken, postsControl.getPostById)

router.put('/:postId', verifyAccessToken, postsControl.updatePost)

router.delete('/:postId', verifyAccessToken, postsControl.deletePost)

router.post('/search', verifyAccessToken, postsControl.search)

module.exports = router;