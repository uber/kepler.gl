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

import pick from 'lodash.pick';
import {console as globalConsole} from 'global/window';

import {VERSIONS} from './versions';
import Schema from './schema';
import {getFieldsFromData, getSampleForTypeAnalyze} from 'processors/data-processor';
import {createDataContainer} from 'utils/table-utils';

// version v0
const fieldPropertiesV0 = {
  name: null,
  type: null
};

const fieldPropertiesV1 = {
  name: null,
  type: null,
  format: null,
  analyzerType: null
};

class FieldSchema extends Schema {
  save(fields) {
    return {
      [this.key]: fields.map(f => this.savePropertiesOrApplySchema(f)[this.key])
    };
  }
  load(fields) {
    return {[this.key]: fields};
  }
}

const propertiesV0 = {
  id: null,
  label: null,
  color: null,
  allData: null,
  fields: new FieldSchema({
    key: 'fields',
    version: VERSIONS.v0,
    properties: fieldPropertiesV0
  })
};

const propertiesV1 = {
  ...propertiesV0,
  dataContainer: null, // TODO new properties version
  fields: new FieldSchema({
    key: 'fields',
    version: VERSIONS.v1,
    properties: fieldPropertiesV1
  })
};

class DatasetSchema extends Schema {
  key = 'dataset';

  save(dataset) {
    return this.savePropertiesOrApplySchema(dataset)[this.key];
  }
  load(dataset) {
    const {fields} = dataset;
    let {dataContainer} = dataset;
    let updatedFields = fields;

    // recalculate field type
    // because we have updated type-analyzer
    // we need to add format to each field
    const needCalculateMeta =
      fields[0] &&
      (!fields[0].hasOwnProperty('format') || !fields[0].hasOwnProperty('analyzerType'));

    // TODO new properties version
    if (!dataContainer) {
      dataContainer = createDataContainer(dataset.allData, {fields});
    }

    if (needCalculateMeta) {
      const fieldOrder = fields.map(f => f.name);

      const sampleData = getSampleForTypeAnalyze({fields: fieldOrder, dataContainer});
      const meta = getFieldsFromData(sampleData, fieldOrder);

      updatedFields = meta.map((f, i) => ({
        ...pick(meta[i], ['name', 'type', 'format']),
        analyzerType: meta[i].analyzerType
      }));

      updatedFields.forEach((f, i) => {
        if (fields[i].type !== f.type) {
          // if newly detected field type is different from saved type
          // we log it but won't update it, cause we don't want to break people's map
          globalConsole.warn(`detect ${f.name} type is now ${f.type} instead of ${fields[i].type}`);
        }
      });
    }

    // get format of all fields
    return {
      data: {fields: updatedFields, dataContainer},
      info: pick(dataset, ['id', 'label', 'color'])
    };
  }
}

const datasetSchema = {
  [VERSIONS.v0]: new DatasetSchema({
    key: 'dataset',
    version: VERSIONS.v0,
    properties: propertiesV0
  }),
  [VERSIONS.v1]: new DatasetSchema({
    key: 'dataset',
    version: VERSIONS.v1,
    properties: propertiesV1
  })
};

export default datasetSchema;
