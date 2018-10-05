var express = require("express");
var app = express();
var PORT = 8080;
const bodyParser = require("body-parser");
var cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

//required middle-ware and express set -up
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs")
app.use(express.static("public"));
app.use(cookieSession({
  name: 'session',
  keys: ["kljlkjh"],
}))

//creates random user ID
function generateRandomString() {
  var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var charsArray = chars.split('');
  var result = '';
  for(var i = 0; i < 6; i++){
    var index = Math.floor(Math.random() * charsArray.length)
    result += charsArray[index];
  }
  return result;
}

var urlDatabase = {
  "b2xVn2":{
    longURL: "http://www.lighthouselabs.ca",
    shortURL:"b2xVn2",
    userId: "userRandomID"
  },
    "9sm5xK":{
    longURL: "http://www.google.com",
    shortURL: "9sm5xK",
    userId:"user2RandomID"
  }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

//home page
app.get("/", (req, res) => {
  let templateVars = { urls: urlDatabase, user: users[req.session.userID]};
  res.render("home", templateVars);
});

//url page
app.get("/urls", (req, res) => {
  if(!users[req.session.userID]){
    res.redirect("/")
  } else {
    let myUrls = urlsForUser(users[req.session.userID]);
    let templateVars = {
      urls: myUrls,
      user: users[req.session.userID]
    };
  res.render("urls_index", templateVars);
  }
});

//deleting a unique URL from you database
app.post("/urls/:id/delete", (req, res) =>{
  let templateVars = { urls: urlDatabase, "user": users[req.session.userID]};
  if(urlDatabase[req.params.id].userId !== users[req.session.userID]){
    res.sendStatus(403)
  } else {
  delete urlDatabase[req.params.id]
  res.redirect("/urls")
  }
})
//page for creating new URLS for your personal database
app.get("/urls/new", (req, res) => {
  let templateVars = { "user":  users[req.session.userID]};
  if(users[req.session.userID]){
    res.render("urls_new", templateVars);
  } else {
    res.render("home", templateVars)
  };
});

//updating a pre-exisiting URL with new information
app.post("/urls/:id/update", (req, res) =>{
  if(users[req.session.userID]){
    urlDatabase[req.params.id].longURL = req.body.longURL
    res.redirect("/urls");
  } else {
    res.render("login", templateVars)
  }
})

//Adds a new URL to your database
app.post("/urls", (req, res) => {
  var shortURL = generateRandomString()
  urlDatabase[shortURL] = {
    "longURL" : req.body.longURL,
    "shortURL": shortURL,
    "userId" :  users[req.session.userID]
  }
  res.redirect("/urls");
});

//sends user to individual URL to change the url
app.get("/urls/:id", (req, res) => {
  if(!users[req.session.userID]){
    res.sendStatus(403)
  }
  if(urlDatabase[req.params.id]){
   let templateVars = { shortURL: req.params.id, url: urlDatabase, "user": users[req.session.userID] };
   res.render("urls_show", templateVars);
  } else {
  res.send("dont have that in my files!")
  }

});

//link user through the server to the actual URL site
app.get("/u/:shortURL", (req, res) => {
  if(!urlDatabase[req.params.shortURL]){
    res.sendStatus(403)
  } else{
    let longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  }
});

// new user registration page
app.get("/register", (req, res) => {
  let templateVars = { "user": users[req.session.userID]};
  res.render("register", templateVars);
});

//registers a new user
app.post("/register", (req, res) =>{
  let emailfound = false;
  var userId = generateRandomString();
  let error = false;
  let userEmail = req.body.email;
  let userPassword = req.body.password

  for(var user_id in users){
    let user = users[user_id];
    if(user.email === userEmail){
      emailfound = true;
    }
  }
  if(emailfound === true){
    res.sendStatus(403)
  }

  if(!userEmail || !userPassword){
    error = true;
  }

  for(var ppl in users){
    if(users[ppl].email === userEmail){
      error = true;
    }
  };

  if(error === false && emailfound === false){

    users[userId] = {
      "id" : userId,
      "email" : userEmail,
      "password" : bcrypt.hashSync(userPassword, 10)
    };
    req.session.userID = userId;
    res.redirect("/urls")
  }
});

//user login page
app.get("/login", (req, res) =>{
   let templateVars = { "user": users[req.session.userID]};
  res.render("login", templateVars)
});
//allows an existing user to login
app.post("/login", (req,res) =>{
  let youFoundMe = false;
  let emailfound = false;
  let userEmail = req.body.email;
  let userPassword = req.body.password

  let theRightEmail = thisEmail(req.body.email)
  for(var user_id in users){
    let user = users[user_id];
    if(user.email === userEmail){
      emailfound = true;
      if (bcrypt.compareSync(userPassword, user.password)){
        youFoundMe = true;
        req.session.userID = user_id;
        res.redirect("/urls")
        console.log("logging in as", user.email)
      }
    }
  }

  if(emailfound === false ){
    res.sendStatus(403);
  } else if (youFoundMe === false) {
    res.sendStatus(403);
  }

});
//allows user to logout of application
app.post("/logout", (req, res) => {
  req.session = null
  res.redirect("/")
});

// function for fidning email of specific user
let thisEmail = function(email){
  for(var ppl in users){
    if(users[ppl].email === email){
      return ppl
    }
  }
}


//function for finding the urls attached to a specific user
let urlsForUser = function(userID){
  let urlValues = [];
  for(var urls in urlDatabase){
    if(userID === urlDatabase[urls].userId){
      urlValues.push(urlDatabase[urls])
    }
  }
  return urlValues
}






app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});