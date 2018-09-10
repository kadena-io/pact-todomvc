import * as React from 'react';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';

import { Todos } from '../todos/todos';

const HomeComponent = () => {
  return (
    <div className="home">
      <Todos />
    </div>
  );
};

export const Home = withRouter(HomeComponent);
