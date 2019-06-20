import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import { TodoApp } from "./components/todo-app";
import * as serviceWorker from "./serviceWorker";

ReactDOM.render(<TodoApp />, document.getElementById("root"));

serviceWorker.unregister();
