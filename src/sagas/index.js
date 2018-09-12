import { takeLatest } from 'redux-saga/effects';
import {
  FETCH_TODOS,
  SAVE_NEW_TODO,
  UPDATE_TODO,
  REMOVE_TODO,
  TOGGLE_TODO_STATE,
  fetchTodosSaga,
  saveNewTodoSaga,
  updateTodoSaga,
  toggleTodoStateSaga,
  removeTodoSaga,
} from './todos';

export default function* rootSaga() {
  yield takeLatest(FETCH_TODOS, fetchTodosSaga);
  yield takeLatest(SAVE_NEW_TODO, saveNewTodoSaga);
  yield takeLatest(UPDATE_TODO, updateTodoSaga);
  yield takeLatest(TOGGLE_TODO_STATE, toggleTodoStateSaga);
  yield takeLatest(REMOVE_TODO, removeTodoSaga);
}
