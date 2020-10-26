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
import sinon from 'sinon';
import {console as Console} from 'global/window';
import {DATA_TYPES} from 'type-analyzer';
import cloneDeep from 'lodash.clonedeep';

import testData, {
  dataWithNulls,
  parsedDataWithNulls,
  testFields,
  testAllData,
  wktCsv,
  wktCsvFields,
  wktCsvRows
} from 'test/fixtures/test-csv-data';
import {
  geojsonData,
  geoJsonWithStyle,
  geoStyleFields,
  geoStyleRows,
  fields as geojsonFields,
  rows as geojsonRows
} from 'test/fixtures/geojson';

import {
  ACCEPTED_ANALYZER_TYPES,
  analyzerTypeToFieldType,
  formatCsv,
  getFieldsFromData,
  getSampleForTypeAnalyze,
  parseCsvRowsByFieldType,
  processCsvData,
  processGeojson,
  processRowObject,
  validateInputData
} from 'processors/data-processor';

import {ALL_FIELD_TYPES} from 'constants/default-settings';
import {cmpFields} from '../../helpers/comparison-utils';

test('Processor -> getFieldsFromData', t => {
  const data = [
    {
      time: '2016-09-17 00:09:55',
      trip_epoch: '1472688000000',
      time_str: 'January 1st 2017 11:00pm ',
      value: '4',
      surge: '1.2',
      isTrip: 'true',
      zeroOnes: '0'
    },
    {
      time: '2016-09-17 00:30:08',
      trip_epoch: '1472860800000',
      time_str: 'January 1st 2017 11:01pm ',
      value: '3',
      surge: null,
      isTrip: 'false',
      zeroOnes: '1'
    },
    {
      time: null,
      trip_epoch: null,
      time_str: 'January 1st, 2017 11:02pm ',
      value: '2',
      surge: '1.3',
      isTrip: null,
      zeroOnes: '1'
    },
    {
      time: null,
      trip_epoch: null,
      time_str: 'January 1st, 2017 11:02pm ',
      value: '0',
      surge: '1.4',
      isTrip: null,
      zeroOnes: '0'
    }
  ];

  const headerRow = Object.keys(data[0]);
  const fields = getFieldsFromData(data, headerRow);
  const expectedFieldTypes = [
    'timestamp',
    'timestamp',
    'timestamp',
    'integer',
    'real',
    'boolean',
    'integer'
  ];

  fields.forEach((f, i) =>
    t.equal(f.type, expectedFieldTypes[i], `should find field type as ${expectedFieldTypes[i]}`)
  );
  t.end();
});

test('Processor -> processCsvData', t => {
  t.throws(() => processCsvData(''), 'should throw if csv is empty');

  // load sample dataset csv as text
  const {fields, rows} = processCsvData(cloneDeep(testData));

  t.equal(rows.length, testAllData.length, `should return ${testAllData.length} rows`);

  cmpFields(t, testFields, fields, 'should parse rows correctly');

  t.deepEqual(rows, testAllData, 'should parse rows correctly');

  rows.forEach((r, i) => {
    t.deepEqual(r, testAllData[i], `should parse row ${i} correctly`);
  });

  t.end();
});

