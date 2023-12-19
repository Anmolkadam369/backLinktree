const mongoose = require('mongoose');

const verification = new mongoose.Schema({
 
  email:{
    type:String,
    required:true
  },
  resetToken:{
    type:String
  },
  resetTokenExpires:{
    type:String
  },
  isDeleted:{
    type:Boolean,
    default:false
  },
},{timestamps:true});

module.exports  = mongoose.model('verification', verification);