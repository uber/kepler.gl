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

import {DataRow} from './data-row';
import {rowsIterator, columnIterator} from './data-container-utils';

// Temp proxy for debugging
const rowDebugProxyHandler = {
  get(obj, prop) {
    if (!isNaN(parseInt(prop, 10))) {
      // return obj.valueAt(prop);
      throw Error(`DataContainer: trying to index row [${prop}] directly`);
    } else if (obj[prop] === undefined) {
      // eslint-disable-next-line no-debugger
      // throw Error(`DataContainer: ${prop} property doesn't exist on the data container`);
    }
    return obj[prop];
  }
};

// Shared row is used when caller doesn't save rows between calls
// @ts-ignore
const sharedRow = new DataRow(null, 0);
const _sharedRow = new Proxy(sharedRow, rowDebugProxyHandler);

export class RowDataContainer {
  constructor(data) {
    this._rows = data.rows;

    this._numColumns = data.fields?.length || data.rows[0].length;

    if (!this._numColumns) {
      throw Error(`DataContainer: No fields`);
    }
  }

  numRows() {
    return this._rows.length;
  }

  numColumns() {
    return this._numColumns;
  }

  valueAt(row, column) {
    // Looks like this is expected by some tests
    if (this._rows[row] === null) {
      // Error.stackTraceLimit = 20;
      // console.log('>>>>>>>>>>>>> bad row access', row, column);
      // console.trace('Null row', row, column);
      return null;
    }

    if (!this._rows[row]) {
      throw Error(`DataContainer: the row [${row}] doesn't exist`);
    }

    return this._rows[row][column];
  }

  row(rowIndex, safe = false) {
    if (safe) {
      _sharedRow.setSource(this, rowIndex); // note, shared row references dc
      return _sharedRow;
    }

    const tRow = new DataRow(this, rowIndex);
    const proxyRow = new Proxy(tRow, rowDebugProxyHandler);
    return proxyRow;
  }

  rowAsArray(rowIndex) {
    return this._rows[rowIndex];
  }

  rows(safe) {
    return rowsIterator(this, safe);
  }

  column(columnIndex) {
    return columnIterator(this, columnIndex);
  }

  map(func, safe = false, options = {}) {
    const {start = 0, end = this.numRows()} = options;

    // some functions now expect DataRow so use custom map implementation

    const numRows = Math.min(this.numRows(), end);
    const out = [];
    for (let rowIndex = start; rowIndex < numRows; ++rowIndex) {
      const row = this.row(rowIndex, safe);
      out.push(func(row, rowIndex));
    }
    _sharedRow.setSource(null, 0); // reset the referenced data container
    return out;

    /*
    const rowsIter = this.rows();
    const mapped = mapIterator(rowsIter, func);
    return Array.from(mapped);
    */
  }

  find(func, safe = false) {
    for (let rowIndex = 0; rowIndex < this._rows.length; ++rowIndex) {
      const row = this.row(rowIndex, safe);
      if (func(row, rowIndex)) {
        _sharedRow.setSource(null, 0);
        // make sure to return not shared row
        return safe ? this.row(rowIndex) : row;
      }
    }
    _sharedRow.setSource(null, 0);
    return false;
  }

  reduce(func, acc) {
    acc = acc || [];
    for (let i = 0; i < this._rows.length; ++i) {
      const row = this.row(i); // ! option to use shared row
      acc = func(acc, row, i);
    }
    return acc;
  }

  getPlainIndex(valid) {
    return this._rows.map((_, i) => i);
  }

  flattenData() {
    return this._rows;
  }
}