test('Processor -> processCsvData: duplicated field name', t => {
  const testData1 = `column1,column1,column1,column2\na,b,c,d\nc,d,e,f`;

  // load sample dataset csv as text
  const result = processCsvData(testData1);

  const expectedResult = {
    fields: [
      {
        name: 'column1',
        id: 'column1',
        format: '',
        fieldIdx: 0,
        displayName: 'column1',
        type: 'string',
        analyzerType: 'STRING',
        valueAccessor: values => values[0]
      },
      {
        name: 'column1-0',
        id: 'column1-0',
        format: '',
        fieldIdx: 1,
        displayName: 'column1-0',
        type: 'string',
        analyzerType: 'STRING',
        valueAccessor: values => values[1]
      },
      {
        name: 'column1-1',
        id: 'column1-1',
        format: '',
        fieldIdx: 2,
        displayName: 'column1-1',
        type: 'string',
        analyzerType: 'STRING',
        valueAccessor: values => values[2]
      },
      {
        name: 'column2',
        id: 'column2',
        format: '',
        fieldIdx: 3,
        displayName: 'column2',
        type: 'string',
        analyzerType: 'STRING',
        valueAccessor: values => values[3]
      }
    ],
    rows: [
      ['a', 'b', 'c', 'd'],
      ['c', 'd', 'e', 'f']
    ]
  };

  cmpFields(t, result.fields, expectedResult.fields, 'should have created non duplicated fields');
  t.deepEqual(
    result.rows,
    expectedResult.rows,
    'should have computed rows with non duplicated fields'
  );

  t.end();
});

test('Processor -> processCsvData -> with nulls', t => {
  const {fields, rows} = processCsvData(dataWithNulls);
  cmpFields(t, fields, testFields, 'should parse fields correctly');

  t.deepEqual(rows, parsedDataWithNulls, 'should parse rows correctly');
  rows.forEach((r, i) => {
    t.deepEqual(r, parsedDataWithNulls[i], `should parse row ${i} correctly`);
  });
  t.end();
});

test('Processor -> processCsv.wkt', t => {
  const {fields, rows} = processCsvData(wktCsv);

  cmpFields(t, fields, wktCsvFields, 'should find geometry fields as type:geojson');

  rows.forEach((r, i) => {
    t.deepEqual(r, wktCsvRows[i], `should process wkt rows[${i}] correctly`);
  });
  t.deepEqual(rows, wktCsvRows, 'should process wkt rows correctly');

  t.end();
});

test('Processor => processGeojson', t => {
  const {fields, rows} = processGeojson(cloneDeep(geojsonData));

  cmpFields(t, fields, geojsonFields, 'should have same field length');

  t.equal(rows.length, geojsonRows.length, 'should have same row length');
  rows.forEach((r, i) => {
    t.deepEqual(r, geojsonRows[i], 'should format correct geojson rows');
  });
  t.end();
});

test('Processor => processGeojson: with style property', t => {
  const {fields, rows} = processGeojson(cloneDeep(geoJsonWithStyle));

  cmpFields(t, fields, geoStyleFields, 'should preserve objects in geojson properties');
  t.deepEqual(rows, geoStyleRows, 'should preserve objects in geojson properties');
  t.end();
});

test('Processor => processGeojson:invalid geojson', t => {
  t.throws(
    () => processGeojson({fields: [], rows: []}),
    'Should throw error with invalid geojson type'
  );

  t.end();
});

