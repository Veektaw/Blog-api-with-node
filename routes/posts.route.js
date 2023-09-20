const express = require('express');
const router = express.Router();
const postsControl = require('../controllers/posts-controller');
const { verifyAccessToken } = require('../helpers/jwt.helper');


router.post('/post', verifyAccessToken, postsControl.makePosts);

router.get('/posts', verifyAccessToken, postsControl.getPosts)

router.post('/:postId', verifyAccessToken, postsControl.getPostById)

// router.delete('/logout', authControl.login)

module.exports = router;