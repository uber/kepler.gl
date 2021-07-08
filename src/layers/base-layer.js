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

import {console as Console} from 'global/window';
import keymirror from 'keymirror';
import {DataFilterExtension} from '@deck.gl/extensions';
import {COORDINATE_SYSTEM} from '@deck.gl/core';
import {TextLayer} from '@deck.gl/layers';

import DefaultLayerIcon from './default-layer-icon';
import {diffUpdateTriggers} from './layer-update';

import {
  ALL_FIELD_TYPES,
  NO_VALUE_COLOR,
  SCALE_TYPES,
  CHANNEL_SCALES,
  FIELD_OPTS,
  SCALE_FUNC,
  CHANNEL_SCALE_SUPPORTED_FIELDS,
  MAX_GPU_FILTERS
} from 'constants/default-settings';
import {COLOR_RANGES} from 'constants/color-ranges';
import {DataVizColors} from 'constants/custom-color-ranges';
import {
  LAYER_VIS_CONFIGS,
  DEFAULT_TEXT_LABEL,
  DEFAULT_COLOR_UI,
  UNKNOWN_COLOR_KEY
} from './layer-factory';

import {generateHashId, isPlainObject} from 'utils/utils';

import {getSampleData, getLatLngBounds, notNullorUndefined} from 'utils/data-utils';

import {hexToRgb, getColorGroupByName, reverseColorRange} from 'utils/color-utils';

/** @typedef {import('./index').Layer} LayerClass} */

/**
 * Approx. number of points to sample in a large data set
 * @type {number}
 */
export const LAYER_ID_LENGTH = 6;

const MAX_SAMPLE_SIZE = 5000;
const defaultDomain = [0, 1];
const dataFilterExtension = new DataFilterExtension({filterSize: MAX_GPU_FILTERS});
const identity = d => d;
const defaultDataAccessor = d => d.data;

export const OVERLAY_TYPE = keymirror({
  deckgl: null,
  mapboxgl: null
});

export const layerColors = Object.values(DataVizColors).map(hexToRgb);
function* generateColor() {
  let index = 0;
  while (index < layerColors.length + 1) {
    if (index === layerColors.length) {
      index = 0;
    }
    yield layerColors[index++];
  }
}

export const colorMaker = generateColor();
const defaultGetFieldValue = (field, d) => field.valueAccessor(d);

/** @type {LayerClass} */
class Layer {
  constructor(props = {}) {
    this.id = props.id || generateHashId(LAYER_ID_LENGTH);

    // meta
    this.meta = {};

    // visConfigSettings
    this.visConfigSettings = {};

    // @ts-ignore
    this.config = this.getDefaultLayerConfig({
      columns: this.getLayerColumns(),
      ...props
    });
  }

  get layerIcon() {
    return DefaultLayerIcon;
  }

  get overlayType() {
    return OVERLAY_TYPE.deckgl;
  }

  get type() {
    return null;
  }

  get name() {
    return this.type;
  }

  get isAggregated() {
    return false;
  }

  get requiredLayerColumns() {
    return [];
  }

  get optionalColumns() {
    return [];
  }

  get noneLayerDataAffectingProps() {
    return ['label', 'opacity', 'thickness', 'isVisible', 'hidden'];
  }

  get visualChannels() {
    return {
      color: {
        property: 'color',
        field: 'colorField',
        scale: 'colorScale',
        domain: 'colorDomain',
        range: 'colorRange',
        key: 'color',
        channelScaleType: CHANNEL_SCALES.color,
        nullValue: NO_VALUE_COLOR,
        defaultValue: config => config.color
      },
      size: {
        property: 'size',
        field: 'sizeField',
        scale: 'sizeScale',
        domain: 'sizeDomain',
        range: 'sizeRange',
        key: 'size',
        channelScaleType: CHANNEL_SCALES.size,
        nullValue: 0,
        defaultValue: 1
      }
    };
  }

  /*
   * Column pairs maps layer column to a specific field pairs,
   * By default, it is set to null
   */
  get columnPairs() {
    return null;
  }

  /*
   * Default point column pairs, can be used for point based layers: point, icon etc.
   */
  get defaultPointColumnPairs() {
    return {
      lat: {pair: 'lng', fieldPairKey: 'lat'},
      lng: {pair: 'lat', fieldPairKey: 'lng'}
    };
  }

