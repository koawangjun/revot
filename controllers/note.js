var express = require('express');
var router = express.Router();
// require model file.
var noteModel = require('../models/note');


router.route('/')
  .get(function(req,res) {
    // Code to fetch the polls.
    var noteObject = new noteModel();
    // Calling our model function.
    noteObject.getAllNotes(function(err,pollResponse) {
      if(err) {
        return res.json({"responseCode" : 1, "responseDesc" : pollResponse});
      }
      res.json({"responseCode" : 0, "responseDesc" : "Success", "data" : pollResponse});
    });
  })
  .post(function(req,res) {
    // Code to add new polls.
    var noteObject = new noteModel();
    // Calling our model function.
    // We nee to validate our payload here.
    noteObject.addNewNotes(req.body,function(err,pollResponse) {
      if(err) {
        return res.json({"responseCode" : 1, "responseDesc" : pollResponse});
      }
      res.json({"responseCode" : 0, "responseDesc" : "Success","data" : pollResponse});
    });
  })
  .put(function(req,res) {
    // Code to update votes of poll.
    var noteObject = new noteModel();
    // Calling our model function.
    // We need to validate our payload here.
    noteObject.voteNotesOption(req.body,function(err,pollResponse) {
      if(err) {
        return res.json({"responseCode" : 1, "responseDesc" : pollResponse});
      }
      res.json({"responseCode" : 0, "responseDesc" : "Success", "data" : pollResponse});
    });
  });

module.exports = router;
