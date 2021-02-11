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

import {ascending, extent, histogram as d3Histogram, ticks} from 'd3-array';
import keyMirror from 'keymirror';
import {console as Console} from 'global/console';
import get from 'lodash.get';
import isEqual from 'lodash.isequal';

import booleanWithin from '@turf/boolean-within';
import {point as turfPoint} from '@turf/helpers';
import {Decimal} from 'decimal.js';
import {ALL_FIELD_TYPES, FILTER_TYPES, ANIMATION_WINDOW} from 'constants/default-settings';
import {notNullorUndefined, unique, timeToUnixMilli} from './data-utils';
import * as ScaleUtils from './data-scale-utils';
import {LAYER_TYPES} from 'layers/types';
import {generateHashId, set, toArray} from './utils';
import {getCentroid, h3IsValid} from 'layers/h3-hexagon-layer/h3-utils';

// TYPE
/** @typedef {import('./table-utils/kepler-table').FilterRecord} FilterRecord */
/** @typedef {import('./filter-utils').FilterResult} FilterResult */

export const TimestampStepMap = [
  {max: 1, step: 0.05},
  {max: 10, step: 0.1},
  {max: 100, step: 1},
  {max: 500, step: 5},
  {max: 1000, step: 10},
  {max: 5000, step: 50},
  {max: Number.POSITIVE_INFINITY, step: 1000}
];

export const histogramBins = 30;
export const enlargedHistogramBins = 100;

const durationSecond = 1000;
const durationMinute = durationSecond * 60;
const durationHour = durationMinute * 60;
const durationDay = durationHour * 24;
const durationWeek = durationDay * 7;
const durationYear = durationDay * 365;

export const PLOT_TYPES = keyMirror({
  histogram: null,
  lineChart: null
});

export const FILTER_UPDATER_PROPS = keyMirror({
  dataId: null,
  name: null,
  layerId: null
});

export const LIMITED_FILTER_EFFECT_PROPS = keyMirror({
  [FILTER_UPDATER_PROPS.name]: null
});
/**
 * Max number of filter value buffers that deck.gl provides
 */

const SupportedPlotType = {
  [FILTER_TYPES.timeRange]: {
    default: 'histogram',
    [ALL_FIELD_TYPES.integer]: 'lineChart',
    [ALL_FIELD_TYPES.real]: 'lineChart'
  },
  [FILTER_TYPES.range]: {
    default: 'histogram',
    [ALL_FIELD_TYPES.integer]: 'lineChart',
    [ALL_FIELD_TYPES.real]: 'lineChart'
  }
};

export const FILTER_COMPONENTS = {
  [FILTER_TYPES.select]: 'SingleSelectFilter',
  [FILTER_TYPES.multiSelect]: 'MultiSelectFilter',
  [FILTER_TYPES.timeRange]: 'TimeRangeFilter',
  [FILTER_TYPES.range]: 'RangeFilter',
  [FILTER_TYPES.polygon]: 'PolygonFilter'
};

export const DEFAULT_FILTER_STRUCTURE = {
  dataId: [], // [string]
  freeze: false,
  id: null,

  // time range filter specific
  fixedDomain: false,
  enlarged: false,
  isAnimating: false,
  animationWindow: ANIMATION_WINDOW.free,
  speed: 1,

  // field specific
  name: [], // string
  type: null,
  fieldIdx: [], // [integer]
  domain: null,
  value: null,

  // plot
  plotType: PLOT_TYPES.histogram,
  yAxis: null,
  interval: null,

  // mode
  gpu: false
};

export const FILTER_ID_LENGTH = 4;

export const LAYER_FILTERS = [FILTER_TYPES.polygon];

/**
 * Generates a filter with a dataset id as dataId
 * @type {typeof import('./filter-utils').getDefaultFilter}
 */
export function getDefaultFilter(dataId) {
  return {
    ...DEFAULT_FILTER_STRUCTURE,
    // store it as dataId and it could be one or many
    dataId: toArray(dataId),
    id: generateHashId(FILTER_ID_LENGTH)
  };
}

