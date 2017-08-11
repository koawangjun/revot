var express = require('express');
var router = express.Router();
// require model file.
var passport = require('passport');
var userModel = require('../models/user');
/*
router.route('/signup').post(
    passport.authenticate('local.signup',{
        successRedirect:'/user/profile',
        failureRedirect:'/create_vote',
        failureFlash:true
    }),function(req,res,next){
}); */

router.get('/login',
    function(req,res,next){
          console.log("name:"+req.query.name)        
          return req.query.name;
    }
);

router.get('/fail',
    function(req,res,next){
          //console.log("name:"+req.query.name)  
          res.send('/#/create_vote');      
          //return req.query.name;
    }
);
module.exports = router;
