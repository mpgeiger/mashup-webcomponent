/**
 * @jest-environment jsdom
 */
import {
  setObjectFromRef,
  getValue,
  clearProps,
  getNewRowProps,
  addRowToPageList,
  deleteRowFromPageList,
  shouldRefresh,
  getFormData,
} from '../src/utils/form-utils';

describe('testing the getValue API', () => {
  test('it should return the correct obj for key1.key2.key3', () => {
    const input = { key1: { key2: { key3: 'test' } } };
    expect(getValue(input, 'key1.key2.key3')).toEqual('test');
  });
  test('it should return null for invalid input', () => {
    expect(getValue({}, 'key1')).toBeNull();
  });
  test('it should return null for invalid input', () => {
    expect(getValue({}, {})).toBeNull();
  });
  test('it should return null for incorrect match', () => {
    expect(getValue({ test: [{ key1: 'test' }] }, 'key1')).toBeNull();
  });
  test('it should return null for incorrect match', () => {
    expect(getValue({ test: { key1: 'test' } }, 'test(1).foo')).toBeNull();
  });
});

describe('testing the setObjectFromRef API', () => {
  test('it should populate the correct object', () => {
    const input = {};
    setObjectFromRef(input, 'props(3).key1', 'foo2');
    setObjectFromRef(input, 'props(1).key1', 'foo');
    setObjectFromRef(input, 'props(2).key1', 'foo1');
    setObjectFromRef(input, 'props(3).key2', 'foo3');
    const output = {
      props: [{ key1: 'foo' }, { key1: 'foo1' }, { key1: 'foo2', key2: 'foo3' }],
    };
    expect(input).toEqual(output);
  });
  test('it should be in sync with getValue', () => {
    const input = {};
    const path = 'props(3).types(5).test.foo(3).tt';
    setObjectFromRef(input, path, 'foo2');
    expect(getValue(input, path)).toEqual('foo2');
  });
  test('it should handle invalid parameters', () => {
    const input = {};
    setObjectFromRef(input, ['test'], 'foo2');
    expect(input).toEqual({});
  });
});

describe('testing the clearProps API', () => {
  test('it should clear the values', () => {
    const input = { key1: { key2: { key3: 'test' }, key4: 'eee' }, key5: 'ddd' };
    const output = { key1: { key2: { key3: '' }, key4: '' }, key5: '' };
    const content = [];
    clearProps(input);
    expect(input).toEqual(output);
  });
});

describe('testing the getNewRowProps API', () => {
  test('it should get all the properties with fieldID', () => {
    const input = { key1: [{ key2: { fieldID: 'test' }, key4: 'eee' }], fieldID: 'foo', key5: 'ddd' };
    const content = [];
    const output = ['test', 'foo'];
    getNewRowProps(input, content);
    expect(content).toEqual(output);
  });
});

describe('testing the addRowToPageList API', () => {
  test('it should add a row to the page with empty values', () => {
    const input = { key1: { key2: [{ key3: 'test' }, { key4: 'eee' }] }, key5: 'ddd' };
    const output = { key1: { key2: [{ key3: 'test' }, { key4: 'eee' }, { key3: '' }] }, key5: 'ddd' };
    addRowToPageList(input, 'key1.key2');
    expect(input).toEqual(output);
  });
  test('it should add a row to the page with row properties', () => {
    const input = { key1: { key2: [{ key3: 'test' }, { key4: 'eee' }] }, key5: 'ddd' };
    const output = { key1: { key2: [{ key3: 'test' }, { key4: 'eee' }, { foo: '', bar: '' }] }, key5: 'ddd' };
    addRowToPageList(input, 'key1.key2', 'foo,bar');
    expect(input).toEqual(output);
  });
  test('it should add a row to the page with row properties even when content is empty', () => {
    const input = {};
    const output = { key1: { key2: [{ foo: '', bar: '' }] } };
    addRowToPageList(input, 'key1.key2', 'foo,bar');
    expect(input).toEqual(output);
  });
});

