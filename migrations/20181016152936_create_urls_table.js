
exports.up = function(knex) {
  return knex.schema.createTable('urls', (table) => {
    table.increments();
    table.string('short_url').notNull();
    table.string('long_url').notNull();
    table.integer('user_id')
      .notNull()
      .references('id')
      .inTable('users');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('urls');
};
