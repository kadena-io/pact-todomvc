import React from 'react';
import renderer from 'react-test-renderer';
import { shallow } from 'enzyme';

import { TodosComponent } from '../../../src/components/todos/todos';

const todo = {
  id: 1,
  entry: 'A Todo',
  state: 'active',
};

const todosProps = {
  todosIsLoading: false,
  todosError: null,
  todos: [todo],
  newTodo: '',
  editedTodo: null,
  fetchTodos: jest.fn(),
  saveNewTodo: jest.fn(),
  removeTodo: jest.fn(),
  updateTodo: jest.fn(),
  toggleState: jest.fn(),
  changeEntry: jest.fn(),
  updateNewTodoField: jest.fn(),
};

describe('Todos Component', () => {
  describe('Pass-thru Functions', () => {
    const component = shallow(<TodosComponent {...todosProps} />).instance();

    afterEach(() => {
      jest.clearAllMocks();
    });

    test('should render a todos list', () => {
      const snapshot = renderer.create(<TodosComponent {...todosProps} />);
      const tree = snapshot.toJSON();
      expect(tree).toMatchSnapshot();
    });

    test('should call fetchTodos() on componentDidMount()', () => {
      jest.spyOn(component, 'fetchTodos');
      component.componentDidMount();
      expect(component.fetchTodos).toHaveBeenCalled();
    });

    test('should call props.fetchTodos() on this.fetchTodos()', () => {
      component.fetchTodos();
      expect(todosProps.fetchTodos).toHaveBeenCalled();
    });

    test('should call props.saveNewTodo() on this.saveNewTodo()', () => {
      component.saveNewTodo(todo.entry);
      expect(todosProps.saveNewTodo).toHaveBeenCalledWith(todo.entry);
    });

    test('should call props.removeTodo() on this.onRemoveTodo()', () => {
      component.onRemoveTodo(todo.id);
      expect(todosProps.removeTodo).toHaveBeenCalledWith(todo.id);
    });

    test('should call props.updateTodo() on this.onUpdateTodo()', () => {
      component.onUpdateTodo(todo);
      expect(todosProps.updateTodo).toHaveBeenCalledWith(todo);
    });

    test('should call props.toggleState() on this.onToggleState()', () => {
      component.onToggleState(todo.id, todo.state);
      expect(todosProps.toggleState).toHaveBeenCalledWith(todo.id, todo.state);
    });

    test('should call props.changeEntry() on this.onChangeEntry()', () => {
      component.onChangeEntry(todo.id, todo.entry);
      expect(todosProps.changeEntry).toHaveBeenCalledWith(todo.id, todo.entry);
    });
  });

  describe('Render', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    test('should render a <TodosComponent/>', () => {
      const component = renderer.create(<TodosComponent {...todosProps} />);
      const tree = component.toJSON();
      expect(tree).toMatchSnapshot();
    });

    test('should render an <h1>Todos</div> and a root element with classname "todos"', () => {
      const component = shallow(<TodosComponent {...todosProps} />);
      expect(component.find('h1').text()).toEqual('Todos');
      expect(component.find('div .show-completed').exists()).toBeTruthy();
      expect(component.find('div .todos-list').exists()).toBeTruthy();
    });

    test('should render a <Loader /> if todoIsLoading = true', () => {
      const component = shallow(<TodosComponent {...todosProps} todosIsLoading={true} />);
      expect(component.find('.loading').exists()).toBeTruthy();
    });

    test('should render a <div className="error" /> if todoError !== null', () => {
      const component = shallow(
        <TodosComponent {...todosProps} todosError="Error loading todos" />
      );
      expect(component.find('.error').exists()).toBeTruthy();
    });
  });
});
