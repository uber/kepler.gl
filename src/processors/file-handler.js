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

import '@loaders.gl/polyfills';
import {parseInBatches} from '@loaders.gl/core';
import {JSONLoader, _JSONPath} from '@loaders.gl/json';
import {CSVLoader} from '@loaders.gl/csv';
import {processGeojson, processKeplerglJSON, processRowObject} from './data-processor';
import {isPlainObject, generateHashId} from 'utils/utils';
import {DATASET_FORMATS} from 'constants/default-settings';

const BATCH_TYPE = {
  METADATA: 'metadata',
  PARTIAL_RESULT: 'partial-result',
  FINAL_RESULT: 'final-result'
};

const CSV_LOADER_OPTIONS = {
  batchSize: 4000, // Auto de tect number of rows per batch (network batch size)
  rowFormat: 'object',
  dynamicTyping: false // not working for now
};

const JSON_LOADER_OPTIONS = {
  // instruct loaders.gl on what json paths to stream
  jsonpaths: [
    '$', // JSON Row array
    '$.features', // GeoJSON
    '$.datasets' // KeplerGL JSON
  ]
};

export function isGeoJson(json) {
  // json can be feature collection
  // or single feature
  return isPlainObject(json) && (isFeature(json) || isFeatureCollection(json));
}

export function isFeature(json) {
  return json.type === 'Feature' && json.geometry;
}

export function isFeatureCollection(json) {
  return json.type === 'FeatureCollection' && json.features;
}

export function isRowObject(json) {
  return Array.isArray(json) && isPlainObject(json[0]);
}

export function isKeplerGlMap(json) {
  return Boolean(
    isPlainObject(json) &&
      json.datasets &&
      json.config &&
      json.info &&
      json.info.app === 'kepler.gl'
  );
}

export async function* makeProgressIterator(asyncIterator, info) {
  let rowCount = 0;

  for await (const batch of asyncIterator) {
    const rowCountInBatch = (batch.data && batch.data.length) || 0;
    rowCount += rowCountInBatch;
    const percent = Number.isFinite(batch.bytesUsed) ? batch.bytesUsed / info.size : null;

    // Update progress object
    const progress = {
      rowCount,
      rowCountInBatch,
      // @ts-ignore
      ...(Number.isFinite(percent) ? {percent} : {})
    };

    yield {...batch, progress};
  }
}

// eslint-disable-next-line complexity
export async function* readBatch(asyncIterator, fileName) {
  let result = null;
  const batches = [];

  for await (const batch of asyncIterator) {
    // Last batch will have this special type and will provide all the root
    // properties of the parsed document.
    // Only json parse will have `FINAL_RESULT`
    if (batch.batchType === BATCH_TYPE.FINAL_RESULT) {
      if (batch.container) {
        result = {...batch.container};
      }
      // Set the streamed data correctly is Batch json path is set
      // and the path streamed is not the top level object (jsonpath = '$')
      if (batch.jsonpath && batch.jsonpath.length > 1) {
        const streamingPath = new _JSONPath(batch.jsonpath);
        streamingPath.setFieldAtPath(result, batches);
      } else if (batch.jsonpath && batch.jsonpath.length === 1) {
        // The streamed object is a ROW JSON-batch (jsonpath = '$')
        // row objects
        result = batches;
      }
    } else {
      for (let i = 0; i < batch.data.length; i++) {
        batches.push(batch.data[i]);
      }
    }

    yield {
      ...batch,
      ...(batch.schema ? {headers: Object.keys(batch.schema)} : {}),
      fileName,
      // if dataset is CSV, data is set to the raw batches
      data: result ? result : batches
    };
  }
}

export async function readFileInBatches({file, fileCache = [], loaders = [], loadOptions = {}}) {
  loaders = [JSONLoader, CSVLoader, ...loaders];
  loadOptions = {
    csv: CSV_LOADER_OPTIONS,
    json: JSON_LOADER_OPTIONS,
    metadata: true,
    ...loadOptions
  };

  const batchIterator = await parseInBatches(file, loaders, loadOptions);
  const progressIterator = makeProgressIterator(batchIterator, {size: file.size});

  return readBatch(progressIterator, file.name);
}

export function processFileData({content, fileCache}) {
  return new Promise((resolve, reject) => {
    const {data} = content;

    let format;
    let processor;
    if (isKeplerGlMap(data)) {
      format = DATASET_FORMATS.keplergl;
      processor = processKeplerglJSON;
    } else if (isRowObject(data)) {
      format = DATASET_FORMATS.row;
      processor = processRowObject;
    } else if (isGeoJson(data)) {
      format = DATASET_FORMATS.geojson;
      processor = processGeojson;
    }

    if (format && processor) {
      const result = processor(data);

      resolve([
        ...fileCache,
        {
          // TODO {rows, fields} here
          data: result,
          info: {
            label: content.fileName,
            format
          }
        }
      ]);
    }

    reject('Unknow File Format');
  });
}

export function filesToDataPayload(fileCache) {
  // seperate out files which could be a single datasets. or a keplergl map json
  const collection = fileCache.reduce(
    (accu, file) => {
      const {data, info = {}} = file;
      const {format} = info;
      if (format === DATASET_FORMATS.keplergl) {
        // if file contains a single kepler map dataset & config
        accu.keplerMaps.push({
          ...data,
          options: {
            centerMap: !(data.config && data.config.mapState)
          }
        });
      } else if (DATASET_FORMATS[format]) {
        // if file contains only data
        const newDataset = {
          // TODO {rows, fields} here
          data,
          info: {
            id: info.id || generateHashId(4),
            ...info
          }
        };
        accu.datasets.push(newDataset);
      }
      return accu;
    },
    {datasets: [], keplerMaps: []}
  );

  // add kepler map first with config
  // add datasets later in one add data call
  return collection.keplerMaps.concat({datasets: collection.datasets});
}
