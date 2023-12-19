const mongoose = require('mongoose');

const linktreeDoc = new mongoose.Schema({
  header:{
    type : Array,
  },
  wholeAddedLinks:{
    type : Array,
    required:true
  },
  isDeleted:{
    type:Boolean,
    default:false
  },
},{timestamps:true});

module.exports  = mongoose.model('linktreeDoc', linktreeDoc);