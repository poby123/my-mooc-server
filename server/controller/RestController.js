const fs = require('fs');

class Rest {
  /**
   *
   * @param {object} connection
   * @param {string} uploadPath
   */
  constructor(connection, uploadPath) {
    this.connection = connection;
    this.uploadPath = uploadPath;
  }

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
}

module.exports = Rest;
