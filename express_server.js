var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
var cookieParser = require('cookie-parser')

app.use(cookieParser())
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs")
app.use(express.static("public"));

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
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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





app.get("/", (req, res) => {
  let templateVars = { urls: urlDatabase, "user": users[req.cookies["userID"]]};
  res.render("urls_index", templateVars);
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase,
  "user": users[req.cookies["userID"]] };

  res.render("urls_index", templateVars);
});

app.post("/urls/:id/delete", (req, res) =>{
  let templateVars = { urls: urlDatabase, "user": users[req.cookies["userID"]]};
  delete urlDatabase[req.params.id]
  res.render("urls_index", templateVars )
})

app.get("/urls/new", (req, res) => {
  let templateVars = {"user": users[req.cookies["userID"]]}
  res.render("urls_new", templateVars);
});

app.post("/urls/:id/update", (req, res) =>{
urlDatabase[req.params.id] = req.body.longURL
res.redirect("/urls");
})


app.post("/urls", (req, res) => {
  var shortURL = generateRandomString()
  urlDatabase[shortURL] = req.body.longURL
  res.redirect("/urls");         // Respond with 'Ok' (we will replace this)
});


app.get("/urls/:id", (req, res) => {
  if(urlDatabase[req.params.id]){
   let templateVars = { shortURL: req.params.id, url: urlDatabase, "user": users[req.cookies["userID"]] };
   res.render("urls_show", templateVars);
  } else {
  res.send("dont have that in my files!")
  }

});


app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});


app.get("/register", (req, res) => {
  let templateVars = { "user": users[req.cookies["userID"]]};
  res.render("register", templateVars);
});

app.post("/register", (req, res) =>{
  var userId = generateRandomString();
  let error = false;
  let userEmail = req.body.email;
  let userPassword = req.body.password

  if(!userEmail || !userPassword){
    error = true;
  }

  for(var ppl in users){
    if(users[ppl].email === userEmail){
      error = true;
    }
  };

  if(error === false){

    users[userId] = {
      "id:" : userId,
      "email" : userEmail,
      "password" : userPassword
    };
    console.log(users);
    res.cookie("userID", userId);
    res.redirect("/urls")
  }
});

app.get("/login", (req, res) =>{
   let templateVars = { "user": users[req.cookies["userID"]]};
  res.render("login", templateVars)
});

app.post("/login", (req,res) =>{
  let error = false;
  let userEmail = req.body.email;
  let userPassword = req.body.password

  let theRightEmail = thisEmail(req.body.email)

  console.log(theRightEmail)
  console.log(req.body.password)
  // console.log(users[theRightEmail].password)
  if(theRightEmail === undefined || users[theRightEmail].password !== req.body.password){
    res.sendStatus(403);
  } else {
    res.cookie("userID", theRightEmail)
    res.redirect("/urls");
  }

});

app.post("/logout", (req, res) => {
  console.log("hellooooooooo")
  res.clearCookie("userID")
  res.redirect("/")
});


let thisEmail = function(email){
  for(var ppl in users){
    if(users[ppl].email === email){
      return ppl
    }
  }
}







// app.post("/logout", (req,res) =>{
// res.clearCookie("user")
// res.redirect("/urls")
// })




app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});