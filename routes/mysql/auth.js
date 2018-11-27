module.exports = function (passport) {
    var bkfd2Password = require("pbkdf2-password");
    var hasher = bkfd2Password();
    var conn = require('../../config/mysql/db')();
    var route = require('express').Router();
    route.post(
        '/login',
        passport.authenticate(  // 미들웨어(콜백함수를 만들어주는 역할)가 실행.
            'local',
            {
                successRedirect: '/topic',
                failureRedirect: '/auth/login',
                failureFlash: false
            }
        )
    );
    route.get(
        '/facebook',
        passport.authenticate(
            'facebook',
            { scope: 'email' }  // 받아올 수 있는 정보의 scope(범위)
        )
    );
    route.get(
        '/facebook/callback',
        passport.authenticate(
            'facebook',
            {
                successRedirect: '/topic',
                failureRedirect: '/auth/login',
            }
        )
    );
    route.post('/register',function (req,res){
        hasher({password: req.body.password}, function(err, pass, salt, hash){
            var user = {
                authId: 'local:'+req.body.username,
                username: req.body.username,
                password: hash,
                salt: salt,
                displayName: req.body.displayName
            };
            var sql = 'INSERT INTO users SET ?';
            conn.query(sql, user, function(err, results) {
                if(err){
                    console.log(err);
                    res.status(500);
                } else{
                    req.login(user, function (err) {
                        req.session.save(function () {
                            res.redirect('/welcome');
                        });
                    });
                }
            });
        });
    });
    route.get('/register', function (req,res){
        var sql = 'SELECT id, title FROM topic';
        conn.query(sql, function(err, topics, fields){
            res.render('auth/register', {topics: topics})
        });
    });
    route.get('/logout', function (req,res) {
        req.logout();
        req.session.save(function(){
            res.redirect('/topic');
        });
    });
    route.get('/login', function (req, res){
        var sql = 'SELECT id, title FROM topic';
        conn.query(sql, function(err, topics, fields){
            res.render('auth/login', {topics: topics})
        });

    });
    return route;
};