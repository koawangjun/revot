var express = require('express');
var router = express.Router();
// require model file.
var deduceModel = require('../models/deduce');

router.route('/')
  .get(function(req,res) {
    // Code to fetch the polls.
    var deduceObject = new deduceModel();
    // Calling our model function.
    deduceObject.getAllDeduces(function(err,pollResponse) {
      if(err) {
        return res.json({"responseCode" : 1, "responseDesc" : pollResponse});
      }
      res.json({"responseCode" : 0, "responseDesc" : "Success", "data" : pollResponse});
    });
  })
  .post(function(req,res) {
    // Code to add new polls.
    var deduceObject = new deduceModel();
    // Calling our model function.
    // We nee to validate our payload here.
    deduceObject.addNewDeduces(req.body,function(err,pollResponse) {
      if(err) {
        return res.json({"responseCode" : 1, "responseDesc" : pollResponse});
      }
      res.json({"responseCode" : 0, "responseDesc" : "Success","data" : pollResponse});
    });
  })
  .put(function(req,res) {
    // Code to update votes of poll.
    var deduceObject = new deduceModel();
    // Calling our model function.
    // We need to validate our payload here.
    deduceObject.voteDeduceOption(req.body,function(err,pollResponse) {
      if(err) {
        return res.json({"responseCode" : 1, "responseDesc" : pollResponse});
      }
      res.json({"responseCode" : 0, "responseDesc" : "Success", "data" : pollResponse});
    });
  });

module.exports = router;
