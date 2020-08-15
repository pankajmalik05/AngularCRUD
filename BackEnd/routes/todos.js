const express = require("express");
const mysql = require("mysql");
const nconf = require("../config");
const connection = mysql.createConnection(nconf.get("db"));
const token = require("../middlewares/token");
const validate = require("../services/validation");
const router = express();

router.get("/", token.required, getTodosById);
router.get("/todo/:id", token.required, getTodoById);
router.post("/create", token.required, createTodo);
router.put("/todo/:id", token.required, updateTodo);
router.delete("/todo/:id", token.required, removeTodo);

module.exports = router;

async function getTodosById(req, res) {
  const check_permission = await validate.ValidateUser(req, "read_todos");
  if (!check_permission) return res.status(401).json("Unauthorized");

  const sql = "select * from `todos`";
  connection.query(sql, [], (err, result) => {
    if (err) {
      res.status(400);
    }

    if (result && result.length === 0) {
      res.status(200).json("Todos are not created");
    }

    if (result && result.length > 0) {
      res.status(200).json(result);
    }
  });
}

async function getTodoById(req, res) {
  const check_permission = await validate.ValidateUser(req, "read_todos");
  if (!check_permission) return res.status(401).json("Unauthorized");

  const id = req.params.id;
  const sql = "select * from `todos` where `todo_id` = ?";
  connection.query(sql, [id], (err, result) => {
    if (err) {
      res.status(400);
    }

    if (result && result.length > 0) {
      res.status(200).json(result);
    }
  });
}

async function createTodo(req, res) {
  const check_permission = await validate.ValidateUser(req, "create_todos");
  if (!check_permission) return res.status(401).json("Unauthorized");

  const todo = {
    name: req.body.name,
    checked: false,
  };

  const sqlCheck = "select name from `todos` where `name` = ?";
  connection.query(sqlCheck, [todo.name], (err, result) => {
    if (err) {
      res.status(400).json(err);
    }

    if (result && result.length > 0) {
      res.status(403).json("Todo already was created");
    }

    if (result && result.length === 0) {
      const sql = "insert into `todos` set ?";
      connection.query(sql, [todo], (err, result) => {
        if (err) {
          res.status(400).json(err);
        }

        if (result) {
          res.status(200).json("Todo was created");
        }
      });
    }
  });
}

async function updateTodo(req, res) {
  const check_permission = await validate.ValidateUser(req, "update_todos");
  if (!check_permission) return res.status(401).json("Unauthorized");

  const todo = {
    todo_id: req.body.todo_id,
    name: req.body.name,
    checked: req.body.checked || 0,
  };

  const sqlCheck = "select name from `todos` where `todo_id` = ?";
  connection.query(sqlCheck, [todo.todo_id], (err, result) => {
    if (err) {
      res.status(400).json(err);
    }

    if (!result) {
      res.status(403).json("Todo Not Found");
    }

    if (result && result.length > 0) {
      const sql =
        "update `todos` set `name` = ?, `checked` = ? where `todo_id` = ?";
      connection.query(
        sql,
        [todo.name, todo.checked, todo.todo_id],
        (err, result) => {
          if (err) {
            res.status(400).json(err);
          }

          if (result) {
            res.status(200).json("Todo was updated");
          }
        }
      );
    }
  });
}

async function removeTodo(req, res) {
  const check_permission = await validate.ValidateUser(req, "delete_todos");
  if (!check_permission) return res.status(401).json("Unauthorized");

  const id = req.params.id;
  const sql = "delete from `todos` where `todo_id` = ?";
  connection.query(sql, [id], (err, result) => {
    if (err) {
      res.status(400).json(err);
    }

    if (result) {
      res.status(200).json("Todo removed");
    }
  });
}
