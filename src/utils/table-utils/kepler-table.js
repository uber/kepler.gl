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

import {console as Console} from 'global/console';
import {TRIP_POINT_FIELDS, SORT_ORDER} from 'constants/default-settings';
import {ascending, descending} from 'd3-array';

// import {validateInputData} from 'processors/data-processor';
import {generateHashId} from 'utils/utils';
import {getGpuFilterProps, getDatasetFieldIndexForFilter} from 'utils/gpu-filter-utils';
import {
  getFilterProps,
  getFilterRecord,
  diffFilters,
  getFilterFunction,
  filterDataByFilterTypes,
  getNumericFieldDomain,
  getTimestampFieldDomain
} from 'utils/filter-utils';
import {maybeToDate, getSortingFunction} from 'utils/data-utils';
import {
  getQuantileDomain,
  getOrdinalDomain,
  getLogDomain,
  getLinearDomain
} from 'utils/data-scale-utils';

import {ALL_FIELD_TYPES, SCALE_TYPES} from 'constants/default-settings';

import {createDataContainer} from './data-container-utils';

// Unique identifier of each field
const FID_KEY = 'name';

/** @typedef {import('./kepler-table').KeplerTable} KeplerTableClass} */

/**
 * @type {KeplerTableClass}
 */
class KeplerTable {
  constructor({info = {}, data, color, metadata}) {
    // TODO - what to do if validation fails? Can kepler handle exceptions?
    // const validatedData = validateInputData(data);
    // if (!validatedData) {
    //   return this;
    // }

    // TODO In some cases we end up with existing data container when we create KeplerTable (tests)
    const dataContainer =
      data.dataContainer || createDataContainer(data.rows, {fields: data.fields});

    const datasetInfo = {
      id: generateHashId(4),
      label: 'new dataset',
      ...(info || {})
    };
    const dataId = datasetInfo.id;

    const fields = data.fields.map((f, i) => ({
      ...f,
      fieldIdx: i,
      valueAccessor: maybeToDate.bind(
        null,
        // is time
        f.type === ALL_FIELD_TYPES.timestamp,
        i,
        f.format
      )
    }));

    const allIndexes = dataContainer.getPlainIndex();

    this.id = datasetInfo.id;
    this.label = datasetInfo.label;
    this.color = color;
    this.metadata = {
      ...metadata,
      id: datasetInfo.id,
      label: datasetInfo.label
    };

    this.dataContainer = dataContainer;
    this.allIndexes = allIndexes;
    this.filteredIndex = allIndexes;
    this.filteredIndexForDomain = allIndexes;
    this.fieldPairs = findPointFieldPairs(fields);
    this.fields = fields;
    this.gpuFilter = getGpuFilterProps([], dataId, fields);
  }

  /**
   * Get field
   * @param columnName
   */
  getColumnField(columnName) {
    const field = this.fields.find(fd => fd[FID_KEY] === columnName);
    this._assetField(columnName, field);
    return field;
  }

  /**
   * Get fieldIdx
   * @param columnName
   */
  getColumnFieldIdx(columnName) {
    const fieldIdx = this.fields.findIndex(fd => fd[FID_KEY] === columnName);
    this._assetField(columnName, Boolean(fieldIdx > -1));
    return fieldIdx;
  }

  /**
   * Get the value of a cell
   */
  getValue(columnName, rowIdx) {
    const field = this.getColumnField(columnName);

    const row = this.dataContainer.row(rowIdx, true);
    const rawRow = row.values();
    return field ? field.valueAccessor(rawRow) : null;
  }

  /**
   * Updates existing field with a new object
   * @param fieldIdx
   * @param newField
   */
  updateColumnField(fieldIdx, newField) {
    this.fields = Object.assign([...this.fields], {[fieldIdx]: newField});
  }

  /**
   * Save filterProps to field and retrieve it
   * @param {string} columnName
   */
  getColumnFilterProps(columnName) {
    const fieldIdx = this.getColumnFieldIdx(columnName);
    if (fieldIdx < 0) {
      return null;
    }
    const field = this.fields[fieldIdx];
    if (field.hasOwnProperty('filterProps')) {
      return field.filterProps;
    }

    const fieldDomain = this.getColumnFilterDomain(field);
    if (!fieldDomain) {
      return null;
    }

    const filterProps = getFilterProps(field, fieldDomain);
    const newField = {
      ...field,
      filterProps
    };

    this.updateColumnField(fieldIdx, newField);

    return filterProps;
  }

