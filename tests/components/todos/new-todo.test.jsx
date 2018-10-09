import React from 'react';
import renderer from 'react-test-renderer';
import { shallow } from 'enzyme';

import { NewTodo } from '../../../src/components/todos/new-todo';

const newTodoProps = { saveNewTodo: jest.fn() };

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

  test('should handle entry and date on change', () => {
    const component = shallow(<NewTodo {...newTodoProps} />);
    const entryInput = component.find('.entry input');
    const dateInput = component.find('.date input');
    entryInput.simulate('change', {
      preventDefault() {},
      currentTarget: {
        value: 'Something',
      },
    });
    dateInput.simulate('change', { preventDefault() {}, currentTarget: { value: '2019-10-20' } });
    entryInput.simulate('change', { preventDefault() {}, currentTarget: { value: 'Something' } });
    entryInput.simulate('keyDown', { keyCode: 13, currentTarget: entryInput });
    expect(newTodoProps.saveNewTodo).toHaveBeenCalledWith('Something', '2019-10-20');
  });

  test('should assign current date as due date if due date is not selected', () => {
    const component = shallow(<NewTodo {...newTodoProps} />);
    const entryInput = component.find('.entry input');

    entryInput.simulate('change', {
      preventDefault() {},
      currentTarget: { value: 'Something Else' },
    });
    entryInput.simulate('keyDown', { keyCode: 13, currentTarget: entryInput });
    expect(newTodoProps.saveNewTodo).toHaveBeenCalledWith(
      'Something Else',
      new Date().toISOString().slice(0, 10)
    );
  });
});
