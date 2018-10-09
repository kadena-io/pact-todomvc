import * as React from 'react';
import { connect } from 'react-redux';

import {
  fetchTodos,
  saveNewTodo,
  removeTodo,
  changeEntry,
  updateTodo,
  toggleState,
  updateNewTodoField,
  changeEditStatus,
} from '../../sagas/todos';

import { NewTodo } from './new-todo';
import { Todo } from './todo';

export class TodosComponent extends React.PureComponent {
  constructor() {
    super();
    this.fetchTodos = this.fetchTodos.bind(this);
    this.onRemoveTodo = this.onRemoveTodo.bind(this);
    this.onUpdateTodo = this.onUpdateTodo.bind(this);
    this.onToggleState = this.onToggleState.bind(this);
    this.onChangeEntry = this.onChangeEntry.bind(this);
    this.saveNewTodo = this.saveNewTodo.bind(this);
    this.onClickEdit = this.onClickEdit.bind(this);
  }

  componentDidMount() {
    this.fetchTodos();
  }

  fetchTodos() {
    this.props.fetchTodos();
  }

  onRemoveTodo(id) {
    this.props.removeTodo(id);
  }

  onUpdateTodo(todo) {
    this.props.updateTodo(todo);
  }

  onToggleState(id, state) {
    this.props.toggleState(id, state);
  }

  onChangeEntry(id, entry, date) {
    this.props.changeEntry(id, entry, date);
  }

  saveNewTodo(entry, date) {
    this.props.saveNewTodo(entry, date);
  }

  onClickEdit(id) {
    this.props.changeEditStatus(id);
  }

  render() {
    const { todos, todosError, editStatus } = this.props;
    let dom;
    if (todosError !== null) {
      dom = <div className="error">Error loading todos</div>;
    } else {
      dom = (
        <div className="todos-list">
          <NewTodo saveNewTodo={this.saveNewTodo} />
          <ul>
            {todos.map((todo, i) => (
              <Todo
                key={i}
                {...todo}
                onRemove={this.onRemoveTodo}
                onChangeEntry={this.onChangeEntry}
                onUpdate={this.onUpdateTodo}
                onToggleState={this.onToggleState}
                onClickEdit={this.onClickEdit}
              />
            ))}
          </ul>
        </div>
      );
    }

    return (
      <div className="todos">
        <h1>Todos</h1>
        {dom}
      </div>
    );
  }
}

/* istanbul ignore next */
const mapStateToProps = state => {
  /*
  todosIsLoading: false,
  todosError: null,
  todos: [],
  newTodo: '',
  editedTodo: null,
  */
  return { ...state.todos };
};

/* istanbul ignore next */
const mapDispatchToProps = dispatch => {
  return {
    fetchTodos: () => {
      dispatch(fetchTodos());
    },
    saveNewTodo: (newTodo, date) => {
      dispatch(saveNewTodo(newTodo, date));
    },
    removeTodo: id => {
      dispatch(removeTodo(id));
    },
    updateTodo: todo => {
      dispatch(updateTodo(todo));
    },
    toggleState: (id, state) => {
      dispatch(toggleState(id, state));
    },
    changeEntry: (id, entry, date) => {
      dispatch(changeEntry(id, entry, date));
    },
    updateNewTodoField: (entry, date) => {
      dispatch(updateNewTodoField(entry, date));
    },
    changeEditStatus: id => {
      dispatch(changeEditStatus(id));
    },
  };
};

/* istanbul ignore next */
export const Todos = connect(
  mapStateToProps,
  mapDispatchToProps
)(TodosComponent);
