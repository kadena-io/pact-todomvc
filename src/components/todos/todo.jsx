import * as React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';

import './todo.scss';

export const Todo = ({ id, entry, state, onEdit, onRemove, onComplete }) => {
  const clickEdit = () => onEdit(id);
  const clickRemove = () => onRemove(id);
  const clickComplete = () => onComplete(id);

  const changeEntry = e => {
    onUpdate(id, e.currentTarget.value.trim());
  };

  const blurEntry = e => {
    const value = e.currentTarget.value.trim();
    if (value !== entry) {
      onEdit(id, value);
    }
  };

  const entryKeyDown = e => {
    if (e.keyCode === 13) {
      e.currentTarget.blur();
    }
  };

  return (
    <div className={`todo ${state}`}>
      <div className="check">
        <button onClick={clickComplete}>
          <FontAwesomeIcon icon={faCheck} />
        </button>
      </div>
      <div className="entry">
        <input
          type="text"
          className={entry.length < 1 ? 'empty' : ''}
          value={entry}
          onChange={changeEntry}
          onKeyDown={entryKeyDown}
          onBlur={blurEntry}
          placeholder="New Todo…"
        />
      </div>
      <div className="remove">
        <button onClick={clickRemove}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
    </div>
  );
};
