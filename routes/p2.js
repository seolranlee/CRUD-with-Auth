module.exports = function (app) {
    var express = require('express');
    var route = express.Router();
    route.get('/r1', function (req, res) {
        res.send('Hello /p2/r1');
    });
    route.get('/r2', function (req, res) {
        res.send('Hello /p2/r2');
    });
    app.get('/p4/r1',function (req,res) {
        res.send('Hello /p4/r1')
    });
    return route;
};