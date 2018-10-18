const bcrypt = require('bcrypt');
function makeUserDataHelpers(knex){

  function getUserById(userId){
    return knex('users')
      .first('*')
      .where({id: userId || 0});
    // client.query('SELECT * FROM users WHERE id = $1 LIMIT 1', [userId], (err, result) => {
    //   if(err){
    //     cb(err);
    //   } else {
    //     cb(null, result.rows[0]);
    //   }
    // });
  }
  function isEmailTaken(email){
    const userPromise = getUserByEmail(email);

    const userExistsPromise = userPromise
      .then(user => {
        return user !== undefined;
      });

    return userExistsPromise;
  }
  function createUser(email, password){

    const hash = bcrypt.hashSync(password, 10);

    const createdUsersPromise = knex('users')
      .returning('*')
      .insert([{
        email:email,
        password: hash
      }]);

    const firstUserPromise = createdUsersPromise
      .then((users) => {
        return users[0];
      });

    return firstUserPromise;
  }

  function getUserByEmail(email){
    return knex('users')
      .first('*')
      .where({email: email});
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