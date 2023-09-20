const createError = require('http-errors');
const User = require('../models/user.model');
const { authSchema, loginSchema } = require('../helpers/validation.schema');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../helpers/jwt.helper');
const client = require('../helpers/init_redis');

module.exports = {
    signup: async(req, res, next) => {
        try {
            const result = await authSchema.validateAsync(req.body);
    
            const emailExists =  await User.findOne({email: result.email});
            if (emailExists) throw createError.Conflict(`This email '${result.email}' has already been registered`);
    
            const user = new User(result);
            const savedUser = await user.save();
    
            const accessToken = await signAccessToken(savedUser.id);
            const refreshToken = await signRefreshToken(savedUser.id);
            res.status(201).send({ message: 'User created', accessToken, refreshToken });
        }
        catch (error) {
            if (error.isJoi === true) error.status = 422;
            next(error)
        }
    },

    login: async(req, res, next) => {
        try {
            const result = await loginSchema.validateAsync(req.body)
            const user = await User.findOne({email: result.email})
    
            if (!user) throw createError.NotFound(`User not registered`)
            const passwordMatch = await user.isValidPassword(result.password)
    
            if (!passwordMatch) throw createError.Unauthorized(`Username or password invalid`)
    
            const accessToken = await signAccessToken(user.id)
            const refreshToken = await signRefreshToken(user.id)
    
           res.status(200).send({message: 'User logged in', accessToken, refreshToken})
        }
        catch (error) {
            if (error.isJoi === true)
                next(createError.BadRequest("Invalid username or password"))
            next(error)
        }
    },

    refresh_token: async(req, res, next) => {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) throw createError.BadRequest();
            const userId = await verifyRefreshToken(refreshToken)
    
            const accessToken = await signAccessToken(userId)
            const refresh = await signRefreshToken(userId)
    
            res.status(200).send({message: 'Refreshed', accessToken: accessToken, refreshToken: refresh})
    
        } catch (error) {
            next(error)
        }
    },

    logout: async(req, res, next) => {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) throw createError.BadRequest();
    
            const userId = await verifyRefreshToken(refreshToken);
            client.DEL(userId, (err, val) => {
                if (err){
                    console.log(err.message)
                    throw createError.InternalServerError();
                }
                console.log(val)
                res.sendStatus(204);
            })
    
        } catch (error) {
            next(err)
        }
    }
}