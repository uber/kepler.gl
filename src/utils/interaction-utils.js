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

import {
  DEFAULT_TOOLTIP_FIELDS,
  MAX_DEFAULT_TOOLTIPS,
  ALL_FIELD_TYPES,
  TRIP_POINT_FIELDS
} from 'constants/default-settings';
import {
  parseFieldValue,
  getFormatter,
  isNumber,
  defaultFormatter,
  notNullorUndefined
} from 'utils/data-utils';
import {Messages, Crosshairs, CursorClick, Pin} from 'components/common/icons/index';
import {TOOLTIP_FORMATS, TOOLTIP_KEY, COMPARE_TYPES} from 'constants/tooltip';

// \u2212 is the minus sign that d3-format uses for decimal number formatting
export const TOOLTIP_MINUS_SIGN = '\u2212';

/**
 * @type {typeof import('./interaction-utils').getDefaultInteraction}
 */
export function getDefaultInteraction() {
  return {
    tooltip: {
      id: 'tooltip',
      label: 'interactions.tooltip',
      enabled: true,
      iconComponent: Messages,
      config: {
        fieldsToShow: {},
        compareMode: false,
        compareType: COMPARE_TYPES.ABSOLUTE
      }
    },
    geocoder: {
      id: 'geocoder',
      label: 'interactions.geocoder',
      enabled: false,
      iconComponent: Pin,
      position: null
    },
    brush: {
      id: 'brush',
      label: 'interactions.brush',
      enabled: false,
      iconComponent: Crosshairs,
      config: {
        // size is in km
        size: 0.5
      }
    },
    coordinate: {
      id: 'coordinate',
      label: 'interactions.coordinate',
      enabled: false,
      iconComponent: CursorClick,
      position: null
    }
  };
}

export const BRUSH_CONFIG = {
  range: [0, 50]
};

/**
 * @type {typeof import('./interaction-utils').findFieldsToShow}
 */
export function findFieldsToShow({fields, id}) {
  // first find default tooltip fields for trips
  const fieldsToShow = DEFAULT_TOOLTIP_FIELDS.reduce((prev, curr) => {
    if (fields.find(({name}) => curr.name === name)) {
      prev.push(curr);
    }
    return prev;
  }, []);

  return {
    [id]: fieldsToShow.length ? fieldsToShow : autoFindTooltipFields(fields)
  };
}

function autoFindTooltipFields(fields) {
  const ptFields = _mergeFieldPairs(TRIP_POINT_FIELDS);
  // filter out the default fields that contains lat and lng and any geometry
  const fieldsToShow = fields.filter(
    ({name, type}) =>
      name
        .replace(/[_,.]+/g, ' ')
        .trim()
        .split(' ')
        .every(seg => !ptFields.includes(seg)) &&
      type !== ALL_FIELD_TYPES.geojson &&
      type !== 'object'
  );

  return fieldsToShow.slice(0, MAX_DEFAULT_TOOLTIPS).map(({name}) => {
    return {
      name,
      format: null
    };
  });
}

function _mergeFieldPairs(pairs) {
  return pairs.reduce((prev, pair) => [...prev, ...pair], []);
}

/**
 * @type {typeof import('./interaction-utils').getTooltipDisplayDeltaValue}
 */
export function getTooltipDisplayDeltaValue({
  primaryData,
  field,
  compareType,
  data,
  fieldIdx,
  item
}) {
  let displayDeltaValue = null;

  if (
    primaryData &&
    // comparison mode only works for numeric field
    (field.type === ALL_FIELD_TYPES.integer || field.type === ALL_FIELD_TYPES.real)
  ) {
    const baseDp = primaryData.valueAt(fieldIdx);
    const dp = data.valueAt(fieldIdx);
    if (isNumber(baseDp) && isNumber(dp)) {
      const deltaValue = compareType === COMPARE_TYPES.RELATIVE ? dp / baseDp - 1 : dp - baseDp;
      const deltaFormat =
        compareType === COMPARE_TYPES.RELATIVE
          ? TOOLTIP_FORMATS.DECIMAL_PERCENT_FULL_2[TOOLTIP_KEY]
          : item.format || TOOLTIP_FORMATS.DECIMAL_DECIMAL_FIXED_3[TOOLTIP_KEY];

      displayDeltaValue = getFormatter(deltaFormat)(deltaValue);

      // safely cast string
      displayDeltaValue = defaultFormatter(displayDeltaValue);
      const deltaFirstChar = displayDeltaValue.charAt(0);
      if (deltaFirstChar !== '+' && deltaFirstChar !== TOOLTIP_MINUS_SIGN) {
        displayDeltaValue = `+${displayDeltaValue}`;
      }
    } else {
      displayDeltaValue = TOOLTIP_MINUS_SIGN;
    }
  }

  return displayDeltaValue;
}

/**
 * @type {typeof import('./interaction-utils').getTooltipDisplayValue}
 */
export function getTooltipDisplayValue({item, field, data, fieldIdx}) {
  const dataValue = data.valueAt(fieldIdx);

  if (!notNullorUndefined(dataValue)) {
    return '';
  }

  return item.format
    ? getFormatter(item.format, field)(dataValue)
    : parseFieldValue(dataValue, field.type);
}
