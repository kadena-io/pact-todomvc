import * as React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle as faCircleFill, faTimes, faEdit } from '@fortawesome/free-solid-svg-icons';
import { faCircle as faCircleOutline } from '@fortawesome/free-regular-svg-icons';

import './todo.scss';

export const Todo = ({
  id,
  entry,
  date,
  state,
  deleted,
  editStatus,
  onChangeEntry,
  onUpdate,
  onRemove,
  onToggleState,
  onClickEdit,
}) => {
  const handleDate = e => {
    e.preventDefault();
    date = e.currentTarget.value;
  };

  const handleEntry = e => {
    e.preventDefault();
    entry = e.currentTarget.value;
  };

  const clickRemove = () => onRemove(id);
  const clickState = () => {
    onToggleState(id, state === 'completed' ? 'active' : 'completed');
  };
  const clickEdit = () => {
    onClickEdit(id);
  };
  const changeEntry = e => {
    onChangeEntry(id, e.currentTarget.value, date);
  };

  const blurEntry = e => {
    onUpdate({ id, entry, date, state, deleted });
  };

  const entryKeyDown = e => {
    if (e.keyCode === 13) {
      e.currentTarget.blur();
    }
  };

  return (
    <div className={`todo ${state}`}>
      <div className="check">
        <button onClick={clickState} disabled={editStatus}>
          <FontAwesomeIcon icon={state === 'completed' ? faCircleFill : faCircleOutline} />
        </button>
      </div>
      <div className="entry">
        {editStatus ? (
          <input
            type="text"
            className={entry.length < 1 ? 'empty' : ''}
            value={entry}
            onChange={changeEntry}
            onBlur={blurEntry}
            onKeyDown={entryKeyDown}
            placeholder="Enter Todo…"
            disabled={state === 'completed'}
          />
        ) : (
          <span>{entry}</span>
        )}
      </div>
      <div className="due-date">
        {editStatus ? (
          <input
            type="date"
            className={entry.length < 1 ? 'empty' : ''}
            defaultValue={date}
            onBlur={blurEntry}
            onKeyDown={entryKeyDown}
            onChange={handleDate}
            min={new Date().toISOString().slice(0, 10)}
            disabled={state === 'completed'}
          />
        ) : (
          <span>{date}</span>
        )}
      </div>
      <div className="edit">
        <button onClick={clickEdit} disabled={state === 'completed'}>
          <FontAwesomeIcon icon={faEdit} />
        </button>
      </div>
      <div className="remove">
        <button onClick={clickRemove}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
    </div>
  );
};
