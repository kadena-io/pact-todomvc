import * as React from 'react';
import { withRouter } from 'react-router-dom';

import { Todos } from '../todos/todos';

const HomeComponent = () => {
  return (
    <div className="home">
      <Todos />
    </div>
  );
};

export const Home = withRouter(HomeComponent);