test('Processor => processGeojson: parse rows', t => {
  const testGeoData = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {TRIPS: '11', RATE: 'a', TIME: '1570749707'},
        geometry: {type: 'Point', coordinates: [[-122, 37]]}
      },
      {
        type: 'Feature',
        properties: {TRIPS: '10', RATE: 'b', TIME: '1570749707'},
        geometry: {type: 'Point', coordinates: [[-122, 37]]}
      },
      {
        type: 'Feature',
        properties: {TRIPS: '9', RATE: 'b', TIME: '1570749707'},
        geometry: {type: 'Point', coordinates: [[-122, 37]]}
      }
    ]
  };

  const expectedFields = [
    {
      name: '_geojson',
      id: '_geojson',
      displayName: '_geojson',
      format: '',
      fieldIdx: 0,
      type: 'geojson',
      analyzerType: 'GEOMETRY',
      valueAccessor: values => values[0]
    },
    {
      name: 'TRIPS',
      id: 'TRIPS',
      displayName: 'TRIPS',
      format: '',
      fieldIdx: 1,
      type: 'integer',
      analyzerType: 'INT',
      valueAccessor: values => values[1]
    },
    {
      name: 'RATE',
      id: 'RATE',
      displayName: 'RATE',
      format: '',
      fieldIdx: 2,
      type: 'string',
      analyzerType: 'STRING',
      valueAccessor: values => values[2]
    },
    {
      name: 'TIME',
      id: 'TIME',
      displayName: 'TIME',
      format: 'x',
      fieldIdx: 3,
      type: 'timestamp',
      analyzerType: 'TIME',
      valueAccessor: values => values[3]
    }
  ];

  const expectedRows = [
    [
      {
        type: 'Feature',
        properties: {TRIPS: 11, RATE: 'a', TIME: 1570749707},
        geometry: {type: 'Point', coordinates: [[-122, 37]]}
      },
      11,
      'a',
      1570749707
    ],
    [
      {
        type: 'Feature',
        properties: {TRIPS: 10, RATE: 'b', TIME: 1570749707},
        geometry: {type: 'Point', coordinates: [[-122, 37]]}
      },
      10,
      'b',
      1570749707
    ],
    [
      {
        type: 'Feature',
        properties: {TRIPS: 9, RATE: 'b', TIME: 1570749707},
        geometry: {type: 'Point', coordinates: [[-122, 37]]}
      },
      9,
      'b',
      1570749707
    ]
  ];
  const result = processGeojson(testGeoData);

  t.deepEqual(Object.keys(result), ['fields', 'rows'], 'should contain fields and rows');
  cmpFields(
    t,
    result.fields,
    expectedFields,
    'should parse correct fields when geojson input contain string'
  );

  t.deepEqual(
    result.rows,
    expectedRows,
    'should parse correct rows when geojson input contain string'
  );

  t.end();
});

test('Processor -> parseCsvRowsByFieldType -> real', t => {
  const field = {
    type: ALL_FIELD_TYPES.real
  };

  const rows = [
    ['0.0'],
    ['1.0'],
    ['-1.0'],
    ['155.0'],
    ['1.55e3'],
    ['1.55e-3'],
    [' 1.55e-3 '],
    [' 1.55e+3 xyz']
  ];

  const expected = [[0.0], [1.0], [-1.0], [155.0], [1550.0], [0.00155], [0.00155], [1550.0]];

  parseCsvRowsByFieldType(rows, -1, field, 0);
  t.same(rows, expected, 'should parsed reals properly');
  t.end();
});

test('Processor -> parseCsvRowsByFieldType -> integer', t => {
  const field = {
    type: ALL_FIELD_TYPES.integer
  };

  const rows = [['0'], ['1'], ['-1'], ['155'], [' 155 '], [' 155 xyz']];

  const expected = [[0], [1], [-1], [155], [155], [155]];

  parseCsvRowsByFieldType(rows, -1, field, 0);
  t.same(rows, expected, 'should parsed ints properly');
  t.end();
});

test('Processor -> parseCsvRowsByFieldType -> boolean', t => {
  const field = {
    type: ALL_FIELD_TYPES.boolean
  };

  const rows = [[null], ['0'], ['1'], ['True'], ['False'], ['0'], ['1'], ['true']];

  // is parsing '' meaningful, why not false
  const expected = [[null], [false], [true], [true], [false], [false], [true], [true]];

  parseCsvRowsByFieldType(rows, -1, field, 0);
  t.same(rows, expected, 'should parsed boolean properly');
  t.end();
});

