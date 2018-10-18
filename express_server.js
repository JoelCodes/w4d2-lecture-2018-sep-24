const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const {Client} = require('pg');
const client = new Client({
  database: 'tiny_app_pg'
});

const knexConfig = require('./knexfile').development;
const knex = require('knex')(knexConfig);

client.connect((err) => {

  //required middle-ware and express set -up
  app.use(bodyParser.urlencoded({extended: true}));
  app.set('view engine', 'ejs');
  app.use(express.static('public'));
  app.use(cookieSession({
    name: 'session',
    keys: ['nokeys'],
  }));

  //creates random user ID
  function generateRandomString() {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const charsArray = chars.split('');
    let result = '';
    for(let i = 0; i < 6; i++){
      const index = Math.floor(Math.random() * charsArray.length);
      result += charsArray[index];
    }
    return result;
  }

  // const {
  //   getUserById, 
  //   isEmailTaken, 
  //   createUser, 
  //   getUserByEmail,
  // } = require('./data-helpers/users-pg')(client);
  const {
    getUserById, 
    isEmailTaken, 
    createUser, 
    getUserByEmail,
  } = require('./data-helpers/users-knex')(knex);

  // const {
  //   getUrlsForUser,
  //   getUrlByShortUrl,
  //   createUrl,
  //   deleteUrl,
  //   updateUrl,
  // } = require('./data-helpers/urls-pg')(client);
  const {
    getUrlsForUser,
    getUrlByShortUrl,
    createUrl,
    deleteUrl,
    updateUrl,
  } = require('./data-helpers/urls-knex')(knex);

  app.use((req, res, next) => {
    // getUserById(req.session.userId, (err, user) => {
    //   res.locals.user = user;
    //   next();
    // });
    getUserById(req.session.userId).then((user) => {
      res.locals.user = user;
      next();
    });
  });

  //home page
  app.get('/', (req, res) => {
    res.render('home');
  });

  //url page
  app.use('/urls', (req, res, next) => {
    if(res.locals.user === undefined){
      res.redirect('/login');
    } else {
      next();
    }
  });

  app.get('/urls', (req, res) => {
    getUrlsForUser(res.locals.user.id, (err, urls) => {
      res.render('urls_index', {urls});
    });
  });

  //page for creating new URLS for your personal database
  app.get('/urls/new', (req, res) => {
    res.render('urls_new');
  });

  //Adds a new URL to your database
  app.post('/urls', (req, res) => {
    const shortURL = generateRandomString();
    createUrl(shortURL, req.body.longURL, res.locals.user.id, () => {
      res.redirect('/urls');
    });
  });

  app.use('/urls/:id', (req, res, next) => {
    getUrlByShortUrl(req.params.id, (err, url) => {
      if(url === undefined){
        res.sendStatus(404);
      } else if(url.userId !== res.locals.user.id){
        res.sendStatus(403);
      } else {
        res.locals.url = url;
        next();
      }
  
    });
  });

  //deleting a unique URL from you database
  app.post('/urls/:id/delete', (req, res) =>{
    deleteUrl(req.params.id, () => {
      res.redirect('/urls');
    });
  });
  
  //updating a pre-exisiting URL with new information
  app.post('/urls/:id/update', (req, res) =>{
    updateUrl(req.params.id, req.body.longURL, () => {
      res.redirect('/urls');
    });
  });


  //sends user to individual URL to change the url

  app.get('/urls/:id', (req, res) => {

    res.render('urls_show');
  });


  //link user through the server to the actual URL site
  app.get('/u/:shortURL', (req, res) => {
    getUrlByShortUrl(req.params.shortURL, (err, url) => {
      if(url){
        res.redirect(url.longUrl);
      } else {
        res.sendStatus(404);
      }
    });
  });

  // new user registration page
  app.get('/register', (req, res) => {
    res.render('register');
  });

  //registers a new user
  app.post('/register', (req, res) =>{
    const userEmail = req.body.email;
    const userPassword = req.body.password;
    if(!userEmail || !userPassword){
      res.status(400).send('Email and Password Required');
      return;
    }
    const emailTakenPromise = isEmailTaken(userEmail);

    emailTakenPromise.then((isTaken) => {
      if(isTaken){
        res.status(400).send('That Email is Taken');
        return;
      } else {

        const createdUserPromise = createUser(userEmail, userPassword);

        createdUserPromise
          .then((newUser) => {
            req.session.userId = newUser.id;
            res.redirect('/urls');
          });
      }
    });
  });

  //user login page
  app.get('/login', (req, res) =>{
    res.render('login');
  });
  //allows an existing user to login
  app.post('/login', (req,res) =>{
    getUserByEmail(req.body.email)
      .then(( user) => {
        if(bcrypt.compareSync(req.body.password, user.password)){
          req.session.userId = user.id;
          res.redirect('/urls');
        } else {
          res.status(401).send('Email and password combo not found');
        }
      });
  });
  //allows user to logout of application
  app.post('/logout', (req, res) => {
    req.session = null;
    res.redirect('/');
  });

  app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
  });
});
