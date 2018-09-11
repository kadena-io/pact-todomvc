import * as React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import Loader from 'react-loader-spinner';

import {
  fetchTodos,
  saveNewTodo,
  removeTodo,
  updateTodo,
  updateNewTodoField,
} from '../../sagas/todos';

import { NewTodo } from './new-todo';
import { Todo } from './todo';

class TodosComponent extends React.PureComponent {
  constructor() {
    super();
    this.fetchTodos = this.fetchTodos.bind(this);
    this.onRemoveTodo = this.onRemoveTodo.bind(this);
    this.onUpdateTodo = this.onUpdateTodo.bind(this);
    this.saveNewTodo = this.saveNewTodo.bind(this);
  }

  componentDidMount() {
    this.fetchTodos();
  }

  fetchTodos() {
    console.log('fetching todos');
    this.props.fetchTodos();
  }

  onRemoveTodo(id) {
    this.props.onRemoveTodo(id);
  }

  onUpdateTodo(todo) {
    this.props.updateTodo(todo);
  }

  saveNewTodo(entry) {
    console.log('saveNewTodo, with entry: ', entry);
    this.props.saveNewTodo(entry);
  }

  render() {
    const { todos, todosIsLoading, todosError } = this.props;
    console.log('todos, todosIsLoading, todosError = ', todos, todosIsLoading, todosError);
    if (todosIsLoading) {
      return (
        <div className="todos">
          <h1>Todos</h1>
          <Loader type="TailSpin" color="#3cf" />
        </div>
      );
    } else if (todosError !== null) {
      return (
        <div className="todos">
          <h1>Todos</h1>
          <div className="error">Error loading todos</div>
          <p>
            <Link className="btn" to="/" onClick={this.fetchTodos}>
              Reload
            </Link>
          </p>
        </div>
      );
    } else {
      return (
        <div className="todos">
          <h1>Todos</h1>'
          <div className="show-completed">
            <input type="checkbox" /> Show Completed Items
          </div>
          <div className="todos-list">
            <NewTodo saveNewTodo={this.saveNewTodo} />
            {todos.map((todo, i) => (
              <Todo key={i} {...todo} onRemove={this.onRemoveTodo} onUpdate={this.onUpdateTodo} />
            ))}
          </div>
          <p>
            <Link className="btn" to="/">
              New Todo
            </Link>
          </p>
        </div>
      );
    }
  }
}

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

const mapDispatchToProps = dispatch => {
  return {
    fetchTodos: () => {
      dispatch(fetchTodos());
    },
    saveNewTodo: newTodo => {
      dispatch(saveNewTodo(newTodo));
    },
    removeTodo: id => {
      dispatch(removeTodo(id));
    },
    updateTodo: todo => {
      dispatch(updateTodo(todo));
    },
    updateNewTodoField: entry => {
      dispatch(updateNewTodoField(entry));
    },
  };
};

export const Todos = connect(
  mapStateToProps,
  mapDispatchToProps
)(TodosComponent);
