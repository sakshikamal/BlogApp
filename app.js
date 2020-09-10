const express=require("express");
const app=express();
const bodyParser=require("body-parser");
const sanitizer=require("express-sanitizer");

const methodOverride=require("method-override");

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/blog_app', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to DB!'))
.catch(error => console.log(error.message));

let blogSchema= new mongoose.Schema({
    name: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
});

let Blog=mongoose.model("Blog",blogSchema);

// Blog.create({
//     name:"Test Blog",
//     image:"https://images.unsplash.com/photo-1505232070786-2f46d15f9f5e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1229&q=80",
//     body: "Hello this is a blog post"
// }, (err,blog)=>{
//     if(err){
//         console.log("something wrong with create");
//         console.log(err);
//     } else {
//         console.log(blog);
//     }
// });



app.use(bodyParser.urlencoded({extended:true}));

app.use(sanitizer()); //this should be after body parser

app.use(express.static("public"));   //css part is present in public directory
app.set("view engine","ejs");  //telling ealier that al files passed will be ejs ie home.ejs,love.ejs, posts.ejs


app.use(methodOverride("_method"));


app.listen(3000,function() { 
    console.log('Server listening on port 3000'); 
});

app.get("/",(req,res)=>{
    res.redirect("/blogs");
});

//INDEX ROUTE
app.get("/blogs",(req,res)=>{
    Blog.find({}, (err,blogs)=>{
        if(err)
            console.log(err);
        else{
            res.render("index", {blogs: blogs});
        }
    })
});

//NEW ROUTE
app.get("/blogs/new", (req,res) => {  //this shows the form that is then directed to the post route
    res.render("new");
});

//CREATE ROUTE
app.post("/blogs", (req,res)=>{
    req.body.blog.body= req.sanitize(req.body.blog.body);    //req.body fetches from the form and blog.body is the field
    Blog.create(req.body.blog, (err,camp)=>{            //blog is an object that hols all 3 data
        if(err){
            console.log("something wrong with create");
            console.log(err);
            res.render("new");
        } else {
            //console.log(camp);
            res.redirect("/blogs");
        }
    });
});

//SHOW ROUTE
app.get("/blogs/:id",(req,res)=>{
    Blog.findById(req.params.id, (err,foundBlog)=>{
        if(err)
            res.redirect("/blogs");
        else
            res.render("show", {blog: foundBlog});
    });
});

//EDIT ROUTE
app.get("/blogs/:id/edit",(req,res)=>{
    Blog.findById(req.params.id, (err,foundBlog)=>{
        if(err)
            res.redirect("/blogs");
        else
            res.render("edit", {blog: foundBlog});
    });
});

//UPDATE ROUTE
app.put("/blogs/:id", (req,res)=>{
    req.body.blog.body= req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, (err,updatedBlog)=>{
        if(err){
            res.redirect("/blogs");
        }else{
            res.redirect("/blogs/"+req.params.id);
        }
    });
});

//DELETE ROUTE
app.delete("/blogs/:id", (req,res)=>{
    Blog.findByIdAndRemove(req.params.id,(err,foundBlog)=>{
        if(err){
            res.redirect("/blogs"); 
        }else{
            res.redirect("/blogs");
        }
    });
});