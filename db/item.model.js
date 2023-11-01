const pool = require('./index');

function getItemByName(itemName) {
  return new Promise((resolve, reject) => {
      pool.query('SELECT * FROM Products WHERE name = ?', [itemName], function(err, results) {
          if(err) {
              reject(err);
          } else {
              resolve(results);
          }
      });
  });
}



module.exports = {
  getItemByName
};
