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
      date=date||new Date().toISOString().slice(0,10);
      saveNewTodo(entry, date);
      entry='';
    }
  };

  return (
    <div className="todo new">
      <div className="entry">
        <label>New Todo</label>
        <input id= "new-todo" type="text" name="entry" className="empty" onChange={handleEntry} onKeyDown={entryKeyDown} placeholder="New Todo…" />
      </div>
      <div className="date">
        <label>Due Date</label>
        <input id="due-date" type="date" name="due-date" onChange={handleDate} onKeyDown={entryKeyDown} placeholder="Enter Due Date..." min={new Date().toISOString().slice(0,10)}/>
      </div>
    </div>
  );
};