/**
 * Check if a filter is valid based on the given dataId
 * @param  filter to validate
 * @param  datasetId id to validate filter against
 * @return true if a filter is valid, false otherwise
 * @type {typeof import('./filter-utils').shouldApplyFilter}
 */
export function shouldApplyFilter(filter, datasetId) {
  const dataIds = toArray(filter.dataId);
  return dataIds.includes(datasetId) && filter.value !== null;
}

/**
 * Validates and modifies polygon filter structure
 * @param dataset
 * @param filter
 * @param layers
 * @return - {filter, dataset}
 * @type {typeof import('./filter-utils').validatePolygonFilter}
 */
export function validatePolygonFilter(dataset, filter, layers) {
  const failed = {dataset, filter: null};
  const {value, layerId, type, dataId} = filter;

  if (!layerId || !isValidFilterValue(type, value)) {
    return failed;
  }

  const isValidDataset = dataId.includes(dataset.id);

  if (!isValidDataset) {
    return failed;
  }

  const layer = layers.find(l => layerId.includes(l.id));

  if (!layer) {
    return failed;
  }

  return {
    filter: {
      ...filter,
      freeze: true,
      fieldIdx: []
    },
    dataset
  };
}

/**
 * Custom filter validators
 */
const filterValidators = {
  [FILTER_TYPES.polygon]: validatePolygonFilter
};

/**
 * Default validate filter function
 * @param dataset
 * @param filter
 * @return - {filter, dataset}
 * @type {typeof import('./filter-utils').validateFilter}
 */
export function validateFilter(dataset, filter) {
  // match filter.dataId
  const failed = {dataset, filter: null};
  const filterDataId = toArray(filter.dataId);

  const filterDatasetIndex = filterDataId.indexOf(dataset.id);
  if (filterDatasetIndex < 0) {
    // the current filter is not mapped against the current dataset
    return failed;
  }

  const initializeFilter = {
    ...getDefaultFilter(filter.dataId),
    ...filter,
    dataId: filterDataId,
    name: toArray(filter.name)
  };

  const fieldName = initializeFilter.name[filterDatasetIndex];
  const {filter: updatedFilter, dataset: updatedDataset} = applyFilterFieldName(
    initializeFilter,
    dataset,
    fieldName,
    filterDatasetIndex,
    {mergeDomain: true}
  );

  if (!updatedFilter) {
    return failed;
  }

  updatedFilter.value = adjustValueToFilterDomain(filter.value, updatedFilter);
  updatedFilter.enlarged =
    typeof filter.enlarged === 'boolean' ? filter.enlarged : updatedFilter.enlarged;

  if (updatedFilter.value === null) {
    // cannot adjust saved value to filter
    return failed;
  }

  return {
    filter: validateFilterYAxis(updatedFilter, updatedDataset),
    dataset: updatedDataset
  };
}

/**
 * Validate saved filter config with new data,
 * calculate domain and fieldIdx based new fields and data
 *
 * @param dataset
 * @param filter - filter to be validate
 * @param layers - layers
 * @return validated filter
 * @type {typeof import('./filter-utils').validateFilterWithData}
 */
export function validateFilterWithData(dataset, filter, layers) {
  // @ts-ignore
  return filterValidators.hasOwnProperty(filter.type)
    ? filterValidators[filter.type](dataset, filter, layers)
    : validateFilter(dataset, filter);
}

/**
 * Validate YAxis
 * @param filter
 * @param dataset
 * @return {*}
 */
function validateFilterYAxis(filter, dataset) {
  // TODO: validate yAxis against other datasets

  const {fields} = dataset;
  const {yAxis} = filter;
  // TODO: validate yAxis against other datasets
  if (yAxis) {
    const matchedAxis = fields.find(({name, type}) => name === yAxis.name && type === yAxis.type);

    filter = matchedAxis
      ? {
          ...filter,
          yAxis: matchedAxis,
          ...getFilterPlot({...filter, yAxis: matchedAxis}, dataset)
        }
      : filter;
  }

  return filter;
}

