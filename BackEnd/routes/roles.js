const express = require("express");
const mysql = require("mysql");
const nconf = require("../config");
const connection = mysql.createConnection(nconf.get("db"));
const validate = require("../services/validation");
const token = require("../middlewares/token");
const router = express();

router.get("/", token.required, getAllRoles);
router.post("/", token.required, addRole);
router.delete("/:id", token.required, deleteRole);

module.exports = router;

async function getAllRoles(req, res) {
  const check_permission = await validate.ValidateUser(req, "read_users");
  if (!check_permission) return res.status(401).json("Unauthorized");

  const sql =
    "select roles.id as role_id, roles.name as role_name, permissions.id as permission_id, permissions.name as permission_name from `roles` LEFT JOIN `permissions` ON roles.id = permissions.role_id";
  connection.query(sql, async (err, results) => {
    if (err) {
      return res.status(400).json(err);
    }

    if (results && results.length > 0) {
      const all_roles = await Promise.all(
        results.map(async (role) => {
          return {
            id: role.role_id,
            name: role.role_name,
            permissions: results
              .filter((r) => r.role_id == role.role_id)
              .map((fl) => fl.permission_name),
          };
        })
      );
      return res.status(200).json({
        all_roles: all_roles.filter(
          (role, idx, self) =>
            idx === self.findIndex((t) => t.name === role.name)
        ),
        all_permissions: [...new Set(results.map((r) => r.permission_name))],
      });
    }
  });
}

async function addRole(req, res) {
  const check_permission = await validate.ValidateUser(req, "create_users");
  if (!check_permission) return res.status(401).json("Unauthorized");

  const body_data = req.body;
  const checkDataSql = "SELECT * FROM `roles` WHERE `name` = ?";
  connection.query(checkDataSql, [body_data.name], (err, result) => {
    if (err) {
      return res.status(400).json(err);
    }

    if (result && result.length > 0) {
      let err = new Error();
      err.message = "Role already was created";
      return res.status(400).json(err.message);
    }

    if (!err && result.length === 0) {
      const sql = "INSERT INTO `roles` SET ? ";
      connection.query(sql, body_data, (err) => {
        if (err) {
          return res.status(400).json(err);
        }
        return res.status(200).json("Success");
      });
    }
  });
}

async function deleteRole(req, res) {
  const check_permission = await validate.ValidateUser(req, "delete_users");
  if (!check_permission) return res.status(401).json("Unauthorized");

  const role_id = req.params.id;

  const checkDataSql = "SELECT * FROM `roles` WHERE `id` = ?";
  connection.query(checkDataSql, [role_id], (err, result) => {
    if (err) {
      return res.status(400).json(err);
    }

    if (!result) {
      let err = new Error();
      err.message = "Role not Found";
      return res.status(400).json(err.message);
    }

    if (!err && result.length > 0) {
      connection.query(
        `update users set role_id = 1 where role_id = '${role_id}'`
      );
      connection.query(`DELETE FROM permissions WHERE role_id= '${role_id}'`);
      const sql = "DELETE FROM `roles` WHERE `id` = ?";
      connection.query(sql, [role_id], (err) => {
        if (err) {
          return res.status(400).json(err);
        }
        return res.status(200).json("Success");
      });
    }
  });
}
