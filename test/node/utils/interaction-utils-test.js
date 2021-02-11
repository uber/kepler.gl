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
import {
  findFieldsToShow,
  getTooltipDisplayValue,
  getTooltipDisplayDeltaValue,
  TOOLTIP_MINUS_SIGN
} from 'utils/interaction-utils';
import {DEFAULT_TOOLTIP_FIELDS} from 'constants/default-settings';
import {StateWTooltipFormat, testGeoJsonDataId} from 'test/helpers/mock-state';
import {COMPARE_TYPES} from 'constants/tooltip';

const fields = [
  {
    name: 'lat'
  },
  {
    name: '_lat'
  },
  {
    name: 'se.longitude'
  },
  {
    name: 'p longitude'
  },
  {
    name: 'hex_id'
  },
  {
    name: 'all_points',
    type: 'geojson'
  },
  {
    name: 'a'
  },
  {
    name: 'b'
  },
  {
    name: 'c'
  },
  {
    name: 'd'
  },
  {
    name: 'e'
  },
  {
    name: 'f'
  }
];

test('interactionUtil -> findFieldsToShow', t => {
  const dataId = 'random_stuff';

  const someFields = [
    ...DEFAULT_TOOLTIP_FIELDS.slice(0, 2).map(d => ({name: d})),
    ...[
      {
        name: 'random'
      },
      {
        name: 'something_else'
      }
    ]
  ];

  const expectedFields = [
    {
      name: 'random',
      format: null
    },
    {
      name: 'something_else',
      format: null
    }
  ];

  t.deepEqual(
    findFieldsToShow({fields: someFields, id: dataId}),
    {random_stuff: expectedFields},
    'should find 2 default trip layers'
  );

  t.end();
});

test('interactionUtil -> autoFindTooltipFields', t => {
  const expectedFields = {
    test: [
      {
        name: 'hex_id',
        format: null
      },
      {
        name: 'a',
        format: null
      },
      {
        name: 'b',
        format: null
      },
      {
        name: 'c',
        format: null
      },
      {
        name: 'd',
        format: null
      }
    ]
  };

  t.deepEqual(
    findFieldsToShow({fields, id: 'test'}),
    expectedFields,
    'should filter out all default geometry fields and return first 5'
  );

  t.end();
});

test('interactionUtil -> getTooltipDisplayDeltaValue', t => {
  const tooltipConfig = StateWTooltipFormat.visState.interactionConfig.tooltip.config;
  const dataset = StateWTooltipFormat.visState.datasets[testGeoJsonDataId];
  const testFieldIdx = dataset.fields.findIndex(f => f.name === 'TRIPS');
  const item = tooltipConfig.fieldsToShow[testGeoJsonDataId].find(fs => fs.name === 'TRIPS');

  const TEST_CASES = [
    {
      input: {
        primaryData: dataset.dataContainer.row(0),
        field: dataset.fields[testFieldIdx],
        compareType: COMPARE_TYPES.ABSOLUTE,
        data: dataset.dataContainer.row(1),
        fieldIdx: testFieldIdx,
        item
      },
      output: `${TOOLTIP_MINUS_SIGN}7.000`,
      message: 'should display absolute delta value'
    },
    {
      input: {
        primaryData: dataset.dataContainer.row(0),
        field: dataset.fields[testFieldIdx],
        compareType: COMPARE_TYPES.RELATIVE,
        data: dataset.dataContainer.row(1),
        fieldIdx: testFieldIdx,
        item
      },
      output: `${TOOLTIP_MINUS_SIGN}63.64%`,
      message: 'should display relative delta value'
    },
    {
      input: {
        primaryData: dataset.dataContainer.row(3),
        field: dataset.fields[testFieldIdx],
        compareType: COMPARE_TYPES.ABSOLUTE,
        data: dataset.dataContainer.row(1),
        fieldIdx: testFieldIdx,
        item
      },
      output: TOOLTIP_MINUS_SIGN,
      message: 'should display - when primary is null'
    },
    {
      input: {
        primaryData: dataset.dataContainer.row(0),
        field: dataset.fields[testFieldIdx],
        compareType: COMPARE_TYPES.ABSOLUTE,
        data: dataset.dataContainer.row(3),
        fieldIdx: testFieldIdx,
        item
      },
      output: TOOLTIP_MINUS_SIGN,
      message: 'should display - when data is null'
    },
    {
      input: {
        primaryData: dataset.dataContainer.row(4),
        field: dataset.fields[testFieldIdx],
        compareType: COMPARE_TYPES.ABSOLUTE,
        data: dataset.dataContainer.row(3),
        fieldIdx: testFieldIdx,
        item
      },
      output: TOOLTIP_MINUS_SIGN,
      message: 'should display - when both are null'
    }
  ];

  TEST_CASES.forEach(tc => {
    t.equal(getTooltipDisplayDeltaValue(tc.input), tc.output, tc.message);
  });

  t.end();
});

test('interactionUtil -> getTooltipDisplayValue', t => {
  const tooltipConfig = StateWTooltipFormat.visState.interactionConfig.tooltip.config;
  const dataset = StateWTooltipFormat.visState.datasets[testGeoJsonDataId];
  const items = tooltipConfig.fieldsToShow[testGeoJsonDataId];

  const TEST_CASES = [
    {
      input: items[0], // OBJECTID
      output: ['1', '2', '3', '4', '5'],
      message: `should display correct tooltip value for ${items[0].name}`
    },
    {
      input: items[3], // ID
      output: ['11.000', '4.000', '20.000', '', ''],
      message: `should display correct tooltip value for ${items[3].name}`
    },
    {
      input: {name: 'OBJ', format: null}, // ID
      output: ['{"id":1}', '{"id":2}', '{"id":3}', '{"id":4}', '{"id":5}'],
      message: 'should display correct tooltip value for OBJ'
    }
  ];

  TEST_CASES.forEach(tc => {
    const field = dataset.fields.find(f => f.name === tc.input.name);
    const fieldIdx = dataset.fields.findIndex(f => f.name === tc.input.name);

    t.deepEqual(
      dataset.dataContainer.map(data =>
        getTooltipDisplayValue({
          field,
          data,
          fieldIdx,
          item: tc.input
        })
      ),
      tc.output,
      tc.message
    );
  });
  t.end();
});
