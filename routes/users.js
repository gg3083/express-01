var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/db', function(req, res, next) {
  console.log('db init ')
  res.send('respond with a resource');
});

module.exports = router;
