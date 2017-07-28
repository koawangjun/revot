"use strict";
var rethinkdb = require('rethinkdb');
var db = require('./db');
var async = require('async');

class deduce {
  addNewDeduces(pollData,callback) {
    async.waterfall([
      function(callback) {
        var pollObject = new db();
        console.log("hacks");
        console.log(pollData);
        pollObject.connectToDb(function(err,connection) {
          if(err) {
            return callback(true,"Error connecting to database");
          }
          callback(null,connection);
        });
      },
      function(connection,callback) {
        rethinkdb.table('deduce').insert({
            "id" : pollData.id,
            "question"  : pollData.question,
            "length"    : pollData.length,
	          "subject"   : pollData.subject,
	          "objective" : pollData.objective,
	          "deduces"   : pollData.deduces
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

  voteDeduceOption(pollData,callback) {
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
        rethinkdb.table('deduce').get(pollData.id).run(connection,function(err,result) {
          if(err) {
            return callback(true,"Error fetching polls to database");
          }
          for(var pollCounter = 0; pollCounter < result.polls.length; pollCounter++) {
            if(result.polls[pollCounter].option === pollData.option) {
              result.polls[pollCounter].vote += 1;
              break;
            }
          }
          rethinkdb.table('deduce').get(pollData.id).update(result).run(connection,function(err,result) {
            connection.close();
            if(err) {
              return callback(true,"Error updating the vote");
            }
            callback(null,result);
          });
        });
      }
    ],function(err,data) {
      callback(err === null ? false : true,data);
    });
  }

  getAllDeduces(callback) {
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
        rethinkdb.table('deduce').run(connection,function(err,cursor) {
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

module.exports = deduce;
