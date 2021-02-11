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

import test from 'tape';
import moment from 'moment';

import {
  adjustValueToFilterDomain,
  getFilterFunction,
  getDefaultFilter,
  validatePolygonFilter,
  generatePolygonFilter,
  isValidFilterValue,
  isInPolygon,
  diffFilters,
  getHistogram,
  getTimestampFieldDomain
} from 'utils/filter-utils';

import {getDatasetFieldIndexForFilter} from 'utils/gpu-filter-utils';

import {FILTER_TYPES} from 'constants/default-settings';
import {mockPolygonFeature, mockPolygonData} from '../../fixtures/polygon';

import {createDataContainer} from 'utils/table-utils';

/* eslint-disable max-statements */
test('filterUtils -> adjustValueToFilterDomain', t => {
  // TODO: needs id
  const rangeFilter = getDefaultFilter();
  rangeFilter.type = FILTER_TYPES.range;
  rangeFilter.domain = [0, 1];

  t.deepEqual(
    adjustValueToFilterDomain([0, 0.5], rangeFilter),
    [0, 0.5],
    'should return value matched to range filter'
  );

  t.deepEqual(
    adjustValueToFilterDomain([-1, 0.5], rangeFilter),
    [0, 0.5],
    'should return value adjust to range filter'
  );

  t.deepEqual(
    adjustValueToFilterDomain([0.1, 1.5], rangeFilter),
    [0.1, 1],
    'should return value adjust to range filter'
  );

  t.deepEqual(
    adjustValueToFilterDomain([1.1, 2], rangeFilter),
    [0, 1],
    'should return value adjust to range filter'
  );

  t.deepEqual(
    adjustValueToFilterDomain(null, rangeFilter),
    [0, 1],
    'should return value adjust to range filter'
  );

  t.deepEqual(
    adjustValueToFilterDomain([undefined, 0.5], rangeFilter),
    [0, 0.5],
    'should return value adjust to range filter'
  );

  // TODO needs id
  const multiSelectFilter = getDefaultFilter();
  multiSelectFilter.type = FILTER_TYPES.multiSelect;
  multiSelectFilter.domain = ['a', 'b', 'c'];

  t.deepEqual(
    adjustValueToFilterDomain(['a', 'b'], multiSelectFilter),
    ['a', 'b'],
    'should return value matched to multiSelect filter'
  );

  t.deepEqual(
    adjustValueToFilterDomain(['a', 'b', 'd'], multiSelectFilter),
    ['a', 'b'],
    'should return value matched to multiSelect filter'
  );

  t.deepEqual(
    adjustValueToFilterDomain(['a', 'b', null], multiSelectFilter),
    ['a', 'b'],
    'should return value matched to multiSelect filter'
  );

  t.deepEqual(
    adjustValueToFilterDomain(null, multiSelectFilter),
    [],
    'should return [] if nothing matched to multiSelect filter'
  );

  t.deepEqual(
    adjustValueToFilterDomain([1, 2], multiSelectFilter),
    [],
    'should return [] if nothing matched to multiSelect filter'
  );

  // TODO needs id
  const selectFilter = getDefaultFilter();
  selectFilter.type = FILTER_TYPES.select;
  selectFilter.domain = ['a', 'b', 'c'];

  t.equal(
    adjustValueToFilterDomain('a', selectFilter),
    'a',
    'should return value matched to select filter'
  );

  t.equal(
    adjustValueToFilterDomain(['a', 'b'], selectFilter),
    true,
    'should return true if nothing matched to select filter'
  );

  t.equal(
    adjustValueToFilterDomain(null, selectFilter),
    true,
    'should return true if nothing matched to select filter'
  );

  t.end();
});

