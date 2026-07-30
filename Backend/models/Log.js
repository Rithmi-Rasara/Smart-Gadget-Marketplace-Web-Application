const mongoose=require('mongoose');
module.exports=mongoose.model('Log',
 new mongoose.Schema({
  action:String,
  data:Object,
  date:{type:Date,default:Date.now}
 })
);
