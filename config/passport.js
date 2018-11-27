module.exports = function (app) {
    var conn = require('./db')(); // ./ = 같은 디렉토리를 의미   // 함수라서 호출을 해줘야함.
    var bkfd2Password = require("pbkdf2-password");
    var hasher = bkfd2Password();
    var passport = require('passport');
    var LocalStrategy = require('passport-local').Strategy;
    var FacebookStrategy = require('passport-facebook').Strategy;

    app.use(passport.initialize());
    app.use(passport.session());

    passport.serializeUser(function(user, done) {
        console.log('serializeUser', user);
        done(null, user.authId);  // 두번째 인자는 데이터 식별자 자리   // 세션이 저장된다.
        // 우리는 id값을 설정해놓지 않았기 때문에 일단 username을 "식별자"로 쓴다.
    });

    passport.deserializeUser(function(id, done) {
        console.log('deserializeUser', id);
        var sql = 'SELECT * FROM users WHERE authId=?';
        conn.query(sql, [id], function (err, results) {
            console.log(sql, err, results);
            if(err){
                console.log(err);
                done('There is no user');
            }else{
                return done(null, results[0]);
            }
        });
    });

    passport.use(new LocalStrategy(     // new=> 객체를 생성
        function (username, password, done) {
            var username = username;
            var password = password;

            var sql = 'SELECT * FROM users WHERE authId=?';
            conn.query(sql, ['local:'+username], function (err, results) {
                // console.log(results);
                if(err){
                    return done('There is no user');
                }
                var user = results[0];
                return hasher({password: password, salt: user.salt}, function (err, pass, salt, hash) {
                    if(hash === user.password){
                        console.log('LocalStrategy', user);
                        done(null, user);   // 로그인 절차가 끝났고 성공했다. 로그인한 사용자 객체를 전달한다.
                        // passport.serializeUser()의 콜백함수가 실행된다.
                    }else{
                        done(null, false);  // 로그인 절차가 끝났고 실패했다.
                        // res.send('아이디나 비밀번호를 확인하세요. <a href="/auth/login">login</a>');
                    }
                })
            });
        }
    ));

    passport.use(new FacebookStrategy({
            clientID: '297405317766824',
            clientSecret: 'd825e059a092c9a1fc0618d10e326396',
            callbackURL: "/auth/facebook/callback",
            profileFields: ['id', 'email', 'gender', 'link', 'locale', 'name', 'timezone', 'updated_time', 'verified', 'displayName']  // profile에 들어올 정보들을 명시적으로 표시할 수 있다.
        },
        function(accessToken, refreshToken, profile, done) {    // profile 정보가 가장 중요.
            console.log(profile);
            var authId = 'facebook:'+profile.id;
            var sql = 'SELECT * FROM users WHERE authId=?';
            conn.query(sql, [authId], function (err, results) {
                if(results.length>0){   // 사용자가 존재한다면.
                    done(null, results[0]);
                }else{
                    var newuser = {     // 사용자가 없다면 return 문에 걸리지 않아서 새로운 유저 정보 객체를 생성한다.
                        'authId': authId,
                        'displayName': profile.displayName,
                        'email': profile.emails[0].value,
                    };
                    var sql = 'INSERT INTO users SET ?';
                    conn.query(sql, newuser, function (err, results) {
                        if(err){
                            console.log(err);
                            done('Error');
                        }else{
                            done(null, newuser);
                        }
                    })
                }
            });
        }
    ));
    return passport;
};