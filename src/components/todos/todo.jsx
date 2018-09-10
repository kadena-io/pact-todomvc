import * as React from 'react';

import './todo.scss';

export const Todo = ({ id, entry, state, onEdit, onRemove, onComplete }) => {
  const clickEdit = () => onEdit(id);
  const clickRemove = () => onRemove(id);
  const clickComplete = () => onComplete(id);

  const updateEntry = e => {
    onUpdate(id, e.currentTarget.value.trim());
  };

  const blurEntry = e => {
    const value = e.currentTarget.value.trim();
    console.log('Blur', id, entry, value);
    if (value !== entry) {
      onEdit(id, value);
    }
  };

  const entryKeyDown = e => {
    console.log('Blur', id, entry, e.keyCode);
    if (e.keyCode === 13) {
      e.currentTarget.blur();
    }
  };

  return (
    <div className={`todo ${state}`}>
      <div className="completed-box">
        <button onClick={clickComplete}>Complete</button>>
      </div>
      <div className="entry">
        <input type={entry} onUpdate={updateEntry} onKeyDown={entryKeyDown} onBlur={blurEntry} />
      </div>
      <div className="remove">
        <button onClick={clickRemove}>Remove</button>
      </div>
    </div>
  );
};