/**
 * Get default filter prop based on field type
 *
 * @param field
 * @param fieldDomain
 * @returns default filter
 * @type {typeof import('./filter-utils').getFilterProps}
 */
export function getFilterProps(field, fieldDomain) {
  const filterProps = {
    ...fieldDomain,
    fieldType: field.type
  };

  switch (field.type) {
    case ALL_FIELD_TYPES.real:
    case ALL_FIELD_TYPES.integer:
      return {
        ...filterProps,
        value: fieldDomain.domain,
        type: FILTER_TYPES.range,
        typeOptions: [FILTER_TYPES.range],
        gpu: true
      };

    case ALL_FIELD_TYPES.boolean:
      return {
        ...filterProps,
        type: FILTER_TYPES.select,
        value: true,
        gpu: false
      };

    case ALL_FIELD_TYPES.string:
    case ALL_FIELD_TYPES.date:
      return {
        ...filterProps,
        type: FILTER_TYPES.multiSelect,
        value: [],
        gpu: false
      };

    case ALL_FIELD_TYPES.timestamp:
      return {
        ...filterProps,
        type: FILTER_TYPES.timeRange,
        enlarged: true,
        fixedDomain: true,
        value: filterProps.domain,
        gpu: true
      };

    default:
      return {};
  }
}

export const getPolygonFilterFunctor = (layer, filter) => {
  const getPosition = layer.getPositionAccessor();

  switch (layer.type) {
    case LAYER_TYPES.point:
    case LAYER_TYPES.icon:
      return data => {
        const pos = getPosition({data});
        return pos.every(Number.isFinite) && isInPolygon(pos, filter.value);
      };
    case LAYER_TYPES.arc:
    case LAYER_TYPES.line:
      return data => {
        const pos = getPosition({data});
        return (
          pos.every(Number.isFinite) &&
          [
            [pos[0], pos[1]],
            [pos[3], pos[4]]
          ].every(point => isInPolygon(point, filter.value))
        );
      };
    case LAYER_TYPES.hexagonId:
      if (layer.dataToFeature && layer.dataToFeature.centroids) {
        return (data, index) => {
          // null or getCentroid({id})
          const centroid = layer.dataToFeature.centroids[index];
          return centroid && isInPolygon(centroid, filter.value);
        };
      }
      return data => {
        const id = getPosition({data});
        if (!h3IsValid(id)) {
          return false;
        }
        const pos = getCentroid({id});
        return pos.every(Number.isFinite) && isInPolygon(pos, filter.value);
      };
    default:
      return () => true;
  }
};

/**
 * @param field dataset Field
 * @param dataId Dataset id
 * @param filter Filter object
 * @param layers list of layers to filter upon
 * @return filterFunction
 * @type {typeof import('./filter-utils').getFilterFunction}
 */
export function getFilterFunction(field, dataId, filter, layers) {
  // field could be null in polygon filter
  const valueAccessor = field ? field.valueAccessor : data => null;
  const defaultFunc = d => true;

  switch (filter.type) {
    case FILTER_TYPES.range:
      return data => isInRange(valueAccessor(data), filter.value);
    case FILTER_TYPES.multiSelect:
      return data => filter.value.includes(valueAccessor(data));
    case FILTER_TYPES.select:
      return data => valueAccessor(data) === filter.value;
    case FILTER_TYPES.timeRange:
      if (!field) {
        return defaultFunc;
      }
      const mappedValue = get(field, ['filterProps', 'mappedValue']);
      const accessor = Array.isArray(mappedValue)
        ? (data, index) => mappedValue[index]
        : data => timeToUnixMilli(valueAccessor(data), field.format);
      return (data, index) => isInRange(accessor(data, index), filter.value);
    case FILTER_TYPES.polygon:
      if (!layers || !layers.length) {
        return defaultFunc;
      }
      // @ts-ignore
      const layerFilterFunctions = filter.layerId
        .map(id => layers.find(l => l.id === id))
        .filter(l => l && l.config.dataId === dataId)
        .map(layer => getPolygonFilterFunctor(layer, filter));

      return (data, index) => layerFilterFunctions.every(filterFunc => filterFunc(data, index));
    default:
      return defaultFunc;
  }
}

