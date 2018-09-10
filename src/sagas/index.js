import { takeLatest } from 'redux-saga/effects';
import {
  FETCH_TODOS,
  SAVE_NEW_TODO,
  UPDATE_TODO,
  REMOVE_TODO,
  fetchTodosSaga,
  saveNewTodoSaga,
  updateTodoSaga,
  removeTodoSaga,
} from './todos';

export default function* rootSaga() {
  yield takeLatest(FETCH_TODOS, fetchTodosSaga);
  yield takeLatest(SAVE_NEW_TODO, saveNewTodoSaga);
  yield takeLatest(UPDATE_TODO, updateTodoSaga);
  yield takeLatest(REMOVE_TODO, removeTodoSaga);
}
