import * as React from "react";
import uuidv4 from "uuid/v4";
import Pact from "pact-lang-api";

import { TodoItem } from "./todo-item.jsx";
import { TodoFooter } from "./footer.jsx";

const ENTER_KEY = 13;
const KP = Pact.crypto.genKeyPair();
const API_HOST = "http://localhost:9001";

const ALL_TODOS = "all";
const ACTIVE_TODOS = "active";
const COMPLETED_TODOS = "completed";

export class TodoApp extends React.PureComponent {
  constructor() {
    super();
    this.state = {
      todos: [],
      onChanges: [],
      nowShowing: ALL_TODOS,
      editing: null,
      newTodo: ""
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleNewTodoKeyDown = this.handleNewTodoKeyDown.bind(this);
    this.toggleAll = this.toggleAll.bind(this);
    this.edit = this.edit.bind(this);
    this.cancel = this.cancel.bind(this);
    this.clearCompleted = this.clearCompleted.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.save = this.save.bind(this);
    this.showActive = this.showActive.bind(this);
    this.showCompleted = this.showCompleted.bind(this);
    this.showAll = this.showAll.bind(this);
  }

  componentDidMount() {
    this.getTodos();
  }

  getTodos() {
    const cmdObj = {
      pactCode: Pact.lang.mkExp('todos.read-todos'),
      keyPairs: KP
    };

    return Pact.fetch
      .local(cmdObj, API_HOST)
      .then(res => res.data)
      .then(todos => {
        const notDeleted = todos
          .filter(todo => {
            return todo.deleted === false;
          })
          .sort((a, b) => {
            if (a.title < b.title) return -1;
            if (b.title > a.title) return 1;
            return 0;
          });
        this.setState({ todos: notDeleted });
      });
  }

  add(title) {
    const uuid = uuidv4();
    const cmdObj = {
      pactCode: Pact.lang.mkExp('todos.new-todo', uuid, title),
      keyPairs: KP
    };

    Pact.fetch.send(cmdObj, API_HOST)
      .then(() => this.getTodos());
  }

  toggle(todo) {
    const cmdObj = {
      pactCode:  Pact.lang.mkExp('todos.toggle-todo-status', todo.id),
      keyPairs: KP
    };

    Pact.fetch.send(cmdObj, API_HOST)
      .then(() => this.getTodos());
  }

  toggleAll() {
    const activeTodos = this.state.todos.filter(todo => !todo.completed);
    const completedTodos = this.state.todos.filter(todo => todo.completed);
    const toggleTodos =
      this.state.todos.length === completedTodos.length
        ? completedTodos
        : activeTodos;
    const cmds = toggleTodos.map(todo => {
      return {
        pactCode: Pact.lang.mkExp('todos.toggle-todo-status', todo.id),
        keyPairs: KP
      };
    });

    Pact.fetch.send(cmds, API_HOST)
      .then(() => this.getTodos());
  }

  destroy(todo) {
    const cmdObj = {
      pactCode: Pact.lang.mkExp('todos.delete-todo', todo.id),
      keyPairs: KP
    };

    Pact.fetch.send(cmdObj, API_HOST)
      .then(() => this.getTodos());
  }

  clearCompleted() {
    const completedTodos = this.state.todos.filter(todo => todo.completed);
    const cmds = completedTodos.map(todo => {
      return {
        pactCode: Pact.lang.mkExp('todos.delete-todo', todo.id),
        keyPairs: KP
      };
    });

    Pact.fetch.send(cmds, API_HOST)
      .then(() => this.getTodos());
  }

  save(todo, text) {
    const cmdObj = {
      pactCode: Pact.lang.mkExp('todos.edit-todo', todo.id, text),
      keyPairs: KP
    };

    Pact.fetch.send(cmdObj, API_HOST)
      .then(() => this.getTodos());

    this.setState({ editing: null });
  }

  edit(todo) {
    this.setState({ editing: todo.id });
  }

  cancel() {
    this.setState({ editing: null });
  }

  showActive() {
    this.setState({ nowShowing: ACTIVE_TODOS });
  }

  showCompleted() {
    this.setState({ nowShowing: COMPLETED_TODOS });
  }

  showAll() {
    this.setState({ nowShowing: ALL_TODOS });
  }

  handleChange(event) {
    this.setState({ newTodo: event.target.value });
  }

  handleNewTodoKeyDown(event) {
    if (event.keyCode !== ENTER_KEY) {
      return;
    }

    event.preventDefault();

    var val = this.state.newTodo.trim();

    if (val) {
      this.add(val);
      this.setState({ newTodo: "" });
    }
  }

  handleSubmit() {
    var val = this.state.editText.trim();
    if (val) {
      this.save(val);
      this.getTodos();
    } else {
      this.destroy();
      this.getTodos();
    }
  }

  render() {
    var footer;
    var main;
    var todos = this.state.todos;
    var shownTodos = todos.filter(function(todo) {
      switch (this.state.nowShowing) {
        case ACTIVE_TODOS:
          return !todo.completed;
        case COMPLETED_TODOS:
          return todo.completed;
        default:
          return true;
      }
    }, this);

    var todoItems = shownTodos.map(function(todo) {
      return (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={this.toggle.bind(this, todo)}
          onDestroy={this.destroy.bind(this, todo)}
          onEdit={this.edit}
          onSave={this.save}
          editing={this.state.editing}
          onCancel={this.cancel}
        />
      );
    }, this);

    var activeTodoCount = todos.reduce(function(accum, todo) {
      return todo.completed ? accum : accum + 1;
    }, 0);

    var completedCount = todos.length - activeTodoCount;

    if (activeTodoCount || completedCount) {
      footer = (
        <TodoFooter
          count={activeTodoCount}
          completedCount={completedCount}
          nowShowing={this.state.nowShowing}
          onClearCompleted={this.clearCompleted}
          showActive={this.showActive}
          showCompleted={this.showCompleted}
          showAll={this.showAll}
        />
      );
    }

    if (todos.length) {
      main = (
        <section className="main">
          <input
            id="toggle-all"
            className="toggle-all"
            type="checkbox"
            onChange={this.toggleAll}
            checked={activeTodoCount === 0}
          />
          <label htmlFor="toggle-all" />
          <ul className="todo-list">{todoItems}</ul>
        </section>
      );
    }

    return (
      <div>
        <header className="header">
          <h1>todos</h1>
          <input
            className="new-todo"
            placeholder="What needs to be done?"
            value={this.state.newTodo}
            onKeyDown={this.handleNewTodoKeyDown}
            onChange={this.handleChange}
            autoFocus={true}
          />
        </header>
        {main}
        {footer}
      </div>
    );
  }
}
