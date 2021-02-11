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
import testData, {numericRangesCsv, testFields} from 'test/fixtures/test-csv-data';

import {getFilterFunction} from 'utils/filter-utils';
import {preciseRound} from 'utils/data-utils';
import {createNewDataEntry} from 'utils/dataset-utils';

import {processCsvData} from 'processors/data-processor';
import {cmpFields} from '../../helpers/comparison-utils';
import {FILTER_TYPES} from 'constants/default-settings';

function testGetTimeFieldDomain(table, t) {
  const test_cases = [
    {
      name: 'default',
      input: table.getColumnFilterDomain(table.fields[0]).domain,
      output: [
        moment.utc('2016-09-17 00:09:55').valueOf(),
        moment.utc('2016-09-17 00:30:08').valueOf()
      ],
      msg: '2016-09-17 00:30:08'
    },
    {
      name: 'epoch',
      input: table.getColumnFilterDomain(table.fields[4]).domain,
      output: [moment.utc(1472688000000).valueOf(), moment.utc(1472774400000).valueOf()],
      msg: 1472688000000
    },
    {
      name: 'T',
      input: table.getColumnFilterDomain(table.fields[7]).domain,
      output: [
        moment.utc('2016-09-23T00:00:00.000Z').valueOf(),
        moment.utc('2016-09-23T08:00:00.000Z').valueOf()
      ],
      msg: '2016-09-23T00:00:00.000Z'
    },
    {
      name: 'UTC',
      input: table.getColumnFilterDomain(table.fields[8]).domain,
      output: [
        moment.utc('2016-10-01 09:41:39+00:00').valueOf(),
        moment.utc('2016-10-01 10:01:54+00:00').valueOf()
      ],
      msg: '2016-10-01 09:41:39+00:00'
    },
    {
      name: 'local',
      input: table.getColumnFilterDomain(table.fields[9]).domain,
      output: [
        moment.utc('2016-10-01 09:41:39+00:00').valueOf(),
        moment.utc('2016-10-01 17:01:54+00:00').valueOf()
      ],
      msg: '2016-10-01 09:41:39+00:00'
    }
  ];

  test_cases.forEach(tc =>
    t.deepEqual(tc.input, tc.output, `should process correct domain for timestamp ${tc.msg}`)
  );
}

function testGetNumericFieldStep(table, t) {
  const test_cases = [
    {
      name: 'smallest',
      input: table.getColumnFilterDomain(table.fields[0]).step,
      output: 0.0000001
    },
    {
      name: 'small',
      input: table.getColumnFilterDomain(table.fields[1]).step,
      output: 0.001
    },
    {
      name: 'negative',
      input: table.getColumnFilterDomain(table.fields[2]).step,
      output: 0.01
    },
    {
      name: 'medium',
      input: table.getColumnFilterDomain(table.fields[3]).step,
      output: 0.01
    },
    {
      name: 'large',
      input: table.getColumnFilterDomain(table.fields[4]).step,
      output: 1
    }
  ];

  test_cases.forEach(tc =>
    t.equal(
      preciseRound(tc.input, 5),
      preciseRound(tc.output, 5),
      `should process correct step for field ${tc.name}`
    )
  );
}

function testGetFilterFunction({fields, dataContainer}, t) {
  const dataId = 'dataset-1';
  const timeStringFilter = {
    fieldIdx: [0],
    type: FILTER_TYPES.timeRange,
    value: [
      moment.utc('2016-09-17 00:09:55').valueOf(),
      moment.utc('2016-09-17 00:20:08').valueOf()
    ],
    id: 'filter-1',
    dataId: [dataId]
  };

  let field = fields[timeStringFilter.fieldIdx[0]];

  let filterFunction = getFilterFunction(field, dataId, timeStringFilter, []);

  t.equal(
    filterFunction(dataContainer.row(10), 10),
    true,
    `${dataContainer.valueAt(10, 0)} should be inside the range`
  );

  t.equal(
    filterFunction(dataContainer.row(15), 15),
    false,
    `${dataContainer.valueAt(15, 0)} should be outside the range`
  );

  const epochFilter = {
    fieldIdx: [4],
    type: FILTER_TYPES.timeRange,
    value: [moment.utc(1472688000000).valueOf(), moment.utc(1472734400000).valueOf()],
    id: 'filter-2',
    dataId: [dataId]
  };

  field = fields[epochFilter.fieldIdx[0]];

  filterFunction = getFilterFunction(field, dataId, epochFilter, []);

  t.equal(
    filterFunction(dataContainer.row(10), 10),
    true,
    `${dataContainer.valueAt(10, 1)} should be inside the range`
  );

  t.equal(
    filterFunction(dataContainer.row(15), 15),
    false,
    `${dataContainer.valueAt(15, 1)} should be outside the range`
  );

  const tzFilter = {
    fieldIdx: [7],
    type: FILTER_TYPES.timeRange,
    value: [
      moment.utc('2016-09-23T00:00:00.000Z').valueOf(),
      moment.utc('2016-09-23T06:00:00.000Z').valueOf()
    ],
    id: 'filter-3',
    dataId: [dataId]
  };

  field = fields[tzFilter.fieldIdx[0]];

  filterFunction = getFilterFunction(field, dataId, tzFilter, []);

  t.equal(
    filterFunction(dataContainer.row(10), 10),
    true,
    `${dataContainer.valueAt(10, 7)} should be inside the range`
  );

  t.equal(
    filterFunction(dataContainer.row(23), 10),
    false,
    `${dataContainer.valueAt(23, 7)} should be outside the range`
  );

  const utcFilter = {
    fieldIdx: [8],
    type: FILTER_TYPES.timeRange,
    value: [
      moment.utc('2016-10-01 09:45:39+00:00').valueOf(),
      moment.utc('2016-10-01 10:00:00+00:00').valueOf()
    ],
    id: 'filter-4',
    dataId: [dataId]
  };

  field = fields[utcFilter.fieldIdx[0]];

  filterFunction = getFilterFunction(field, dataId, utcFilter, []);

  t.equal(
    filterFunction(dataContainer.row(6), 6),
    false,
    `${dataContainer.valueAt(0, 8)} should be outside the range`
  );

  t.equal(
    filterFunction(dataContainer.row(4), 4),
    true,
    `${dataContainer.valueAt(4, 8)} should be inside the range`
  );

  t.equal(
    filterFunction(dataContainer.row(23), 23),
    false,
    `${dataContainer.valueAt(23, 8)} should be outside the range`
  );
}

test('KeplerTable -> getColumnFilterDomain -> time', t => {
  const expectedFields = testFields;

  const data = processCsvData(testData);
  const newDataEntry = createNewDataEntry({
    info: {id: 'test'},
    data
  });
  const dataset = newDataEntry.test;
  cmpFields(t, expectedFields, dataset.fields, dataset.id);
  testGetTimeFieldDomain(dataset, t);
  testGetFilterFunction(dataset, t);

  t.end();
});

test('KeplerTable -> getColumnFilterDomain -> numeric', async t => {
  const data = processCsvData(numericRangesCsv);
  const newDataEntry = createNewDataEntry({
    info: {id: 'test'},
    data
  });
  const dataset = newDataEntry.test;

  testGetNumericFieldStep(dataset, t);

  t.end();
});
