import React from 'react';
import renderer from 'react-test-renderer';
import { shallow } from 'enzyme';

import { TodosComponent } from '../../../src/components/todos/todos';
import { NewTodo } from '../../../src/components/todos/new-todo';
import { Todo } from '../../../src/components/todos/todo';

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
    describe('Top Level', () => {
      test('should render an <h1>Todos</div> and a root element with classname "todos"', () => {
        const component = shallow(<TodosComponent {...todosProps} />);
        expect(component.find('h1').text()).toEqual('Todos');
        expect(component.find('div .todos-list').exists()).toBeTruthy();
        expect(component.find(NewTodo).exists()).toBeTruthy();
        expect(component.find(Todo).exists()).toBeTruthy();
      });

      test('should render a <div className="error" /> if todoError !== null', () => {
        const component = shallow(
          <TodosComponent {...todosProps} todosError="Error loading todos" />
        );
        expect(component.find('.error').exists()).toBeTruthy();
      });
    });

    describe('Child Handlers', () => {
      const component = shallow(<TodosComponent {...todosProps} />);
      const instance = component.instance();
      const todo = component.find(Todo);

      test('NewTodo.saveNewTodo should call saveNewTodo()', () => {
        const newTodo = component.find(NewTodo);
        expect(newTodo.prop('saveNewTodo')).toEqual(instance.saveNewTodo);
      });

      test('Todo.onRemove should call onRemoveTodo()', () => {
        expect(todo.prop('onRemove')).toEqual(instance.onRemoveTodo);
      });

      test('Todo.onChangeEntry should call onChangeEntry()', () => {
        expect(todo.prop('onChangeEntry')).toEqual(instance.onChangeEntry);
      });

      test('Todo.onUpdate should call onUpdateTodo()', () => {
        expect(todo.prop('onUpdate')).toEqual(instance.onUpdateTodo);
      });

      test('Todo.onToggleState should call onToggleState()', () => {
        expect(todo.prop('onToggleState')).toEqual(instance.onToggleState);
      });
    });
  });
});
