var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var userMedia = new Schema({
    title:{type:String, required: true},
    types:{type:String, default:'free' , enum:['free', 'vip', 'premium']},
    userId: {type:Schema.Types.ObjectId , ref:'User'}, 
    file:{type:String , required:true},
})

module.exports = mongoose.model('UserMedia' , userMedia);