test('filterUtils -> getDatasetFieldIndexForFilter', t => {
  const dataId = 'test-this-id';

  let fieldIndex = getDatasetFieldIndexForFilter(dataId, {
    dataId: [dataId],
    fieldIdx: [3]
  });

  t.equal(fieldIndex, 3, 'FieldIndex should be 3');

  fieldIndex = getDatasetFieldIndexForFilter(dataId, {
    dataId: ['different-id', dataId],
    fieldIdx: [3, 5]
  });

  t.equal(fieldIndex, 5, 'FieldIndex should be 5');

  fieldIndex = getDatasetFieldIndexForFilter(dataId, {dataId: ['different-id']});
  t.equal(fieldIndex, -1, 'FieldIndex should be -1');

  t.end();
});

test('filterUtils -> isValidFilterValue', t => {
  t.equal(isValidFilterValue(null, true), false, 'Should return false because type is null');

  t.equal(
    isValidFilterValue(FILTER_TYPES.select, true),
    true,
    'Should return true because type is select and value is true'
  );

  t.equal(
    isValidFilterValue(FILTER_TYPES.select, false),
    true,
    'Should return true because type is select and value is true'
  );

  t.equal(
    isValidFilterValue(FILTER_TYPES.timeRange, false),
    false,
    'Should return false because type is timeRange and value is not an array'
  );

  t.equal(
    isValidFilterValue(FILTER_TYPES.timeRange, []),
    true,
    'Should return true because type is timeRange and value is an empty array'
  );

  t.equal(
    isValidFilterValue(FILTER_TYPES.timeRange, [1]),
    true,
    'Should return false because type is timeRange and value is an array'
  );

  t.equal(
    isValidFilterValue(FILTER_TYPES.multiSelect, true),
    false,
    'Should return false because type is multiSelect and value is not an array'
  );

  t.equal(
    isValidFilterValue(FILTER_TYPES.multiSelect, []),
    false,
    'Should return false because type is multiSelect and value is an empty array'
  );

  t.equal(
    isValidFilterValue(FILTER_TYPES.multiSelect, [1]),
    true,
    'Should return false because type is multiSelect and value is an array'
  );

  t.end();
});

test('filterUtils -> isInPolygon', t => {
  t.equal(
    isInPolygon([120.47448, 23.667604], {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [120.21949418752885, 23.755486652156186],
            [120.21949418752885, 23.221461105318184],
            [121.05994828909135, 23.221461105318184],
            [121.05994828909135, 23.755486652156186],
            [120.21949418752885, 23.755486652156186]
          ]
        ]
      },
      properties: {
        renderType: 'Rectangle',
        isClosed: true,
        bbox: {
          xmin: 120.21949418752885,
          xmax: null,
          ymin: 23.755486652156186,
          ymax: null
        },
        isVisible: true,
        filterId: 'z1ilfjv6'
      },
      id: '036d9e21-af6b-4350-aab9-f1ce37c35cce'
    }),
    true,
    'Should return true because the point is within the polygon'
  );

  t.equal(
    isInPolygon([119.47448, 23.667604], {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [120.21949418752885, 23.755486652156186],
            [120.21949418752885, 23.221461105318184],
            [121.05994828909135, 23.221461105318184],
            [121.05994828909135, 23.755486652156186],
            [120.21949418752885, 23.755486652156186]
          ]
        ]
      },
      properties: {
        renderType: 'Rectangle',
        isClosed: true,
        bbox: {
          xmin: 120.21949418752885,
          xmax: null,
          ymin: 23.755486652156186,
          ymax: null
        },
        isVisible: true,
        filterId: 'z1ilfjv6'
      },
      id: '036d9e21-af6b-4350-aab9-f1ce37c35cce'
    }),
    false,
    'Should return false because the point is not within the polygon'
  );

  t.end();
});