describe('testing the deleteRowFromPageList API', () => {
  test('it should delete the last row from the pagelist', () => {
    const input = { key1: { key2: [{ key3: 'test' }, { key4: 'eee' }] }, key5: 'ddd' };
    const output = { key1: { key2: [{ key3: 'test' }] }, key5: 'ddd' };
    deleteRowFromPageList(input, 'key1.key2');
    expect(input).toEqual(output);
  });
  test('it should delete the row from the pagelist specified by the path', () => {
    const input = { key1: { key2: [{ key3: 'test' }, { key4: 'eee' }] }, key5: 'ddd' };
    const output = { key1: { key2: [{ key4: 'eee' }] }, key5: 'ddd' };
    deleteRowFromPageList(input, 'key1.key2(1).pyTemplateButton');
    expect(input).toEqual(output);
  });
  test('it should do nothing if the pagelist has only one row', () => {
    const input = { key1: { key2: [{ key3: 'test' }] }, key5: 'ddd' };
    const output = Object.assign({}, input);
    deleteRowFromPageList(input, 'key1.key2');
    expect(input).toEqual(output);
  });
});

describe('testing the shouldRefresh API', () => {
  test('it should return true if data-action-click value is set', () => {
    const input = document.createElement('button');
    input.setAttribute('data-action-click', 'postValue');
    const output = shouldRefresh(input, 'click');
    expect(output).toBeTruthy();
  });
  test('it should return true if data-action-click value is set', () => {
    const input = document.createElement('button');
    input.setAttribute('data-action-change', 'refresh');
    const output = shouldRefresh(input, 'change');
    expect(output).toBeTruthy();
  });
  test('it should return true if data-action-click value is set', () => {
    const input = document.createElement('button');
    input.setAttribute('data-action-change', 'postValue');
    const output = shouldRefresh(input, 'click');
    expect(output).toBeFalsy();
  });
});

describe('testing the getFormData API', () => {
  test('it should return all the input elements on the form', () => {
    const form = { elements: [] };
    const input = document.createElement('input');
    form.elements.push(input);
    input.setAttribute('data-ref', 'key1.key2.test');
    input.value = 'foo';
    const output = { key1: { key2: { test: 'foo' } } };
    const content = {};
    getFormData(form, content);
    expect(content).toEqual(output);
  });
  test('it should not return non form elements', () => {
    const form = { elements: [] };
    const input = document.createElement('button');
    input.setAttribute('data-ref', 'key1.key2.test');
    input.value = 'foo';
    form.elements.push(input);
    const output = {};
    const content = {};
    getFormData(form, content);
    expect(content).toEqual(output);
  });
  test('it should correctly handle checkbox', () => {
    const form = { elements: [] };
    const input = document.createElement('input');
    input.setAttribute('data-ref', 'key1.key2(1).test');
    input.type = 'checkbox';
    input.checked = true;
    form.elements.push(input);
    const output = { key1: { key2: [{ test: true }] } };
    const content = {};
    getFormData(form, content);
    expect(content).toEqual(output);
  });
  test('it should return all the input elements on the form', () => {
    const form = { elements: [] };
    const input = document.createElement('textarea');
    input.setAttribute('data-ref', 'key1.key2.test');
    input.value = 'foo';
    form.elements.push(input);
    const input1 = document.createElement('select');
    input1.setAttribute('data-ref', 'key1.key2.test1');
    var option = document.createElement('option');
    option.text = 'foo1';
    input1.add(option);
    input1.value = 'foo1';
    form.elements.push(input1);
    const output = { key1: { key2: { test: 'foo', test1: 'foo1' } } };
    const content = {};
    getFormData(form, content);
    expect(content).toEqual(output);
  });
  test('it should correctly handle a radiobutton', () => {
    const form = { elements: [] };
    const input = document.createElement('input');
    input.setAttribute('type', 'radio');
    input.setAttribute('data-ref', 'key1.key2.test');
    input.value = 'foo';
    input.checked = true;
    form.elements.push(input);
    const input1 = document.createElement('input');
    input1.setAttribute('type', 'radio');
    input1.setAttribute('data-ref', 'key1.key2.test1');
    input1.value = 'foo1';
    form.elements.push(input1);
    const output = { key1: { key2: { test: 'foo' } } };
    const content = {};
    getFormData(form, content);
    expect(content).toEqual(output);
  });
  test('it should correctly handle a data', () => {
    const form = { elements: [] };
    const input = document.createElement('input');
    input.setAttribute('type', 'date');
    input.setAttribute('data-ref', 'key1.key2.test');
    input.valueAsDate = new Date('2019/2/1');
    form.elements.push(input);
    const output = { key1: { key2: { test: '02/01/2019' } } };
    const content = {};
    getFormData(form, content);
    expect(content).toEqual(output);
  });
});
