import * as React from 'react';
import './todo.scss';

export const NewTodo = ({ newEntry, newDate, saveNewTodo, onChangeNewEntry, onChangeNewDate }) => {
  const changeNewEntry = e => {
    onChangeNewEntry(e.currentTarget.value);
  };

  const changeNewDate = e => {
    onChangeNewDate(e.currentTarget.value);
  };

  const entryKeyDown = e => {
    if (e.keyCode === 13) {
      saveNewTodo(newEntry, newDate);
      e.currentTarget.value = '';
    }
  };

  return (
    <div className="todo new">
      <div className="entry">
        <label>New Todo</label>
        <input
          id="new-todo"
          type="text"
          name="entry"
          className="empty"
          onChange={changeNewEntry}
          onKeyDown={entryKeyDown}
          placeholder="New Todo…"
        />
      </div>
      <div className="date">
        <label>Due Date</label>
        <input
          id="due-date"
          type="date"
          name="due-date"
          onChange={changeNewDate}
          onKeyDown={entryKeyDown}
          placeholder="Enter Due Date..."
          min={new Date().toISOString().slice(0, 10)}
        />
      </div>
    </div>
  );
};
