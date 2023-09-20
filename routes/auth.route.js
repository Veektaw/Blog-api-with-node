const express = require('express');
const router = express.Router();
const authControl = require('../controllers/auth-controller');



router.post('/signup', authControl.signup);

router.post('/login', authControl.login)

router.post('/refresh-token', authControl.refresh_token)

router.delete('/logout', authControl.login)

module.exports = router;