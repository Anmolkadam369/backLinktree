const mongoose = require('mongoose');

const userName = new mongoose.Schema({
  userName :{
    type:String,
    required:true
  },
  email:{
    type:String,
  },
  password:{
    type:String,
  },
  name:{
    type:String
  },
  category:{
    type:String
  },
  subCategory:{
    type:String
  },
  isDeleted:{
    type:Boolean,
    default:false
  },
},{timestamps:true});

module.exports  = mongoose.model('userName', userName);