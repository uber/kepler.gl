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

import moment from 'moment';
import assert from 'assert';
import {ALL_FIELD_TYPES} from 'constants/default-settings';
import {TOOLTIP_FORMATS, TOOLTIP_FORMAT_TYPES, TOOLTIP_KEY} from 'constants/tooltip';
import {format as d3Format} from 'd3-format';
import {bisectLeft} from 'd3-array';

const MAX_LATITUDE = 90;
const MIN_LATITUDE = -90;
const MAX_LONGITUDE = 180;
const MIN_LONGITUDE = -180;

/**
 * simple getting unique values of an array
 *
 * @param {array} values
 * @returns {array} unique values
 */
export function unique(values) {
  const results = [];
  values.forEach(v => {
    if (!results.includes(v) && notNullorUndefined(v)) {
      results.push(v);
    }
  });

  return results;
}

/* eslint-disable max-statements */
/**
 * return center of map from given points
 * @param {array} layers
 * @returns {object} coordinates of map center, empty if not found
 */
export function findMapBounds(layers) {
  // find bounds in formatted layerData
  // take ALL layers into account when finding map bounds
  const availableLayerBounds = layers.reduce((res, l) => {
    if (l.meta && l.meta.bounds) {
      res.push(l.meta.bounds);
    }
    return res;
  }, []);
  // return null if no layer is available
  if (availableLayerBounds.length === 0) {
    return null;
  }
  // merge bounds in each layer
  const newBounds = availableLayerBounds.reduce(
    (res, b) => {
      return [
        Math.min(res[0], b[0]),
        Math.min(res[1], b[1]),
        Math.max(res[2], b[2]),
        Math.max(res[3], b[3])
      ];
    },
    [MAX_LONGITUDE, MAX_LATITUDE, MIN_LONGITUDE, MIN_LATITUDE]
  );
  return newBounds;
}
/* eslint-enable max-statements */

export function getLatLngBounds(points, idx, limit) {
  const lats = points
    .map(d => {
      // TODO check for DataRow
      if (d.valueAt && d.valueAt(idx)) {
        return d.valueAt(idx);
      }

      // TODO because of different accessors we are still getting arrays as input
      return Array.isArray(d) && d[idx];
    })
    .filter(Number.isFinite)
    .sort(numberSort);

  if (!lats.length) {
    return null;
  }

  // clamp to limit
  return [Math.max(lats[0], limit[0]), Math.min(lats[lats.length - 1], limit[1])];
}

export function clamp([min, max], val) {
  return val <= min ? min : val >= max ? max : val;
}

export function getSampleData(dataContainer, sampleSize = 500, getValue = d => d) {
  const numberOfRows = dataContainer.numRows();
  const sampleStep = Math.max(Math.floor(numberOfRows / sampleSize), 1);
  const output = [];
  for (let i = 0; i < numberOfRows; i += sampleStep) {
    output.push(getValue(dataContainer.row(i)));
  }

  return output;
}

export function getSampleDataArray(data, sampleSize = 500, getValue = d => d) {
  const sampleStep = Math.max(Math.floor(data.length / sampleSize), 1);
  const output = [];
  for (let i = 0; i < data.length; i += sampleStep) {
    output.push(getValue(data[i]));
  }

  return output;
}

/**
 * Convert different time format to unix milliseconds
 * @type {typeof import('./data-utils').timeToUnixMilli}
 */
export function timeToUnixMilli(value, format) {
  if (notNullorUndefined(value)) {
    return typeof value === 'string'
      ? moment.utc(value, format).valueOf()
      : format === 'x'
      ? value * 1000
      : value;
  }
  return null;
}

/**
 *
 * @type {typeof import('./data-utils').maybeToDate}
 */
export function maybeToDate(isTime, fieldIdx, format, d) {
  if (isTime) {
    return timeToUnixMilli(d.valueAt(fieldIdx), format);
  }

  return d.valueAt(fieldIdx);
}

/**
 * whether null or undefined
 * @type {typeof import('./data-utils').notNullorUndefined}
 */
export function notNullorUndefined(d) {
  return d !== undefined && d !== null;
}

/**
 * Whether d is a number, this filtered out NaN as well
 * @type {typeof import('./data-utils').notNullorUndefined}
 */
export function isNumber(d) {
  return Number.isFinite(d);
}
/**
 * whether null or undefined
 */
export function isPlainObject(obj) {
  return obj === Object(obj) && typeof obj !== 'function' && !Array.isArray(obj);
}

/**
 * @type {typeof import('./data-utils').numberSort}
 */
export function numberSort(a, b) {
  return a - b;
}

/**
 * @type {typeof import('./data-utils').getSortingFunction}
 */
export function getSortingFunction(fieldType) {
  switch (fieldType) {
    case ALL_FIELD_TYPES.real:
    case ALL_FIELD_TYPES.integer:
    case ALL_FIELD_TYPES.timestamp:
      return numberSort;
    default:
      return undefined;
  }
}

/**
 * round number with exact number of decimals
 * return as a string
 * @type {typeof import('./data-utils').preciseRound}
 */
export function preciseRound(num, decimals) {
  const t = Math.pow(10, decimals);
  return (
    Math.round(
      num * t + (decimals > 0 ? 1 : 0) * (Math.sign(num) * (10 / Math.pow(100, decimals)))
    ) / t
  ).toFixed(decimals);
}

/**
 * get number of decimals to round to for slider from step
 * @param {number} step
 * @returns {number} - number of decimal
 */
export function getRoundingDecimalFromStep(step) {
  if (isNaN(step)) {
    assert('step is not a number');
    assert(step);
  }

  const splitZero = step.toString().split('.');
  if (splitZero.length === 1) {
    return 0;
  }
  return splitZero[1].length;
}

