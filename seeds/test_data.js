
const bcrypt = require('bcrypt');

exports.seed = function(knex) {
  // Deletes ALL existing entries
  const deleteUrls = knex('urls').del();
  const thenDeleteUsers = deleteUrls
    .then(() => {
      return knex('users').del();
    });
  const hashJoelPW = bcrypt.hash('joel', 10);
  const hashRosyPW = bcrypt.hash('rosy', 10);

  const readyToCreateUsers = Promise.all([hashJoelPW, hashRosyPW, thenDeleteUsers]);

  const thenCreateUsers = readyToCreateUsers
    .then((results) => {
      const [joelPW, rosyPW] = results;
      return knex('users')
        .returning('*')
        .insert([{
          email: 'joel@joel.joel',
          password: joelPW
        }, {
          email: 'rosy@rosy.rosy',
          password: rosyPW
        }]);
    });
  
  const thenCreateUrls = thenCreateUsers
    .then((users) => {
      const joel = users[0];
      const rosy = users[1];
      // const [joel, rosy] = users;
      // Google array destructuring, Zoe.

      return knex('urls')
        .returning('*')
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

// exports.seed = async function(knex) {
//   // Deletes ALL existing entries
//   await knex('urls').del();
//   await knex('users').del();
//   const [joel, rosy] = await knex('users')
//     .returning('*')
//     .insert([{
//       email: 'joel@joel.joel',
//       password: bcrypt.hashSync('joel', 10)
//     }, {
//       email: 'rosy@rosy.rosy',
//       password: bcrypt.hashSync('rosy', 10)
//     }]);
//   const urls = await knex('urls')
//     .returning('*')
//     .insert([
//       {
//         long_url: 'http://reddit.com',
//         short_url: 'a1234z',
//         user_id: joel.id,
//       }, {
//         long_url: 'http://facebook.com',
//         short_url: 'b1234y',
//         user_id: rosy.id
//       }
//     ]);
//   return urls;
// };
