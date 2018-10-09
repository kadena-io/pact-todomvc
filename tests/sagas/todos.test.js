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
  CHANGE_EDIT_STATUS,
  UPDATE_TODO,
  UPDATE_TODO_REQUEST,
  UPDATE_TODO_SUCCEEDED,
  UPDATE_TODO_FAILED,
  TOGGLE_TODO_STATE,
  TOGGLE_TODO_STATE_REQUEST,
  TOGGLE_TODO_STATE_SUCCEEDED,
  TOGGLE_TODO_STATE_FAILED,
  CHANGE_TODO_ENTRY,
  UPDATE_NEW_TODO_FIELD,
  RESET_NEW_TODO_FIELD,
  updateNewTodoField,
  fetchTodos,
  saveNewTodo,
  changeEntry,
  updateTodo,
  toggleState,
  removeTodo,
  changeEditStatus,
  fetchTodosSaga,
  toggleTodoStateSaga,
  saveNewTodoSaga,
  updateTodoSaga,
  removeTodoSaga,
} from '../../src/sagas/todos';

import reducer from '../../src/sagas/todos';

import sendPactCommand from '../../src/utils/send-pact-command';
jest.mock('../../src/utils/send-pact-command');

const initialState = {
  todosIsLoading: false,
  todosError: null,
  todos: [],
  newTodo: '',
  editedTodo: null,
  editStatus: false,
};

