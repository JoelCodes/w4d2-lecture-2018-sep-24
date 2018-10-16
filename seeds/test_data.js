
const bcrypt = require('bcrypt');

exports.seed = function(knex) {
  // Deletes ALL existing entries
  const deleteUrls = knex('urls').del();
  const thenDeleteUsers = deleteUrls
    .then(() => {
      return knex('users').del();
    });
  
  const thenCreateUsers = thenDeleteUsers
    .then(() => {
      return knex('users')
        .returning('*')
        .insert([{
          email: 'joel@joel.joel',
          password: bcrypt.hashSync('joel', 10)
        }, {
          email: 'rosy@rosy.rosy',
          password: bcrypt.hashSync('rosy', 10)
        }]);
    });
  
  const thenCreateUrls = thenCreateUsers
    .then((users) => {
      const joel = users[0];
      const rosy = users[1];
      // const [joel, rosy] = users;
      // Google array destructuring, Zoe.

      return knex('urls')
        .insert([
          {
            long_url: 'http://reddit.com',
            short_url: 'a1234z',
            user_id: joel.id,
          }, {
            long_url: 'http://facebook.com',
            short_url: 'b1234y',
            user_id: rosy.id
          }
        ]);
    });
  return thenCreateUrls;
};
