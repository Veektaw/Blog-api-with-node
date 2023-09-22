const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const {User} = require('../models/user.model');
const mongoosePaginate = require('mongoose-paginate-v2'); 

const Postschema = new Schema ({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    createAt: {
        type: Date,
        default: () => Date.now(),
    },
    // Reference to the user who created the post
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    
});

Postschema.plugin(mongoosePaginate); 

const Post = mongoose.model('Post', Postschema);
module.exports = Post;