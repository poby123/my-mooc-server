const express = require('express');
const mysql = require('mysql');
const session = require('express-session');
const router = express.Router();
const dbConfig = require('../config/database.js');
const sessionAuth = require('../config/session.js');

const connection = mysql.createPool(dbConfig);
router.use(session(sessionAuth));

const Auth = require('../controller/AuthController');
const myAuth = new Auth(connection);

/* POST /auth/signup. */
router.post('/signup', async (req, res) => {
  let { id, password, number, grade, _class, email, auth } = req.body;
  if (id && password && number && grade && _class && auth) {
    try {
      await myAuth.signup(id, password, number, grade, _class, email, auth);
      res.json({ result: true });
    } catch (err) {
      console.log('[ IN AUTH.JS SIGNUP ROUTER ]', err);
      res.status(500);
      res.json({ result: false, error: 'Database error. Please check duplicate name' });
    }
  } else {
    res.status(400);
    res.json({ result: false, error: 'Some elements are empty.' });
  }
});

router.get('/signin', (req, res) => {
  res.render('signin');
});

/* POST /auth/signin */
router.post('/signin', async (req, res) => {
  let { id, password } = req.body;
  if (id && password) {
    try {
      const result = await myAuth.signin(id, password);
      if (result.same) {
        req.session.name = result.user.id;
        req.session.auth = result.user.auth;
        req.session.grade = result.user.grade;
        req.session.class = result.user.class;
        req.session.status = result.user.status;

        req.session.save(() => {
          res.json({ result: true });
        });
      } else {
        res.json({ result: false, error: '아이디나 비밀번호가 일치하지 않습니다.' });
      }
    } catch (err) {
      console.log('[ IN AUTH.JS SIGNIN ROUTER ]', err);
      res.status(500);
      res.json({ result: false, error: err.message });
    }
  } else {
    res.status(400);
    res.json({ result: false, error: 'id or password is empty' });
  }
});

/* GET /auth/signout */
router.get('/signout', (req, res) => {
  if (req.session.name) {
    req.session.destroy((err) => {
      if (err) {
        res.status(500);
        res.json({ result: false, error: err.message });
      } else {
        req.session;
        res.json({ result: true });
      }
    });
  } else {
    console.log('만료된 세션에서 로그아웃 요청...');
    res.json({ result: true });
  }
});

module.exports = router;
