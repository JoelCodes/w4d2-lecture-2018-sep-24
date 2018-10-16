function makeUserDataHelpers(client){
  function getUserById(userId, cb){
    return client.query('SELECT * FROM users WHERE id = $1 LIMIT 1', [userId], (err, result) => {
      if(err){
        cb(err);
      } else {
        cb(null, result.rows[0]);
      }
    });
  }
  function isEmailTaken(email, cb){
    return client.query('SELECT * FROM users WHERE email = $1 LIMIT 1', [email], (err, result) => {
      if(err){
        cb(err);
      } else {
        cb(null, result.rows.length > 0);
      }
    });
  }
  function createUser(email, password, cb){
    const hash = bcrypt.hashSync(password, 10);
    return client.query('INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *', [email, hash], (err, result) => {
      if(err){
        cb(err);
      } else {
        cb(null, result.rows[0]);
      }
    });
  }

  function getUserByEmail(email, cb){
    return client.query('SELECT * FROM users WHERE email = $1 LIMIT 1', [email], (err, result) => {
      if(err){
        cb(err);
      } else {
        cb(null, result.rows[0]);
      }
    });
  }
  return {
    getUserById, 
    isEmailTaken, 
    createUser, 
    getUserByEmail
  };
}

module.exports = makeUserDataHelpers;