var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'roguelike' });
});


router.get('/play', function(req, res, next) {
  res.render('play', { title: 'rogue js' });
});

module.exports = router;