test('filterUtils -> validatePolygonFilter', t => {
  const filter = {
    layerId: ['layer1'],
    dataId: ['puppy'],
    value: {
      id: 'feature_1',
      geometry: {
        coordinates: []
      }
    },
    type: 'polygon'
  };

  const dataset = {
    id: 'puppy'
  };

  const layers = [
    {
      id: 'layer1'
    }
  ];

  t.deepEqual(
    validatePolygonFilter(dataset, filter, layers).filter,
    {
      ...filter,
      fieldIdx: [],
      freeze: true
    },
    'Should positively validate filter'
  );

  t.equal(
    validatePolygonFilter(dataset, filter, [{id: 'layer2'}]).filter,
    null,
    'Should not validate the filter since layers are not matched'
  );

  t.equal(
    validatePolygonFilter(dataset, {}, layers).filter,
    null,
    'Should not validate empty filter'
  );

  t.deepEqual(
    validatePolygonFilter(
      dataset,
      {
        ...filter,
        dataId: ['non_valid']
      },
      layers
    ).filter,
    null,
    'Should not validate filter with non existing dataId'
  );

  t.deepEqual(
    validatePolygonFilter(
      dataset,
      {
        ...filter,
        value: {
          id: 'wrong-value-for-polygon-type'
        }
      },
      layers
    ).filter,
    null,
    'Should not validate filter given type and value without corresponding layer'
  );

  t.end();
});

test('filterUtils -> Polygon getFilterFunction ', t => {
  const dataset = {
    id: 'puppy',
    data: mockPolygonData.data,
    allData: mockPolygonData.data,
    fields: mockPolygonData.fields
  };

  const {layers, data} = mockPolygonData;

  const polygonFilter = generatePolygonFilter(layers, mockPolygonFeature);

  let filterFunction = getFilterFunction(null, dataset.id, polygonFilter, []);

  t.equal(filterFunction(data[0], 0), true, `Should return true because layer list is empty`);

  filterFunction = getFilterFunction(null, 'puppy-2', polygonFilter, layers);

  t.equal(
    filterFunction(data[0], 0),
    true,
    `${data[0][0]} - ${data[0][1]} should be inside the range`
  );

  t.end();
});

/* eslint-enable max-statements */

test('filterUtils -> diffFilters', t => {
  const testCases = [
    {
      filterRecord: {
        dynamicDomain: [],
        fixedDomain: [],
        cpu: [],
        gpu: []
      },
      oldFilterRecord: undefined,
      result: {
        dynamicDomain: null,
        fixedDomain: null,
        cpu: null,
        gpu: null
      }
    },
    {
      filterRecord: {
        dynamicDomain: [],
        fixedDomain: [],
        cpu: [],
        gpu: []
      },
      oldFilterRecord: {
        dynamicDomain: [],
        fixedDomain: [],
        cpu: [],
        gpu: []
      },
      result: {
        dynamicDomain: null,
        fixedDomain: null,
        cpu: null,
        gpu: null
      }
    },
    {
      filterRecord: {
        dynamicDomain: [{id: 'aa', name: 'hello', value: 'bb'}],
        fixedDomain: [{id: 'bb', name: 'ab', value: 'ab'}],
        cpu: [
          {id: 'dd', name: 'hey', value: 'ee'},
          {id: 'ee', name: 'ee', value: 'ff'}
        ],
        gpu: []
      },
      oldFilterRecord: {
        dynamicDomain: [{id: 'aa', name: 'hello', value: 'bb'}],
        fixedDomain: [
          {id: 'bb', name: 'cd', value: 'ab'},
          {id: 'cc', name: 'world', value: 'dd'}
        ],
        cpu: [{id: 'ee', name: 'ee', value: 'gg'}],
        gpu: []
      },
      result: {
        dynamicDomain: null,
        fixedDomain: {bb: 'name_changed', cc: 'deleted'},
        cpu: {dd: 'added', ee: 'value_changed'},
        gpu: null
      }
    }
  ];

  testCases.forEach(({filterRecord, oldFilterRecord, result}) => {
    t.deepEqual(
      diffFilters(filterRecord, oldFilterRecord),
      result,
      'diff filters should be correct'
    );
  });

  t.end();
});

