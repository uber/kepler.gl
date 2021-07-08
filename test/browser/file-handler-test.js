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

/* eslint-disable max-statements */
import test from 'tape';
import {processFileData, readFileInBatches} from 'processors/file-handler';
import {csvWithNull} from '../node/processors/file-handler-fixtures';
import {dataWithNulls, testFields, parsedDataWithNulls} from 'test/fixtures/test-csv-data';
import geojsonString, {
  featureString,
  processedFeature,
  processedFeatureRows,
  processedFeatureFields,
  processedFields as geojsonFields,
  processedRows as geojsonRows
} from 'test/fixtures/geojson-style';
import rowDataString, {parsedFields, parsedRows} from 'test/fixtures/row-object';
import {
  savedStateV1InteractionCoordinate as keplerglMap,
  parsedFields as parsedKeplerMapFields
} from 'test/fixtures/state-saved-v1-7';

import global from 'global';
import {cmpField} from '../helpers/comparison-utils';

/** loaders.gl uses these from global */
global.File = global.window.File;
global.FileReader = global.window.FileReader;
global.Blob = global.window.Blob;

test('#file-handler -> readFileInBatches.csv -> processFileData', async t => {
  const csvFile = new File([dataWithNulls], 'text-data.csv', {type: 'text/csv'});

  let gen = null;
  try {
    gen = await readFileInBatches({file: csvFile, fileList: []});
  } catch (e) {
    t.equal(true, false, 'Should read file correctly');
    t.end();
    return;
  }

  // metadata batch
  const batch1 = await gen.next();

  const expected1 = {
    value: {
      batchType: 'metadata',
      metadata: {_loader: {}, _context: {}},
      data: [],
      bytesUsed: 0,
      progress: {rowCount: 0, rowCountInBatch: 0, percent: 0},
      fileName: 'text-data.csv'
    },
    done: false
  };
  t.deepEqual(
    Object.keys(batch1.value).sort(),
    Object.keys(expected1.value).sort(),
    'value should have same keys'
  );

  t.equal(batch1.value.batchType, expected1.value.batchType, 'batch1.batchType should be the same');
  t.equal(batch1.value.fileName, expected1.value.fileName, 'batch1.fileName should be the same');
  t.deepEqual(batch1.value.data, expected1.value.data, 'batch1.data should be the same');
  t.deepEqual(
    batch1.value.progress,
    expected1.value.progress,
    'batch1.progress should be the same'
  );

  // data batch
  const batch2 = await gen.next();

  const expected2 = {
    value: {
      bytesUsed: undefined,
      count: 0,
      cursor: 0,
      data: csvWithNull,
      fileName: 'text-data.csv',
      headers: [
        'gps_data.utc_timestamp',
        'gps_data.lat',
        'gps_data.lng',
        'gps_data.types',
        'epoch',
        'has_result',
        'id',
        'time',
        'begintrip_ts_utc',
        'begintrip_ts_local',
        'date'
      ],
      length: 13,
      progress: {rowCount: 13, rowCountInBatch: 13},
      schema: {}
    },
    done: false
  };

  t.deepEqual(
    Object.keys(batch2.value).sort(),
    Object.keys(expected2.value).sort(),
    'value should have same keys'
  );

  t.equal(batch2.value.fileName, expected2.value.fileName, 'batch2.fileName should be the same');
  // t.deepEqual(batch2.value.data, expected2.value.data, 'batch2.data should be the same');
  t.deepEqual(batch2.value.headers, expected2.value.headers, 'batch2.headers should be the same');
  t.deepEqual(
    batch2.value.progress,
    expected2.value.progress,
    'batch2.progress should be the same'
  );

  const batch3 = await gen.next();
  const expected3 = {value: undefined, done: true};
  t.deepEqual(batch3, expected3, 'batch3 should be the final batch');

  // go on to run processFileData
  const processed = await processFileData({content: batch2.value, fileCache: []});
  const expectedInfo = {label: 'text-data.csv', format: 'row'};

  t.equal(processed.length, 1, 'processFileData should return 1 result');
  t.ok(processed[0].info, 'processFileData should have info');
  t.ok(processed[0].data, 'processFileData should have data');
  t.deepEqual(processed[0].info, expectedInfo, 'info should be correct');

  const {fields, rows} = processed[0].data;

  fields.forEach((f, i) =>
    cmpField(t, testFields[i], f, `should process correct field ${testFields[i].name}`)
  );

  rows.forEach((r, i) => {
    t.deepEqual(r, parsedDataWithNulls[i], `should process row ${i} correctly`);
  });

  t.end();
});

test('#file-handler -> readFileInBatches.GeoJSON FeatureCollection -> processFileData', async t => {
  const geojsonFile = new File([geojsonString], 'text-data-1.geojson', {type: ''});

  let gen = null;
  try {
    gen = await readFileInBatches({file: geojsonFile, fileList: []});
  } catch (e) {
    t.equal(true, false, 'Should read file correctly');
    t.end();
    return;
  }

  // metadata batch
  const batch1 = await gen.next();

  const expected1 = {
    value: {
      batchType: 'metadata',
      metadata: {_loader: {}, _context: {}},
      data: [],
      bytesUsed: 0,
      progress: {rowCount: 0, rowCountInBatch: 0, percent: 0},
      fileName: 'text-data-1.geojson'
    },
    done: false
  };

  t.deepEqual(
    Object.keys(batch1.value).sort(),
    Object.keys(expected1.value).sort(),
    'value should have same keys'
  );

  t.equal(batch1.value.batchType, expected1.value.batchType, 'batch1.batchType should be the same');
  t.equal(batch1.value.fileName, expected1.value.fileName, 'batch1.fileName should be the same');
  t.deepEqual(batch1.value.data, expected1.value.data, 'batch1.data should be the same');
  t.deepEqual(
    batch1.value.progress,
    expected1.value.progress,
    'batch1.progress should be the same'
  );

  // partial result batch
  const batch2 = await gen.next();

  const expected2 = {
    value: {
      batchType: 'partial-result',
      container: {type: 'FeatureCollection', features: []},
      data: [],
      bytesUsed: 0,
      schema: null,
      jsonpath: '$.features',
      progress: {rowCount: 0, rowCountInBatch: 0, percent: 0},
      fileName: 'text-data-1.geojson'
    },
    done: false
  };
  t.deepEqual(batch2, expected2, 'batch2 should be partial-result');
  // data batch
  const batch3 = await gen.next();
  const expected3 = {
    value: {
      data: [], // 13 features
      schema: null,
      length: 26,
      cursor: 0,
      count: 0,
      bytesUsed: 4890,
      jsonpath: '$.features',
      progress: {rowCount: 26, rowCountInBatch: 26, percent: 1},
      fileName: 'text-data-1.geojson'
    },
    done: false
  };

  t.equal(batch3.value.data.length, 26, 'batch3 should data length 26');
  t.equal(batch3.value.jsonpath, expected3.value.jsonpath, 'batch3 should have jsonpath');
  t.deepEqual(batch3.value.progress, expected3.value.progress, 'batch3 should have progress');
  t.equal(batch3.value.fileName, expected3.value.fileName, 'batch3 should have fileName');
  t.equal(batch3.value.length, expected3.value.length, 'batch3 should have length');

  const batch4 = await gen.next();
  const expected4 = {
    value: {
      batchType: 'final-result',
      container: {type: 'FeatureCollection', features: []},
      jsonpath: '$.features',
      data: {type: 'FeatureCollection', features: []}, // feature should be length 26
      schema: null,
      progress: {rowCount: 26, rowCountInBatch: 0},
      fileName: 'text-data-1.geojson'
    },
    done: false
  };
  t.equal(
    batch4.value.data.type,
    'FeatureCollection',
    'batch4 should data be a geojson feature collection'
  );
  t.deepEqual(batch4.value.progress, expected4.value.progress, 'batch4 should have progress');
  t.equal(batch4.value.fileName, expected4.value.fileName, 'batch4 should have fileName');
  t.equal(batch4.value.data.features.length, 26, 'batch4 return 26 features');

  const batch5 = await gen.next();
  t.deepEqual(batch5, {value: undefined, done: true}, 'batch5 should be done');

  // process geojson data received
  const processed = await processFileData({content: batch4.value, fileCache: []});
  const expectedInfo = {label: 'text-data-1.geojson', format: 'geojson'};

  t.equal(processed.length, 1, 'processFileData should return 1 result');
  t.ok(processed[0].info, 'processFileData should have info');
  t.ok(processed[0].data, 'processFileData should have data');
  t.deepEqual(processed[0].info, expectedInfo, 'info should be correct');
  const {fields, rows} = processed[0].data;
  fields.forEach((f, i) =>
    cmpField(
      t,
      geojsonFields[i],
      f,
      `should process correct geojson field ${geojsonFields[i].name}`
    )
  );
  rows.forEach((r, i) => {
    t.deepEqual(r, geojsonRows[i], `should process geojson row ${i} correctly`);
  });

  t.end();
});

