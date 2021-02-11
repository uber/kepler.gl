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

export class DataRow {
  constructor(dataContainer, rowIndex) {
    this._dataContainer = dataContainer;
    this._rowIndex = rowIndex;
  }

  valueAt(columnIndex) {
    return this._dataContainer.valueAt(this._rowIndex, columnIndex);
  }

  values() {
    return this._dataContainer.rowAsArray(this._rowIndex);
  }

  setSource(dataContainer, rowIndex) {
    this._dataContainer = dataContainer;
    this._rowIndex = rowIndex;
  }

  map(handler) {
    const numColumns = this._dataContainer.numColumns();
    const out = [];
    for (let column = 0; column < numColumns; ++column) {
      out[column] = handler(this.valueAt(column), column);
    }
    return out;
  }
}
