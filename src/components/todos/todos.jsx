import * as React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import Loader from 'react-loader-spinner';

import { fetchTodos } from '../../sagas/todos';

import { Todo } from './todo';

class TodosComponent extends React.PureComponent {
  constructor() {
    super();
    this.fetchTodos = this.fetchTodos.bind(this);
  }

  componentDidMount() {
    this.fetchTodos();
  }

  fetchTodos() {
    this.props.fetchTodos();
  }

  render() {
    const { todos, todosIsLoading, todosError } = this.props;

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
            {todos.map((todo, i) => (
              <Todo {...todo} key={i} />
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
    todos: []
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
  };
};

export const Todos = connect(
  mapStateToProps,
  mapDispatchToProps
)(TodosComponent);