test('filterUtils -> getTimestampFieldDomain', t => {
  /* eslint-disable func-style */
  const valueAccessorRef = d => moment.utc(d).valueOf();
  /* eslint-enable func-style */

  const timeData = {
    no: {
      input: 0.5,
      expect: {
        domain: [0, 1],
        step: 0.05,
        ...getHistogram([0, 1], []),
        mappedValue: []
      }
    },
    zero: {
      input: ['2016-10-01 09:45:39', '2016-10-01 09:45:39'],
      expect: {
        domain: [1475315139000, 1475315139000],
        mappedValue: [1475315139000, 1475315139000],
        histogram: [{count: 2, x0: 1475315139000, x1: 1475315139000}],
        enlargedHistogram: [{count: 2, x0: 1475315139000, x1: 1475315139000}],
        step: 0.05
      }
    },
    tiny: {
      input: ['2016-10-01 09:45:39.001', '2016-10-01 09:45:39.002', '2016-10-01 09:45:39.003'],
      expect: {
        domain: [1475315139001, 1475315139003],
        mappedValue: [1475315139001, 1475315139002, 1475315139003],
        ...getHistogram(
          [1475315139001, 1475315139003],
          [1475315139001, 1475315139002, 1475315139003]
        ),
        step: 0.1
      }
    },
    small: {
      input: ['2016-10-01 09:45:39.010', '2016-10-01 09:45:39.020', '2016-10-01 09:45:39.030'],
      expect: {
        domain: [1475315139010, 1475315139030],
        mappedValue: [1475315139010, 1475315139020, 1475315139030],
        histogram: [],
        enlargedHistogram: [],
        step: 1
      }
    },
    medium: {
      input: ['2016-10-01 09:45:39.100', '2016-10-01 09:45:39.200', '2016-10-01 09:45:39.300'],
      expect: {
        domain: [1475315139100, 1475315139300],
        mappedValue: [1475315139100, 1475315139200, 1475315139300],
        histogram: [],
        enlargedHistogram: [],
        step: 5
      }
    },
    large: {
      input: ['2016-10-01 09:45:39', '2016-10-01 09:45:45'],
      expect: {
        domain: [1475315139000, 1475315145000],
        mappedValue: [1475315139000, 1475315145000],
        histogram: [],
        enlargedHistogram: [],
        step: 1000
      }
    }
  };

  Object.keys(timeData).forEach(key => {
    const data = Array.isArray(timeData[key].input)
      ? {
          rows: timeData[key].input.map(inputDate => {
            // make array of rows
            return [inputDate];
          }),
          fields: [
            {
              name: 'a',
              type: 'timestamp',
              format: 'YYYY/M/D HH:mm:ss.SSSS',
              fieldIdx: 0,
              analyzerType: 'DATETIME',
              valueAccessor: values => moment.utc(values.valueAt(0)).valueOf()
            }
          ]
        }
      : null;

    let tsFieldDomain;

    if (data) {
      const dataContainer = createDataContainer(data.rows, {fields: data.fields});
      const {valueAccessor} = data.fields[0];
      tsFieldDomain = getTimestampFieldDomain(dataContainer, valueAccessor);
    } else {
      // we want to test bad input
      tsFieldDomain = getTimestampFieldDomain(timeData[key].input, valueAccessorRef);
    }

    // const tsFieldDomain = getTimestampFieldDomain(timeData[key].input, valueAccessor);
    t.deepEqual(
      Object.keys(tsFieldDomain).sort(),
      Object.keys(timeData[key].expect).sort(),
      'domain should have same keys'
    );

    Object.keys(timeData[key].expect).forEach(k => {
      // histogram is created by d3, only need to test they exist
      if (k === 'histogram' || k === 'enlargedHistogram') {
        t.ok(tsFieldDomain[k].length, `should create ${k}`);
      } else {
        t.deepEqual(
          tsFieldDomain[k],
          timeData[key].expect[k],
          `time domain ${k} should be the same`
        );
      }
    });
  });

  t.end();
});
