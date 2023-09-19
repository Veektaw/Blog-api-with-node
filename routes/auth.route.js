const express = require('express');
const router = express.Router();
const createError = require('http-errors');
const User = require('../models/user.model');
const { authSchema, loginSchema } = require('../helpers/validation.schema');
const { signAccessToken } = require('../helpers/jwt.helper')


router.post('/signup', async(req, res, next) => {
    try {
        const result = await authSchema.validateAsync(req.body);

        const emailExists =  await User.findOne({email: result.email});
        if (emailExists) throw createError.Conflict(`This email '${result.email}' has already been registered`);

        const user = new User(result);
        const savedUser = await user.save();

        const accessToken = await signAccessToken(savedUser.id)
        res.status(201).send({ message: 'User created', accessToken });
    }
    catch (error) {
        if (error.isJoi === true) error.status = 422;
        next(error)
    }
});


router.post('/login', async(req, res, next) => {
    try {
        const result = await loginSchema.validateAsync(req.body)
        const user = await User.findOne({email: result.email})

        if (!user) throw createError.NotFound(`User not registered`)
        const passwordMatch = await user.isValidPassword(result.password)

        if (!passwordMatch) throw createError.Unauthorized(`Username or password invalid`)

        const accessToken = await signAccessToken(user.id)

       res.status(200).send({message: 'User logged in', accessToken})
    }
    catch (error) {
        if (error.isJoi === true)
            next(createError.BadRequest("Invalid username or password"))
        next(error)
    }
})

router.post('/refresh-token', async(req, res, next) => {
    res.send("This is to refresh")
})

router.delete('/logout', async(req, res, next) => {
    res.send("This is to logout")
})





module.exports = router;