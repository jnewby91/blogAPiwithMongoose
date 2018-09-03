const chai = require("chai");
const chaiHttp = require("chai-http");

const  {app, runServer , closeServer} = require("../server");


const expect = chai.expect; 

chai.use(chaiHttp);


describe("Blog Posts", function(){
	before(function(){
		return runServer();	
	});

	after(function(){
		return closeServer();
	});

	it("should list blogs items on GET", function(){
		return chai.request(app).get('/blog-posts').then(function(res){
			expect(res).to.have.status(200);
			expect(res).to.be.json;
			expect(res.body).to.be.a('array');
			expect(res.body.length).to.be.above(0);
			res.body.forEach(function (item){
				expect(item).to.be.a('object');
				expect(item).to.have.all.keys('id','title','content','author','publishDate');
			});
		});
	})

	it("should add items on POST", function(){
		const newItem = { title: "How the Days are Going", 
			content : "This is sample text for how the day is going",
			author :"Justin Newby",
			publishDate : "9/20/2018"};
		return chai
		.request(app).post('/blog-posts').send(newItem).then(function(res){
			expect(res).to.have.status(201);
			expect(res).to.be.json;
			expect(res.body).to.be.a("object");
			expect(res.body).to.include.keys('id','title','content','author','publishDate');
			expect(res.body.id).to.not.equal(null);
			expect(res.body).to.deep.equal(
				Object.assign(newItem, {id: res.body.id})
			);
		});
	});

	it('should update items on PUT', function(){
		const updateData = {
			title: "How the Weeks are Going",
			author: "Justin Newby",
			content: "This is sample text for how the week is going",
			publishDate: "9/21/2018"
		};

		return (
			chai.request(app).get("/blog-posts").then(function(res){
				updateData.id = res.body[0].id;
				return chai.request(app).put(`/blog-posts/${updateData.id}`).send(updateData);
			})
		)
	})

	it("should delete items on DELETE", function(){
		return (
			chai.request(app).get("/blog-posts").then(function(res){
				return chai.request(app).delete(`/blog-posts/${res.body[0].id}`)
			})
			.then(function(res){
				expect(res).to.have.status(201)
			})
		);
	});
}); 
