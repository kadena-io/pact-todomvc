import 'regenerator-runtime/runtime';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Route } from 'react-router-dom';

import { createBrowserHistory } from 'history';
import { applyMiddleware, compose, createStore, combineReducers } from 'redux';
import { connectRouter, routerMiddleware, ConnectedRouter } from 'connected-react-router';

import { Switch } from 'react-router';

import { Provider } from 'react-redux';

import createSagaMiddleware from 'redux-saga';

import rootSaga from './sagas/index';
import todos from './sagas/todos';

import { Home } from './components/home/home';

import './index.scss';

const history = createBrowserHistory();

const rootReducer = combineReducers({ todos });

const sagaMiddleware = createSagaMiddleware();
const store = createStore(
  connectRouter(history)(rootReducer),
  {},
  compose(applyMiddleware(routerMiddleware(history), sagaMiddleware))
);

sagaMiddleware.run(rootSaga);

function render() {
  ReactDOM.render(
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <div className="index">
          <Route exact path="/" component={Home} />
        </div>
      </ConnectedRouter>
    </Provider>,
    document.getElementById('app')
  );
}

render();
store.subscribe(render);