  /*
   * Default link column pairs, can be used for link based layers: arc, line etc
   */
  get defaultLinkColumnPairs() {
    return {
      lat0: {pair: 'lng0', fieldPairKey: 'lat'},
      lng0: {pair: 'lat0', fieldPairKey: 'lng'},
      lat1: {pair: 'lng1', fieldPairKey: 'lat'},
      lng1: {pair: 'lat1', fieldPairKey: 'lng'}
    };
  }

  /**
   * Return a React component for to render layer instructions in a modal
   * @returns {object} - an object
   * @example
   *  return {
   *    id: 'iconInfo',
   *    template: IconInfoModal,
   *    modalProps: {
   *      title: 'How to draw icons'
   *   };
   * }
   */
  get layerInfoModal() {
    return null;
  }
  /*
   * Given a dataset, automatically find props to create layer based on it
   * and return the props and previous found layers.
   * By default, no layers will be found
   */
  static findDefaultLayerProps(dataset, foundLayers) {
    return {props: [], foundLayers};
  }

  /**
   * Given a array of preset required column names
   * found field that has the same name to set as layer column
   *
   * @param {object} defaultFields
   * @param {object[]} allFields
   * @returns {object[] | null} all possible required layer column pairs
   */
  static findDefaultColumnField(defaultFields, allFields) {
    // find all matched fields for each required col
    const requiredColumns = Object.keys(defaultFields).reduce((prev, key) => {
      const requiredFields = allFields.filter(
        f => f.name === defaultFields[key] || defaultFields[key].includes(f.name)
      );

      prev[key] = requiredFields.length
        ? requiredFields.map(f => ({
            value: f.name,
            fieldIdx: f.fieldIdx
          }))
        : null;
      return prev;
    }, {});

    if (!Object.values(requiredColumns).every(Boolean)) {
      // if any field missing, return null
      return null;
    }

    return this.getAllPossibleColumnParis(requiredColumns);
  }

  static getAllPossibleColumnParis(requiredColumns) {
    // for multiple matched field for one required column, return multiple
    // combinations, e. g. if column a has 2 matched, column b has 3 matched
    // 6 possible column pairs will be returned
    const allKeys = Object.keys(requiredColumns);
    const pointers = allKeys.map((k, i) => ((i === allKeys.length - 1 ? -1 : 0)));
    const countPerKey = allKeys.map(k => requiredColumns[k].length);
    const pairs = [];

    /* eslint-disable no-loop-func */
    while (incrementPointers(pointers, countPerKey, pointers.length - 1)) {
      const newPair = pointers.reduce((prev, cuur, i) => {
        prev[allKeys[i]] = requiredColumns[allKeys[i]][cuur];
        return prev;
      }, {});

      pairs.push(newPair);
    }
    /* eslint-enable no-loop-func */

    // recursively increment pointers
    function incrementPointers(pts, counts, index) {
      if (index === 0 && pts[0] === counts[0] - 1) {
        // nothing to increment
        return false;
      }

      if (pts[index] + 1 < counts[index]) {
        pts[index] = pts[index] + 1;
        return true;
      }

      pts[index] = 0;
      return incrementPointers(pts, counts, index - 1);
    }

    return pairs;
  }

  static hexToRgb(c) {
    return hexToRgb(c);
  }

  getDefaultLayerConfig(props = {}) {
    return {
      dataId: props.dataId || null,
      label: props.label || 'new layer',
      color: props.color || colorMaker.next().value,
      columns: props.columns || null,
      isVisible: props.isVisible || false,
      isConfigActive: props.isConfigActive || false,
      highlightColor: props.highlightColor || [252, 242, 26, 255],
      hidden: props.hidden || false,

      // TODO: refactor this into separate visual Channel config
      // color by field, domain is set by filters, field, scale type
      colorField: null,
      colorDomain: [0, 1],
      colorScale: SCALE_TYPES.quantile,

      // color by size, domain is set by filters, field, scale type
      sizeDomain: [0, 1],
      sizeScale: SCALE_TYPES.linear,
      sizeField: null,

      visConfig: {},

      textLabel: [DEFAULT_TEXT_LABEL],

      colorUI: {
        color: DEFAULT_COLOR_UI,
        colorRange: DEFAULT_COLOR_UI
      },
      animation: {enabled: false}
    };
  }

