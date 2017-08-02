var rethinkdb = require('rethinkdb');
var db = require('./db');
var bcrypt = require('bcrypt-nodejs');


class user {
  user(profile){
     this.profile = profile;
     this.password = profile.password;
     this.email = profile.email;
  }

  validPassword(password){
    return bcrypt.compareSync(password,this.password);
  }
  
  findOne(email, handler){
    var allUsers = getAllUsers(function(err,response) {
      var err,res;
      if(err) {
        return res.json({"responseCode" : 1, "responseDesc" : response});
      }
      return response;
    }); 
    console.log(allUsers);
  }

  findById(id, handler){
     console.log(id);
  }

  encryptPassword(password){
    return bcrypt.hashSync(password,bcrypt.genSaltSync(5),null);
  }

  addNewUser(pollData,callback) {
    async.waterfall([
      function(callback) {
        var pollObject = new db();
        pollObject.connectToDb(function(err,connection) {
          if(err) {
            return callback(true,"Error connecting to database");
          }
          callback(null,connection);
        });
      },
      function(connection,callback) {
        rethinkdb.table('users').insert({
            "email" : pollData.email,
            "scenario" : pollData.scenario,
            "subject"  : pollData.subject,
            "objective": pollData.objective,
            "answer"   : pollData.answer,
            "type"     : pollData.type,
            "distractor":pollData.distractor,
            "polls" : pollData.polls
        }).run(connection,function(err,result) {
          connection.close();
          if(err) {
            return callback(true,"Error happens while adding new polls");
          }          
          callback(null,result);
        });
      }
    ],function(err,data) {
      callback(err === null ? false : true,data);
    });
  }

  
  getAllUsers(callback) {
    async.waterfall([
      function(callback) {
        var pollObject = new db();
        pollObject.connectToDb(function(err,connection) {
          if(err) {
            return callback(true,"Error connecting to database");
          }
          callback(null,connection);
        });
      },
      function(connection,callback) {
        rethinkdb.table('users').run(connection,function(err,cursor) {
          connection.close();
          if(err) {
            return callback(true,"Error fetching polls to database");
          }
          cursor.toArray(function(err, result) {
            if(err) {
              return callback(true,"Error reading cursor");
            }
            callback(null,result)
          });
        });
      }
    ],function(err,data) {
      callback(err === null ? false : true,data);
    });
  }
}

module.exports = user;