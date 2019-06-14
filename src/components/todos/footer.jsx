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
            <a href="#/" className={{ selected: nowShowing === "all" }}>
              All
            </a>
          </li>{" "}
          <li>
            <a
              href="#/active"
              className={{ selected: nowShowing === "active" }}
            >
              Active
            </a>
          </li>{" "}
          <li>
            <a
              href="#/completed"
              className={{ selected: nowShowing === "completed" }}
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
