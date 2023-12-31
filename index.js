const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const blogPostArray = require("./data");
require("dotenv").config();

const app = express();

app.set("view engine", "ejs");

//if css is not there then create public folder and keep css in public folder then write
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
//Connection to database
const mongodbURL = process.env.MONGO_URL;

mongoose
  .connect(mongodbURL)
  .then(() => {
    console.log("connected to mongoose");
  })

  .catch((err) => {
    console.log("could not connect to mongoose", err);
  });

const blogSchema = new mongoose.Schema({
  title: String,
  imageURL: String,
  description: String,
});

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

const Blog = new mongoose.model("blog", blogSchema);
const User = new mongoose.model("User", userSchema);

app.get("/", (req, res) => {
  res.render("signup");
});

app.get("/home", (req, res) => {
  Blog.find({})
    .then((arr) => {
      res.render("index", { blogPostArray: arr });
    })

    .catch((err) => {
      console.log("Can not find blogs", err);
      res.redirect("/error");
    });
});

app.get("/contact", (req, res) => {
  res.render("contact");
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/compose", (req, res) => {
  res.render("compose");
});

app.post("/compose", (req, res) => {
  const image = req.body.imageUrl;
  const title = req.body.title;
  const description = req.body.description;

  const newBlog = new Blog({
    imageURL: image,
    title: title,
    description: description,
  });

  newBlog
    .save()
    .then(() => {
      console.log("Blog posted successfully");
    })

    .catch((err) => {
      console.log("Could not post new blog", err);
    });

  res.redirect("/home");
});

app.get("/post/:id", async (req, res) => {
  console.log(req.params.id);
  const id = req.params.id;
  const post = await Blog.findOne({ _id: id });
  res.render("post", { post });
});

app.get("/delete/:id",  (req, res) => {
  console.log(req.params.id);
  const id = req.params.id;
  Blog.deleteOne({ _id: id })
    .then(() => {
      res.redirect("/home");
    })
    .catch(() => {
      res.redirect("/error");
    });
});

app.get("/signup", (req, res) => {
  res.render("signup");
});


app.get("/error", (req, res) => {
  res.render("404");
});

app.post("/signup", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const newUser = new User({
    email: email,
    password: password,
  });
  newUser
    .save()
    .then(() => {
      console.log("New User Created");
    })
    .catch((err) => {
      console.log("Error User Can't Signup", err);
    });
  res.redirect("/login");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email: email })
    .then((user) => {
      if (user.password == password) {
        Blog.find({}).then((arr) => {
          res.render("index", { blogPostArray: arr });
        });
      } else {
        console.log("Login failed");
      }
    })
    .catch((err) => {
      console.log("User Not Found", err);
      res.redirect("/login");
    });
});

// app.get("/", (request,response)=>{
//     response.send("Welcome to Home Page")
// })

// app.get("/contact", (req,res)=>{
//     res.send("This is contact page");
// })

// app.get("/aboutus", (req,res)=>{
//     res.send("This is about us page");
// })

const port = 3000 || process.env.PORT;

app.listen(port, () => {
  console.log("Server is listening on port 3000");
});
