//declaring that i'm using express 
const express = require('express');

//declare that i'm using routes 

//declare morgan 
const morgan = require('morgan');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
//declare the bodyParser

//declare models 
const {BlogPosts} = require('./models');


const app = express();


//add blog post so that there is information already there
BlogPosts.create('Ready To Go Home', 'Somedays you have been on the road for too long and you just want to go one place. That place is called Home.','Albert', Date.now() );
BlogPosts.create('Ready To Go to The Beach', 'Somedays you have been on the road for too long and you just want to go one place. That place is called Home.','Burt', Date.now() );
BlogPosts.create('Ready To Go to The Movies', 'Somedays you have been on the road for too long and you just want to go one place. That place is called Home.','Chris', Date.now() );

//when a request goes to '/blog-posts' return items from the blog
app.get('/blog-posts', (req, res) => {
	res.json(BlogPosts.get());
});

app.post('/blog-posts', jsonParser, (req,res) => {
	const requiredFields = ['title', 'content','author', 'publishDate'];
	for(let i=0; i < requiredFields[i]; i++){
		const field = requiredFields[i];
		if(!(field) in req.body){
			const message = `Missing ${field} in request body`;
			console.error(message);
			return res.status(400).send(message);
}
	}
	const item = BlogPosts.create(req.body.title, req.body.content,req.body.author, req.body.publishDate);
	res.status(201).json(item);
});

app.delete('/blog-posts/:id', (req, res) => {
	BlogPosts.delete(req.params.id);
	console.log(`Deleted blog post ${req.params.id}`);
	res.status(201).end();
});

app.put('/blog-posts/:id', jsonParser, (req,res) => {
	const requiredFields = ['id', 'title', 'content', 'author', 'publishDate'];
	for (let i =0; i < requiredFields[i]; i++){
		const field = requiredFields[i];
		if(!(field) in req.body){
			const message = `Missing ${field} in request body`
			console.error(message);
			return res.status(400).send(message);
		}
	}
	if(req.params.id !== req.body.id){
		const message = `Request Path id (${req.params.id}) and request body (${req.body.id}) must match`;
		console.error(message);
		return res.status(400).send(message);
	}
	BlogPosts.update = {
		'id' : req.params.id, 
		'title' : req.body.title, 
		'content' : req.body.content,
		'author' : req.body.author, 
		'publishDate' : req.body.publishDate
	}; 
	res.status(400).end();
});


//listen to specific server when calling the listen method



let server; 

function runServer() {
	const port = process.env.PORT || 8080;
	return new Promise((resolve, reject) => {
		server = app.listen (port, () => {
			console.log(`Your app is listening on port ${port}`); resolve(server);
		}).on("error", err => { reject(err);
		});
	});
}

function closeServer (){
	return new Promise((resolve,reject) => {
		console.log("Closing server");
		server.close(err => {
			if(err) {
				reject(err);
				return;
			}
			resolve();
		});
	});
}

if (require.main === module) {
	runServer().catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };

