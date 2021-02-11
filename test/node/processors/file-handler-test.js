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
import {isKeplerGlMap, makeProgressIterator, filesToDataPayload} from 'processors/file-handler';
import {parsedFields, parsedRows} from 'test/fixtures/row-object';
import {
  savedStateV1InteractionCoordinate as keplerglMap,
  parsedFields as parsedKeplerMapFields
} from 'test/fixtures/state-saved-v1-7';

test('#file-handler -> isKeplerGlMap', t => {
  t.equal(
    isKeplerGlMap('{datasets: [], info: {app: "kepler.gl"}, config: {}}'),
    false,
    'Should return false when passing a json string'
  );

  t.equal(
    isKeplerGlMap({datasets: [], info: {app: 'kepler.gl'}, config: {}}),
    true,
    'Should return true when object is a kepler map'
  );

  t.equal(
    isKeplerGlMap({datasets: [], info: {app: 'kepler.gl'}}),
    false,
    'Should return false when object is not a kepler map'
  );

  t.end();
});

test('#file-handler -> makeProgressIterator', async t => {
  // mock AsyncIterator returned by loarder.gl patchInBatches
  // Ideally should run this in browser-headless
  async function* mock() {
    let bytesUsed = 0;
    let value = 0;
    let b = 0;
    await new Promise(resolve => setTimeout(resolve, 100));
    while (b < 2) {
      b += 1;
      bytesUsed += 10;
      value += 1;
      yield {
        data: [{value}],
        bytesUsed
      };
    }
  }
  const asyncIterator = mock();
  const info = {size: 100};

  const progress = makeProgressIterator(asyncIterator, info);

  const batch1 = await progress.next();
  const batch2 = await progress.next();
  const batch3 = await progress.next();

  const expected1 = {
    value: {
      data: [{value: 1}],
      bytesUsed: 10,
      progress: {rowCount: 1, rowCountInBatch: 1, percent: 0.1}
    },
    done: false
  };

  const expected2 = {
    value: {
      data: [{value: 2}],
      bytesUsed: 20,
      progress: {rowCount: 2, rowCountInBatch: 1, percent: 0.2}
    },
    done: false
  };
  const expected3 = {
    value: undefined,
    done: true
  };

  t.deepEqual(batch1, expected1, 'batch1 should be correct');
  t.deepEqual(batch2, expected2, 'batch2 should be correct');
  t.deepEqual(batch3, expected3, 'batch3 should be correct');

  t.end();
});

test('#file-handler -> filesToDataPayload', t => {
  const fileCache = [
    {
      data: {
        fields: parsedFields,
        rows: parsedRows // TODO looks like not checked
      },
      info: {label: 'rows-data.json', format: 'row'}
    },
    {
      data: {
        datasets: [
          {
            data: {
              fields: parsedKeplerMapFields,
              rows: keplerglMap.datasets[0].data.allData // TODO looks like not checked
            },
            info: {id: 'a5ybmwl2d', label: 'geojson_as_string_small.csv', color: [53, 92, 125]}
          }
        ],
        config: keplerglMap.config
      },
      info: {label: 'keplergl-map.json', format: 'keplergl'}
    }
  ];

  const result = filesToDataPayload(fileCache);

  // const expectedResults = [
  //   {
  //     datasets: [{data, info}],
  //     config: {
  //       version: 'v1',
  //       config: {}
  //     },
  //     options: {centerMap: true}
  //   },
  //   {datasets: [{data, info}]}
  // ];

  t.equal(result.length, 2, 'result shoud have 2 entries');
  t.deepEqual(
    Object.keys(result[0]),
    ['datasets', 'config', 'options'],
    'result[0] should have 3 keys'
  );
  t.equal(result[0].datasets, fileCache[1].data.datasets, 'should save keplergl map datasets');
  t.equal(result[0].config, fileCache[1].data.config, 'should save keplergl map config');
  t.deepEqual(
    result[0].options,
    {centerMap: true},
    'should save keplergl map set {centerMap: true}'
  );

  t.deepEqual(Object.keys(result[1]), ['datasets'], 'result[0] should have 1 key');
  t.deepEqual(
    result[1].datasets[0].data,
    fileCache[0].data,
    'should pass file data to datasets only'
  );
  t.deepEqual(
    Object.keys(result[1].datasets[0].info),
    ['id', 'label', 'format'],
    'result[0] datasets[0].info should have 3 key'
  );

  t.end();
});
