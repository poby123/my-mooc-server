const express = require('express');
const session = require('express-session');
const mysql = require('mysql');
const path = require('path');
const router = express.Router();
const dbConfig = require('../config/database.js');
const sessionAuth = require('../config/session.js');
const multer = require('multer');

const connection = mysql.createPool(dbConfig);
const uploadPath = 'uploads/';
router.use(session(sessionAuth));

const Rest = require('../controller/RestController');
const myRest = new Rest(connection, uploadPath);

const checkSignedAuth = function (auth = 0) {
  return (req, res, next) => {
    if (req.session.name) {
      if (req.session.auth > auth) {
        next();
      } else {
        res.status(401).send('권한이 없습니다.');
      }
    } else {
      res.status(401).send('로그인이 필요한 서비스입니다.');
    }
  };
};

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      cb(null, new Date().valueOf() + path.extname(file.originalname));
    },
  }),
});

/**
 * GET /board
 */
router.get('/board', (req, res) => {
  res.render('write');
});

/**
 * POST /board to write
 */
router.post('/board', checkSignedAuth(), upload.fields([{ name: 'files', maxCount: 2 }]), async (req, res) => {
  const writer = req.session.name;
  const { category, content } = req.body;
  const files =
    (req.files.files &&
      req.files.files.reduce((files, file_obj) => {
        files.push(file_obj.filename);
        return files;
      }, [])) ||
    null;

  if (category && content) {
    try {
      await myRest.write(writer, category, files, content);
      res.json({ result: true });
    } catch (error) {
      files && myRest.deleteFiles(files);
      console.log('[ IN REST.JS "POST" /board ]', error);
      res.json({ result: false, error: error.message });
    }
  } else {
    files && myRest.deleteFiles(files);
    res.status(400);
    res.json({ result: false, error: 'Some elements are empty.' });
  }
});

/**
 * DELETE /board
 */
router.delete('/board', checkSignedAuth(), async (req, res) => {
  let { board_id } = req.body;
  if (board_id) {
    try {
      await myRest.delete(req.session, board_id);
      res.json({ result: true });
    } catch (error) {
      console.log('[ IN REST.JS "DELETE" /board ]', error);
      res.json({ result: false, error: error.message });
    }
  } else {
    res.status(400);
    res.json({ result: false, error: '필드가 비어있거나, 글의 주인이 아닙니다. 권한이 없습니다.' });
  }
});

module.exports = router;
