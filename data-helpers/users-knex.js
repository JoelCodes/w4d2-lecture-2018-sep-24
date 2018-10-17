const bcrypt = require('bcrypt');
function makeUserDataHelpers(knex){

  function getUserById(userId, cb){
    knex('users')
      .first('*')
      .where({id: userId})
      .asCallback(cb);
    // client.query('SELECT * FROM users WHERE id = $1 LIMIT 1', [userId], (err, result) => {
    //   if(err){
    //     cb(err);
    //   } else {
    //     cb(null, result.rows[0]);
    //   }
    // });
  }
  function isEmailTaken(email, cb){
    getUserByEmail(email, (err, user) => {
      if(err){
        cb(err);
      } else {
        cb(null, user !== undefined);
      }
    });
    // return client.query('SELECT * FROM users WHERE email = $1 LIMIT 1', [email], (err, result) => {
    //   if(err){
    //     cb(err);
    //   } else {
    //     cb(null, result.rows.length > 0);
    //   }
    // });
  }
  function createUser(email, password, cb){

    const hash = bcrypt.hashSync(password, 10);
    knex('users')
      .returning('*')
      .insert([{
        email:email,
        password: hash
      }])
      .asCallback((err, users) => {
        if(err){
          cb(err);
        } else {
          cb(null, users[0]);
        }
      });
    // return client.query('INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *', [email, hash], (err, result) => {
    //   if(err){
    //     cb(err);
    //   } else {
    //     cb(null, result.rows[0]);
    //   }
    // });
  }

  function getUserByEmail(email, cb){
    knex('users')
      .first('*')
      .where({email: email})
      .asCallback(cb);
    // return client.query('SELECT * FROM users WHERE email = $1 LIMIT 1', [email], (err, result) => {
    //   if(err){
    //     cb(err);
    //   } else {
    //     cb(null, result.rows[0]);
    //   }
    // });
  }
  return {
    getUserById, 
    isEmailTaken, 
    createUser, 
    getUserByEmail
  };
}

module.exports = makeUserDataHelpers;