test('Processor -> getSampleForTypeAnalyze', t => {
  const fields = ['string', 'int', 'bool', 'time'];

  const allData = [
    ['a', 0, true, null],
    ['b', 2, false, null],
    ['c', 3, true, '2017-01-01'],
    [null, 1, false, '2017-01-02'],
    ['d', 6, false, '2017-01-03'],
    ['e', 4, true, null],
    ['f', 5, true, undefined],
    ['g', null, true, null],
    ['h', undefined, true, '2017-01-04']
  ];

  const sample = getSampleForTypeAnalyze({fields, allData, sampleCount: 5});
  const expected = [
    {
      string: 'a',
      int: 0,
      bool: true,
      time: '2017-01-01'
    },
    {
      string: 'b',
      int: 2,
      bool: false,
      time: '2017-01-02'
    },
    {
      string: 'c',
      int: 3,
      bool: true,
      time: '2017-01-03'
    },
    {
      string: 'd',
      int: 1,
      bool: false,
      time: '2017-01-04'
    },
    {
      string: 'e',
      int: 6,
      bool: false,
      time: null
    }
  ];

  t.deepEqual(sample, expected, 'Should find correct sample for type analyzer');
  t.end();
});

test('Processor -> validateInputData', t => {
  t.equal(validateInputData(null), null, 'Should throw error if data is null');
  t.equal(validateInputData({rows: 'hello'}), null, 'Should throw error if data.rows is null');
  t.equal(
    validateInputData({rows: [], fields: null}),
    null,
    'Should throw error if data.fields is null'
  );

  const cases = [
    {
      input: {
        rows: [[1], [2], [3]],
        fields: ['a']
      },
      expected: {
        rows: [[1], [2], [3]],
        fields: [{type: ALL_FIELD_TYPES.integer, format: '', name: 'column_0', analyzerType: 'INT'}]
      },
      msg: 'should re generate field if not an object'
    },
    {
      input: {
        rows: [[1], [2], [3]],
        fields: [{type: ALL_FIELD_TYPES.integer, format: ''}]
      },
      expected: {
        rows: [[1], [2], [3]],
        fields: [{type: ALL_FIELD_TYPES.integer, format: '', name: 'column_0', analyzerType: 'INT'}]
      },
      msg: 'should reassign field name'
    },
    {
      input: {
        rows: [[1], [2], [3]],
        fields: [{type: 'hello', format: '', name: 'taro'}]
      },
      expected: {
        rows: [[1], [2], [3]],
        fields: [
          {
            type: ALL_FIELD_TYPES.integer,
            format: '',
            name: 'taro',
            analyzerType: 'INT'
          }
        ]
      },
      msg: 'should reassign field type'
    },
    {
      input: {
        rows: [['2018-09-01 00:00'], ['2018-09-01 01:00'], ['2018-09-01 02:00']],
        fields: [{type: ALL_FIELD_TYPES.timestamp, format: '', name: 'taro'}]
      },
      expected: {
        rows: [['2018-09-01 00:00'], ['2018-09-01 01:00'], ['2018-09-01 02:00']],
        fields: [
          {
            type: ALL_FIELD_TYPES.timestamp,
            format: 'YYYY-M-D H:m',
            name: 'taro',
            analyzerType: 'DATETIME'
          }
        ]
      },
      msg: 'should reassign field type'
    }
  ];

  cases.forEach(({input, expected, msg}) => {
    t.deepEqual(validateInputData(input), expected, msg);
  });

  t.end();
});

test('Processor -> processRowObject', t => {
  t.equal(processRowObject({}), null, 'Should return null when rawData is empty');

  const cases = [
    {
      input: [
        {a: 1, b: 'c', c: true, d: '1.2'},
        {a: 2, b: 'c', c: false, d: '1.3'},
        {a: 3, b: 'd', c: true, d: '1.4'}
      ],
      expected: {
        rows: [
          [1, 'c', true, 1.2],
          [2, 'c', false, 1.3],
          [3, 'd', true, 1.4]
        ],
        fields: [
          {
            name: 'a',
            id: 'a',
            displayName: 'a',
            type: 'integer',
            format: '',
            fieldIdx: 0,
            analyzerType: 'INT',
            valueAccessor: values => values[0]
          },
          {
            name: 'b',
            id: 'b',
            displayName: 'b',
            type: 'string',
            format: '',
            fieldIdx: 1,
            analyzerType: 'STRING',
            valueAccessor: values => values[1]
          },
          {
            name: 'c',
            id: 'c',
            displayName: 'c',
            type: 'boolean',
            format: '',
            fieldIdx: 2,
            analyzerType: 'BOOLEAN',
            valueAccessor: values => values[2]
          },
          {
            name: 'd',
            id: 'd',
            displayName: 'd',
            type: 'real',
            format: '',
            fieldIdx: 3,
            analyzerType: 'FLOAT',
            valueAccessor: values => values[3]
          }
        ]
      },
      msg: 'should parse correct row objects'
    }
  ];

  cases.forEach(({input, expected, msg}) => {
    const {fields, rows} = processRowObject(input);
    cmpFields(t, fields, expected.fields, `${msg} fields`);
    t.deepEqual(rows, expected.rows, msg);
  });
  t.end();
});

