var express = require('express');
var router = express.Router();
// require model file.
var passport = require('passport');
var userModel = require('../models/user');

router.route('/signup').post(
    passport.authenticate('local.signup',{
        successRedirect:'/user/profile',
        failureRedirect:'/create_vote',
        failureFlash:true
    }),function(req,res,next){
});

router.route('/login').post(
    passport.authenticate('local.login',{
        successRedirect:'/user/profile',
        failureRedirect:'/create_vote',
        failureFlash:true
    }),function(req,res,next){
});
module.exports = router;