export function updateFilterDataId(dataId) {
  return getDefaultFilter(dataId);
}

/**
 * @type {typeof import('./filter-utils').filterDataByFilterTypes}
 */
export function filterDataByFilterTypes(
  {dynamicDomainFilters, cpuFilters, filterFuncs},
  dataContainer
) {
  const result = {
    ...(dynamicDomainFilters ? {filteredIndexForDomain: []} : {}),
    ...(cpuFilters ? {filteredIndex: []} : {})
  };

  const filterContext = {row: dataContainer.row(0, true), rowIndex: -1};

  const filterFuncCaller = filter =>
    filterFuncs[filter.id](filterContext.row, filterContext.rowIndex);

  for (const row of dataContainer.rows(true)) {
    filterContext.rowIndex++;
    filterContext.row = row;

    const matchForDomain = dynamicDomainFilters && dynamicDomainFilters.every(filterFuncCaller);
    if (matchForDomain) {
      // @ts-ignore
      result.filteredIndexForDomain.push(filterContext.rowIndex);
    }

    const matchForRender = cpuFilters && cpuFilters.every(filterFuncCaller);
    if (matchForRender) {
      // @ts-ignore
      result.filteredIndex.push(filterContext.rowIndex);
    }
  }

  return result;
}

/**
 * Get a record of filters based on domain type and gpu / cpu
 * @type {typeof import('./filter-utils').getFilterRecord}
 */
export function getFilterRecord(dataId, filters, opt = {}) {
  /**
   * @type {FilterRecord}
   */
  const filterRecord = {
    dynamicDomain: [],
    fixedDomain: [],
    cpu: [],
    gpu: []
  };

  filters.forEach(f => {
    if (isValidFilterValue(f.type, f.value) && toArray(f.dataId).includes(dataId)) {
      (f.fixedDomain || opt.ignoreDomain
        ? filterRecord.fixedDomain
        : filterRecord.dynamicDomain
      ).push(f);

      (f.gpu && !opt.cpuOnly ? filterRecord.gpu : filterRecord.cpu).push(f);
    }
  });

  return filterRecord;
}

/**
 * Compare filter records to get what has changed
 * @type {typeof import('./filter-utils').diffFilters}
 */
export function diffFilters(filterRecord, oldFilterRecord = {}) {
  let filterChanged = {};

  Object.entries(filterRecord).forEach(([record, items]) => {
    items.forEach(filter => {
      const oldFilter = (oldFilterRecord[record] || []).find(f => f.id === filter.id);

      if (!oldFilter) {
        // added
        filterChanged = set([record, filter.id], 'added', filterChanged);
      } else {
        // check  what has changed
        ['name', 'value', 'dataId'].forEach(prop => {
          if (filter[prop] !== oldFilter[prop]) {
            filterChanged = set([record, filter.id], `${prop}_changed`, filterChanged);
          }
        });
      }
    });

    (oldFilterRecord[record] || []).forEach(oldFilter => {
      // deleted
      if (!items.find(f => f.id === oldFilter.id)) {
        filterChanged = set([record, oldFilter.id], 'deleted', filterChanged);
      }
    });

    if (!filterChanged[record]) {
      filterChanged[record] = null;
    }
  });

  // @ts-ignore
  return filterChanged;
}
/**
 * Call by parsing filters from URL
 * Check if value of filter within filter domain, if not adjust it to match
 * filter domain
 *
 * @type {typeof import('./filter-utils').adjustValueToFilterDomain}
 * @returns value - adjusted value to match filter or null to remove filter
 */
