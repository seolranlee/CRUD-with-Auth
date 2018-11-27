module.exports = function () {
    var express = require('express');
    var session = require('express-session');
    var MySQLStore = require('express-mysql-session')(session);
    var bodyParser = require('body-parser');

    var app = express();
    app.set('views', './views/mysql');
    app.set('view engine', 'pug');
    var options = {
        host: 'localhost',
        port: 3306, // mysql 은 기본이 3306임.
        user: 'root',
        password: '1111',
        database: 'o2'
    };

    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(session({
        secret: '234u823?!@#$%@#sdfkl',
        resave: false,
        saveUninitialized: true,
        store: new MySQLStore(options)
    }));

    return app;
};