const mysql = require("mysql");
const nconf = require("./config");
const connection = mysql.createConnection(nconf.get("db"));

exports.create_tables = function () {
  connection.connect();

  const createUsers = `create table if not exists users(
                          user_id int primary key auto_increment,
                          email varchar(255) not null unique,
                          role_id int not null,
                          username varchar(255) not null unique,
                          password varchar(255) not null
                      ) character set=utf8`;

  connection.query(createUsers);

  const addAdmin = `INSERT IGNORE INTO users (user_id, email, role_id, username, password) VALUES (1, 'admin@todo.lk', 1, 'admin', '$2a$08$yaCWCuylH8iFCmRMkc05Hum66Lyz2YWc9wa.d0aPClecTAX7/XcWq')`;
  connection.query(addAdmin);
  const addGuest = `INSERT IGNORE INTO users (user_id, email, role_id, username, password) VALUES (2, 'guest@todo.lk', 2, 'guest', '$2a$08$yaCWCuylH8iFCmRMkc05Hum66Lyz2YWc9wa.d0aPClecTAX7/XcWq')`;
  connection.query(addGuest);

  const createRoles = `create table if not exists roles(
                          id int primary key auto_increment,
                          name varchar(255) not null unique
                      ) engine=innodb character set=utf8`;
  connection.query(createRoles);
  const addAdminRole = `INSERT IGNORE INTO roles (id, name) VALUES (1, 'admin')`;
  connection.query(addAdminRole);
  const addGuestRole = `INSERT IGNORE INTO roles (id, name) VALUES (2, 'guest')`;
  connection.query(addGuestRole);

  const createPermissions = `create table if not exists permissions(
        id int primary key auto_increment,
        name varchar(255) not null,
        role_id int not null
    ) engine=innodb character set=utf8`;
  connection.query(createPermissions);

  const admin_permissions = [
    "create_users",
    "read_users",
    "update_users",
    "delete_users",
    "create_todos",
    "read_todos",
    "update_todos",
    "delete_todos",
  ];
  admin_permissions.map((permission, i) => {
    let addAdminPermission = `INSERT IGNORE INTO permissions (id, name, role_id) VALUES (${
      i + 1
    }, '${permission}', 1)`;
    connection.query(addAdminPermission);
    addAdminPermission = `INSERT IGNORE INTO permissions (id, name, role_id) VALUES (${
      9999 + i + 1
    }, '${permission}', 9999)`;
    connection.query(addAdminPermission);
  });

  const guset_permissions = ["read_todos"];
  guset_permissions.map((permission, i) => {
    const addGuestPermission = `INSERT IGNORE INTO permissions (id, name, role_id) VALUES (${
      admin_permissions.length + i + 1
    }, '${permission}', 2)`;
    connection.query(addGuestPermission);
  });

  const createTodos = `create table if not exists todos(
        todo_id int primary key auto_increment,
        name varchar(255) not null unique,
        checked tinyint(1) not null
    ) engine=innodb character set=utf8`;

  connection.query(createTodos);

  const todos = [
    { name: "Sample Todo 1", checked: 1 },
    { name: "Sample Todo 2", checked: 0 },
  ];
  todos.map((todo) => {
    const addTodos = `INSERT IGNORE INTO todos (name, checked) VALUES ('${todo.name}', ${todo.checked})`;
    connection.query(addTodos);
  });
};
