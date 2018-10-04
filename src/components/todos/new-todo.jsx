import * as React from 'react';
import './todo.scss';

export const NewTodo = ({ saveNewTodo }) => {
  let entry='';
  let date;

  const handleDate = e => {
    e.preventDefault();
    date = e.currentTarget.value;
  };

  const handleEntry = e => {
    e.preventDefault();
    entry = e.currentTarget.value;
  };

  const entryKeyDown = e => {
    if (e.keyCode === 13) {
      let newDate = new Date();
      date = date || newDate.toISOString().slice(0,10);
      console.log(entry, date)
      saveNewTodo(entry, date);
      entry='';
    }
  };

  return (
    <div className="todo new">
      <div className="entry">
        <label>New Task</label>
        <input id= "new-todo" type="text" className="empty" onChange={handleEntry} onKeyDown={entryKeyDown} placeholder="New Todo…" />
      </div>
      <div className="date">
        <label>Due Date</label>
        <input id="due-date" type="date" onChange={handleDate} onKeyDown={entryKeyDown} placeholder="Enter Due Date..." />
      </div>
    </div>
  );
};
