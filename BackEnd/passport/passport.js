const mysql = require("mysql");
const bcrypt = require("bcrypt-nodejs");
const nconf = require("../config");
const token = require("../middlewares/token");
const { GetUserPermissions, GetUserRole } = require("../services/validation");
const connection = mysql.createConnection(nconf.get("db"));
const LocalStrategy = require("passport-local").Strategy;

module.exports = (passport) => {
  connection.connect();

  passport.use(
    "local-signup",
    new LocalStrategy(
      {
        session: false,
        passReqToCallback: true,
      },
      (req, username, password, done) => {
        const user = {
          username: username,
          password: bcrypt.hashSync(password, bcrypt.genSaltSync(8), null),
          email: req.body.email,
          role_id: 2,
        };

        const checkDataSql =
          "SELECT username, email FROM `Users` WHERE `username` = ? OR `email` = ?";
        connection.query(
          checkDataSql,
          [user.username, user.email],
          (err, result) => {
            if (err) {
              return done(err, false);
            }

            if (result && result.length > 0) {
              let err = new Error();
              err.message = "User already was created";
              return done(err, false);
            }

            if (!err && result.length === 0) {
              const sql = "INSERT INTO `Users` SET ? ";
              connection.query(sql, user, (err) => {
                if (err) {
                  return done(err, false);
                }
                return done(null, false);
              });
            }
          }
        );
      }
    )
  );

  passport.use(
    "local-login",
    new LocalStrategy(
      {
        usernameField: "email",
        session: false,
        passReqToCallback: true,
      },
      function (req, email, password, done) {
        const sql = "SELECT * From `Users` WHERE `email` = ?";
        connection.query(sql, [email], async (err, result) => {
          if (err) {
            return done(err, false);
          }

          if (result && result.length === 0) {
            return done(
              null,
              false,
              req.flash("loginMessage", "Oops! User not found.")
            );
          }

          if (!bcrypt.compareSync(password, result[0].password)) {
            return done(
              null,
              false,
              req.flash("loginMessage", "Oops! Wrong password.")
            );
          }

          const permissions = await GetUserPermissions(result[0].username);
          const role = await GetUserRole(result[0].username);
          const userData = {
            username: result[0].username,
            token: token.generate(
              result[0].user_id,
              result[0].username,
              role,
              permissions
            ),
            role: role,
            permissions: permissions,
          };

          return done(null, userData);
        });
      }
    )
  );
};
