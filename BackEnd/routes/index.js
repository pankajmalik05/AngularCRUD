const express = require("express");
const router = express();
const auth = require("./auth");
const users = require("./users");
const todos = require("./todos");
const roles = require("./roles");

router.use("/auth", auth);
router.use("/users", users);
router.use("/todos", todos);
router.use("/roles", roles);

module.exports = router;
