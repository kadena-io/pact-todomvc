import { call, put } from 'redux-saga/effects';
import fetch from 'isomorphic-fetch';

import {
  API_URL,
  FETCH_QUIZ,
  FETCH_QUIZ_REQUEST,
  FETCH_QUIZ_SUCCEEDED,
  FETCH_QUIZ_FAILED,
  ANSWER_QUESTION,
  RESET_ANSWERS,
  answerQuestion,
  resetAnswers,
  fetchQuiz,
  fetchQuizSaga,
  fetchQuizQuestionsFromAPI,
} from '../../src/sagas/quiz';

import reducer from '../../src/sagas/quiz';

jest.mock('isomorphic-fetch');

const initialState = {
  quizIsLoading: false,
  quizError: null,
  quizQuestions: null,
  quizAnswers: null,
};

const mockQuestions = [{ question: 'How are you?' }, { question: 'Find, and you?' }];

describe('Quiz Saga', () => {
  test('answerQuestion() returns a redux action', () => {
    const questionNumber = 2;
    const answer = 'True';

    const expected = { type: ANSWER_QUESTION, questionNumber, answer };
    const actual = answerQuestion(questionNumber, answer);

    expect(actual).toEqual(expected);
  });

  test('resetAnswers() returns a redux action', () => {
    const expected = { type: RESET_ANSWERS };
    const actual = resetAnswers();

    expect(actual).toEqual(expected);
  });

  test('fetchQuiz() returns a redux action', () => {
    const expected = { type: FETCH_QUIZ };
    const actual = fetchQuiz();

    expect(actual).toEqual(expected);
  });

  test('fetchQuizSaga() calls fetchQuizQuestionsFromAPI()', () => {
    const gen = fetchQuizSaga();
    const expectedPutRequest = gen.next().value;
    expect(expectedPutRequest).toEqual(put({ type: FETCH_QUIZ_REQUEST }));

    const expectedCallFetch = gen.next().value;
    expect(expectedCallFetch).toEqual(call(fetchQuizQuestionsFromAPI));

    // mocking isomorphic-fetch out, so questions should be undefined
    const expectedPutSuccess = gen.next().value;
    expect(expectedPutSuccess).toEqual(put({ type: FETCH_QUIZ_SUCCEEDED, questions: undefined }));
  });

  test('reducer() responsds to FETCH_QUIZ_REQUEST', () => {
    const action = { type: FETCH_QUIZ_REQUEST };

    const expected = { ...initialState, quizIsLoading: true };
    const actual = reducer(initialState, action);

    expect(actual).toEqual(expected);
  });

  test('reducer() responsds to FETCH_QUIZ_SUCCEEDED', () => {
    const action = { type: FETCH_QUIZ_SUCCEEDED, questions: mockQuestions };

    const state = { ...initialState, quizIsLoading: true };
    const expected = {
      ...state,
      quizError: null,
      quizQuestions: action.questions,
      quizAnswers: new Array(action.questions.length),
      quizIsLoading: false,
    };
    const actual = reducer(state, action);

    expect(actual).toEqual(expected);
  });

  test('reducer() responsds to FETCH_QUIZ_FAILED', () => {
    const mockError = new Error('Mock Error');
    const action = { type: FETCH_QUIZ_FAILED, error: mockError };

    const state = { ...initialState, quizIsLoading: true };
    const expected = {
      ...state,
      quizError: action.error,
      quizQuestions: null,
      quizAnswers: null,
      quizIsLoading: false,
    };
    const actual = reducer(state, action);

    expect(actual).toEqual(expected);
  });

  test('reducer() responsds to ANSWER_QUESTION', () => {
    const action = { type: ANSWER_QUESTION, questionNumber: 1, answer: 'OK' };

    const state = {
      ...initialState,
      quizQuestions: mockQuestions,
      quizAnswers: new Array(mockQuestions.length),
    };
    const newAnswers = ['OK', undefined];

    const expected = { ...state, quizAnswers: newAnswers };
    const actual = reducer(state, action);

    expect(actual).toEqual(expected);
  });

  test('reducer() responsds to RESET_ANSWERS', () => {
    const action = { type: RESET_ANSWERS };

    const state = { ...initialState, quizQuestions: mockQuestions, quizAnswers: ['True', 'False'] };

    const expected = { ...state, quizAnswers: new Array(mockQuestions.length) };
    const actual = reducer(state, action);

    expect(actual).toEqual(expected);
  });

  test('reducer() default', () => {
    const action = { type: 'not a valid type' };
    const expected = initialState;
    const actual = reducer(initialState, action);
    expect(actual).toEqual(expected);
  });
});
