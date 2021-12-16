const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const PORT = 3000;

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));

app.get("/",function(req, res){
    res.render('home.ejs');
});

app.get("/register",function(req, res){
    res.render('register.ejs');
});

app.get("/login",function(req, res){
    res.render('login.ejs');
});


app.listen(PORT, function(){
    console.log("App started at port" + PORT);
})