test('#file-handler -> readFileInBatches.GeoJSON Single Feature -> processFileData', async t => {
  const geojsonFile = new File([featureString], 'text-data-1.geojson', {type: ''});
  let gen = null;
  try {
    gen = await readFileInBatches({file: geojsonFile, fileList: []});
  } catch (e) {
    t.equal(true, false, 'Should read file correctly');
    t.end();
    return;
  }

  // metadata batch
  const batch1 = await gen.next();

  const expected1 = {
    value: {
      batchType: 'metadata',
      metadata: {_loader: {}, _context: {}},
      data: [],
      bytesUsed: 0,
      progress: {rowCount: 0, rowCountInBatch: 0, percent: 0},
      fileName: 'text-data-1.geojson'
    },
    done: false
  };

  t.deepEqual(
    Object.keys(batch1.value).sort(),
    Object.keys(expected1.value).sort(),
    'value should have same keys'
  );

  t.equal(batch1.value.batchType, expected1.value.batchType, 'batch1.batchType should be the same');
  t.equal(batch1.value.fileName, expected1.value.fileName, 'batch1.fileName should be the same');
  t.deepEqual(batch1.value.data, expected1.value.data, 'batch1.data should be the same');
  t.deepEqual(
    batch1.value.progress,
    expected1.value.progress,
    'batch1.progress should be the same'
  );

  // final result batch
  const batch2 = await gen.next();
  const expected2 = {
    value: {
      batchType: 'final-result',
      container: processedFeature,
      jsonpath: null,
      data: processedFeature,
      schema: null,
      progress: {rowCount: 0, rowCountInBatch: 0},
      fileName: 'text-data-1.geojson'
    },
    done: false
  };

  t.deepEqual(
    batch2.value.batchType,
    expected2.value.batchType,
    'batch2 batchType should be a final-result'
  );
  t.deepEqual(
    batch2.value.data,
    expected2.value.data,
    'batch2 data should be a single geojson feature'
  );
  t.deepEqual(
    batch2.value.container,
    expected2.value.container,
    'batch2 container should be a single geojson feature'
  );
  t.equal(batch2.value.jsonpath, expected2.value.jsonpath, 'batch2 jsonpath should be null');
  t.deepEqual(batch2.value.progress, expected2.value.progress, 'batch2 progress should be correct');

  const batch3 = await gen.next();
  t.deepEqual(batch3, {value: undefined, done: true}, 'batch3 should be done');

  // process geojson data received
  const processed = await processFileData({content: batch2.value, fileCache: []});
  const expectedInfo = {label: 'text-data-1.geojson', format: 'geojson'};

  t.equal(processed.length, 1, 'processFileData should return 1 result');
  t.ok(processed[0].info, 'processFileData should have info');
  t.ok(processed[0].data, 'processFileData should have data');
  t.deepEqual(processed[0].info, expectedInfo, 'info should be correct');
  const {fields, rows} = processed[0].data;

  fields.forEach((f, i) =>
    cmpField(
      t,
      processedFeatureFields[i],
      f,
      `should process correct geojson field ${processedFeatureFields[i].name}`
    )
  );
  rows.forEach((r, i) => {
    t.deepEqual(r, processedFeatureRows[i], `should process geojson row ${i} correctly`);
  });

  t.end();
});

test('#file-handler -> readFileInBatches.row -> processFileData', async t => {
  const fileName = 'row-data.json';
  const rowFile = new File([rowDataString], fileName, {type: ''});

  let gen = null;
  try {
    gen = await readFileInBatches({file: rowFile, fileList: []});
  } catch (e) {
    t.equal(true, false, 'Should read file correctly');
    t.end();
    return;
  }

  // metadata batch
  const batch1 = await gen.next();

  const expected1 = {
    value: {
      batchType: 'metadata',
      metadata: {_loader: {}, _context: {}},
      data: [],
      bytesUsed: 0,
      progress: {rowCount: 0, rowCountInBatch: 0, percent: 0},
      fileName
    },
    done: false
  };
  t.deepEqual(
    Object.keys(batch1.value).sort(),
    Object.keys(expected1.value).sort(),
    'value should have same keys'
  );

  t.equal(batch1.value.batchType, expected1.value.batchType, 'batch1.batchType should be the same');
  t.equal(batch1.value.fileName, expected1.value.fileName, 'batch1.fileName should be the same');
  t.deepEqual(batch1.value.data, expected1.value.data, 'batch1.data should be the same');
  t.deepEqual(
    batch1.value.progress,
    expected1.value.progress,
    'batch1.progress should be the same'
  );

  const batch2 = await gen.next();
  const expected2 = {
    value: {
      batchType: 'partial-result',
      container: {}, // do not test
      data: [],
      bytesUsed: 0,
      schema: null,
      jsonpath: '$',
      progress: {rowCount: 0, rowCountInBatch: 0, percent: 0},
      fileName
    },
    done: false
  };
  t.deepEqual(batch2.value.batchType, expected2.value.batchType, 'batch2 should be partial-result');
  t.deepEqual(batch2.value.jsonpath, expected2.value.jsonpath, 'batch2 should be partial-result');
  t.deepEqual(batch2.value.progress, expected2.value.progress, 'batch2 progress should be correct');

  const batch3 = await gen.next();
  const expected3 = {
    value: {
      data: [],
      schema: null,
      length: 8,
      cursor: 0,
      count: 0,
      bytesUsed: 4552,
      jsonpath: '$',
      progress: {rowCount: 8, rowCountInBatch: 8, percent: 1},
      fileName
    },
    done: false
  };
  t.equal(batch3.value.data.length, 8, 'batch3 should data length 26');
  t.deepEqual(batch3.value.progress, expected3.value.progress, 'batch3 should have progress');
  t.equal(batch3.value.fileName, expected3.value.fileName, 'batch3 should have fileName');
  t.equal(batch3.value.length, expected3.value.length, 'batch3 should have length');

  const batch4 = await gen.next();
  const expected4 = {
    value: {
      batchType: 'final-result',
      container: {}, // do not test
      jsonpath: '$',
      data: [], // do not test
      schema: null,
      progress: {rowCount: 8, rowCountInBatch: 0},
      fileName
    },
    done: false
  };

  t.deepEqual(batch4.value.progress, expected4.value.progress, 'batch4 should have progress');
  t.equal(batch4.value.fileName, expected4.value.fileName, 'batch4 should have fileName');
  t.equal(batch4.value.data.length, 8, 'batch4 return 8 rows');

  const batch5 = await gen.next();
  t.deepEqual(batch5, {value: undefined, done: true}, 'batch5 should be done');

  const processed = await processFileData({content: batch4.value, fileCache: []});
  const expectedFileCache = [
    {
      data: {
        fields: parsedFields,
        rows: parsedRows
      },
      info: {label: fileName, format: 'row'}
    }
  ];
  t.equal(processed.length, 1, 'processFileData should return 1 result');
  t.ok(processed[0].info, 'processFileData should have info');
  t.ok(processed[0].data, 'processFileData should have data');
  t.deepEqual(processed[0].info, expectedFileCache[0].info, 'info should be correct');

  const {fields, rows} = processed[0].data;
  fields.forEach((f, i) =>
    cmpField(
      t,
      expectedFileCache[0].data.fields[i],
      f,
      `should process correct row object field ${parsedFields[i].name}`
    )
  );
  rows.forEach((r, i) => {
    t.deepEqual(r, expectedFileCache[0].data.rows[i], `should process row ${i} correctly`);
  });

  t.end();
});

