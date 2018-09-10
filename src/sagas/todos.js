import { call, put } from 'redux-saga/effects';

import sendPactCommand from '../utils/send-pact-command';

export const FETCH_TODOS = 'pact-todomvc/todos/FETCH_TODOS';
export const FETCH_TODOS_REQUEST = 'pact-todomvc/todos/FETCH_TODOS_REQUEST';
export const FETCH_TODOS_SUCCEEDED = 'pact-todomvc/todos/FETCH_TODOS_SUCCEEDED';
export const FETCH_TODOS_FAILED = 'pact-todomvc/todos/FETCH_TODOS_FAILED';

export const SAVE_NEW_TODO = 'pact-todomvc/todos/SAVE_NEW_TODO';
export const SAVE_NEW_TODO_REQUEST = 'pact-todomvc/todos/SAVE_NEW_TODO_REQUEST';
export const SAVE_NEW_TODO_SUCCEEDED = 'pact-todomvc/todos/SAVE_NEW_TODO_SUCCEEDED';
export const SAVE_NEW_TODO_FAILED = 'pact-todomvc/todos/SAVE_NEW_TODO_FAILED';

export const REMOVE_TODO = 'pact-todomvc/todos/REMOVE_TODO';
export const REMOVE_TODO_REQUEST = 'pact-todomvc/todos/REMOVE_TODO_REQUEST';
export const REMOVE_TODO_SUCCEEDED = 'pact-todomvc/todos/REMOVE_TODO_SUCCEEDED';
export const REMOVE_TODO_FAILED = 'pact-todomvc/todos/REMOVE_TODO_FAILED';

export const UPDATE_TODO = 'pact-todomvc/todos/UPDATE_TODO';
export const UPDATE_TODO_REQUEST = 'pact-todomvc/todos/UPDATE_TODO_REQUEST';
export const UPDATE_TODO_SUCCEEDED = 'pact-todomvc/todos/UPDATE_TODO_SUCCEEDED';
export const UPDATE_TODO_FAILED = 'pact-todomvc/todos/UPDATE_TODO_FAILED';

export const EDIT_TODO = 'pact-todomvc/todos/EDIT_TODO';
export const UPDATE_TODO_TITLE = 'pact-todomvc/todos/UPDATE_TODO_TITLE';
export const UPDATE_NEW_TODO_FIELD = 'pact-todomvc/todos/UPDATE_NEW_TODO_FIELD';
export const RESET_NEW_TODO_FIELD = 'pact-todomvc/todos/RESET_NEW_TODO_FIELD';

const initialState = {
  todosIsLoading: false,
  todosError: null,
  todos: [],
  newTodo: '',
  editedTodo: null,
};

let workingTodo;
export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case FETCH_TODOS_REQUEST:
      return { ...initialState, todosIsLoading: true };

    case FETCH_TODOS_SUCCEEDED:
      return {
        ...state,
        todosError: null,
        todos: action.todos.sort((a, b) => a.id - b.id),
        todosIsLoading: false,
      };

    case FETCH_TODOS_FAILED:
      return {
        ...state,
        todosError: action.error,
        todos: [],
        todosIsLoading: false,
      };

    case SAVE_NEW_TODO_REQUEST:
      return { ...initialState, todosIsLoading: true };

    case SAVE_NEW_TODO_SUCCEEDED:
      return {
        ...state,
        todosError: null,
        todos: [...state.todos, action.todo].sort((a, b) => a.id - b.id),
        todosIsLoading: false,
        newTodo: '',
      };

    case SAVE_NEW_TODO_FAILED:
      return {
        ...state,
        todosError: action.error,
        todosIsLoading: false,
      };

    case REMOVE_TODO_REQUEST:
      return { ...initialState, todosIsLoading: true };

    case REMOVE_TODO_SUCCEEDED:
      return {
        ...state,
        todosError: null,
        todos: state.todos.filter(todo => todo.id !== action.id),
        todosIsLoading: false,
        newTodo: '',
      };

    case REMOVE_TODO_FAILED:
      return {
        ...state,
        todosError: action.error,
        todosIsLoading: false,
      };

    case UPDATE_TODO_REQUEST:
      return { ...initialState, todosIsLoading: true };

    case UPDATE_TODO_SUCCEEDED:
      return {
        ...state,
        todosError: null,
        todos: state.todos
          .filter(todo => todo.id !== action.todo.id)
          .push(action.todo)
          .sort((a, b) => a.id - b.id),
        todosIsLoading: false,
      };

    case UPDATE_TODO_FAILED:
      return {
        ...state,
        todosError: action.error,
        todosIsLoading: false,
      };

    case EDIT_TODO:
      return {
        ...state,
        editedTodo: state.todos.find(todo => todo.id === action.id),
      };

    case UPDATE_TODO_TITLE:
      workingTodo = state.todos.find(todo => todo.id === action.id);
      workingTodo.title = action.title;
      return {
        ...state,
        editedTodo: { ...state.editedTodo, title: action.title },
      };

    case UPDATE_NEW_TODO_FIELD:
      return { ...state, newTodo: action.newTodo };

    case RESET_NEW_TODO_FIELD:
      return { ...state, newTodo: '' };

    default:
      return state;
  }
}

export function updateNewTodoField(newTodo) {
  return { type: UPDATE_NEW_TODO_FIELD, newTodo };
}

export function fetchTodos() {
  return { type: FETCH_TODOS };
}

export function saveNewTodo(entry) {
  return { type: SAVE_NEW_TODO, entry };
}

export function removeTodo(id) {
  return { type: REMOVE_TODO, id };
}

export function* fetchTodosSaga() {
  yield put({ type: FETCH_TODOS_REQUEST });
  try {
    const todos = yield call(sendPactCommand, 'todos.read-todos');
    yield put({ type: FETCH_TODOS_SUCCEEDED, todos });
  } catch (error) {
    yield put({ type: FETCH_TODOS_FAILED, error });
  }
}

export function* saveNewTodoSaga(entry) {
  yield put({ type: SAVE_NEW_TODO_REQUEST });
  try {
    const newTodo = yield call(sendPactCommand, `(todos.new-todo ${entry})`);
    yield put({ type: SAVE_NEW_TODO_SUCCEEDED, newTodo });
  } catch (error) {
    yield put({ type: SAVE_NEW_TODO_FAILED, error });
  }
}

export function* removeTodoSaga(id) {
  yield put({ type: REMOVE_TODO_REQUEST, id });
  try {
    yield call(sendPactCommand, `(todos.delete-todo ${id})`);
    yield put({ type: REMOVE_TODO_SUCCEEDED, id });
  } catch (error) {
    yield put({ type: REMOVE_TODO_FAILED, error });
  }
}

export function* updateTodoSaga(id, entry) {
  yield put({ type: UPDATE_TODO_REQUEST, id, entry });
  try {
    const todo = yield call(sendPactCommand, `(todos.edit-todo ${id} ${entry})`);
    yield put({ type: UPDATE_TODO_SUCCEEDED, todo });
  } catch (error) {
    yield put({ type: UPDATE_TODO_FAILED, error });
  }
}