/**
 * Use in slider, given a number and an array of numbers, return the nears number from the array
 * @type {typeof import('./data-utils').snapToMarks}
 * @param value
 * @param marks
 */
export function snapToMarks(value, marks) {
  // always use bin x0
  const i = bisectLeft(marks, value);
  if (i === 0) {
    return marks[i];
  } else if (i === marks.length) {
    return marks[i - 1];
  }
  const idx = marks[i] - value < value - marks[i - 1] ? i : i - 1;
  return marks[idx];
}

/**
 * If marks is provided, snap to marks, if not normalize to step
 * @type {typeof import('./data-utils').normalizeSliderValue}
 * @param val
 * @param minValue
 * @param step
 * @param marks
 */
export function normalizeSliderValue(val, minValue, step, marks) {
  if (marks && marks.length) {
    return snapToMarks(val, marks);
  }

  return roundValToStep(minValue, step, val);
}

/**
 * round the value to step for the slider
 * @type {typeof import('./data-utils').roundValToStep}
 * @param minValue
 * @param step
 * @param val
 * @returns - rounded number
 */
export function roundValToStep(minValue, step, val) {
  if (!isNumber(step) || !isNumber(minValue)) {
    return val;
  }

  const decimal = getRoundingDecimalFromStep(step);
  const steps = Math.floor((val - minValue) / step);
  let remain = val - (steps * step + minValue);

  // has to round because javascript turns 0.1 into 0.9999999999999987
  remain = Number(preciseRound(remain, 8));

  let closest;
  if (remain === 0) {
    closest = val;
  } else if (remain < step / 2) {
    closest = steps * step + minValue;
  } else {
    closest = (steps + 1) * step + minValue;
  }

  // precise round return a string rounded to the defined decimal
  const rounded = preciseRound(closest, decimal);

  return Number(rounded);
}

/**
 * Get the value format based on field and format options
 * Used in render tooltip value
 * @type {typeof import('./data-utils').defaultFormatter}
 */
export const defaultFormatter = v => (notNullorUndefined(v) ? String(v) : '');

export const FIELD_DISPLAY_FORMAT = {
  [ALL_FIELD_TYPES.string]: defaultFormatter,
  [ALL_FIELD_TYPES.timestamp]: defaultFormatter,
  [ALL_FIELD_TYPES.integer]: defaultFormatter,
  [ALL_FIELD_TYPES.real]: defaultFormatter,
  [ALL_FIELD_TYPES.boolean]: defaultFormatter,
  [ALL_FIELD_TYPES.date]: defaultFormatter,
  [ALL_FIELD_TYPES.geojson]: d =>
    typeof d === 'string'
      ? d
      : isPlainObject(d)
      ? JSON.stringify(d)
      : Array.isArray(d)
      ? `[${String(d)}]`
      : ''
};

/**
 * Parse field value and type and return a string representation
 * @type {typeof import('./data-utils').parseFieldValue}
 */
export const parseFieldValue = (value, type) => {
  if (!notNullorUndefined(value)) {
    return '';
  }

  return FIELD_DISPLAY_FORMAT[type] ? FIELD_DISPLAY_FORMAT[type](value) : String(value);
};

const arrayMoveMutate = (array, from, to) => {
  array.splice(to < 0 ? array.length + to : to, 0, array.splice(from, 1)[0]);
};

/**
 *
 * @param {*} array
 * @param {*} from
 * @param {*} to
 */
export const arrayMove = (array, from, to) => {
  array = array.slice();
  arrayMoveMutate(array, from, to);
  return array;
};

/**
 * Get the value format based on field and format options
 * Used in render tooltip value
 * @type {typeof import('./data-utils').getFormatter}
 * @param format
 * @param field
 */
export function getFormatter(format, field) {
  if (!format) {
    return defaultFormatter;
  }
  const tooltipFormat = Object.values(TOOLTIP_FORMATS).find(f => f[TOOLTIP_KEY] === format);

  if (tooltipFormat) {
    return applyDefaultFormat(tooltipFormat);
  } else if (typeof format === 'string' && field) {
    return applyCustomFormat(format, field);
  }

  return defaultFormatter;
}

export function applyDefaultFormat(tooltipFormat) {
  if (!tooltipFormat || !tooltipFormat.format) {
    return defaultFormatter;
  }

  switch (tooltipFormat.type) {
    case TOOLTIP_FORMAT_TYPES.DECIMAL:
      return d3Format(tooltipFormat.format);
    case TOOLTIP_FORMAT_TYPES.DATE:
    case TOOLTIP_FORMAT_TYPES.DATE_TIME:
      return v => moment.utc(v).format(tooltipFormat.format);
    case TOOLTIP_FORMAT_TYPES.PERCENTAGE:
      return v => `${d3Format(TOOLTIP_FORMATS.DECIMAL_DECIMAL_FIXED_2.format)(v)}%`;
    case TOOLTIP_FORMAT_TYPES.BOOLEAN:
      return getBooleanFormatter(tooltipFormat.format);
    default:
      return defaultFormatter;
  }
}

export function getBooleanFormatter(format) {
  switch (format) {
    case '01':
      return v => (v ? '1' : '0');
    case 'yn':
      return v => (v ? 'yes' : 'no');
    default:
      return defaultFormatter;
  }
}
// Allow user to specify custom tooltip format via config
export function applyCustomFormat(format, field) {
  switch (field.type) {
    case ALL_FIELD_TYPES.real:
    case ALL_FIELD_TYPES.integer:
      return d3Format(format);
    case ALL_FIELD_TYPES.date:
    case ALL_FIELD_TYPES.timestamp:
      return v => moment.utc(v).format(format);
    default:
      return v => v;
  }
}
