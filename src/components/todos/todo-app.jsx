import * as React from "react";
import { TodoItem } from "./todo.jsx";
import { TodoFooter } from "./footer.jsx";
import uuidv4 from "uuid/v4";
import Pact from "pact-lang-api";

const ENTER_KEY = 13;
const KP = Pact.crypto.genKeyPair();
const API_HOST = "http://localhost:9001";

export class TodoApp extends React.PureComponent {
  constructor() {
    super();
    this.state = {
      todos: [],
      onChanges: [],
      nowShowing: "all",
      editing: null,
      newTodo: ""
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleNewTodoKeyDown = this.handleNewTodoKeyDown.bind(this);
    this.toggle = this.toggle.bind(this);
    this.destroy = this.destroy.bind(this);
    this.edit = this.edit.bind(this);
    this.cancel = this.cancel.bind(this);
    this.clearcompleted = this.clearcompleted.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    this.getTodos();
  }

  getTodos() {
    const cmdObj = {
      pactCode: `(todos.read-todos)`,
      apiHost: API_HOST,
      keyPairs: KP
    };
    Pact.fetch.local(cmdObj)
      .then(res => res.data)
      .then(todos => this.setState({ todos }))
      .catch(e => e);
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
      this.addTodo(val);
      this.setState({ newTodo: "" });
    }
  }

  addTodo(title) {
    const uuid = uuidv4();
    const cmdObj = {
      pactCode: `(todos.new-todo
                 ${JSON.stringify(uuid)}
                 ${JSON.stringify(title)})`,
      apiHost: API_HOST,
      keyPairs: KP
    };

    Pact.fetch.send(cmdObj);
  }

  toggle(todo) {
    const cmdObj = {
      pactCode: `(todos.toggle-todo-status
                 ${JSON.stringify(todo.id)})`,
      apiHost: API_HOST,
      keyPairs: KP
    };
    const res = Pact.fetch.send(cmdObj);
  }

  destroy(todo) {
    const cmdObj = {
      pactCode: `(todos.delete-todo
                 ${JSON.stringify(todo.id)})`,
      apiHost: API_HOST,
      keyPairs: KP
    };
    Pact.fetch.send(cmdObj);
  }

  edit(todo, text) {
    const cmdObj = {
      pactCode: `(todos.edit-todo
                ${JSON.stringify(todo.id)})
                ${JSON.stringify(text)})`,
      apiHost: API_HOST,
      keyPairs: KP
    };
    const res = Pact.fetch.send(cmdObj);
    this.setState({ editing: null });
  }

  cancel() {
    this.setState({ editing: null });
  }

  clearcompleted() {
    this.todos = this.todos.filter(function(todo) {
      return !todo.completed;
    });
  }

  handleSubmit(e) {
    var val = this.state.editText.trim();
    if (val) {
      this.save(val);
      this.setState({
        editText: val
      });
    } else {
      this.destroy();
    }
  }

  render() {
    console.log(this.state.todos);
    var footer;
    var main;
    var todos = this.state.todos;
    var shownTodos = todos.filter(function(todo) {
      switch (this.state.nowShowing) {
        case "active":
          return !todo.completed;
        case "completed":
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
          onEdit={this.edit.bind(this, todo)}
          editing={this.state.editing === todo.id}
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
