import { call, put } from 'redux-saga/effects';
import { testSaga } from 'redux-saga-test-plan';

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

import * as sendPactCommand from '../../src/utils/send-pact-command';

const initialState = {
  todosIsLoading: false,
  todosError: null,
  todos: [],
  newTodo: '',
  editedTodo: null,
};

const mockTodos = [{ id: 2, entry: 'Alpha' }, { id: 1, entry: 'Zoo' }];

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

  describe('Sagas', () => {
    afterEach(() => {
      sendPactCommand.default.mockRestore();
    });

    test.skip('fetchTodosSaga() should return an array of todos', () => {
      sendPactCommand.default = jest.fn().mockReturnValue(mockTodos);

      testSaga(fetchTodosSaga)
        .next()
        .put({ type: FETCH_TODOS_REQUEST })
        .next()
        .call(sendPactCommand.default, 'todos.read-todos')
        .next()
        .put({ type: FETCH_TODOS_SUCCEEDED, todos: mockTodos })
        .next()
        .isDone();
    });

    test('fetchTodosSaga() should throw a failure on error', () => {
      sendPactCommand.default = jest.fn();

      const error = new Error('error');

      testSaga(fetchTodosSaga)
        .next()
        .put({ type: FETCH_TODOS_REQUEST })
        .next()
        .throw(error)
        .put({ type: FETCH_TODOS_FAILED, error })
        .next()
        .isDone();
    });

    test.skip('saveNewTodoSaga() should return a newly-created todo', () => {
      sendPactCommand.default = jest.fn().mockReturnValue(mockTodos[0]);

      const entry = 'A new todo';

      testSaga(saveNewTodoSaga)
        .next()
        .put({ type: SAVE_NEW_TODO_REQUEST })
        .next()
        .call(sendPactCommand.default, `(todos.new-todo ${entry})`)
        .next()
        .put({ type: SAVE_NEW_TODO_SUCCEEDED, todo: mockTodos[0] })
        .next()
        .isDone();
    });

    test('saveNewTodoSaga() should throw a failure on error', () => {
      sendPactCommand.default = jest.fn();

      const error = new Error('error');
      const entry = 'a todo';

      testSaga(saveNewTodoSaga, entry)
        .next()
        .put({ type: SAVE_NEW_TODO_REQUEST })
        .next()
        .throw(error)
        .put({ type: SAVE_NEW_TODO_FAILED, error })
        .next()
        .isDone();
    });

    test.skip('removeTodoSaga() should return the id of the removed todo', () => {
      const id = 1;

      sendPactCommand.default = jest.fn().mockReturnValue(id);

      testSaga(removeTodoSaga)
        .next()
        .put({ type: REMOVE_TODO_REQUEST })
        .next()
        .call(sendPactCommand.default, `(todos.delete-todo ${id})`)
        .next()
        .put({ type: REMOVE_TODO_SUCCEEDED, id })
        .next()
        .isDone();
    });

    test('removeTodoSaga() should throw a failure on error', () => {
      sendPactCommand.default = jest.fn();

      const error = new Error('error');
      const id = 1;

      testSaga(removeTodoSaga, id)
        .next()
        .put({ type: REMOVE_TODO_REQUEST, id })
        .next()
        .throw(error)
        .put({ type: REMOVE_TODO_FAILED, error })
        .next()
        .isDone();
    });

    test.skip('updateTodoSaga() should return the updated todo', () => {
      const id = 1;
      const entry = 'A new todo';

      sendPactCommand.default = jest.fn().mockReturnValue({ id, entry });

      testSaga(updateTodoSaga, id, entry)
        .next()
        .put({ type: UPDATE_TODO_REQUEST, id, entry})
        .next()
        .call(sendPactCommand.default, `(todos.edit-todo ${id} ${entry})`)
        .next()
        .put({ type: UPDATE_TODO_SUCCEEDED, todo: { id, entry } })
        .next()
        .isDone();
    });

    test('updateTodoSaga() should throw a failure on error', () => {
      sendPactCommand.default = jest.fn();

      const error = new Error('error');
      const id = 1;
      const entry = 'A new todo';

      testSaga(updateTodoSaga, id, entry)
        .next()
        .put({ type: UPDATE_TODO_REQUEST, id, entry})
        .next()
        .throw(error)
        .put({ type: UPDATE_TODO_FAILED, error })
        .next()
        .isDone();
    });

  });

  describe('Reducer', () => {
    test('FETCH_TODOS_REQUEST should set todosIsLoading to true', () => {
      const expected = { ...initialState };
      expected.todosIsLoading = true;
      const actual = reducer(initialState, { type: FETCH_TODOS_REQUEST });
      expect(actual).toEqual(expected);
    });

    test('FETCH_TODOS_SUCCEEDED should set todosIsLoading to false and sort todos by ID', () => {
      const state = { ...initialState, todosIsLoading: true };
      const expected = {
        ...state,
        todosError: null,
        todos: mockTodos.sort((a, b) => a.id - b.id),
        todosIsLoading: false,
      };
      const actual = reducer(state, { type: FETCH_TODOS_SUCCEEDED, todos: mockTodos });
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
      const todo = { id: 3, entry: 'Bravo' };
      const state = { ...initialState, todos: mockTodos, todosIsLoading: true };
      const expected = {
        ...state,
        todosError: null,
        todos: [...state.todos, todo].sort((a, b) => a.id - b.id),
        todosIsLoading: false,
      };
      const actual = reducer(state, { type: SAVE_NEW_TODO_SUCCEEDED, todo });
      expect(actual).toEqual(expected);
    });

    test('SAVE_NEW_TODO_FAILED should set todosError', () => {
      const error = 'Some error message';
      const state = { ...initialState, todosIsLoading: true, todos: mockTodos };
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
      const id = 1;
      const state = { ...initialState, todos: mockTodos, todosIsLoading: true };
      const expected = {
        ...state,
        todosError: null,
        todos: state.todos.filter(todo => todo.id !== id),
        todosIsLoading: false,
      };
      const actual = reducer(state, { type: REMOVE_TODO_SUCCEEDED, id });
      expect(actual).toEqual(expected);
    });

    test('REMOVE_TODO_FAILED should set todosError', () => {
      const error = 'Some error message';
      const state = { ...initialState, todosIsLoading: true, todos: mockTodos };
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