  /**
   *
   * Apply filters to dataset, return the filtered dataset with updated `gpuFilter`, `filterRecord`, `filteredIndex`, `filteredIndexForDomain`
   * @param filters
   * @param layers
   * @param opt
   */
  filterTable(filters, layers, opt) {
    const {dataContainer, id: dataId, filterRecord: oldFilterRecord, fields} = this;

    // if there is no filters
    const filterRecord = getFilterRecord(dataId, filters, opt || {});

    this.filterRecord = filterRecord;
    this.gpuFilter = getGpuFilterProps(filters, dataId, fields);

    // const newDataset = set(['filterRecord'], filterRecord, dataset);

    if (!filters.length) {
      this.filteredIndex = this.allIndexes;
      this.filteredIndexForDomain = this.allIndexes;
      return this;
    }

    this.changedFilters = diffFilters(filterRecord, oldFilterRecord);

    // generate 2 sets of filter result
    // filteredIndex used to calculate layer data
    // filteredIndexForDomain used to calculate layer Domain
    const shouldCalDomain = Boolean(this.changedFilters.dynamicDomain);
    const shouldCalIndex = Boolean(this.changedFilters.cpu);

    let filterResult = {};
    if (shouldCalDomain || shouldCalIndex) {
      const dynamicDomainFilters = shouldCalDomain ? filterRecord.dynamicDomain : null;
      const cpuFilters = shouldCalIndex ? filterRecord.cpu : null;

      const filterFuncs = filters.reduce((acc, filter) => {
        const fieldIndex = getDatasetFieldIndexForFilter(this.id, filter);
        const field = fieldIndex !== -1 ? fields[fieldIndex] : null;

        return {
          ...acc,
          [filter.id]: getFilterFunction(field, this.id, filter, layers)
        };
      }, {});

      filterResult = filterDataByFilterTypes(
        {dynamicDomainFilters, cpuFilters, filterFuncs},
        dataContainer
      );
    }

    this.filteredIndex = filterResult.filteredIndex || this.filteredIndex;
    this.filteredIndexForDomain =
      filterResult.filteredIndexForDomain || this.filteredIndexForDomain;

    return this;
  }

  /**
   * Apply filters to a dataset all on CPU, assign to `filteredIdxCPU`, `filterRecordCPU`
   * @param filters
   * @param layers
   */
  filterTableCPU(filters, layers) {
    const opt = {
      cpuOnly: true,
      ignoreDomain: true
    };

    // no filter
    if (!filters.length) {
      this.filteredIdxCPU = this.allIndexes;
      this.filterRecordCPU = getFilterRecord(this.id, filters, opt);
      return this;
    }

    // no gpu filter
    if (!filters.find(f => f.gpu)) {
      this.filteredIdxCPU = this.filteredIndex;
      this.filterRecordCPU = getFilterRecord(this.id, filters, opt);
      return this;
    }

    // make a copy for cpu filtering
    const copied = copyTable(this);

    copied.filterRecord = this.filterRecordCPU;
    copied.filteredIndex = this.filteredIdxCPU || [];

    const filtered = copied.filterTable(filters, layers, opt);

    this.filteredIdxCPU = filtered.filteredIndex;
    this.filterRecordCPU = filtered.filterRecord;

    return this;
  }

  /**
   * Calculate field domain based on field type and data
   * for Filter
   */
  getColumnFilterDomain(field) {
    const {dataContainer} = this;
    const {valueAccessor} = field;

    let domain;

    switch (field.type) {
      case ALL_FIELD_TYPES.real:
      case ALL_FIELD_TYPES.integer:
        // calculate domain and step
        return getNumericFieldDomain(dataContainer, valueAccessor);

      case ALL_FIELD_TYPES.boolean:
        return {domain: [true, false]};

      case ALL_FIELD_TYPES.string:
      case ALL_FIELD_TYPES.date:
        domain = getOrdinalDomain(dataContainer, valueAccessor);
        return {domain};

      case ALL_FIELD_TYPES.timestamp:
        return getTimestampFieldDomain(dataContainer, valueAccessor);

      default:
        return {domain: getOrdinalDomain(dataContainer, valueAccessor)};
    }
  }

