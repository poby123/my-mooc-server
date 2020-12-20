const express = require('express');
const mysql = require('mysql');
const session = require('express-session');
const router = express.Router();
const dbConfig = require('../config/database.js');
const sessionAuth = require('../config/session.js');

router.use(session(sessionAuth));

/* GET home page. */
router.get('/', function (req, res) {
  if (req.session.name) {
    console.log('login 상태입니다');
  } else {
    console.log('logout 상태입니다.');
  }
  res.render('index', { title: 'Express' });
});

module.exports = router;
