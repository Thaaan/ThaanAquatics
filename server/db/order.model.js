const pool = require('./index');

function addOrder(session, items) {
    return new Promise((resolve, reject) => {
        // First, check if the session ID already exists in the table
        const checkSql = 'SELECT `ID` FROM `Orders` WHERE `Session_id` = ? LIMIT 1';
        pool.query(checkSql, [session.id], (checkError, checkResults) => {
            if (checkError) {
                reject(checkError);
            } else if (checkResults.length > 0) {
                resolve({ message: 'Order already exists', orderId: checkResults[0].ID });
            } else {
                const insertSql = 'INSERT INTO `Orders` (`Session_id`, `Email`, `Items`, `Amount`) VALUES (?, ?, ?, ?)';
                const values = [
                    session.id,
                    session.customer_details.email,
                    JSON.stringify(items),
                    session.amount_total / 100
                ];

                pool.query(insertSql, values, (insertError, insertResults) => {
                    if (insertError) {
                        reject(insertError);
                    } else {
                        resolve({ message: 'Order added successfully', orderId: insertResults.insertId });
                    }
                });
            }
        });
    });
}

function soldQuantity(item, quantity) {
    return new Promise((resolve, reject) => {
        pool.query('UPDATE Products SET Quantity = GREATEST(0, Quantity - ?) WHERE Name = ?', [quantity, item], function(err, results) {
            if(err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
}

function getQuantity(item) {
    return new Promise((resolve, reject) => {
        pool.query('SELECT Quantity FROM `Products` WHERE Name = ?', [item], function(err, results) {
            if(err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
}


module.exports = {
    addOrder,
    soldQuantity,
    getQuantity
};