/* eslint-disable complexity */
export function adjustValueToFilterDomain(value, {domain, type}) {
  if (!domain || !type) {
    return false;
  }

  switch (type) {
    case FILTER_TYPES.range:
    case FILTER_TYPES.timeRange:
      if (!Array.isArray(value) || value.length !== 2) {
        return domain.map(d => d);
      }

      return value.map((d, i) => (notNullorUndefined(d) && isInRange(d, domain) ? d : domain[i]));

    case FILTER_TYPES.multiSelect:
      if (!Array.isArray(value)) {
        return [];
      }
      const filteredValue = value.filter(d => domain.includes(d));
      return filteredValue.length ? filteredValue : [];

    case FILTER_TYPES.select:
      return domain.includes(value) ? value : true;

    default:
      return null;
  }
}
/* eslint-enable complexity */

/**
 * Calculate numeric domain and suitable step
 *
 * @type {typeof import('./filter-utils').getNumericFieldDomain}
 */
export function getNumericFieldDomain(dataContainer, valueAccessor) {
  let domain = [0, 1];
  let step = 0.1;

  // @ts-ignore
  const mappedValue = dataContainer.map ? dataContainer.map(valueAccessor) : [];

  if (dataContainer.numRows && dataContainer.numRows() > 1) {
    domain = ScaleUtils.getLinearDomain(mappedValue);
    const diff = domain[1] - domain[0];

    // in case equal domain, [96, 96], which will break quantize scale
    if (!diff) {
      domain[1] = domain[0] + 1;
    }

    step = getNumericStepSize(diff) || step;
    domain[0] = formatNumberByStep(domain[0], step, 'floor');
    domain[1] = formatNumberByStep(domain[1], step, 'ceil');
  }

  // @ts-ignore
  const {histogram, enlargedHistogram} = getHistogram(domain, mappedValue);

  return {domain, step, histogram, enlargedHistogram};
}

/**
 * Calculate step size for range and timerange filter
 *
 * @type {typeof import('./filter-utils').getNumericStepSize}
 */
export function getNumericStepSize(diff) {
  diff = Math.abs(diff);

  if (diff > 100) {
    return 1;
  } else if (diff > 3) {
    return 0.01;
  } else if (diff > 1) {
    return 0.001;
  }
  // Try to get at least 1000 steps - and keep the step size below that of
  // the (diff > 1) case.
  const x = diff / 1000;
  // Find the exponent and truncate to 10 to the power of that exponent

  const exponentialForm = x.toExponential();
  const exponent = parseFloat(exponentialForm.split('e')[1]);

  // Getting ready for node 12
  // this is why we need decimal.js
  // Math.pow(10, -5) = 0.000009999999999999999
  // the above result shows in browser and node 10
  // node 12 behaves correctly
  return new Decimal(10).pow(exponent).toNumber();
}

/**
 * Calculate timestamp domain and suitable step
 *
 * @type {typeof import('./filter-utils').getTimestampFieldDomain}
 */
export function getTimestampFieldDomain(dataContainer, valueAccessor) {
  // to avoid converting string format time to epoch
  // every time we compare we store a value mapped to int in filter domain

  // @ts-ignore
  const mappedValue = dataContainer.map ? dataContainer.map(valueAccessor) : [];
  const domain = ScaleUtils.getLinearDomain(mappedValue);
  let step = 0.01;

  const diff = domain[1] - domain[0];
  const entry = TimestampStepMap.find(f => f.max >= diff);
  if (entry) {
    step = entry.step;
  }

  const {histogram, enlargedHistogram} = getHistogram(domain, mappedValue);

  return {domain, step, mappedValue, histogram, enlargedHistogram};
}

/**
 *
 * @type {typeof import('./filter-utils').histogramConstruct}
 */
export function histogramConstruct(domain, mappedValue, bins) {
  return d3Histogram()
    .thresholds(ticks(domain[0], domain[1], bins))
    .domain(domain)(mappedValue)
    .map(bin => ({
      count: bin.length,
      x0: bin.x0,
      x1: bin.x1
    }));
}
/**
 * Calculate histogram from domain and array of values
 *
 * @type {typeof import('./filter-utils').getHistogram}
 */