test('#file-handler -> readFileInBatches.keplerMap -> processFileData', async t => {
  const fileName = 'keplergl.json';
  const keplerGlMap = new File([JSON.stringify(keplerglMap)], fileName, {type: ''});

  let gen = null;
  try {
    gen = await readFileInBatches({file: keplerGlMap, fileList: []});
  } catch (e) {
    t.equal(true, false, 'Should read file correctly');
    t.end();
    return;
  }

  // metadata batch
  const batch1 = await gen.next();

  const expected1 = {
    value: {
      batchType: 'metadata',
      metadata: {_loader: {}, _context: {}},
      data: [],
      bytesUsed: 0,
      progress: {rowCount: 0, rowCountInBatch: 0, percent: 0},
      fileName
    },
    done: false
  };
  t.deepEqual(
    Object.keys(batch1.value).sort(),
    Object.keys(expected1.value).sort(),
    'value should have same keys'
  );

  t.equal(batch1.value.batchType, expected1.value.batchType, 'batch1.batchType should be the same');
  t.equal(batch1.value.fileName, expected1.value.fileName, 'batch1.fileName should be the same');
  t.deepEqual(batch1.value.data, expected1.value.data, 'batch1.data should be the same');
  t.deepEqual(
    batch1.value.progress,
    expected1.value.progress,
    'batch1.progress should be the same'
  );

  const batch2 = await gen.next();
  const expected2 = {
    value: {
      batchType: 'partial-result',
      container: {}, // do not test
      data: [],
      bytesUsed: 0,
      schema: null,
      jsonpath: '$.datasets',
      progress: {rowCount: 0, rowCountInBatch: 0, percent: 0},
      fileName
    },
    done: false
  };
  t.deepEqual(batch2.value.batchType, expected2.value.batchType, 'batch2 should be partial-result');
  t.deepEqual(batch2.value.jsonpath, expected2.value.jsonpath, 'batch2 jsonapth should be correct');
  t.deepEqual(batch2.value.schema, expected2.value.schema, 'batch2 schema should be correct');
  t.deepEqual(batch2.value.progress, expected2.value.progress, 'batch2 progress should be correct');

  const batch3 = await gen.next();
  const expected3 = {
    value: {
      data: [],
      schema: null,
      length: 1,
      cursor: 0,
      count: 0,
      bytesUsed: 4552,
      jsonpath: '$.datasets',
      progress: {rowCount: 1, rowCountInBatch: 1, percent: 1},
      fileName
    },
    done: false
  };
  t.equal(batch3.value.data.length, 1, 'batch3 should data length 1');
  t.deepEqual(batch3.value.progress, expected3.value.progress, 'batch3 should have progress');
  t.equal(batch3.value.fileName, expected3.value.fileName, 'batch3 should have fileName');
  t.equal(batch3.value.length, expected3.value.length, 'batch3 should have length');

  const batch4 = await gen.next();
  const expected4 = {
    value: {
      batchType: 'final-result',
      container: {}, // do not test
      jsonpath: '$.datasets',
      data: [], // do not test
      schema: null,
      progress: {rowCount: 1, rowCountInBatch: 0},
      fileName
    },
    done: false
  };

  t.deepEqual(batch4.value.progress, expected4.value.progress, 'batch4 should have progress');
  t.deepEqual(batch4.value.batchType, expected4.value.batchType, 'batch4 should have batchType');
  t.equal(batch4.value.fileName, expected4.value.fileName, 'batch4 should have fileName');
  t.deepEqual(batch4.value.data, keplerglMap, 'batch4 should return saved kepler.gl map json');

  const batch5 = await gen.next();
  t.deepEqual(batch5, {value: undefined, done: true}, 'batch5 should be done');

  // process file
  const processed = await processFileData({content: batch4.value, fileCache: []});
  const expectedInfo = {label: fileName, format: 'keplergl'};

  const expectedFileCache = [
    {
      data: {
        datasets: [
          {
            data: {
              fields: parsedKeplerMapFields,
              rows: keplerglMap.datasets[0].data.allData
            },
            info: {id: 'a5ybmwl2d', label: 'geojson_as_string_small.csv', color: [53, 92, 125]}
          }
        ],
        config: keplerglMap.config
      },
      info: expectedInfo
    }
  ];

  t.equal(processed.length, 1, 'processFileData should return 1 result');
  t.ok(processed[0].info, 'processFileData should have info');
  t.ok(processed[0].data, 'processFileData should have data');
  t.deepEqual(processed[0].info, expectedInfo, 'info should be correct');

  t.deepEqual(
    Object.keys(processed[0].data),
    ['datasets', 'config'],
    'processFileData of keplergl json should have datasets and config'
  );
  t.deepEqual(
    Object.keys(processed[0].data.datasets[0].data),
    ['fields', 'rows'],
    'dataset should have fields and rows'
  );

  t.deepEqual(
    processed[0].data.datasets[0].data.rows,
    expectedFileCache[0].data.datasets[0].data.rows,
    'should load datasets rows'
  );

  t.deepEqual(
    processed[0].data.datasets[0].data.fields,
    expectedFileCache[0].data.datasets[0].data.fields,
    'should load and analyze datasets'
  );

  t.deepEqual(
    processed[0].data.datasets[0].info,
    expectedFileCache[0].data.datasets[0].info,
    'should load correct file info'
  );
  t.deepEqual(
    Object.keys(processed[0].data.config),
    ['visState', 'mapStyle', 'mapState'],
    'should prepare parsed config'
  );

  t.end();
});
