import * as React from 'react';
import './todo.scss';

export const NewTodo = ({ saveNewTodo }) => {
  const entryKeyDown = e => {
    if (e.keyCode === 13) {
      saveNewTodo(e.currentTarget.value);
      e.currentTarget.value = '';
    }
  };

  return (
    <div className="todo new">
      <div className="entry">
        <input
          type="text"
          className="empty"
          //           value={this.props.newTodo}
          onKeyDown={entryKeyDown}
          placeholder="New Todo…"
        />
      </div>
    </div>
  );
};