export function getHistogram(domain, mappedValue) {
  const histogram = histogramConstruct(domain, mappedValue, histogramBins);
  const enlargedHistogram = histogramConstruct(domain, mappedValue, enlargedHistogramBins);

  return {histogram, enlargedHistogram};
}

/**
 * round number based on step
 *
 * @param {Number} val
 * @param {Number} step
 * @param {string} bound
 * @returns {Number} rounded number
 */
export function formatNumberByStep(val, step, bound) {
  if (bound === 'floor') {
    return Math.floor(val * (1 / step)) / (1 / step);
  }

  return Math.ceil(val * (1 / step)) / (1 / step);
}

/**
 *
 * @type {typeof import('./filter-utils').isInRange}
 */
export function isInRange(val, domain) {
  if (!Array.isArray(domain)) {
    return false;
  }

  return val >= domain[0] && val <= domain[1];
}

/**
 * Determines whether a point is within the provided polygon
 *
 * @param point as input search [lat, lng]
 * @param polygon Points must be within these (Multi)Polygon(s)
 * @return {boolean}
 */
export function isInPolygon(point, polygon) {
  return booleanWithin(turfPoint(point), polygon);
}

export function getTimeWidgetTitleFormatter(domain) {
  if (!Array.isArray(domain)) {
    return null;
  }

  const diff = domain[1] - domain[0];
  return diff > durationYear
    ? 'MM/DD/YY'
    : diff > durationDay
    ? 'MM/DD/YY hh:mma'
    : 'MM/DD/YY hh:mm:ssa';
}

export function getTimeWidgetHintFormatter(domain) {
  if (!Array.isArray(domain)) {
    return null;
  }

  const diff = domain[1] - domain[0];
  return diff > durationYear
    ? 'MM/DD/YY'
    : diff > durationWeek
    ? 'MM/DD'
    : diff > durationDay
    ? 'MM/DD hha'
    : diff > durationHour
    ? 'hh:mma'
    : 'hh:mm:ssa';
}

/**
 * Sanity check on filters to prepare for save
 * @type {typeof import('./filter-utils').isValidFilterValue}
 */
/* eslint-disable complexity */
export function isValidFilterValue(type, value) {
  if (!type) {
    return false;
  }
  switch (type) {
    case FILTER_TYPES.select:
      return value === true || value === false;

    case FILTER_TYPES.range:
    case FILTER_TYPES.timeRange:
      return Array.isArray(value) && value.every(v => v !== null && !isNaN(v));

    case FILTER_TYPES.multiSelect:
      return Array.isArray(value) && Boolean(value.length);

    case FILTER_TYPES.input:
      return Boolean(value.length);

    case FILTER_TYPES.polygon:
      const coordinates = get(value, ['geometry', 'coordinates']);
      return Boolean(value && value.id && coordinates);

    default:
      return true;
  }
}

/**
 *
 * @type {typeof import('./filter-utils').getFilterPlot}
 */
export function getFilterPlot(filter, dataset) {
  if (filter.plotType === PLOT_TYPES.histogram || !filter.yAxis) {
    // histogram should be calculated when create filter
    return {};
  }

  const {mappedValue = []} = filter;
  const {yAxis} = filter;
  const fieldIdx = dataset.getColumnFieldIdx(yAxis.name);
  if (fieldIdx < 0) {
    Console.warn(`yAxis ${yAxis.name} does not exist in dataset`);
    return {lineChart: {}, yAxis};
  }

  // return lineChart
  const series = dataset.dataContainer
    .map(
      (row, rowIndex) => ({
        x: mappedValue[rowIndex],
        y: row.valueAt(fieldIdx)
      }),
      true
    )
    .filter(({x, y}) => Number.isFinite(x) && Number.isFinite(y))
    .sort((a, b) => ascending(a.x, b.x));

  const yDomain = extent(series, d => d.y);
  const xDomain = [series[0].x, series[series.length - 1].x];

  return {lineChart: {series, yDomain, xDomain}, yAxis};
}

