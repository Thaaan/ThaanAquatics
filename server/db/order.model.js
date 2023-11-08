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


module.exports = {
    addOrder
};