import React, { useEffect, useState } from "react";
const url = "http://localhost:3000/api/uid";

function useNewStudent() {
  const [name, setName] = useState("");
  const [_class, setClass] = useState("4TM");
  let onChange = (e) => setName(e.target.value);
  let clear = () => setName("");
  return { name, _class, onChange, clear };
}

function useNewTeacher() {
  const [name, setName] = useState("");
  const [_class, setClass] = useState("4TM");
  let onChange = (e) => setName(e.target.value);
  let clear = () => setName("");
  return { name, _class, onChange, clear };
}

export default function index() {
  const [mode, setMode] = useState({});
  const [list, toggleList] = useState(false);
  let newStudent = useNewStudent();
  let newTeacher = useNewTeacher();

  useEffect(() => {
    setInterval(() => {
      fetch(url).then(async (res) => {
        const _mode = await res.json();
        setMode(_mode);
      });
    }, 100);
  }, []);

  return (
    <>
      <button
        onClick={() => {
          fetch(url, {
            method: "delete",
          });
        }}
      >
        Reset
      </button>
      <button
        onClick={() => {
          toggleList(!list);
        }}
      >
        Toggle List
      </button>
      <div>Mode: {mode.mode}</div>
      <div>
        <input
          placeholder="Full name & surname"
          value={newStudent.name}
          onChange={newStudent.onChange}
        />
        <input placeholder="Class - 4TM" disabled />
        <button
          onClick={() => {
            fetch(url, {
              method: "put",
              headers: {
                "Content-type": "application/json",
              },
              body: JSON.stringify({
                name: newStudent.name,
                class: newStudent._class,
              }),
            });
            newTeacher.clear();
            newStudent.clear();
          }}
        >
          Add a student
        </button>
      </div>
      <div>
        <input
          placeholder="Full name & surname"
          value={newTeacher.name}
          onChange={newTeacher.onChange}
        />
        <input placeholder="Class - 4TM" disabled />
        <button
          onClick={() => {
            fetch(url, {
              method: "put",
              headers: {
                "Content-type": "application/json",
              },
              body: JSON.stringify({
                name: newTeacher.name,
                class: newTeacher._class,
                teacher: true,
              }),
            });
            newTeacher.clear();
            newStudent.clear();
          }}
        >
          Add a teacher
        </button>
      </div>
      <div>
        {list &&
          (mode.class ? (
            Object.keys(mode.class.list).map((val, idx) => (
              <div>{val + " " + mode.class.list[val]}</div>
            ))
          ) : (
            <div>First a teacher has to touch the sensor</div>
          ))}
      </div>
    </>
  );
}