export function getDefaultFilterPlotType(filter) {
  const filterPlotTypes = SupportedPlotType[filter.type];
  if (!filterPlotTypes) {
    return null;
  }

  if (!filter.yAxis) {
    return filterPlotTypes.default;
  }

  return filterPlotTypes[filter.yAxis.type] || null;
}

/**
 *
 * @param datasetIds list of dataset ids to be filtered
 * @param datasets all datasets
 * @param filters all filters to be applied to datasets
 * @return datasets - new updated datasets
 * @type {typeof import('./filter-utils').applyFiltersToDatasets}
 */
export function applyFiltersToDatasets(datasetIds, datasets, filters, layers) {
  const dataIds = toArray(datasetIds);
  return dataIds.reduce((acc, dataId) => {
    const layersToFilter = (layers || []).filter(l => l.config.dataId === dataId);
    const appliedFilters = filters.filter(d => shouldApplyFilter(d, dataId));
    const table = datasets[dataId];

    return {
      ...acc,
      [dataId]: table.filterTable(appliedFilters, layersToFilter, {})
    };
  }, datasets);
}

/**
 * Applies a new field name value to fielter and update both filter and dataset
 * @param filter - to be applied the new field name on
 * @param dataset - dataset the field belongs to
 * @param fieldName - field.name
 * @param filterDatasetIndex - field.name
 * @param option
 * @return - {filter, datasets}
 * @type {typeof import('./filter-utils').applyFilterFieldName}
 */
export function applyFilterFieldName(filter, dataset, fieldName, filterDatasetIndex = 0, option) {
  // using filterDatasetIndex we can filter only the specified dataset
  const mergeDomain = option && option.hasOwnProperty('mergeDomain') ? option.mergeDomain : false;

  const fieldIndex = dataset.getColumnFieldIdx(fieldName);
  // if no field with same name is found, move to the next datasets
  if (fieldIndex === -1) {
    // throw new Error(`fieldIndex not found. Dataset must contain a property with name: ${fieldName}`);
    return {filter: null, dataset};
  }

  // TODO: validate field type
  const filterProps = dataset.getColumnFilterProps(fieldName);

  const newFilter = {
    ...(mergeDomain ? mergeFilterDomainStep(filter, filterProps) : {...filter, ...filterProps}),
    name: Object.assign([...toArray(filter.name)], {[filterDatasetIndex]: fieldName}),
    fieldIdx: Object.assign([...toArray(filter.fieldIdx)], {
      [filterDatasetIndex]: fieldIndex
    }),
    // TODO, since we allow to add multiple fields to a filter we can no longer freeze the filter
    freeze: true
  };

  return {
    filter: newFilter,
    dataset
  };
}

/**
 * Merge one filter with other filter prop domain
 * @type {typeof import('./filter-utils').mergeFilterDomainStep}
 */
/* eslint-disable complexity */
export function mergeFilterDomainStep(filter, filterProps) {
  if (!filter) {
    return null;
  }

  if (!filterProps) {
    return filter;
  }

  if ((filter.fieldType && filter.fieldType !== filterProps.fieldType) || !filterProps.domain) {
    return filter;
  }

  const combinedDomain = !filter.domain
    ? filterProps.domain
    : [...(filter.domain || []), ...(filterProps.domain || [])].sort((a, b) => a - b);

  const newFilter = {
    ...filter,
    ...filterProps,
    domain: [combinedDomain[0], combinedDomain[combinedDomain.length - 1]]
  };

  switch (filterProps.fieldType) {
    case ALL_FIELD_TYPES.string:
    case ALL_FIELD_TYPES.date:
      return {
        ...newFilter,
        domain: unique(combinedDomain).sort()
      };

    case ALL_FIELD_TYPES.timestamp:
      // @ts-ignore
      const step = filter.step < filterProps.step ? filter.step : filterProps.step;

      return {
        ...newFilter,
        step
      };
    case ALL_FIELD_TYPES.real:
    case ALL_FIELD_TYPES.integer:
    default:
      return newFilter;
  }
}
/* eslint-enable complexity */

