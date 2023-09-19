const express = require('express');
const morgan = require('morgan')
const {errorHandler, errorProcess} = require('./middleware/errors')
const authRoute = require('./routes/auth.route')
const createError = require('http-errors');
const { verifyAccessToken } = require('./helpers/jwt.helper');
require('dotenv').config();
require('./helpers/init_mongodb')

const app = express();
app.use(morgan('dev'))

app.use(express.json());
app.use(express.urlencoded({extended: true}))


app.use('/auth', authRoute);

app.get('/', verifyAccessToken, async (req, res) => {
    res.send('This is effing awesome my guys')
});


// errorHandler has the next method, so we can pass it to the next error
app.use(errorHandler);
app.use(errorProcess);


const PORT = process.env.PORT || 3005;

app.listen(PORT, () => {
    console.log(`Port is running on ${PORT}`)
})