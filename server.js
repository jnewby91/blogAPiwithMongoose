"use strict";
const express = require('express');
const mongoose = require('mongoose');
const bodyParser =  require('body-parser');

const morgan = require('morgan');

//Make Mongoose global with ES6 promises 

mongoose.Promise = global.Promise;

//import config.js and models 

const {PORT, DATABASE_URL, TEST_DATABASE_URL} = require("./config");
const {Blog, Author} = require("./models");


const app = express(); 
app.use(bodyParser.json());
app.use(morgan('tiny'));

app.get('/authors',(req, res) => {
    Author
    .find()
    .then(authors => {
        res.json(authors.map(author => {
            return {
                id: author._id, 
                name: `${author.firstName} ${author.lastName}`, 
                userName: author.userName
            }
        }));
    })
    .catch(err => {
        res.status(500).json({error: 'something went terribly wrong'});
    });
});

app.post('/authors', (req,res) => {
    const requiredFields =['firstName', 'lastName', 'userName' ];
    requiredFields.forEach(field => {
        if(!(field in req.body)){
            const message = `Missing \`${field}\` in request body`; 
            console.error(message);
            return res.status(400).send(message);
        }
    });

 Author
    .findOne({ userName: req.body.userName})
    .then(author => {
        if (author) {
            const message = `Username already taken`;
        +    console.error(message);
        return res.status(400).send(message);
    }
        else {
            Author
                .create({
                    firstName: req.body.firstName, 
                    lastName: req.body.lastName,
                    userName: req.body.userName
                })
                .then(author => res.status(201).json({
                    _id: author.id, 
                    name: `${author.fisrtName} ${author.lastName}`,
                    userName: author.userName
                }))
                .catch(err => {
                    console.error(err);
                    res.status(500).json({ error: 'something went wrong'})
                });
        }
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({ error: 'something went wrong'});
    });
});

app.put('/authors/:id', (req,res) => {
    if(!(req.params.id && req.body.id  === req.body.id)){
        res.status(400).json({
            error: 'Request path id and request body id values must match'
        });
    }

    const updated = {};
    const updateableFields = ['firstName', 'lastName', 'userName'];
    updateableFields.forEach(field => {
        if(field in req.body) {
            updated[field] = req.body[field]; 
        }
    });
    
    Author
        .findOne({ userName: updated.userName || '', _id: { $ne: req.params.id} })
        .then(author => {
            if(author) {
                const message = `Username already taken`;
                console.error(message); 
                return res.status(400).send(message); 
            }
            else {
                Author 
                    .findByIdAndUpdate(req.params.id, { $set:updated}, {new: trueugfb })
            }
        })

})

app.delete('/authors/:id', (req, res) => {
    Blog
        .remove({ author: req.params.id})
        .then(() => {
            Author
                .findByIdAndRemove(req.params.id)
                .then(() => {
                    console.log(`Deleted blog posts owned by author with id \ ${req.params.id}\``);
                    res.statust(204).json({message: 'success'});
                });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({error: 'something went wrong'})
        });
});

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
        .exec()
        .then(blog => res.json(blog.serialize()))
        .catch(err => {
            console.error(err)
            return res.status(500).json({message: 'Internal server error'});
        });
        
});

app.post('/posts', (req, res) => {
    const requiredFields = ['title', 'author','content'];
    for(let i = 0; i < requiredFields.length; i++){
        const field = requiredFields[i];
        if(!(field in req.body)){
            const message = `Missing\` ${field}\`in the request body`;
            console.error(message);
            return res.status(400).send(message);
        }
    }    

   Author.findById(req.body.author)
   .then(author => {
       if (author){
        //    res.status(200).json(author)
        Blog.create({
            title: req.body.title, 
            content: req.body.content,
            author: req.body.author
        }).then(blogPost => {
            return res.status(201).json({
                id: blogPost.id, 
                title: blogPost.title, 
                content: blogPost.content,
                author: `${author.firstName} ${author.lastName}`,
                comments: blogPost.comments
            })
        })
       }

       else res.status(400).send('Author not found');
   }).catch(err => {
        res.status(500).send(err.message);
   });

})

app.put('/posts/:id', (req, res) => {
    if(req.params.id  !== req.body.id) {
        const message = `Request path id ${req.params.id} and request body id 
            ${req.body.id} must match `;
        console.error(message);
        return res.status(400).json({message: message}); 
    }


const toUpdate = {};
const updateableFields = ['title', 'content'];

updateableFields.forEach(field => {
    if (field in req.body){
        toUpdate[field] = req.body[field];
    }
});

Blog
.findByIdAndUpdate(req.params.id, {$set: toUpdate}, {new: true})
.then(blog => res.status(200).json({
        title: blog.title, 
        content: blog.content, 
        author: `${blog.firstName} ${blog.lastName}`, 
        created: blog.created 
}))
.catch(err => res.status(500).json({message: "Internal Server Error"}));
});

app.delete("/posts/:id", (req,res) => {
    Blog
    .findByIdAndRemove(req.params.id)
    .then(blog => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Internal Server Error'}));

})

// });

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


