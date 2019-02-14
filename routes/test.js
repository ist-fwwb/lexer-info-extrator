var express = require('express');
var router = express.Router();
var today = require('../variables/general').today

/* GET home page. */
router.get('/today', function(req, res, next) {
  return res.send(today)
});

module.exports = router;
