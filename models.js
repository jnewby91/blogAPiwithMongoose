"use strict"; 

const mongoose = require("mongoose"); 

//Create schema for Blog Api 
const authorSchema = mongoose.Schema({
  firstName: 'string',
  lastName: 'string', 
  userName: {
    type: 'string',
    unique: true
  } 
}) ;

const commentSchema = mongoose.Schema({content: 'string'});

const blogSchema = mongoose.Schema({
  title: {type: String, required: true}, 
  author: {type: mongoose.Schema.Types.ObjectId, ref: 'Author', required: true}, 
  content: String,
  comments: [commentSchema]
});

blogSchema.pre('findOne', function(next) {
  this.populate('author');
  next();
});

blogSchema.pre('find', function(next) {
  this.populate('author');
  next();
});

blogSchema.pre('findbyIdandUpdate', function(next){
  this.populate('author');
  next();
})

//Need to virtualize the authors name 
blogSchema.virtual('authorsName').get( function(){
  return `${this.author.firstName} ${this.author.lastName}`;
});

blogSchema.methods.serialize = function(){
  return {
    id: this._id,
    title: this.title, 
    author: this.authorsName, 
    content: this.content,
    comments: this.comments
  };
}

const Author = mongoose.model('Author', authorSchema);
const Blog = mongoose.model('BlogPost', blogSchema);

module.exports = {Blog, Author};
