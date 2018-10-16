
exports.up = function(knex) {
  return knex.schema.createTable('users', (table) => {
    table.increments();
    table.string('email').notNull();
    table.string('password').notNull();
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('users');
};
