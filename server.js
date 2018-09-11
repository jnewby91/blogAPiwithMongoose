"use strict";
const express = require('express');
const mongoose = require('mongoose');

//Make Mongoose global with ES6 promises 

mongoose.Promise = global.Promise;

//import config.js and models 

const {PORT, DATABASE_URL, TEST_DATABASE_URL} = require("./config");
const {Blog} = require("./models");

const app = express(); 
app.use = (express.json());

app.get('/posts', (req, res) => {
    Blog
        .find()
        .then(blogs => {
            res.json({
              blogs : blogs.map((blog) => blog.serialize())  
            });
        })
        .catch(
            err =>{
                console.error(err);
                res.status(500).json({message: 'Internal server error'});
            });
});

app.get('/posts/:id', (req, res) => {
    Blog
        .findById(req.params.id)
        .then(blog => res.json(blog.serialize()))
        .catch(err => console.error(err));
        res.status(500).json({message: 'Internal server error'});
})

app.post('/posts', (req, res) => {
    const requiredFields = ['title', 'author','content'];
    for(i = 0; i < requiredFields.length; i++){
        const field = requiredFields[i];
        if(!(field in req.body)){
            const message = `Missing\` ${field}\`in the request body`;
            console.error(message);
            return res.status(400).send(message);
        }
    }

    Blog.create({
        title: req.body.title, 
        author: req.body.author, 
        content: req.body.content
    })
    .then(blog => res.status(201).json(blog.serialize()))
    .catch(err => {
        console.error(err);
        res.status(500).json({message: "Internal Server Error"});

    } )

    app.put('posts/:id', (req,res) => {
        if(!(req.params.id && req.body.id && req.params.id === req.body.id)){
            const message = `Request path id ${req.params.id} and request body id` + 
                `${req.body.id} must match `;
            console.error(message);
            return res.status(400).json({message: message}); 

        }
    })

    const toUpdate = {};
    const updateableFields = ['title', 'author', 'content']

    updateableFields.forEach(field => {
        if (field in req.body){
            toUpdate[field] = req.body[field];
        }
    });

    Blog
    .findByIdAndUpdate(req.params.id, ({$set: toUpdate})
    .then(blog => res.status(204).end())
    .catch(err => res.status(500).json({message: "Internal Server Error"}))
);

app.delete("/posts/:id", (req,res) => {
    blog
    .findByIdandRemove(req.params.id)
    .then(blog => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Internal Server Error'}));

})
});

// app.use("*", function(req,res, next){
//     next(); 
// });

let server;

// this function connects to our database, then starts the server
function runServer(databaseUrl, port = PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(
      databaseUrl,
      err => {
        if (err) {
          return reject(err);
        }
        server = app
          .listen(port, () => {
            console.log(`Your app is listening on port ${port}`);
            resolve();
          })
          .on("error", err => {
            mongoose.disconnect();
            reject(err);
          });
      }
    );
  });
}

// this function closes the server, and returns a promise. we'll
// use it in our integration tests later.
function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log("Closing server");
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

// if server.js is called directly (aka, with `node server.js`), this block
// runs. but we also export the runServer command so other code (for instance, test code) can start the server as needed.
if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };


