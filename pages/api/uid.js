var fs = require("fs");
var mode = { mode: "wait", class: false };
/*
  MODES:

  - "wait" - wait for a teacher to touch the sensor, if is a teacher then proceed
  - "check" - check the list for a class, ends with the starting teacher touching the sensor
*/

var db = {};
fs.readFile("db.json", "utf8", function readFileCallback(err, data) {
  if (err) {
    console.log(err);
  } else {
    db = JSON.parse(data);
  }
});

export default (req, res) => {
  if (req.method === "POST") {
    if (mode.mode === "wait") {
      if (db.teachers && db.teachers[req.body]) {
        mode = { mode: "check", class: db[db.teachers[req.body].class] };
        res.statusCode = 302;
        res.end();
      } else {
        res.statusCode = 404;
        res.end();
      }
    } else if (mode.mode === "check") {
      if (db.teachers && db.teachers[req.body]) {
        const json = JSON.stringify({
          ...db,
          ...{ [db.teachers[req.body].class]: mode.class },
        });
        fs.writeFile("db.json", json, "utf8", () => {});
        mode = { mode: "wait", class: mode.class };
        res.statusCode = 302;
        res.end();
      } else if (mode.class && mode.class.tags[req.body]) {
        mode.class.list[mode.class.tags[req.body]] = 1;
        res.statusCode = 202;
        res.end();
      } else {
        res.statusCode = 401;
        res.end();
      }
    } else if (mode.mode === "add") {
      db = !mode.teacher
        ? {
            ...db,
            ...{
              [mode.className]: {
                ...db[mode.className],
                ...{
                  tags: {
                    ...db[mode.className].tags,
                    ...{ [req.body]: mode.name },
                  },
                  list: { ...db[mode.className].list, ...{ [mode.name]: 0 } },
                },
              },
            },
          }
        : {
            ...db,
            ...{
              teachers: {
                ...db.teachers,
                ...{
                  [req.body]: { name: mode.name, class: mode.className },
                },
              },
            },
          };
      const json = JSON.stringify(db);
      fs.writeFile("db.json", json, "utf8", () => {});
      mode = { mode: "wait", class: mode.class };
      res.statusCode = 202;
      res.end();
    }
    res.statusCode = 500;
    res.end(0);
  } else if (req.method === "PUT") {
    mode = {
      mode: "add",
      name: req.body.name,
      className: req.body.class,
      teacher: req.body.teacher,
      class: mode.class,
    };
    res.status(200).json({ error: false });
  } else if (req.method === "DELETE") {
    db = {
      teachers: {},
      "4TM": {
        tags: {},
        list: {},
      },
    };
    const json = JSON.stringify(db);
    fs.writeFile("db.json", json, "utf8", () => {});
    mode = { mode: "wait", class: false };
    res.status(200).json({ error: false });
  } else {
    res.status(200).json(mode);
  }
};