/**
 * Generates polygon filter
 * @type {typeof import('./filter-utils').featureToFilterValue}
 */
export const featureToFilterValue = (feature, filterId, properties = {}) => ({
  ...feature,
  id: feature.id,
  properties: {
    ...feature.properties,
    ...properties,
    filterId
  }
});

/**
 * @type {typeof import('./filter-utils').getFilterIdInFeature}
 */
export const getFilterIdInFeature = f => get(f, ['properties', 'filterId']);

/**
 * Generates polygon filter
 * @type {typeof import('./filter-utils').generatePolygonFilter}
 */
export function generatePolygonFilter(layers, feature) {
  const dataId = layers.map(l => l.config.dataId).filter(d => d);
  const layerId = layers.map(l => l.id);
  const name = layers.map(l => l.config.label);
  // @ts-ignore
  const filter = getDefaultFilter(dataId);
  return {
    ...filter,
    fixedDomain: true,
    type: FILTER_TYPES.polygon,
    name,
    layerId,
    value: featureToFilterValue(feature, filter.id, {isVisible: true})
  };
}

/**
 * Run filter entirely on CPU
 * @type {typeof import('./filter-utils').filterDatasetCPU}
 */
export function filterDatasetCPU(state, dataId) {
  const datasetFilters = state.filters.filter(f => f.dataId.includes(dataId));
  const dataset = state.datasets[dataId];

  if (!dataset) {
    return state;
  }

  const cpuFilteredDataset = dataset.filterTableCPU(datasetFilters, state.layers);

  return set(['datasets', dataId], cpuFilteredDataset, state);
}

/**
 * Validate parsed filters with datasets and add filterProps to field
 * @type {typeof import('./filter-utils').validateFiltersUpdateDatasets}
 */
export function validateFiltersUpdateDatasets(state, filtersToValidate = []) {
  const validated = [];
  const failed = [];
  const {datasets} = state;
  let updatedDatasets = datasets;

  // merge filters
  filtersToValidate.forEach(filter => {
    // we can only look for datasets define in the filter dataId
    const datasetIds = toArray(filter.dataId);

    // we can merge a filter only if all datasets in filter.dataId are loaded
    if (datasetIds.every(d => datasets[d])) {
      // all datasetIds in filter must be present the state datasets
      const {filter: validatedFilter, applyToDatasets, augmentedDatasets} = datasetIds.reduce(
        (acc, datasetId) => {
          const dataset = updatedDatasets[datasetId];
          const layers = state.layers.filter(l => l.config.dataId === dataset.id);
          const {filter: updatedFilter, dataset: updatedDataset} = validateFilterWithData(
            acc.augmentedDatasets[datasetId] || dataset,
            filter,
            layers
          );

          if (updatedFilter) {
            return {
              ...acc,
              // merge filter props
              filter: acc.filter
                ? {
                    ...acc.filter,
                    ...mergeFilterDomainStep(acc, updatedFilter)
                  }
                : updatedFilter,

              applyToDatasets: [...acc.applyToDatasets, datasetId],

              augmentedDatasets: {
                ...acc.augmentedDatasets,
                [datasetId]: updatedDataset
              }
            };
          }

          return acc;
        },
        {
          filter: null,
          applyToDatasets: [],
          augmentedDatasets: {}
        }
      );

      if (validatedFilter && isEqual(datasetIds, applyToDatasets)) {
        validated.push(validatedFilter);
        updatedDatasets = {
          ...updatedDatasets,
          ...augmentedDatasets
        };
      }
    } else {
      failed.push(filter);
    }
  });

  return {validated, failed, updatedDatasets};
}

/**
 * Retrieve interval bins for time filter
 * @type {typeof import('./filter-utils').getIntervalBins}
 */
export function getIntervalBins(filter) {
  const {bins} = filter;
  const interval = filter.plotType && filter.plotType.interval;
  if (!interval || !bins || Object.keys(bins).length === 0) {
    return null;
  }
  const values = Object.values(bins);
  return values[0] ? values[0][interval] : null;
}
