import React from 'react';
import renderer from 'react-test-renderer';
import { shallow } from 'enzyme';

import { NewTodo } from '../../../src/components/todos/new-todo';

const newTodoProps = {
  onChangeNewEntry: jest.fn(),
  onChangeNewDate: jest.fn(),
  saveNewTodo: jest.fn(),
  newDate: new Date().toISOString().slice(0, 10),
  newEntry: '',
};

describe('New Todo Component', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should render a new todo', () => {
    const component = renderer.create(<NewTodo {...newTodoProps} />);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('should only call saveNewTodo() on text field if keyDown keyCode is 13', () => {
    const component = shallow(<NewTodo {...newTodoProps} />);
    const input = component.find('.entry input');
    input.value = 'Something Else';

    input.simulate('keyDown', { keyCode: 1, currentTarget: input });
    expect(newTodoProps.saveNewTodo).not.toHaveBeenCalled();
    expect(input.value).toEqual(input.value);

    input.simulate('keyDown', { keyCode: 13, currentTarget: input });
    expect(newTodoProps.saveNewTodo).toHaveBeenCalled();
    expect(input.value).toEqual('');
  });

  test('should call onChangeNewEntry on change', () => {
    const component = shallow(<NewTodo {...newTodoProps} />);
    const input = component.find('.entry input');
    input.simulate('change', { currentTarget: { value: 'Something' } });
    expect(newTodoProps.onChangeNewEntry).toHaveBeenCalledWith('Something');
  });

  test('should call onChangeNewDate on change', () => {
    const component = shallow(<NewTodo {...newTodoProps} />);
    const input = component.find('.date input');
    input.simulate('change', { currentTarget: { value: '2018-10-10' } });
    expect(newTodoProps.onChangeNewDate).toHaveBeenCalledWith('2018-10-10');
  });
});
