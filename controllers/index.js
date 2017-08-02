var express = require('express');
var router = express.Router();

/**
  * @description
  * First route will handle the static html file delievery.
  * Second route will handle the API calls.
*/
router.use('/',require('./home'));
router.use('/polls',require('./polls'));
router.use('/note',require('./note'));
router.use('/deduce',require('./deduce'));
router.use('/question',require('./question'));
router.use('/user',require('./users'));
module.exports = router;
