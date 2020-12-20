const bcrypt = require('bcrypt');
const saltRounds = 10;

class Auth {
  constructor(connection) {
    this.connection = connection;
  }

  /**
   * Sign Up
   *
   * @param {string} id
   * @param {string} password
   * @param {Number} number
   * @param {string} grade
   * @param {string} _class
   * @param {string} email
   * @param {string} auth
   */
  signup = async function (id, password, number, grade, _class, email, auth) {
    return new Promise((resolve, reject) => {
      if (id && password && number && grade && _class && auth) {
        bcrypt.hash(password, saltRounds, (err, hash) => {
          if (err) {
            reject(err);
          } else {
            password = hash;
            const query =
              'INSERT INTO tbl_user (id, number, password, grade, class, email, auth) VALUES (?,?,?,?,?,?,?)';
            const params = [id, number, password, grade, _class, email, auth];
            this.connection.query(query, params, (err) => {
              if (err) {
                reject(err);
              } else {
                resolve(true);
              }
            });
          }
        });
      } else {
        throw new Error('null value');
      }
    });
  };

  /**
   *
   * @param {string} id
   * @param {string} password
   */
  signin = async function (id, password) {
    return new Promise((resolve, reject) => {
      if (id && password) {
        this.connection.query('SELECT * from tbl_user where id=?', [id], (err, search_id_result) => {
          if (err) {
            reject(err);
          } else {
            bcrypt.compare(password, search_id_result[0].password, (err, same) => {
              if (err) {
                reject(err);
              } else {
                resolve({ same: same, user: search_id_result[0] });
              }
            });
          }
        });
      } else {
        throw new Error('null value');
      }
    });
  };
}
module.exports = Auth;