  /**
   * Get the description of a visualChannel config
   * @param key
   * @returns {{label: string, measure: (string|string)}}
   */
  getVisualChannelDescription(key) {
    // e.g. label: Color, measure: Vehicle Type
    return {
      label: this.visConfigSettings[this.visualChannels[key].range].label,
      measure: this.config[this.visualChannels[key].field]
        ? this.config[this.visualChannels[key].field].name
        : this.visualChannels[key].defaultMeasure
    };
  }

  /**
   * Assign a field to layer column, return column config
   * @param key - Column Key
   * @param field - Selected field
   * @returns {{}} - Column config
   */
  assignColumn(key, field) {
    // field value could be null for optional columns
    const update = field
      ? {
          value: field.name,
          fieldIdx: field.fieldIdx
        }
      : {value: null, fieldIdx: -1};

    return {
      ...this.config.columns,
      [key]: {
        ...this.config.columns[key],
        ...update
      }
    };
  }

  /**
   * Assign a field pair to column config, return column config
   * @param key - Column Key
   * @param pair - field Pair
   * @returns {object} - Column config
   */
  assignColumnPairs(key, pair) {
    if (!this.columnPairs || !this.columnPairs?.[key]) {
      // should not end in this state
      return this.config.columns;
    }

    const {pair: partnerKey, fieldPairKey} = this.columnPairs?.[key];
    const {fieldPairKey: partnerFieldPairKey} = this.columnPairs?.[partnerKey];

    return {
      ...this.config.columns,
      [key]: pair[fieldPairKey],
      [partnerKey]: pair[partnerFieldPairKey]
    };
  }

  /**
   * Calculate a radius zoom multiplier to render points, so they are visible in all zoom level
   * @param {object} mapState
   * @param {number} mapState.zoom - actual zoom
   * @param {number | void} mapState.zoomOffset - zoomOffset when render in the plot container for export image
   * @returns {number}
   */
  getZoomFactor({zoom, zoomOffset = 0}) {
    return Math.pow(2, Math.max(14 - zoom + zoomOffset, 0));
  }

  /**
   * Calculate a elevation zoom multiplier to render points, so they are visible in all zoom level
   * @param {object} mapState
   * @param {number} mapState.zoom - actual zoom
   * @param {number | void} mapState.zoomOffset - zoomOffset when render in the plot container for export image
   * @returns {number}
   */
  getElevationZoomFactor({zoom, zoomOffset = 0}) {
    return this.config.visConfig.enableElevationZoomFactor
      ? Math.pow(2, Math.max(8 - zoom + zoomOffset, 0))
      : 1;
  }

  formatLayerData(datasets, filteredIndex) {
    return {};
  }

  renderLayer() {
    return [];
  }

  getHoverData(object) {
    if (!object) {
      return null;
    }
    // by default, each entry of layerData should have a data property points
    // to the original item in the allData array
    // each layer can implement its own getHoverData method
    return object.data;
  }

  /**
   * When change layer type, try to copy over layer configs as much as possible
   * @param configToCopy - config to copy over
   * @param visConfigSettings - visConfig settings of config to copy
   */
  assignConfigToLayer(configToCopy, visConfigSettings) {
    // don't deep merge visualChannel field
    // don't deep merge color range, reversed: is not a key by default
    const shallowCopy = ['colorRange', 'strokeColorRange'].concat(
      Object.values(this.visualChannels).map(v => v.field)
    );

    // don't copy over domain and animation
    const notToCopy = ['animation'].concat(Object.values(this.visualChannels).map(v => v.domain));
    // if range is for the same property group copy it, otherwise, not to copy
    Object.values(this.visualChannels).forEach(v => {
      if (
        configToCopy.visConfig[v.range] &&
        this.visConfigSettings[v.range] &&
        visConfigSettings[v.range].group !== this.visConfigSettings[v.range].group
      ) {
        notToCopy.push(v.range);
      }
    });

    // don't copy over visualChannel range
    const currentConfig = this.config;
    const copied = this.copyLayerConfig(currentConfig, configToCopy, {
      shallowCopy,
      notToCopy
    });

    this.updateLayerConfig(copied);
    // validate visualChannel field type and scale types
    Object.keys(this.visualChannels).forEach(channel => {
      this.validateVisualChannel(channel);
    });
  }

