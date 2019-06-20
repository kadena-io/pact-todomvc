import * as React from "react";
import ReactDOM from "react-dom";

var ESCAPE_KEY = 27;
var ENTER_KEY = 13;

export class TodoItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = { editText: this.props.todo.title };
    this.handleChange = this.handleChange.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      nextProps.todo !== this.props.todo ||
      nextProps.editing !== this.props.editing ||
      nextState.editText !== this.state.editText
    );
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.editing && this.props.editing) {
      var node = ReactDOM.findDOMNode(this.refs.editField);
      node.focus();
      node.setSelectionRange(node.value.length, node.value.length);
    }
  }

  handleSubmit(event) {
    var val = this.state.editText.trim();
    if (val) {
      this.props.onSave(this.props.todo, val);
    } else {
      this.props.onDestroy();
    }
  }

  handleEdit() {
    this.props.onEdit(this.props.todo);
    this.setState({ editText: this.props.todo.title });
  }

  handleKeyDown(event) {
    if (event.which === ESCAPE_KEY) {
      this.setState({ editText: this.props.todo.title });
      this.props.onCancel(event);
    } else if (event.which === ENTER_KEY) {
      this.handleSubmit(event);
    }
  }

  handleChange(event) {
    if (this.props.editing === this.props.todo.id) {
      this.setState({ editText: event.target.value });
    }
  }

  render() {
    let status =
      this.props.editing === this.props.todo.id
        ? "editing"
        : this.props.todo.completed
          ? "completed"
          : "static";

    return (
      <li className={status}>
        <div className="view">
          <input
            className="toggle"
            type="checkbox"
            checked={this.props.todo.completed}
            onChange={this.props.onToggle}
          />
          <label onDoubleClick={this.handleEdit}>{this.props.todo.title}</label>
          <button className="destroy" onClick={this.props.onDestroy} />
        </div>
        <input
          ref="editField"
          className="edit"
          value={this.state.editText}
          onBlur={this.handleSubmit}
          onChange={this.handleChange}
          onKeyDown={this.handleKeyDown}
        />
      </li>
    );
  }
}
