import { call, put } from 'redux-saga/effects';

import {
  FETCH_TODOS,
  FETCH_TODOS_REQUEST,
  FETCH_TODOS_SUCCEEDED,
  FETCH_TODOS_FAILED,
  SAVE_NEW_TODO,
  SAVE_NEW_TODO_REQUEST,
  SAVE_NEW_TODO_SUCCEEDED,
  SAVE_NEW_TODO_FAILED,
  REMOVE_TODO,
  REMOVE_TODO_REQUEST,
  REMOVE_TODO_SUCCEEDED,
  REMOVE_TODO_FAILED,
  UPDATE_TODO,
  UPDATE_TODO_REQUEST,
  UPDATE_TODO_SUCCEEDED,
  UPDATE_TODO_FAILED,
  EDIT_TODO,
  UPDATE_TODO_TITLE,
  UPDATE_NEW_TODO_FIELD,
  RESET_NEW_TODO_FIELD,
  updateNewTodoField,
  fetchTodos,
  saveNewTodo,
  removeTodo,
  fetchTodosSaga,
  saveNewTodoSaga,
  updateTodoSaga,
  removeTodoSaga,
} from '../../src/sagas/todos';

import reducer from '../../src/sagas/todos';

const initialState = {
  todosIsLoading: false,
  todosError: null,
  todos: [],
  newTodo: '',
  editedTodo: null,
};

jest.mock('../../src/utils/send-pact-command');

describe('Todos Saga', () => {
  describe('Action Creators', () => {
    test('updateNewTodoField() should return an action with a newTodo', () => {
      const newTodo = { id: 1, newTodo: { entry: 'Something' } };
      const expected = { type: UPDATE_NEW_TODO_FIELD, newTodo };
      const actual = updateNewTodoField(newTodo);
      expect(actual).toEqual(expected);
    });

    test('fetchTodos() should return an action', () => {
      const expected = { type: FETCH_TODOS };
      const actual = fetchTodos();
      expect(actual).toEqual(expected);
    });

    test('saveNewTodo() should return an action with a newTodo', () => {
      const entry = 'Something';
      const expected = { type: SAVE_NEW_TODO, entry };
      const actual = saveNewTodo(entry);
      expect(actual).toEqual(expected);
    });

    test('removeTodo() should return an action with an id', () => {
      const id = 1;
      const expected = { type: REMOVE_TODO, id };
      const actual = removeTodo(id);
      expect(actual).toEqual(expected);
    });
  });

  describe('Sagas', () => {});

  describe('Reducer', () => {
    test('FETCH_TODOS_REQUEST should set todosIsLoading to true', () => {
      const expected = { ...initialState };
      expected.todosIsLoading = true;
      const actual = reducer(initialState, { type: FETCH_TODOS_REQUEST });
      expect(actual).toEqual(expected);
    });

    test('FETCH_TODOS_SUCCEEDED should set todosIsLoading to false and sort todos by ID', () => {
      const todos = [{ id: 2, entry: 'Alpha' }, { id: 1, entry: 'Zoo' }];
      const state = { ...initialState, todosIsLoading: true };
      const expected = {
        ...state,
        todosError: null,
        todos: todos.sort((a, b) => a.id - b.id),
        todosIsLoading: false,
      };
      const actual = reducer(state, { type: FETCH_TODOS_SUCCEEDED, todos });
      expect(actual).toEqual(expected);
    });

    test('FETCH_TODOS_FAILED should clear todos and set todosError', () => {
      const error = 'Some error message';
      const state = { ...initialState, todosIsLoading: true };
      const expected = { ...state, todosError: error, todos: [], todosIsLoading: false };
      const actual = reducer(state, { type: FETCH_TODOS_FAILED, error });
      expect(actual).toEqual(expected);
    });

    test('SAVE_NEW_TODO_REQUEST should set todosIsLoading to true', () => {
      const expected = { ...initialState };
      expected.todosIsLoading = true;
      const actual = reducer(initialState, { type: SAVE_NEW_TODO_REQUEST });
      expect(actual).toEqual(expected);
    });

    test('SAVE_NEW_TODO_SUCCEEDED should set todosIsLoading to false and add new todo sort todos by ID', () => {
      const todos = [{ id: 2, entry: 'Alpha' }, { id: 1, entry: 'Zoo' }];
      const todo = { id: 3, entry: 'Bravo' };
      const state = { ...initialState, todos, todosIsLoading: true };
      const expected = {
        ...state,
        todosError: null,
        todos: [...todos, todo].sort((a, b) => a.id - b.id),
        todosIsLoading: false,
      };
      const actual = reducer(state, { type: SAVE_NEW_TODO_SUCCEEDED, todo });
      expect(actual).toEqual(expected);
    });

    test('SAVE_NEW_TODO_FAILED should set todosError', () => {
      const todos = [{ id: 2, entry: 'Alpha' }, { id: 1, entry: 'Zoo' }];
      const error = 'Some error message';
      const state = { ...initialState, todosIsLoading: true, todos };
      const expected = { ...initialState, todosError: error, todosIsLoading: false };
      const actual = reducer(initialState, { type: SAVE_NEW_TODO_FAILED, error });
      expect(actual).toEqual(expected);
    });

    test('REMOVE_TODO_REQUEST should set todosIsLoading to true', () => {
      const expected = { ...initialState };
      expected.todosIsLoading = true;
      const actual = reducer(initialState, { type: REMOVE_TODO_REQUEST });
      expect(actual).toEqual(expected);
    });

    test('REMOVE_TODO_SUCCEEDED should set todosIsLoading to false and remove the todo', () => {
      const todos = [{ id: 2, entry: 'Alpha' }, { id: 1, entry: 'Zoo' }];
      const id = 1;
      const state = { ...initialState, todos, todosIsLoading: true };
      const expected = {
        ...state,
        todosError: null,
        todos: todos.filter(todo => todo.id !== id),
        todosIsLoading: false,
      };
      const actual = reducer(state, { type: REMOVE_TODO_SUCCEEDED, id });
      expect(actual).toEqual(expected);
    });

    test('REMOVE_TODO_FAILED should set todosError', () => {
      const todos = [{ id: 2, entry: 'Alpha' }, { id: 1, entry: 'Zoo' }];
      const error = 'Some error message';
      const state = { ...initialState, todosIsLoading: true, todos };
      const expected = { ...initialState, todosError: error, todosIsLoading: false };
      const actual = reducer(initialState, { type: REMOVE_TODO_FAILED, error });
      expect(actual).toEqual(expected);
    });

    test('UPDATE_TODO_REQUEST should set todosIsLoading to true', () => {
      const expected = { ...initialState };
      expected.todosIsLoading = true;
      const actual = reducer(initialState, { type: UPDATE_TODO_REQUEST });
      expect(actual).toEqual(expected);
    });
  });
});
