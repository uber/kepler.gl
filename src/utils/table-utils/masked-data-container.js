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

export function* rowsIterator(dataContainer, rowsIds, safe) {
  const numRows = rowsIds.length;
  for (let rowIndex = 0; rowIndex < numRows; ++rowIndex) {
    const mappedRowIndex = rowsIds[rowIndex];
    yield dataContainer.row(mappedRowIndex, safe);
  }
}

export class MaskedDataContainer {
  constructor(parentDataContainer, mask) {
    this._parentDataContainer = parentDataContainer;
    this._mask = mask;
  }

  numRows() {
    return this._mask.length;
  }

  numColumns() {
    return this._parentDataContainer.numColumns();
  }

  _mappedRowIndex(rowIndex) {
    return this._mask;
  }

  valueAt(rowIndex, columnIndex) {
    return this._parentDataContainer.valueAt(this._mappedRowIndex(rowIndex), columnIndex);
  }

  row(rowIndex, safe = false) {
    return this._parentDataContainer.row(this._mappedRowIndex(rowIndex), safe);
  }

  rowAsArray(rowIndex) {
    return this._parentDataContainer.rowAsArray(this._mappedRowIndex(rowIndex));
  }

  rows(safe) {
    return rowsIterator(this._parentDataContainer, this._mask, safe);
  }

  column(columnIndex) {
    throw Error('Not implemented');
  }

  map(func, safe = false, options = {}) {
    const {start = 0, end = this.numRows()} = options;

    const numRows = Math.min(this.numRows(), end);
    const out = [];
    for (let rowIndex = start; rowIndex < numRows; ++rowIndex) {
      const row = this.row(rowIndex, safe);
      out.push(func(row, rowIndex));
    }
    return out;
  }

  find(func, safe = false) {
    throw Error('Not implemented');
  }

  reduce(func, acc) {
    throw Error('Not implemented');
  }

  getPlainIndex(valid) {
    throw Error('Not implemented');
  }

  flattenData() {
    throw Error('Not implemented');
  }
}
