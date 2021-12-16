require('dotenv').config(); // must be as early as possible in app
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const encrypt = require('mongoose-encryption');
const md5 = require('md5');
const bcrypt = require('bcrypt');
const saltrounds = 10;
const PORT = 3000;

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));

/////////////// Connect to Database ///////////////
mongoose.connect('mongodb://localhost:27017/userDB', {useNewUrlParser: true});

const userSchema = new mongoose.Schema({
    email : String,
    password :  String
});

/////////////// Using Mongoose Encryption ///////////////
/* 
    During save, documents are encrypted and then signed.
    During find, documents are authenticated and then decrypted.
*/

// userSchema.plugin(encrypt, {secret : process.env.SECRET, encryptedFields:['password']});    

const User = mongoose.model('User', userSchema);

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

/////////////// POST ///////////////
app.post("/register", function(req, res){

    bcrypt.hash(req.body.password, saltrounds, function(err, hash) {
        // Store hash in your password DB.
        if(err){
            console.log(err);
        }else{
            const newUser = new User({
                email : req.body.username,
                password : hash
            });
        
            newUser.save(function(err){
                if(err){
                    console.log(err);
                }else{
                    res.render('secrets.ejs');
                }
            });
        }
    });
});

app.post("/login", function(req, res){

    const username = req.body.username;
    const password = req.body.password;

    User.findOne({email:username}, function(err, foundUser){
        if(err){
            console.log(err);
        }else{
            if(foundUser){
                bcrypt.compare(password, foundUser.password, function(err, result) {
                    // result == true
                    if(err){
                        console.log(err);
                    }else{
                        if(result){
                            res.render('secrets.ejs');
                        }else{
                            console.log("Invalid Password");
                        }
                    }
                });
            }else{
                console.log("User Not Found");
            }
        }
    });

});

/////////////// Listen ///////////////

app.listen(PORT, function(){
    console.log("App started at port" + PORT);
});