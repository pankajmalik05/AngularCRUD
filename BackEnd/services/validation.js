var jwtDecode = require("jwt-decode");

const mysql = require("mysql");
const nconf = require("../config");
const connection = mysql.createConnection(nconf.get("db"));

function GetUserPermissions(username) {
  return new Promise((resolve) => {
    const sql =
      "select permissions.name from `users`, `roles`, `permissions` where username = ? and users.role_id = roles.id and roles.id = permissions.role_id";
    connection.query(sql, [username], (err, result) => {
      if (err) {
        console.log(err);
        resolve([]);
      }

      if (result && result.length === 0) {
        resolve([]);
      }

      if (result && result.length > 0) {
        const permissions = result.map((res) => res.name);
        resolve(permissions);
      }
    });
  });
}

function GetUserRole(username) {
  return new Promise((resolve) => {
    const sql =
      "select roles.name from `users`, `roles` where username = ? and users.role_id = roles.id";
    connection.query(sql, [username], (err, result) => {
      if (err) {
        console.log(err);
        resolve(null);
      }

      if (result && result.length === 0) {
        resolve(null);
      }

      if (result && result.length > 0) {
        const roles = result.map((res) => res.name);
        resolve(roles[0]);
      }
    });
  });
}

module.exports.ValidateUser = async function (req, permission) {
  if (!req.headers || !req.headers.authorization) return false;
  const token = req.headers.authorization.split(" ")[1];
  var decoded = jwtDecode(token);
  const permissions = await this.GetUserPermissions(decoded.username);
  return permissions.includes(permission);
};

module.exports.GetUserPermissions = GetUserPermissions;
module.exports.GetUserRole = GetUserRole;