  /*
   * Recursively copy config over to an empty layer
   * when received saved config, or copy config over from a different layer type
   * make sure to only copy over value to existing keys
   * @param {object} currentConfig - existing config to be override
   * @param {object} configToCopy - new Config to copy over
   * @param {string[]} shallowCopy - array of properties to not to be deep copied
   * @param {string[]} notToCopy - array of properties not to copy
   * @returns {object} - copied config
   */
  copyLayerConfig(currentConfig, configToCopy, {shallowCopy = [], notToCopy = []} = {}) {
    const copied = {};
    Object.keys(currentConfig).forEach(key => {
      if (
        isPlainObject(currentConfig[key]) &&
        isPlainObject(configToCopy[key]) &&
        !shallowCopy.includes(key) &&
        !notToCopy.includes(key)
      ) {
        // recursively assign object value
        copied[key] = this.copyLayerConfig(currentConfig[key], configToCopy[key], {
          shallowCopy,
          notToCopy
        });
      } else if (notNullorUndefined(configToCopy[key]) && !notToCopy.includes(key)) {
        // copy
        copied[key] = configToCopy[key];
      } else {
        // keep existing
        copied[key] = currentConfig[key];
      }
    });

    return copied;
  }

  registerVisConfig(layerVisConfigs) {
    Object.keys(layerVisConfigs).forEach(item => {
      if (typeof item === 'string' && LAYER_VIS_CONFIGS[layerVisConfigs[item]]) {
        // if assigned one of default LAYER_CONFIGS
        this.config.visConfig[item] = LAYER_VIS_CONFIGS[layerVisConfigs[item]].defaultValue;
        this.visConfigSettings[item] = LAYER_VIS_CONFIGS[layerVisConfigs[item]];
      } else if (['type', 'defaultValue'].every(p => layerVisConfigs[item].hasOwnProperty(p))) {
        // if provided customized visConfig, and has type && defaultValue
        // TODO: further check if customized visConfig is valid
        this.config.visConfig[item] = layerVisConfigs[item].defaultValue;
        this.visConfigSettings[item] = layerVisConfigs[item];
      }
    });
  }

  getLayerColumns() {
    const columnValidators = this.columnValidators || {};
    const required = this.requiredLayerColumns.reduce(
      (accu, key) => ({
        ...accu,
        [key]: columnValidators[key]
          ? {value: null, fieldIdx: -1, validator: columnValidators[key]}
          : {value: null, fieldIdx: -1}
      }),
      {}
    );
    const optional = this.optionalColumns.reduce(
      (accu, key) => ({
        ...accu,
        [key]: {value: null, fieldIdx: -1, optional: true}
      }),
      {}
    );

    return {...required, ...optional};
  }

  updateLayerConfig(newConfig) {
    this.config = {...this.config, ...newConfig};
    return this;
  }

  updateLayerVisConfig(newVisConfig) {
    this.config.visConfig = {...this.config.visConfig, ...newVisConfig};
    return this;
  }

  updateLayerColorUI(prop, newConfig) {
    const {colorUI: previous, visConfig} = this.config;

    if (!isPlainObject(newConfig) || typeof prop !== 'string') {
      return this;
    }

    const colorUIProp = Object.entries(newConfig).reduce((accu, [key, value]) => {
      return {
        ...accu,
        [key]: isPlainObject(accu[key]) && isPlainObject(value) ? {...accu[key], ...value} : value
      };
    }, previous[prop] || DEFAULT_COLOR_UI);

    const colorUI = {
      ...previous,
      [prop]: colorUIProp
    };

    this.updateLayerConfig({colorUI});
    // if colorUI[prop] is colorRange
    const isColorRange = visConfig[prop] && visConfig[prop].colors;

    if (isColorRange) {
      this.updateColorUIByColorRange(newConfig, prop);
      this.updateColorRangeByColorUI(newConfig, previous, prop);
      this.updateCustomPalette(newConfig, previous, prop);
    }

    return this;
  }

