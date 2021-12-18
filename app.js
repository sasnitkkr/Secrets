require('dotenv').config(); // must be as early as possible in app
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const PORT = 3000;
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));

app.use(session({
    secret : "Abra Ka Dabra",
    resave : true,
    saveUninitialized : true 
}));
app.use(passport.initialize());
app.use(passport.session());

/////////////// Connect to Database ///////////////
mongoose.connect('mongodb://localhost:27017/userDB', {useNewUrlParser: true});

const userSchema = new mongoose.Schema({
    email : String,
    password :  String
});

userSchema.plugin(passportLocalMongoose);       

const User = mongoose.model('User', userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());   

/////////////// GET ///////////////
app.get("/",function(req, res){
    res.render('home.ejs');
});

app.get("/register",function(req, res){
    res.render('register.ejs');
});

app.get("/login",function(req, res){
    res.render('login.ejs');
});

app.get("/secrets", function(req, res){
    if(req.isAuthenticated()){
        res.render("secrets");
    } else{
        res.redirect("/login");
    }
});

app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
})

/////////////// POST ///////////////
app.post("/register", function(req, res){

    User.register({username : req.body.username}, req.body.password, function(err, user){
        if(err){
            console.log(err);
            res.redirect('/register');
        }else{
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets");
            });
        }
    })
    
});

app.post("/login", function(req, res){

    const user = new User({
        username : req.body.username, // why email key doesnot work
        // email : req.body.username, -> does not work
        password : req.body.password
    });

    req.login(user, function(err){
        if(err){
            console.log(err);
            res.redirect('/login');
        }else{
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets");
            });
        }
    })

});

/////////////// Listen ///////////////

app.listen(PORT, function(){
    console.log("App started at port" + PORT);
});