test('Processor -> formatCsv', t => {
  const geojsonFc = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {TRIPS: '11'},
        geometry: {type: 'Point', coordinates: [[-122, 37]]}
      },
      {
        type: 'Feature',
        properties: {TRIPS: '10'},
        geometry: {type: 'Point', coordinates: [[-122, 37]]}
      },
      {
        type: 'Feature',
        properties: {TRIPS: '9'},
        geometry: {type: 'Point', coordinates: [[-122, 37]]}
      }
    ]
  };

  const cases = [
    {
      input:
        `gps_data.lat,gps_data.types,epoch,has_result,id,begintrip_ts_local,date\n` +
        `29.9900937,driver_analytics,1472688000000,False,1,2016-10-01 09:41:39+00:00,2016-09-23\n` +
        `29.9927699,driver_analytics,1472688000000,False,2,2016-10-01 16:46:37+00:00,2016-09-23\n` +
        `29.9907261,driver_analytics,1472688000000,False,3,,2016-09-23`,
      expected:
        `gps_data.lat,gps_data.types,epoch,has_result,id,begintrip_ts_local,date\n` +
        `29.9900937,driver_analytics,1472688000000,false,1,2016-10-01 09:41:39+00:00,2016-09-23\n` +
        `29.9927699,driver_analytics,1472688000000,false,2,2016-10-01 16:46:37+00:00,2016-09-23\n` +
        `29.9907261,driver_analytics,1472688000000,false,3,,2016-09-23`,
      processor: processCsvData,
      msg: 'should format correct csv'
    },
    {
      input: geojsonFc,
      expected:
        '_geojson,TRIPS\n"{""type"":""Feature"",""properties"":{""TRIPS"":11},""geometry"":{""type"":""Point"",""coordinates"":[[-122,37]]}}",11\n"{""type"":""Feature"",""properties"":{""TRIPS"":10},""geometry"":{""type"":""Point"",""coordinates"":[[-122,37]]}}",10\n"{""type"":""Feature"",""properties"":{""TRIPS"":9},""geometry"":{""type"":""Point"",""coordinates"":[[-122,37]]}}",9',
      processor: processGeojson,
      msg: 'should format correct csv from geojsonInput'
    }
  ];

  cases.forEach(({input, expected, msg, processor}) => {
    const {fields, rows} = processor(input);

    t.deepEqual(formatCsv(rows, fields), expected, msg);
  });
  t.end();
});

test('Processor -> analyzerTypeToFieldType', t => {
  Object.keys(DATA_TYPES).forEach(atype => {
    const spy = sinon.spy(Console, 'warn');

    if (!ACCEPTED_ANALYZER_TYPES.includes(atype)) {
      t.equal(
        analyzerTypeToFieldType(atype),
        'string',
        'should return string if type not recognized'
      );
      t.ok(spy.calledOnce, `should warn when pass unrecognized type ${atype}`);
    } else {
      const fieldType = analyzerTypeToFieldType(atype);
      t.ok(ALL_FIELD_TYPES[fieldType], `should assign ${atype} to one of ALL_FIELD_TYPES`);
    }

    spy.restore();
  });

  t.end();
});
