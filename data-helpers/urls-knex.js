function makeUrlDataHelpers(knex){
  function getUrlsForUser(userId, cb){
    knex('urls')
      .select('*')
      .where({user_id: userId})
      .asCallback(cb);
    // client.query('SELECT * FROM urls WHERE "userId" = $1', [userId], (err, result) => {
    //   if(err){
    //     cb(err);
    //   } else {
    //     cb(null, result.rows);
    //   }
    // });
  }

  function createUrl(shortUrl, longUrl, userId, cb){
    knex('urls')
      .returning('*')
      .insert([{short_url: shortUrl, long_url: longUrl, user_id: userId}])
      .asCallback((err, urls) => {
        if(err){
          cb(err);
        } else {
          cb(null, urls[0]);
        }
      });
    // client.query(`INSERT INTO urls
    // ("shortUrl", "longUrl", "userId")
    // VALUES ($1, $2, $3) RETURNING *`, [shortUrl, longUrl, userId], (err, result) => {
    //   if(err){
    //     cb(err);
    //   } else {
    //     cb(null, result.rows[0]);
    //   }
    // });
  }

  function getUrlByShortUrl(shortUrl, cb){
    knex('urls')
      .first('*')
      .where({short_url: shortUrl})
      .asCallback(cb);
    // client.query('SELECT * FROM urls WHERE "shortUrl" = $1 LIMIT 1', [shortUrl], (err, result) => {
    //   if(err){
    //     cb(err);
    //   } else {
    //     cb(null, result.rows[0]);
    //   }
    // });
  }

  function updateUrl(shortUrl, longUrl, cb){
    knex('urls')
      .where({short_url: shortUrl})
      .update({long_url: longUrl})
      .asCallback(cb);
    // client.query('UPDATE urls SET "longUrl" = $1 WHERE "shortUrl" = $2', [longUrl, shortUrl], (err) => {
    //   if(err){
    //     cb(err);
    //   } else {
    //     cb(null);
    //   }
    // });
  }

  function deleteUrl(shortUrl, cb){
    knex('urls')
      .where({short_url: shortUrl})
      .del()
      .asCallback(cb);
    // client.query('DELETE FROM urls WHERE "shortUrl" = $1', [shortUrl], cb);
  }

  return {
    getUrlsForUser,
    createUrl,
    getUrlByShortUrl,
    updateUrl,
    deleteUrl,
  };
}

module.exports = makeUrlDataHelpers;