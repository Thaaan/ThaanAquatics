const pool = require('./index');

function getAllItems() {
  return new Promise((resolve, reject) => {
      pool.query('SELECT * FROM Products', function(err, results) {
          if(err) {
              reject(err);
          } else {
              resolve(results);
          }
      });
  });
}

function getItemByName(itemName) {
  return new Promise((resolve, reject) => {
      pool.query('SELECT * FROM Products WHERE Name = ?', [itemName], function(err, results) {
          if(err) {
              reject(err);
          } else {
              resolve(results);
          }
      });
  });
}

function getItemByCategory(itemCategory) {
  return new Promise((resolve, reject) => {
      pool.query('SELECT * FROM Products WHERE Category = ?', [itemCategory], function(err, results) {
          if(err) {
              reject(err);
          } else {
              resolve(results);
          }
      });
  });
}

module.exports = {
  getAllItems,
  getItemByName,
  getItemByCategory
};