  updateCustomPalette(newConfig, previous, prop) {
    if (!newConfig.colorRangeConfig || !newConfig.colorRangeConfig.custom) {
      return;
    }

    const {colorUI, visConfig} = this.config;

    if (!visConfig[prop]) return;
    const {colors} = visConfig[prop];
    const customPalette = {
      ...colorUI[prop].customPalette,
      name: 'Custom Palette',
      colors: [...colors]
    };
    this.updateLayerConfig({
      colorUI: {
        ...colorUI,
        [prop]: {
          ...colorUI[prop],
          customPalette
        }
      }
    });
  }
  /**
   * if open dropdown and prop is color range
   * Automatically set colorRangeConfig's step and reversed
   * @param {*} newConfig
   * @param {*} prop
   */
  updateColorUIByColorRange(newConfig, prop) {
    if (typeof newConfig.showDropdown !== 'number') return;

    const {colorUI, visConfig} = this.config;
    this.updateLayerConfig({
      colorUI: {
        ...colorUI,
        [prop]: {
          ...colorUI[prop],
          colorRangeConfig: {
            ...colorUI[prop].colorRangeConfig,
            steps: visConfig[prop].colors.length,
            reversed: Boolean(visConfig[prop].reversed)
          }
        }
      }
    });
  }

  updateColorRangeByColorUI(newConfig, previous, prop) {
    // only update colorRange if changes in UI is made to 'reversed', 'steps' or steps
    const shouldUpdate =
      newConfig.colorRangeConfig &&
      ['reversed', 'steps'].some(
        key =>
          newConfig.colorRangeConfig.hasOwnProperty(key) &&
          newConfig.colorRangeConfig[key] !==
            (previous[prop] || DEFAULT_COLOR_UI).colorRangeConfig[key]
      );
    if (!shouldUpdate) return;

    const {colorUI, visConfig} = this.config;
    const {steps, reversed} = colorUI[prop].colorRangeConfig;
    const colorRange = visConfig[prop];
    // find based on step or reversed
    let update;
    if (newConfig.colorRangeConfig.hasOwnProperty('steps')) {
      const group = getColorGroupByName(colorRange);

      if (group) {
        const sameGroup = COLOR_RANGES.filter(cr => getColorGroupByName(cr) === group);

        update = sameGroup.find(cr => cr.colors.length === steps);

        if (update && colorRange.reversed) {
          update = reverseColorRange(true, update);
        }
      }
    }

    if (newConfig.colorRangeConfig.hasOwnProperty('reversed')) {
      update = reverseColorRange(reversed, update || colorRange);
    }

    if (update) {
      this.updateLayerVisConfig({[prop]: update});
    }
  }

  /**
   * Check whether layer has all columns
   * @returns {boolean} yes or no
   */
  hasAllColumns() {
    const {columns} = this.config;
    return (
      (columns &&
      Object.values(columns).every(v => {
        return Boolean(v.optional || (v.value && v.fieldIdx > -1));
      }))
    );
  }

  /**
   * Check whether layer has data
   *
   * @param {Array | Object} layerData
   * @returns {boolean} yes or no
   */
  hasLayerData(layerData) {
    if (!layerData) {
      return false;
    }
    return Boolean(layerData.data && layerData.data.length);
  }

  isValidToSave() {
    return this.type && this.hasAllColumns();
  }

  shouldRenderLayer(data) {
    return (
      (this.type &&
      this.config.isVisible &&
      this.hasAllColumns() &&
      this.hasLayerData(data) &&
      typeof this.renderLayer === 'function')
    );
  }

  getColorScale(colorScale, colorDomain, colorRange) {
    if (Array.isArray(colorRange.colorMap)) {
      const cMap = new Map();
      colorRange.colorMap.forEach(([k, v]) => {
        cMap.set(k, typeof v === 'string' ? hexToRgb(v) : v);
      });

      const scale = SCALE_FUNC[SCALE_TYPES.ordinal]()
        .domain(cMap.keys())
        .range(cMap.values())
        .unknown(cMap.get(UNKNOWN_COLOR_KEY) || NO_VALUE_COLOR);
      return scale;
    }

    return this.getVisChannelScale(colorScale, colorDomain, colorRange.colors.map(hexToRgb));
  }