  /**
   *  Get the domain of this column based on scale type
   */
  getColumnLayerDomain(field, scaleType) {
    const {dataContainer, filteredIndexForDomain} = this;

    if (!SCALE_TYPES[scaleType]) {
      Console.error(`scale type ${scaleType} not supported`);
      return null;
    }

    const {valueAccessor} = field;
    const indexValueAccessor = i => valueAccessor(dataContainer.row(i));
    const sortFunction = getSortingFunction(field.type);

    switch (scaleType) {
      case SCALE_TYPES.ordinal:
      case SCALE_TYPES.point:
        // do not recalculate ordinal domain based on filtered data
        // don't need to update ordinal domain every time
        return getOrdinalDomain(dataContainer, valueAccessor);

      case SCALE_TYPES.quantile:
        return getQuantileDomain(filteredIndexForDomain, indexValueAccessor, sortFunction);

      case SCALE_TYPES.log:
        return getLogDomain(filteredIndexForDomain, indexValueAccessor);

      case SCALE_TYPES.quantize:
      case SCALE_TYPES.linear:
      case SCALE_TYPES.sqrt:
      default:
        return getLinearDomain(filteredIndexForDomain, indexValueAccessor);
    }
  }

  /**
   * Get a sample of rows to calculate layer boundaries
   */
  // getSampleData(rows)

  /**
   * Parse cell value based on column type and return a string representation
   * Value the field value, type the field type
   */
  // parseFieldValue(value, type)

  // sortDatasetByColumn()

  /**
   * Assert whether field exist
   * @param fieldName
   * @param condition
   */
  _assetField(fieldName, condition) {
    if (!condition) {
      Console.error(`${fieldName} doesnt exist in dataset ${this.id}`);
    }
  }
}

// HELPER FUNCTIONS (MAINLY EXPORTED FOR TEST...)

export function removeSuffixAndDelimiters(layerName, suffix) {
  return layerName
    .replace(new RegExp(suffix, 'ig'), '')
    .replace(/[_,.]+/g, ' ')
    .trim();
}

/**
 * Find point fields pairs from fields
 *
 * @param fields
 * @returns found point fields
 * @type {typeof import('./kepler-table').findPointFieldPairs}
 */
export function findPointFieldPairs(fields) {
  const allNames = fields.map(f => f.name.toLowerCase());

  // get list of all fields with matching suffixes
  return allNames.reduce((carry, fieldName, idx) => {
    // This search for pairs will early exit if found.
    for (const suffixPair of TRIP_POINT_FIELDS) {
      // match first suffix```
      if (fieldName.endsWith(suffixPair[0])) {
        // match second suffix
        const otherPattern = new RegExp(`${suffixPair[0]}\$`);
        const partner = fieldName.replace(otherPattern, suffixPair[1]);

        const partnerIdx = allNames.findIndex(d => d === partner);
        if (partnerIdx > -1) {
          const defaultName = removeSuffixAndDelimiters(fieldName, suffixPair[0]);

          carry.push({
            defaultName,
            pair: {
              lat: {
                fieldIdx: idx,
                value: fields[idx].name
              },
              lng: {
                fieldIdx: partnerIdx,
                value: fields[partnerIdx].name
              }
            },
            suffix: suffixPair
          });
          return carry;
        }
      }
    }
    return carry;
  }, []);
}

/**
 *
 * @param dataset
 * @param column
 * @param mode
 * @type {typeof import('./kepler-table').sortDatasetByColumn}
 */
export function sortDatasetByColumn(dataset, column, mode) {
  const {allIndexes, fields, dataContainer} = dataset;
  const fieldIndex = fields.findIndex(f => f.name === column);
  if (fieldIndex < 0) {
    return dataset;
  }

  const sortBy = SORT_ORDER[mode] || SORT_ORDER.ASCENDING;

  if (sortBy === SORT_ORDER.UNSORT) {
    return {
      ...dataset,
      sortColumn: {},
      sortOrder: null
    };
  }

  const sortFunction = sortBy === SORT_ORDER.ASCENDING ? ascending : descending;
  const sortOrder = allIndexes
    .slice()
    .sort((a, b) =>
      sortFunction(dataContainer.valueAt(a, fieldIndex), dataContainer.valueAt(b, fieldIndex))
    );

  return {
    ...dataset,
    sortColumn: {
      [column]: sortBy
    },
    sortOrder
  };
}

export function copyTable(original) {
  // TODO figure out whether copy logic makes sense with a data container
  return Object.assign(Object.create(Object.getPrototypeOf(original)), original);
}

export function copyTableAndUpdate(original, options = {}) {
  // TODO figure out whether copy logic makes sense with a data container
  return Object.entries(options).reduce((acc, entry) => {
    acc[entry[0]] = entry[1];
    return acc;
  }, copyTable(original));
}

export default KeplerTable;
