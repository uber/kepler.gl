// Copyright (c) 2021 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import {RowDataContainer} from './row-data-container';
import {MaskedDataContainer} from './masked-data-container';

const DataForm = {
  ROWS: 1,
  COLUMNS: 2
};

const defaultOptions = {
  inputDataForm: undefined,
  useSourceData: true,
  fields: undefined,
  outputDataForm: DataForm.ROWS
};

const dataContainerDebugProxyHandler = {
  get(target, prop, receiver) {
    if (!isNaN(parseInt(prop, 10))) {
      throw Error(`DataContainer: trying to index data conttainer [${prop}] directly`);
    } else if (!target[prop] === undefined) {
      throw Error(`DataContainer: ${prop} property doesn't exist on the data container`);
    }
    return Reflect.get(target, prop, receiver);
  }
};

/** @type {typeof import('./data-container-utils').createDataContainer} */
export function createDataContainer(data, options = {}) {
  options = {...defaultOptions, ...options};

  if (!data) {
    throw Error('Failed to create a data container');
  }

  const dataContainer = new RowDataContainer({rows: data, fields: options.fields || []});

  return new Proxy(dataContainer, dataContainerDebugProxyHandler);
}

/** @type {typeof import('./data-container-utils').createMaskedDataContainer} */
export function createMaskedDataContainer(data, mask) {
  // @ts-ignore
  return new MaskedDataContainer(data, mask);
}

/** @type {typeof import('./data-container-utils').rowsIterator} */
export function* rowsIterator(dataContainer, safe) {
  const numRows = dataContainer.numRows();
  for (let rowIndex = 0; rowIndex < numRows; ++rowIndex) {
    yield dataContainer.row(rowIndex, safe);
  }
}

/** @type {typeof import('./data-container-utils').columnIterator} */
export function* columnIterator(dataContainer, columnIndex) {
  const numRows = dataContainer.numRows();
  for (let rowIndex = 0; rowIndex < numRows; ++rowIndex) {
    yield dataContainer.valueAt(rowIndex, columnIndex);
  }
}

/** @type {typeof import('./data-container-utils').mapIterator} */
export function* mapIterator(iterator, mapping) {
  let index = 0;
  for (const i of iterator) {
    yield mapping(i, index);
    index++;
  }
}