  /**
   * Mapping from visual channels to deck.gl accesors
   * @param {Function} dataAccessor - access kepler.gl layer data from deck.gl layer
   * @return {Object} attributeAccessors - deck.gl layer attribute accessors
   */
  getAttributeAccessors(dataAccessor = defaultDataAccessor) {
    const attributeAccessors = {};

    Object.keys(this.visualChannels).forEach(channel => {
      const {
        field,
        fixed,
        scale,
        domain,
        range,
        accessor,
        defaultValue,
        getAttributeValue,
        nullValue,
        channelScaleType
      } = this.visualChannels[channel];

      const shouldGetScale = this.config[field];

      if (shouldGetScale) {
        const args = [this.config[scale], this.config[domain], this.config.visConfig[range]];
        const isFixed = fixed && this.config.visConfig[fixed];

        const scaleFunction =
          channelScaleType === CHANNEL_SCALES.color
            ? this.getColorScale(...args)
            : this.getVisChannelScale(...args, isFixed);

        attributeAccessors[accessor] = d =>
          this.getEncodedChannelValue(
            scaleFunction,
            dataAccessor(d),
            this.config[field],
            nullValue
          );
      } else if (typeof getAttributeValue === 'function') {
        attributeAccessors[accessor] = getAttributeValue(this.config);
      } else {
        attributeAccessors[accessor] =
          typeof defaultValue === 'function' ? defaultValue(this.config) : defaultValue;
      }

      if (!attributeAccessors[accessor]) {
        Console.warn(`Failed to provide accesso function for ${accessor || channel}`);
      }
    });

    return attributeAccessors;
  }

  getVisChannelScale(scale, domain, range, fixed) {
    return SCALE_FUNC[fixed ? 'linear' : scale]()
      .domain(domain)
      .range(fixed ? domain : range);
  }

  getPointsBounds(allData, getPosition = identity) {
    // no need to loop through the entire dataset
    // get a sample of data to calculate bounds
    const sampleData =
      allData.length > MAX_SAMPLE_SIZE ? getSampleData(allData, MAX_SAMPLE_SIZE) : allData;
    const points = sampleData.map(getPosition);

    const latBounds = getLatLngBounds(points, 1, [-90, 90]);
    const lngBounds = getLatLngBounds(points, 0, [-180, 180]);

    if (!latBounds || !lngBounds) {
      return null;
    }

    return [lngBounds[0], latBounds[0], lngBounds[1], latBounds[1]];
  }

  getChangedTriggers(dataUpdateTriggers) {
    const triggerChanged = diffUpdateTriggers(dataUpdateTriggers, this._oldDataUpdateTriggers);
    this._oldDataUpdateTriggers = dataUpdateTriggers;

    return triggerChanged;
  }

  getEncodedChannelValue(
    scale,
    data,
    field,
    nullValue = NO_VALUE_COLOR,
    getValue = defaultGetFieldValue
  ) {
    const {type} = field;
    const value = getValue(field, data);

    if (!notNullorUndefined(value)) {
      return nullValue;
    }

    let attributeValue;
    if (type === ALL_FIELD_TYPES.timestamp) {
      // shouldn't need to convert here
      // scale Function should take care of it
      attributeValue = scale(new Date(value));
    } else {
      attributeValue = scale(value);
    }

    if (!notNullorUndefined(attributeValue)) {
      attributeValue = nullValue;
    }

    return attributeValue;
  }

  updateMeta(meta) {
    this.meta = {...this.meta, ...meta};
  }

  getDataUpdateTriggers({filteredIndex, id, allData}) {
    const {columns} = this.config;

    return {
      getData: {datasetId: id, allData, columns, filteredIndex},
      getMeta: {datasetId: id, allData, columns},
      ...(this.config.textLabel || []).reduce(
        (accu, tl, i) => ({
          ...accu,
          [`getLabelCharacterSet-${i}`]: tl.field ? tl.field.name : null
        }),
        {}
      )
    };
  }

