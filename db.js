let mysql = require('mysql');

let db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "justnow_db"
});

db.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
});

module.exports = db;