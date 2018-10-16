function makeUrlDataHelpers(client){
  function getUrlsForUser(userId, cb){
    client.query('SELECT * FROM urls WHERE "userId" = $1', [userId], (err, result) => {
      if(err){
        cb(err);
      } else {
        cb(null, result.rows);
      }
    });
  }

  function createUrl(shortUrl, longUrl, userId, cb){
    client.query(`INSERT INTO urls
    ("shortUrl", "longUrl", "userId")
    VALUES ($1, $2, $3) RETURNING *`, [shortUrl, longUrl, userId], (err, result) => {
      if(err){
        cb(err);
      } else {
        cb(null, result.rows[0]);
      }
    });
  }

  function getUrlByShortUrl(shortUrl, cb){
    client.query('SELECT * FROM urls WHERE "shortUrl" = $1 LIMIT 1', [shortUrl], (err, result) => {
      if(err){
        cb(err);
      } else {
        cb(null, result.rows[0]);
      }
    });
  }

  function updateUrl(shortUrl, longUrl, cb){
    client.query('UPDATE urls SET "longUrl" = $1 WHERE "shortUrl" = $2', [longUrl, shortUrl], (err) => {
      if(err){
        cb(err);
      } else {
        cb(null);
      }
    });
  }

  function deleteUrl(shortUrl, cb){
    client.query('DELETE FROM urls WHERE "shortUrl" = $1', [shortUrl], cb);
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