  updateData(datasets, oldLayerData) {
    if (!this.config.dataId) {
      return {};
    }
    const layerDataset = datasets[this.config.dataId];
    const {allData} = datasets[this.config.dataId];

    const getPosition = this.getPositionAccessor();
    const dataUpdateTriggers = this.getDataUpdateTriggers(layerDataset);
    const triggerChanged = this.getChangedTriggers(dataUpdateTriggers);

    if (triggerChanged.getMeta) {
      this.updateLayerMeta(allData, getPosition);
    }

    let data = [];

    if (!triggerChanged.getData && oldLayerData && oldLayerData.data) {
      // same data
      data = oldLayerData.data;
    } else {
      data = this.calculateDataAttribute(layerDataset, getPosition);
    }

    return {data, triggerChanged};
  }
  /**
   * helper function to update one layer domain when state.data changed
   * if state.data change is due ot update filter, newFiler will be passed
   * called by updateAllLayerDomainData
   * @param {Object} datasets
   * @param {Object} newFilter
   * @returns {object} layer
   */
  updateLayerDomain(datasets, newFilter) {
    const table = this.getDataset(datasets);
    if (!table) {
      return this;
    }
    Object.values(this.visualChannels).forEach(channel => {
      const {scale} = channel;
      const scaleType = this.config[scale];
      // ordinal domain is based on allData, if only filter changed
      // no need to update ordinal domain
      if (!newFilter || scaleType !== SCALE_TYPES.ordinal) {
        const {domain} = channel;
        const updatedDomain = this.calculateLayerDomain(table, channel);
        this.updateLayerConfig({[domain]: updatedDomain});
      }
    });

    return this;
  }

  getDataset(datasets) {
    return this.config.dataId ? datasets[this.config.dataId] : null;
  }

  /**
   * Validate visual channel field and scales based on supported field & scale type
   * @param channel
   */
  validateVisualChannel(channel) {
    this.validateFieldType(channel);
    this.validateScale(channel);
  }

  /**
   * Validate field type based on channelScaleType
   */
  validateFieldType(channel) {
    const visualChannel = this.visualChannels[channel];
    const {field, channelScaleType, supportedFieldTypes} = visualChannel;

    if (this.config[field]) {
      // if field is selected, check if field type is supported
      const channelSupportedFieldTypes =
        supportedFieldTypes || CHANNEL_SCALE_SUPPORTED_FIELDS[channelScaleType];

      if (!channelSupportedFieldTypes.includes(this.config[field].type)) {
        // field type is not supported, set it back to null
        // set scale back to default
        this.updateLayerConfig({[field]: null});
      }
    }
  }

  /**
   * Validate scale type based on aggregation
   */
  validateScale(channel) {
    const visualChannel = this.visualChannels[channel];
    const {scale} = visualChannel;
    if (!scale) {
      // visualChannel doesn't have scale
      return;
    }
    const scaleOptions = this.getScaleOptions(channel);
    // check if current selected scale is
    // supported, if not, change to default
    if (!scaleOptions.includes(this.config[scale])) {
      this.updateLayerConfig({[scale]: scaleOptions[0]});
    }
  }

  /**
   * Get scale options based on current field
   * @param {string} channel
   * @returns {string[]}
   */
  getScaleOptions(channel) {
    const visualChannel = this.visualChannels[channel];
    const {field, scale, channelScaleType} = visualChannel;

    return this.config[field]
      ? FIELD_OPTS[this.config[field].type].scale[channelScaleType]
      : [this.getDefaultLayerConfig()[scale]];
  }

  updateLayerVisualChannel(dataset, channel) {
    const visualChannel = this.visualChannels[channel];
    this.validateVisualChannel(channel);
    // calculate layer channel domain
    const updatedDomain = this.calculateLayerDomain(dataset, visualChannel);
    this.updateLayerConfig({[visualChannel.domain]: updatedDomain});
  }

  getVisualChannelUpdateTriggers() {
    const updateTriggers = {};
    Object.values(this.visualChannels).forEach(visualChannel => {
      // field range scale domain
      const {accessor, field, scale, domain, range, defaultValue, fixed} = visualChannel;

      updateTriggers[accessor] = {
        [field]: this.config[field],
        [scale]: this.config[scale],
        [domain]: this.config[domain],
        [range]: this.config.visConfig[range],
        defaultValue: typeof defaultValue === 'function' ? defaultValue(this.config) : defaultValue,
        ...(fixed ? {[fixed]: this.config.visConfig[fixed]} : {})
      };
    });
    return updateTriggers;
  }

