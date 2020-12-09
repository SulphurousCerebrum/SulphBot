var mysql = require('mysql');

var connection = mysql.createConnection({
    host     : '127.0.0.1',
    user     : 'root',
    password : 'password',
    database : 'sulphbot'
});

connection.connect(function(err) {
    if (err) throw err;
    console.log("Connected to Database")
});

module.exports = connection;