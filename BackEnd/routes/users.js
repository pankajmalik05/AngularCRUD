const express = require("express");
const mysql = require("mysql");
const nconf = require("../config");
const connection = mysql.createConnection(nconf.get("db"));
const validate = require("../services/validation");
const token = require("../middlewares/token");
const router = express();
const bcrypt = require("bcrypt-nodejs");

router.get("/", token.required, getAllUsers);
router.post("/", token.required, addUser);
router.put("/:id", token.required, editUser);
router.delete("/:id", token.required, deleteUser);
router.get("/user", token.required, getUser);
router.get("/roles", token.required, getRoles);

module.exports = router;

async function getAllUsers(req, res) {
  const check_permission = await validate.ValidateUser(req, "read_users");
  if (!check_permission) return res.status(401).json("Unauthorized");

  const sql = "select username, user_id, email, role_id from `users`";
  connection.query(sql, async (err, results) => {
    if (err) {
      return res.status(400).json(err);
    }

    if (results && results.length > 0) {
      return res.status(200).json(
        await Promise.all(
          results.map(async (user) => {
            const permissions = await validate.GetUserPermissions(
              user.username
            );
            const role = await validate.GetUserRole(user.username);
            return {
              username: user.username,
              user_id: user.user_id,
              email: user.email,
              role_id: user.role_id,
              role,
              permissions,
            };
          })
        )
      );
    }
  });
}

async function getUser(req, res) {
  const sql = "SELECT * FROM `users` WHERE `user_id` = ?";
  connection.query(sql, [req.payload.id], async (err, result) => {
    if (err) {
      return res.status(400).json(err);
    }

    if (result) {
      const permissions = await validate.GetUserPermissions(result[0].username);
      const role = await validate.GetUserRole(result[0].username);
      return res.status(200).json({
        user: {
          username: result[0].username,
          token: token.generate(
            result[0].user_id,
            result[0].username,
            role,
            permissions
          ),
          user_id: result[0].user_id,
          email: result[0].email,
          role_id: result[0].role_id,
          role,
          permissions,
        },
      });
    }
  });
}

async function addUser(req, res) {
  const check_permission = await validate.ValidateUser(req, "create_users");
  if (!check_permission) return res.status(401).json("Unauthorized");

  const user = {
    username: req.body.username,
    password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(8), null),
    email: req.body.email,
    role_id: req.body.role || 2,
  };

  const checkDataSql =
    "SELECT username, email FROM `users` WHERE `username` = ? OR `email` = ?";
  connection.query(checkDataSql, [user.username, user.email], (err, result) => {
    if (err) {
      return res.status(400).json(err);
    }

    if (result && result.length > 0) {
      let err = new Error();
      err.message = "User already was created";
      return res.status(400).json(err.message);
    }

    if (!err && result.length === 0) {
      const sql = "INSERT INTO `users` SET ? ";
      connection.query(sql, user, (err) => {
        if (err) {
          return res.status(400).json(err);
        }
        return res.status(200).json("Success");
      });
    }
  });
}

async function editUser(req, res) {
  const check_permission = await validate.ValidateUser(req, "update_users");
  if (!check_permission) return res.status(401).json("Unauthorized");

  const user_id = req.params.id;
  const user = req.body;

  const checkDataSql =
    "SELECT username, email FROM `users` WHERE `user_id` = ?";
  connection.query(checkDataSql, [user_id], (err, result) => {
    if (err) {
      return res.status(400).json(err);
    }

    if (!result) {
      let err = new Error();
      err.message = "User not Found";
      return res.status(400).json(err.message);
    }

    if (!err && result.length > 0) {
      const sql =
        "update `users` set username = ?, email = ?, role_id = ? where `user_id` = ?";
      connection.query(
        sql,
        [user.username, user.email, user.role, user_id],
        (err) => {
          if (err) {
            return res.status(400).json(err);
          }
          const sql = "DELETE FROM `permissions` WHERE `role_id` = ?";
          connection.query(sql, [user.role], async (err) => {
            if (err) {
              return res.status(400).json(err);
            }
            await Promise.all(
              user.permissions.map(async (permission) => {
                connection.query(
                  `INSERT IGNORE INTO permissions (name, role_id) Values ('${permission}', ${user.role})`
                );
              })
            );
            return res.status(200).json("Success");
          });
        }
      );
    }
  });
}

async function deleteUser(req, res) {
  const check_permission = await validate.ValidateUser(req, "delete_users");
  if (!check_permission) return res.status(401).json("Unauthorized");

  const user_id = req.params.id;

  const checkDataSql =
    "SELECT username, email FROM `users` WHERE `user_id` = ?";
  connection.query(checkDataSql, [user_id], (err, result) => {
    if (err) {
      return res.status(400).json(err);
    }

    if (!result) {
      let err = new Error();
      err.message = "User not Found";
      return res.status(400).json(err.message);
    }

    if (!err && result.length > 0) {
      const sql = "DELETE FROM `users` WHERE `user_id` = ?";
      connection.query(sql, [user_id], (err) => {
        if (err) {
          return res.status(400).json(err);
        }
        return res.status(200).json("Success");
      });
    }
  });
}

async function getRoles(req, res) {
  const check_permission = await validate.ValidateUser(req, "read_users");
  if (!check_permission) return res.status(401).json("Unauthorized");

  const sql =
    "select users.username, users.user_id, roles.id as role_id, roles.name as role_name, permissions.id as permission_id, permissions.name as permission_name from `users`, `roles`, `permissions` where users.role_id = roles.id and roles.id = permissions.role_id";
  connection.query(sql, async (err, results) => {
    if (err) {
      return res.status(400).json(err);
    }

    if (results && results.length > 0) {
      const all_users = [...new Set(results.map((user) => user.user_id))];
      const response = {
        users: await Promise.all(
          all_users.map(async (user) => {
            const username = results.filter((user1) => user1.user_id == user)[0]
              .username;
            const role = await validate.GetUserRole(username);
            const permissions = await validate.GetUserPermissions(username);
            return {
              user_id: user,
              username,
              role,
              permissions: permissions,
            };
          })
        ),
        roles: [...new Set(results.map((user) => user.role_name))].map((r) => {
          return {
            name: r,
            id: results.filter((user1) => user1.role_name == r)[0].role_id,
            permissions: [
              ...new Set(
                results
                  .filter((user) => user.role_name == r)
                  .map((r_n) => r_n.permission_name)
              ),
            ],
          };
        }),
        permissions: [...new Set(results.map((user) => user.permission_name))],
      };
      return res.status(200).json(response);
    }
  });
}