  calculateLayerDomain(dataset, visualChannel) {
    const {scale} = visualChannel;
    const scaleType = this.config[scale];

    const field = this.config[visualChannel.field];
    if (!field) {
      // if colorField or sizeField were set back to null
      return defaultDomain;
    }

    return dataset.getColumnLayerDomain(field, scaleType) || defaultDomain;
  }

  hasHoveredObject(objectInfo) {
    return this.isLayerHovered(objectInfo) && objectInfo.object ? objectInfo.object : null;
  }

  isLayerHovered(objectInfo) {
    return objectInfo?.picked && objectInfo?.layer?.props?.id === this.id;
  }

  getRadiusScaleByZoom(mapState, fixedRadius) {
    const radiusChannel = Object.values(this.visualChannels).find(vc => vc.property === 'radius');

    if (!radiusChannel) {
      return 1;
    }

    const field = radiusChannel.field;
    const fixed = fixedRadius === undefined ? this.config.visConfig.fixedRadius : fixedRadius;
    const {radius} = this.config.visConfig;

    // @ts-ignore
    return fixed ? 1 : (this.config[field] ? 1 : radius) * this.getZoomFactor(mapState);
  }

  shouldCalculateLayerData(props) {
    return props.some(p => !this.noneLayerDataAffectingProps.includes(p));
  }

  getBrushingExtensionProps(interactionConfig, brushingTarget) {
    const {brush} = interactionConfig;

    return {
      // brushing
      autoHighlight: !brush.enabled,
      brushingRadius: brush.config.size * 1000,
      brushingTarget: brushingTarget || 'source',
      brushingEnabled: brush.enabled
    };
  }

  getDefaultDeckLayerProps({idx, gpuFilter, mapState}) {
    return {
      id: this.id,
      idx,
      coordinateSystem: COORDINATE_SYSTEM.LNGLAT,
      pickable: true,
      wrapLongitude: true,
      parameters: {depthTest: Boolean(mapState.dragRotate || this.config.visConfig.enable3d)},
      hidden: this.config.hidden,
      // visconfig
      opacity: this.config.visConfig.opacity,
      highlightColor: this.config.highlightColor,
      // data filtering
      extensions: [dataFilterExtension],
      filterRange: gpuFilter ? gpuFilter.filterRange : undefined
    };
  }

  getDefaultHoverLayerProps() {
    return {
      id: `${this.id}-hovered`,
      pickable: false,
      wrapLongitude: true,
      coordinateSystem: COORDINATE_SYSTEM.LNGLAT
    };
  }

  renderTextLabelLayer({getPosition, getPixelOffset, updateTriggers, sharedProps}, renderOpts) {
    const {data, mapState} = renderOpts;
    const {textLabel} = this.config;

    return data.textLabels.reduce((accu, d, i) => {
      if (d.getText) {
        accu.push(
          new TextLayer({
            ...sharedProps,
            id: `${this.id}-label-${textLabel[i].field?.name}`,
            data: data.data,
            getText: d.getText,
            getPosition,
            characterSet: d.characterSet,
            getPixelOffset: getPixelOffset(textLabel[i]),
            getSize: 1,
            sizeScale: textLabel[i].size,
            getTextAnchor: textLabel[i].anchor,
            getAlignmentBaseline: textLabel[i].alignment,
            getColor: textLabel[i].color,
            parameters: {
              // text will always show on top of all layers
              depthTest: false
            },

            getFilterValue: data.getFilterValue,
            updateTriggers: {
              ...updateTriggers,
              getText: textLabel[i].field?.name,
              getPixelOffset: {
                ...updateTriggers.getRadius,
                mapState,
                anchor: textLabel[i].anchor,
                alignment: textLabel[i].alignment
              },
              getTextAnchor: textLabel[i].anchor,
              getAlignmentBaseline: textLabel[i].alignment,
              getColor: textLabel[i].color
            }
          })
        );
      }
      return accu;
    }, []);
  }

  calculateDataAttribute(dataset, getPosition) {
    // implemented in subclasses
    return [];
  }

  updateLayerMeta(allData, getPosition) {
    // implemented in subclasses
  }

  getPositionAccessor() {
    // implemented in subclasses
    return () => null;
  }
}

export default Layer;
