const pg = require("pg");
const client = new pg.Client(
  process.env.DATABASE_URL || "postgress://localhost/acme_hr_db"
);
const express = require("express");
const app = express();

app.get("/api/employees", async (req, res, next) => {
  try {
    const SQL = `  
        SELECT * 
        FROM employees
        `;
    const response = await client.query(SQL);
    res.send(response.rows);
  } catch (ex) {
    next(ex);
  }
});
app.get("/api/departments", async (req, res, next) => {
  try {
    const SQL = `  
          SELECT * 
          FROM departments
          `;
    const response = await client.query(SQL);
    res.send(response.rows);
  } catch (ex) {
    next(ex);
  }
});

const init = async () => {
  await client.connect();
  console.log("connected to database");
  let SQL = `
        DROP TABLE IF EXISTS employees;
        DROP TABLE IF EXISTS departments;
        CREATE TABLE departments(
            id SERIAL PRIMARY KEY,
            name VARCHAR(20)
        );
        CREATE TABLE employees(
            id SERIAL PRIMARY KEY,
            txt VARCHAR(200),
            ranking INTEGER DEFAULT 5,
            department_id INTEGER REFERENCES departments(id) NOT NULL
        );
  `;
  await client.query(SQL);
  console.log("tables created");
  SQL = `
      INSERT INTO departments(name) VALUES('IT');
      INSERT INTO departments(name) VALUES('HR');
      INSERT INTO departments(name) VALUES('BRAINSTORMING');
      INSERT INTO employees(txt, department_id) VALUES ('Brendon', (
        SELECT id FROM departments WHERE name = 'IT'
      ));
      INSERT INTO employees(txt, department_id) VALUES ('Velma', (
        SELECT id FROM departments WHERE name = 'IT'
      ));
      INSERT INTO employees(txt, department_id) VALUES ('Doug', (
        SELECT id FROM departments WHERE name = 'BRAINSTORMING'
      ));
      INSERT INTO employees(txt, department_id) VALUES ('Toby', (
        SELECT id FROM departments WHERE name = 'HR'
      ));
  `;
  await client.query(SQL);
  console.log("data seeded");
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`listening on port ${port}`));

  console.log("some curl commands to test");
  console.log("curl localhost:3000/api/emplyees");
  console.log("curl localhost:3000/api/departments");
};

init();
