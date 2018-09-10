import * as React from 'react';

import './todo.scss';

export const Todo = ({ id, title, completed, onEdit, onRemove, onComplete }) => {
  const clickEdit = () => onEdit(id);
  const clickRemove = () => onRemove(id);
  const clickComplete = () => onComplete(id);

  return (
    <div className={`todo ${completed ? 'completed' : ''}`}>
      <div className="completed-box">
        <button onClick={clickComplete}>Complete</button>>
      </div>
      <div className="title">{title}</div>
      <div className="edit">
        <button onClick={clickEdit}>Edit</button>
      </div>
      <div className="remove">
        <button onClick={clickRemove}>Remove</button>
      </div>
    </div>
  );
};