const mockTodos = [
  { id: 2, entry: 'Alpha', editStatus: false, date: '10-09-2018' },
  { id: 1, entry: 'Zoo', editStatus: false, date: '10-09-2018' },
];

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
      const date = '10-09-2018';
      const expected = { type: SAVE_NEW_TODO, entry, date };
      const actual = saveNewTodo(entry, date);
      expect(actual).toEqual(expected);
    });

    test('changeEntry() should return an action with id and entry', () => {
      const id = 1;
      const entry = 'Something';
      const date = '10-09-2018';
      const expected = { type: CHANGE_TODO_ENTRY, id, entry, date };
      const actual = changeEntry(id, entry, date);
      expect(actual).toEqual(expected);
    });

    test('updateTodo() should return an action with a todo', () => {
      const todo = { id: 1, entry: 'Something' };
      const expected = { type: UPDATE_TODO, todo };
      const actual = updateTodo(todo);
      expect(actual).toEqual(expected);
    });

    test('toggleState() should return an action with id and entry', () => {
      const id = 1;
      const state = 'completed';
      const expected = { type: TOGGLE_TODO_STATE, id, state };
      const actual = toggleState(id, state);
      expect(actual).toEqual(expected);
    });

    test('removeTodo() should return an action with an id', () => {
      const id = 1;
      const expected = { type: REMOVE_TODO, id };
      const actual = removeTodo(id);
      expect(actual).toEqual(expected);
    });

    test('changeEditStatus() should return an action with an id', () => {
      const id = 1;
      const expected = { type: CHANGE_EDIT_STATUS, id };
      const actual = changeEditStatus(id);
      expect(actual).toEqual(expected);
    });
  });

  describe('Sagas', () => {
    test('fetchTodosSaga() should return an array of todos', () => {
      testSaga(fetchTodosSaga)
        .next()
        .put({ type: FETCH_TODOS_REQUEST })
        .next()
        .call(sendPactCommand, '(todos.read-todos)')
        .next(mockTodos)
        .put({ type: FETCH_TODOS_SUCCEEDED, todos: mockTodos })
        .next()
        .isDone();
    });

    test('fetchTodosSaga() should throw a failure on error', () => {
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

    test('toggleTodoStateSaga() should send a toggle-todo-status with id', () => {
      const id = 1;
      const state = 'comleted';
      testSaga(toggleTodoStateSaga, { id, state })
        .next()
        .put({ type: TOGGLE_TODO_STATE_REQUEST })
        .next()
        .call(sendPactCommand, `(todos.toggle-todo-status ${id})`)
        .next(mockTodos)
        .put({ type: TOGGLE_TODO_STATE_SUCCEEDED, id, state })
        .next()
        .isDone();
    });

    test('toggleTodoStateSaga() should throw a failure on error', () => {
      const error = new Error('error');
      const id = 1;
      const state = 'comleted';

      testSaga(toggleTodoStateSaga, { id, state })
        .next()
        .put({ type: TOGGLE_TODO_STATE_REQUEST })
        .next()
        .throw(error)
        .put({ type: TOGGLE_TODO_STATE_FAILED, error })
        .next()
        .isDone();
    });

    test('saveNewTodoSaga() should return a newly-created todo', () => {
      const entry = 'A new todo';
      const date = '10-09-2018';

      testSaga(saveNewTodoSaga, { entry, date })
        .next()
        .put({ type: SAVE_NEW_TODO_REQUEST })
        .next()
        .call(sendPactCommand, `(todos.new-todo ${JSON.stringify(entry)} ${JSON.stringify(date)})`)
        .next(mockTodos[0])
        .put({ type: SAVE_NEW_TODO_SUCCEEDED, newTodo: mockTodos[0] })
        .next()
        .isDone();
    });

    test('saveNewTodoSaga() should throw a failure on error', () => {
      const error = new Error('error');
      const entry = 'a todo';
      const date = '10-09-2018';

      testSaga(saveNewTodoSaga, { entry, date })
        .next()
        .put({ type: SAVE_NEW_TODO_REQUEST })
        .next()
        .throw(error)
        .put({ type: SAVE_NEW_TODO_FAILED, error })
        .next()
        .isDone();
    });

    test('removeTodoSaga() should return the id of the removed todo', () => {
      const id = 1;

      testSaga(removeTodoSaga, { id })
        .next()
        .put({ type: REMOVE_TODO_REQUEST, id })
        .next()
        .call(sendPactCommand, `(todos.delete-todo ${id})`)
        .next(id)
        .put({ type: REMOVE_TODO_SUCCEEDED, id })
        .next()
        .isDone();
    });

    test('removeTodoSaga() should throw a failure on error', () => {
      const error = new Error('error');
      const id = 1;

      testSaga(removeTodoSaga, { id })
        .next()
        .put({ type: REMOVE_TODO_REQUEST, id })
        .next()
        .throw(error)
        .put({ type: REMOVE_TODO_FAILED, error })
        .next()
        .isDone();
    });

    test('updateTodoSaga() should return the updated todo', () => {
      const id = 1;
      const entry = 'A new todo';
      const date = '10-09-2018';
      const todo = { id, entry, date };

      testSaga(updateTodoSaga, { todo })
        .next()
        .put({ type: UPDATE_TODO_REQUEST, todo })
        .next()
        .call(
          sendPactCommand,
          `(todos.edit-todo ${todo.id} ${JSON.stringify(todo.entry)} ${JSON.stringify(todo.date)})`
        )
        .next(todo)
        .put({ type: UPDATE_TODO_SUCCEEDED, todo })
        .next()
        .isDone();
    });

    test('updateTodoSaga() should throw a failure on error', () => {
      const error = new Error('error');
      const id = 1;
      const entry = 'A new todo';
      const date = '10-09-2018';
      const todo = { id, entry, date };

      testSaga(updateTodoSaga, { todo })
        .next()
        .put({ type: UPDATE_TODO_REQUEST, todo })
        .next()
        .throw(error)
        .put({ type: UPDATE_TODO_FAILED, error })
        .next()
        .isDone();
    });
  });

  describe('Reducer', () => {
    test('should return state on default', () => {
      const expected = { ...initialState };
      const actual = reducer(initialState, { type: 'not a valid action' });
      expect(actual).toEqual(expected);
    });

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
      const newTodo = { id: 3, entry: 'Bravo' };
      const state = { ...initialState, todos: mockTodos, todosIsLoading: true };
      const expected = {
        ...state,
        todosError: null,
        todos: [...state.todos, newTodo].sort((a, b) => a.id - b.id),
        todosIsLoading: false,
      };
      const actual = reducer(state, { type: SAVE_NEW_TODO_SUCCEEDED, newTodo });
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

    test('UPDATE_TODO_SUCCEEDED should set update the todo', () => {
      const state = { ...initialState, todosIsLoading: true, todos: mockTodos };
      const todo = { ...mockTodos[0], entry: 'Something totally different' };
      const action = { type: UPDATE_TODO_SUCCEEDED, todo };
      const expected = {
        ...state,
        todosError: null,
        todosIsLoading: false,
        todos: [...state.todos.filter(todo => todo.id !== action.todo.id), action.todo].sort(
          (a, b) => a.id - b.id
        ),
      };

      const actual = reducer(state, action);
      expect(actual).toEqual(expected);
    });

    test('UPDATE_TODO_FAILED should set todosError', () => {
      const error = 'Some error message';
      const state = { ...initialState, todosIsLoading: true, todos: mockTodos };
      const expected = { ...initialState, todosError: error, todosIsLoading: false };
      const actual = reducer(initialState, { type: UPDATE_TODO_FAILED, error });
      expect(actual).toEqual(expected);
    });

    test('TOGGLE_TODO_STATE_REQUEST should set todosIsLoading to true', () => {
      const expected = { ...initialState };
      expected.todosIsLoading = true;
      const actual = reducer(initialState, { type: TOGGLE_TODO_STATE_REQUEST });
      expect(actual).toEqual(expected);
    });

    test('TOGGLE_TODO_STATE_SUCCEEDED toggle the state todo', () => {
      const state = { ...initialState, todosIsLoading: true, todos: mockTodos };
      const todo = { ...mockTodos[0], state: 'completed' };
      const action = { type: TOGGLE_TODO_STATE_SUCCEEDED, id: mockTodos[0].id, state: 'completed' };
      const expected = {
        ...state,
        todosError: null,
        todosIsLoading: false,
        todos: [...state.todos.filter(todo => todo.id !== action.id), todo].sort(
          (a, b) => a.id - b.id
        ),
      };

      const actual = reducer(state, action);
      expect(actual).toEqual(expected);
    });

    test('TOGGLE_TODO_STATE_FAILED should set todosError', () => {
      const error = 'Some error message';
      const state = { ...initialState, todosIsLoading: true, todos: mockTodos };
      const expected = { ...initialState, todosError: error, todosIsLoading: false };
      const actual = reducer(initialState, { type: TOGGLE_TODO_STATE_FAILED, error });
      expect(actual).toEqual(expected);
    });

    test('CHANGE_TODO_ENTRY change the todo entry', () => {
      const state = { ...initialState, todosIsLoading: true, todos: mockTodos };
      const todo = { ...mockTodos[0], entry: 'new text' };
      const action = { type: CHANGE_TODO_ENTRY, id: mockTodos[0].id, entry: 'new text' };
      const expected = {
        ...state,
        todos: [...state.todos.filter(todo => todo.id !== action.id), todo].sort(
          (a, b) => a.id - b.id
        ),
      };

      const actual = reducer(state, action);
      expect(actual).toEqual(expected);
    });

    test('CHANGE_EDIT_STATUS change the editStatus', () => {
      const state = { ...initialState, todosIsLoading: true, todos: mockTodos };
      const todo = { ...mockTodos[0], editStatus: true };
      const action = { type: CHANGE_EDIT_STATUS, id: mockTodos[0].id };
      const expected = {
        ...state,
        todos: [...state.todos.filter(todo => todo.id !== action.id), todo].sort(
          (a, b) => a.id - b.id
        ),
      };
      const actual = reducer(state, action);
      expect(actual).toEqual(expected);
    });

    test('UPDATE_NEW_TODO_FIELD should set todosError', () => {
      const newTodo = 'hello';
      const state = { ...initialState, newTodo: '' };
      const expected = { ...initialState, newTodo };
      const actual = reducer(initialState, { type: UPDATE_NEW_TODO_FIELD, newTodo });
      expect(actual).toEqual(expected);
    });
  });
});
