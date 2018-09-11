"use strict"; 

const mongoose = require("mongoose"); 

//Create schema for Blog Api 

const blogSchema = mongoose.Schema({
  title: {type : String, required : true}, 
  author: {
    firstName: {type: String, required: true},
    lastName: {type: String, required: true} 
  }, 
  content: String
});

//Need to virtualize the authors name 
blogSchema.virtual('authorsName').get( function(){
  return `${this.author.firstName} + '' + ${this.author.lastName}`;
});

blogSchema.methods.serialize = function(){
  return {
    id: this._id,
    title: this.title, 
    author: this.authorsName, 
    content: this.content
  };
}

const Blog = mongoose.model('Blog', blogSchema);

module.exports = {Blog};
