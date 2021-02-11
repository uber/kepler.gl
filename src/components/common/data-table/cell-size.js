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

import document from 'global/document';
import {parseFieldValue} from 'utils/data-utils';

const MIN_GHOST_CELL_SIZE = 200;

/**
 * Measure rows and column content to determine min width for each column
 * @param {*} param0
 */
export function renderedSize({
  text: {dataContainer, column},
  type = 'string',
  colIdx,
  numRowsToCalculate = 10,
  fontSize = 12,
  font = 'Lato',
  cellPadding = 40,
  maxCellSize = 400,
  maxHeaderSize = 150,
  minCellSize = 45,
  optionsButton = 30
}) {
  if (!document) {
    return {
      row: 0,
      header: 0
    };
  }
  const textCanvas = document.createElement('canvas');
  document.body.appendChild(textCanvas);
  const context = textCanvas.getContext('2d');
  context.font = [fontSize, font].join('px ');

  let rowsToSample = [...Array(numRowsToCalculate)].map(() =>
    Math.floor(Math.random() * (dataContainer.numRows() - 1))
  );

  // IF we have less than 10 rows, lets measure all of them
  if (dataContainer.numRows() <= numRowsToCalculate) {
    rowsToSample = Array.from(Array(dataContainer.numRows()).keys());
  }
  const rowWidth = Math.max(
    ...rowsToSample.map(
      rowIdx =>
        Math.ceil(
          context.measureText(parseFieldValue(dataContainer.valueAt(rowIdx, colIdx), type)).width
        ) + cellPadding
    )
  );
  // header cell only has left padding
  const headerWidth =
    Math.ceil(context.measureText(column).width) + cellPadding / 2 + optionsButton;

  const minRowWidth = minCellSize + cellPadding;
  const minHeaderWidth = minCellSize + cellPadding / 2 + optionsButton;

  const clampedRowWidth = clamp(minRowWidth, maxCellSize, rowWidth);
  const clampedHeaderWidth = clamp(minHeaderWidth, maxHeaderSize, headerWidth);

  // cleanup
  textCanvas.parentElement.removeChild(textCanvas);

  return {
    row: clampedRowWidth,
    header: clampedHeaderWidth
  };
}

function clamp(min, max, value) {
  return Math.max(Math.min(max, value), min);
}

function getColumnOrder(pinnedColumns = [], unpinnedColumns = []) {
  return [...pinnedColumns, ...unpinnedColumns];
}

function getMinCellSize(cellSizeCache) {
  return Object.keys(cellSizeCache).reduce(
    (accu, col) => ({
      ...accu,
      [col]: cellSizeCache[col].row
    }),
    {}
  );
}

function getSizeSum(sizeCache, key) {
  return Object.keys(sizeCache).reduce(
    (acc, val) => acc + (key ? sizeCache[val][key] : sizeCache[val]),
    0
  );
}

/**
 * Expand cell to fit both row and header, if there is still room left,
 * expand last cell to fit the entire width of the container
 * @param {object} cellSizeCache
 * @param {string[]} columnOrder
 * @param {number} containerWidth
 * @param {number} roomToFill
 */
function expandCellSize(cellSizeCache, columnOrder, containerWidth, roomToFill) {
  let remaining = roomToFill;

  const expandedCellSize = columnOrder.reduce((accu, col) => {
    let size = cellSizeCache[col].row;
    if (cellSizeCache[col].row < cellSizeCache[col].header && remaining > 0) {
      // if we are cutting off the header, expand to fit it
      size =
        cellSizeCache[col].header - cellSizeCache[col].row < remaining
          ? cellSizeCache[col].header
          : cellSizeCache[col].row + remaining;
      remaining -= size - cellSizeCache[col].row;
    }

    return {
      ...accu,
      [col]: size
    };
  }, {});

  let ghost = null;
  if (remaining > 0 && remaining < MIN_GHOST_CELL_SIZE) {
    // expand last cell
    const lastCell = columnOrder[columnOrder.length - 1];
    expandedCellSize[lastCell] += remaining;
  } else if (remaining >= MIN_GHOST_CELL_SIZE) {
    // if too much left add a ghost cell
    ghost = remaining;
  }

  return {
    cellSizeCache: expandedCellSize,
    ghost
  };
}

/**
 * Adjust cell size based on container width
 * @param {number} containerWidth
 * @param {Object} cellSizeCache
 * @param {string[]} pinnedColumns
 * @param {string[]} unpinnedColumns
 */
export function adjustCellsToContainer(
  containerWidth,
  cellSizeCache,
  pinnedColumns,
  unpinnedColumns
) {
  const minRowSum = getSizeSum(cellSizeCache, 'row');
  if (minRowSum >= containerWidth) {
    // we apply the min Width to all cells
    return {cellSizeCache: getMinCellSize(cellSizeCache)};
  }

  // if we have some room to expand
  const columnOrder = getColumnOrder(pinnedColumns, unpinnedColumns);
  return expandCellSize(cellSizeCache, columnOrder, containerWidth, containerWidth - minRowSum);
}
