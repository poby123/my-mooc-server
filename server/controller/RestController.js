const fs = require('fs');

class Rest {
  /**
   *
   * @param {object} connection
   * @param {string} uploadPath
   * @param {string} category
   * @param {string} writer
   */
  constructor(connection, uploadPath) {
    this.connection = connection;
    this.uploadPath = uploadPath;
  }

  getBoard = async function (session, category, writer) {
    return new Promise((resolve, reject) => {
      if (category) {
        const query =
          'SELECT tbl_board.*, tbl_user.profile_image FROM tbl_board RIGHT JOIN tbl_user ON tbl_user.id = tbl_board.writer where category=?';
        const params = [category];
        this.connection.query(query, params, (err, select_result) => {
          if (err) {
            reject(err);
          } else {
            resolve(select_result);
          }
        });
      } else if (writer) {
        const query =
          'SELECT tbl_board.*, tbl_user.profile_image FROM tbl_board RIGHT JOIN tbl_user ON tbl_user.id = tbl_board.writer where writer=?';
        const params = [writer];
        this.connection.query(query, params, (err, select_result) => {
          if (err) {
            reject(err);
          } else {
            resolve(select_result);
          }
        });
      } else {
        const query =
          'SELECT tbl_board.*, tbl_user.profile_image FROM tbl_board RIGHT JOIN tbl_user ON tbl_user.id = tbl_board.writer where category=? OR category=? OR category=?';
        const allString = `0-0`;
        const gradeString = `${session.grade}-0`;
        const classString = `${session.grade}-${session.class}`;
        const params = [allString, gradeString, classString];
        this.connection.query(query, params, (err, select_result) => {
          if (err) {
            reject(err);
          } else {
            resolve(select_result);
          }
        });
      }
    });
  };

  getUser = async function (session) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM tbl_user where id=?';
      const param = [session.name];
      this.connection.query(query, param, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  };

  /**
   *
   * @param {string} writer
   * @param {string} category
   * @param {Array} files
   * @param {string} content
   */
  write = async function (writer, category, files, content) {
    return new Promise((resolve, reject) => {
      if (writer && category && content) {
        const fileString = (files && files.join(';')) || null;
        const query = 'INSERT INTO tbl_board (writer, category, file, content) VALUES (?,?,?,?)';
        const params = [writer, category, fileString, content];
        this.connection.query(query, params, (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(true);
          }
        });
      } else {
        reject(new Error('필수 프로퍼티가 비어있습니다.'));
      }
    });
  };

  /**
   *
   * @param {object} session
   * @param {string} board_id
   */
  delete = async function (session, board_id) {
    return new Promise((resolve, reject) => {
      if (board_id) {
        const query = 'SELECT * FROM tbl_board where id=?';
        const params = board_id;
        this.connection.query(query, params, (err, search_result) => {
          if (err) {
            reject(err);
          } else {
            if (search_result.length <= 0) {
              reject(new Error('존재하지 않는 게시물입니다'));
            } else if (search_result[0].writer == session.name) {
              const files = (search_result[0].file && search_result[0].file.split(';')) || undefined;
              this.connection.query('DELETE FROM tbl_board where id=?', [board_id], (err) => {
                if (err) {
                  reject(err);
                } else {
                  files && this.deleteFiles(files);
                  resolve(true);
                }
              });
            } else {
              reject(new Error('삭제할 권한이 없습니다'));
            }
          }
        });
      } else {
        reject(new Error('필수 프로퍼티가 비어있습니다.'));
      }
    });
  };

  /**
   *
   * @param {Array} files
   */
  deleteFiles = function (files) {
    files.map((filename) => {
      const path = this.uploadPath + filename;
      fs.unlink(path, (err) => {
        if (err) {
          console.log(err);
        }
      });
    });
  };

  /**
   * @param {object} session
   * @param {string} profile
   * @param {Array} profile_image
   */
  updateProfile = async function (session, profile, profile_image) {
    return new Promise((resolve, reject) => {
      this.connection.query('SELECT profile_image FROM tbl_user WHERE id=?', [session.name], (err, select_result) => {
        if (err) {
          reject(err);
        } else {
          let query = 'UPDATE tbl_user SET ';
          let params = [];
          if (profile) {
            query += ' profile=? ';
            params.push(profile);
          } else {
            query += ' profile=NULL ';
          }
          if (profile_image) {
            query += ', profile_image=? ';
            params.push(profile_image);
          }
          query += ' WHERE id=? ';
          params.push(session.name);

          this.connection.query(query, params, (err) => {
            if (err) {
              reject(err);
            } else {
              if (profile_image && select_result[0].profile_image) {
                this.deleteFiles([select_result[0].profile_image]);
              }
              resolve(true);
            }
          });
        }
      });
    });
  };
}

module.exports = Rest;
