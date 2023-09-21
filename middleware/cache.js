const mongoose = require('mongoose');
const User = require('../models/user.model');
const Post = require('../models/post.model');
const client = require('../helpers/init_redis');


  // Middleware function to cache results
const cacheMiddleware = (req, res, next) => {
    const cacheKey = req.url; // You can customize this key based on your needs
  
    // Check if the data is in the cache
    client.get(cacheKey, (err, cachedData) => {
      if (err) {
        console.error('Redis error:', err);
        return next(); // Continue to the next middleware or route in case of an error
      }
  
      if (cachedData !== null) {
        // If data is found in the cache, send it as the response
        res.status(200).json(JSON.parse(cachedData));
      } else {
        // If data is not found in the cache, proceed to the next middleware
        next();
      }
    });
  };

module.exports = cacheMiddleware;