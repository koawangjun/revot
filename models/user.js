
var rethinkdb = require('rethinkdb');
var db = require('./db');
var bcrypt = require('bcrypt-nodejs');
var async = require('async');

class user { 
  findOne(email, handler){
    findOneUser(email,handler);    
  }

  findById(id, handler){
    findOneById(id,handler);
  }


  findCount(user,handler){
    return findAllCount(handler);
  }

  save(user,handler){    
    addNewUser(user,handler);
  }

  
/*
  validPassword(password){
    return bcrypt.compareSync(password,this.password);
  }
  */
  /*
  constructor(){
     this.profile = profile;
     this.password = profile.password;
     this.email = profile.email;
     this.findOne = findOne;
     this.allUsersRes = this.getAllUsers(function(err,response) {
      if(err) {
        return res.json({"responseCode" : 1, "responseDesc" : response});
      }
      return {"responseCode" : 0, "responseDesc" : "Success", "data" : response};
    });

    if (this.allUsersRes.responseDesc == "Success") {
       this.allUsers = this.allUsersRes.data;
    }
  }
  */


}

  
  
  function findOneUser(email,callback) {
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
            
            var i;
            for (i=0;i<result.length;i++) {
              if (result[i].name == email.email) {
                callback(null,result[i]);
              }
            };
            callback(null,null);     
          });
        });
      }
    ],function(err,data) {

      callback(err === null ? false : true,data);
     
    });
  }

  function findOneById(id,callback) {
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
            
            var i;
            for (i=0;i<result.length;i++) {
              if (result[i].id == id) {
                callback(null,result[i]);
              }
            };     
          });
        });
      }
    ],function(err,data) {

      callback(err === null ? false : true,data);
     
    });
  }

  function findAllCount(callback) {
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
            console.log(result.length);
            return callback(null,result.length);
            
          });
        });
      }
    ],function(err,data) {

      callback(err === null ? false : true,data);
     
    });
  }


  function addNewUser(user,callback) {
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
        console.log(user);       
        rethinkdb.table('users').insert({
            "name" : user.name,
            "password" : user.password,
            "type"  : "client",
            "id": user.id
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
  
module.exports = user;