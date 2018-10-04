var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
var cookieParser = require('cookie-parser')

app.use(cookieParser())
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs")


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

app.post("/login", (req, res) =>{
res.cookie("username", req.body.username)
res.redirect("/urls");
});

app.use(express.static("public"));
app.post("/logout", (req,res) =>{
res.clearCookie("username")
res.redirect("/urls")
})


app.get("/", (req, res) => {
  let templateVars = {"username": req.cookies["username"]};
  res.render("index", templateVars);
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase,
  "username": req.cookies["username"] };
  res.render("urls_index", templateVars);
});

app.post("/urls/:id/delete", (req, res) =>{
  let templateVars = { urls: urlDatabase, "username": req.cookies["username"]};
  delete urlDatabase[req.params.id]
  res.render("urls_index", templateVars )
})

app.get("/urls/new", (req, res) => {
  let templateVars = {"username" : req.cookies["username"]}
  res.render("urls_new", templateVars);
});

app.post("/urls/:id/update", (req, res) =>{
urlDatabase[req.params.id] = req.body.longURL
res.redirect("/urls");
})

app.post("/urls", (req, res) => {
  var shortURL = generateRandomString()
  urlDatabase[shortURL] = req.body.longURL
  res.redirect("urls");         // Respond with 'Ok' (we will replace this)
});


app.get("/urls/:id", (req, res) => {
  if(urlDatabase[req.params.id]){
   let templateVars = { shortURL: req.params.id, url: urlDatabase, "username": req.cookies["username"] };
   res.render("urls_show", templateVars);
  } else {
  res.send("dont have that in my files!")
  }

});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});