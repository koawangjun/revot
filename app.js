var express = require('express');
var rethinkdb = require('rethinkdb');
var bodyParser = require('body-parser');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var db = require('./models/db');
var feed;
var session = require('express-session');
var flash = require('connect-flash');
var cookie = require('cookie-parser');
//var RDBStore = require('rethinkdb-express-session')(session);
var passport = require('passport');
var validator = require('express-validator');
var UserClass = require("./models/user.js");
var User = new UserClass();
var localStategy = require('passport-local').Strategy;

passport.serializeUser(function(user, done) {
    done(null, user.id);   
});                           

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(null, user);
  }); 
});

passport.use('local.signup',new localStategy({
        usernameField:'email',
        passwordField:'password',
        passReqToCallback:true  //此处为true，下面函数的参数才能有req
    },function(req,email,password,done){
        req.checkBody('email','您输入的email无效').notEmpty().isEmail();
        req.checkBody('password',"您输入了无效密码").notEmpty().isLength({min:4});
      /*  var errors = req.validationErrors();
        if(errors){
            var messages = [];
            errors.forEach(function(error){
                messages.push(error.msg);
            });
         return done(null,false,req.flash('error',messages));
        }
        */
        User.findOne({'email':email},function(err,user){
            console.log("Err:"+err);
            console.log("User:"+user);
            if(err){
                return done(err);
            }
            if(user){
                return done(null,false,{message:"此邮件已经被注册"});
            }
            var newUser = new UserClass();
            var newuser = {name:"",password:"",type:"",id:1};
            newuser.name = email;
            newuser.password = password;
            newUser.findCount(newuser,function(err,result){
                if(err){
                    return done(err);
                };
                newuser.id = result + 1;
                var saveUser = new UserClass();
                console.log("newuser:"+newuser);
                saveUser.save(newuser,function(err,user){
                  if(err){
                    return done(err);
                  };
                  return done(null,user);
                });
                
            });
        });
}));

passport.use('local.login',new localStategy({
    usernameField:'email',
    passwordField:'password',
    passReqToCallback:true  //此处为true，下面函数的参数才能有req
},function(req,email,password,done){
    console.log(email);
    req.checkBody('email','您输入的email无效').notEmpty();
    req.checkBody('password',"您输入了无效密码").notEmpty();
   /*   var errors = req.validationErrors();
        if(errors){
            var messages = [];
            errors.forEach(function(error){
                messages.push(error.msg);
            });
         return done(null,false,req.flash('error',messages));
        }*/
       
   

    User.findOne({'email':email}, (function(err,user){
         if(err){
            return done(err);
         }
         if(!user){
            return done(null,false,{message:"用户名错误!"});
         } 
         if(!(password == user.password))
         {
            return done(null,false,{message:"密码错误!"});
         } 
         console.log(user);
         return done(null,user);
         }));
         // console.log(userData);
    }));


io.on('connection',function(socket) {
  feed = require('./models/feeds')(socket);
});
/**
  Adding the controllers.
*/
var dbModel = new db();
dbModel.setupDb();

/*
var rdbStore = new RDBStore({
  // required, user specified 
  database: 'polls',
  connection: rethinkdb.connect({
      host : 'localhost',
      port : 28015,
      db   : 'polls'
    }, function(err,connection) {
   //   callback(err,connection);
        console.log(connection);
    }), 
  // optional, values shown are defaults default 
  table: 'users',
  sessionTimeout: 86400000,
  flushInterval: 60000,
  instance: require('rethinkdb') // ^2.2.2 
}); */
 

  app.use(express.static('public'));
  app.use(cookie());
  app.use(bodyParser());
  app.use(session({
      key: 'keyboard cat',
      resave: false,
      saveUninitialized: false,
      secret: 'my5uperSEC537(key)!'}));
  app.use(validator());
  app.use(flash());
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(express.Router());
  app.use(function(req,res,next){
    res.locals.login = req.isAuthenticated();
    next();
  });

//app.use(express.static(__dirname + '/node_modules'));
//app.use(require('./node_modules/signature_pad'));
//app.use(express.static(path.join(__dirname, 'public')));
app.post('/login',
  passport.authenticate('local.login',{ session: false, failureRedirect: "failure/login" }),
  function(req, res) {
    // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
    //console.log("res:",res);
   // res.send('profile/login?name=' + req.user.name);
    if (req.user.name == 'admin') { 
      res.send('/#/admin?name=admin'); 
    } else {
      console.log(req.user.name);
      res.send('/#/profile/login?name=' + req.user.name);
    }

  });

app.post('/signup',
  passport.authenticate('local.signup',{ session: false, failureRedirect: "failure/signup" }),
  function(req, res) {
    // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
    //console.log("res:",res);
   // res.send('profile/login?name=' + req.user.name);
   res.send('/#/profile/login?name=' + req.user.name);
  });
//app.get('/login','./view/index.html');

app.use(express.static(__dirname + '/view'));
app.use(express.static(__dirname + '/controllers'));
app.use(express.static(__dirname + '/models'));
app.use(require('./controllers'));

http.listen(3000, function(){
  console.log('listening on port 3000');
});

//module.exports = Signature_Pad;
