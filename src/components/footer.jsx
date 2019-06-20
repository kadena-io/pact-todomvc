import * as React from "react";

export class TodoFooter extends React.PureComponent {
  render() {
    var pluralize = function(count, word) {
      return count === 1 ? word : word + "s";
    };
    var activeTodoWord = pluralize(this.props.count, "item");
    var clearButton = null;

    if (this.props.completedCount > 0) {
      clearButton = (
        <button
          className="clear-completed"
          onClick={this.props.onClearCompleted}
        >
          Clear completed
        </button>
      );
    }

    var nowShowing = this.props.nowShowing;
    return (
      <footer className="footer">
        <span className="todo-count">
          <strong>{this.props.count}</strong> {activeTodoWord} left
        </span>
        <ul className="filters">
          <li>
            <a
              onClick={this.props.showAll}
              href="#/"
              className={nowShowing === "all" ? "selected" : "not-selected"}
            >
              All
            </a>
          </li>{" "}
          <li>
            <a
              onClick={this.props.showActive}
              href="#/active"
              className={nowShowing === "active" ? "selected" : "not-selected"}
            >
              Active
            </a>
          </li>{" "}
          <li>
            <a
              onClick={this.props.showCompleted}
              href="#/completed"
              className={
                nowShowing === "completed" ? "selected" : "not-selected"
              }
            >
              Completed
            </a>
          </li>
        </ul>
        {clearButton}
      </footer>
    );
  }
}
