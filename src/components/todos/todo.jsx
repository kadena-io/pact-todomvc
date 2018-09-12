import * as React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle as faCircleFill, faTimes } from '@fortawesome/free-solid-svg-icons';
import { faCircle as faCircleOutline } from '@fortawesome/free-regular-svg-icons';

import './todo.scss';

export const Todo = ({
  id,
  entry,
  state,
  deleted,
  onChangeEntry,
  onUpdate,
  onRemove,
  onToggleState,
}) => {
  const clickRemove = () => onRemove(id);
  const clickState = () => {
    onToggleState(id, state === 'completed' ? 'active' : 'completed');
  };

  const changeEntry = e => {
    onChangeEntry(id, e.currentTarget.value);
  };

  const blurEntry = e => {
    onUpdate({ id, entry: e.currentTarget.value, state, deleted });
  };

  const entryKeyDown = e => {
    if (e.keyCode === 13) {
      e.currentTarget.blur();
    }
  };

  return (
    <div className={`todo ${state}`}>
      <div className="check">
        <button onClick={clickState}>
          <FontAwesomeIcon icon={state === 'completed' ? faCircleFill : faCircleOutline} />
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
