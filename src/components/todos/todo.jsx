import * as React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';

import './todo.scss';

export const Todo = ({ id, entry, status, onUpdate, onRemove }) => {
  const clickRemove = () => onRemove(id);
  const clickComplete = () => {
    onUpdate({ id, entry, status: 'completed' });
  };

  const changeEntry = e => {
    onUpdate({ id, entry: e.currentTarget.value, status });
  };

  const blurEntry = e => {
    const value = e.currentTarget.value;
    if (value !== entry) {
      onUpdate({ id, entry: value, status });
    }
  };

  const entryKeyDown = e => {
    if (e.keyCode === 13) {
      e.currentTarget.blur();
    }
  };

  return (
    <div className={`todo ${status}`}>
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
          placeholder="Enter Todo…"
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
