module.exports = function () {
    var mysql      = require('mysql');
    var conn = mysql.createConnection({
        host     : 'localhost',
        user     : 'root',
        password : '1111',
        database : 'o2'
    });
    conn.connect();
    return conn;
};