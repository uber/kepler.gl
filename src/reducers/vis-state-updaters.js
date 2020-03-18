// Copyright (c) 2020 Uber Technologies, Inc.
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
import {disableStackCapturing, withTask} from 'react-palm/tasks';
import cloneDeep from 'lodash.clonedeep';
import uniq from 'lodash.uniq';
import get from 'lodash.get';
import xor from 'lodash.xor';

// Tasks
import {LOAD_FILE_TASK, ACTION_TASK} from 'tasks/tasks';

// Actions
import {loadFilesErr, loadFileSuccess} from 'actions/vis-state-actions';
import {addDataToMap} from 'actions';

// Utils
import {getDefaultInteraction, findFieldsToShow} from 'utils/interaction-utils';
import {
  FILTER_UPDATER_PROPS,
  applyFilterFieldName,
  applyFiltersToDatasets,
  generatePolygonFilter,
  filterDatasetCPU,
  getDefaultFilter,
  getFilterPlot,
  getDefaultFilterPlotType,
  isInRange,
  getFilterIdInFeature,
  featureToFilterValue,
  updateFilterDataId
} from 'utils/filter-utils';
import {applyFilterGPU} from 'utils/gpu-filter-utils';
import {createNewDataEntry} from 'utils/dataset-utils';
import {set, toArray, generateHashId} from 'utils/utils';

import {findDefaultLayer, calculateLayerData} from 'utils/layer-utils/layer-utils';

import {
  mergeFilters,
  mergeLayers,
  mergeInteractions,
  mergeLayerBlending,
  mergeSplitMaps,
  mergeAnimationConfig
} from './vis-state-merger';

import {
  addNewLayersToSplitMap,
  removeLayerFromSplitMaps,
  computeSplitMapLayers
} from 'utils/split-map-utils';

import {Layer, LayerClasses} from 'layers';
import {DEFAULT_TEXT_LABEL} from 'layers/layer-factory';
import {EDITOR_MODES, DATASET_FORMATS} from 'constants/default-settings';

// react-palm
// disable capture exception for react-palm call to withTask
disableStackCapturing();

/**
 * Updaters for `visState` reducer. Can be used in your root reducer to directly modify kepler.gl's state.
 * Read more about [Using updaters](../advanced-usage/using-updaters.md)
 *
 * @public
 * @example
 *
 * import keplerGlReducer, {visStateUpdaters} from 'kepler.gl/reducers';
 * // Root Reducer
 * const reducers = combineReducers({
 *  keplerGl: keplerGlReducer,
 *  app: appReducer
 * });
 *
 * const composedReducer = (state, action) => {
 *  switch (action.type) {
 *    case 'CLICK_BUTTON':
 *      return {
 *        ...state,
 *        keplerGl: {
 *          ...state.keplerGl,
 *          foo: {
 *             ...state.keplerGl.foo,
 *             visState: visStateUpdaters.enlargeFilterUpdater(
 *               state.keplerGl.foo.visState,
 *               {idx: 0}
 *             )
 *          }
 *        }
 *      };
 *  }
 *  return reducers(state, action);
 * };
 *
 * export default composedReducer;
 */
/* eslint-disable no-unused-vars */
const visStateUpdaters = null;
/* eslint-enable no-unused-vars */

export const defaultAnimationConfig = {
  domain: null,
  currentTime: null,
  speed: 1
};

export const DEFAULT_EDITOR = {
  mode: EDITOR_MODES.DRAW_POLYGON,
  features: [],
  selectedFeature: null,
  visible: true
};

/**
 * Default initial `visState`
 * @memberof visStateUpdaters
 * @constant
 * @type {Object}
 * @property {Array} layers
 * @property {Array} layerData
 * @property {Array} layerToBeMerged
 * @property {Array} layerOrder
 * @property {Array} filters
 * @property {Array} filterToBeMerged
 * @property {Array} datasets
 * @property {string} editingDataset
 * @property {Object} interactionConfig
 * @property {Object} interactionToBeMerged
 * @property {string} layerBlending
 * @property {Object} hoverInfo
 * @property {Object} clicked
 * @property {Object} mousePos
 * @property {Array} splitMaps - a list of objects of layer availabilities and visibilities for each map
 * @property {Object} layerClasses
 * @property {Object} animationConfig
 * @property {Object} editor
 * @public
 */
export const INITIAL_VIS_STATE = {
  // map info
  mapInfo: {
    title: '',
    description: ''
  },
  // layers
  layers: [],
  layerData: [],
  layerToBeMerged: [],
  layerOrder: [],

  // filters
  filters: [],
  filterToBeMerged: [],

  // a collection of multiple dataset
  datasets: {},
  editingDataset: undefined,

  interactionConfig: getDefaultInteraction(),
  interactionToBeMerged: undefined,

  layerBlending: 'normal',
  hoverInfo: undefined,
  clicked: undefined,
  mousePos: {},

  // this is used when user split maps
  splitMaps: [
    // this will contain a list of objects to
    // describe the state of layer availability and visibility for each map
    // [
    //   {
    //      layers: {layer_id: true | false}
    //   }
    // ]
  ],
  //
  // defaults layer classes
  layerClasses: LayerClasses,

  // default animation
  // time in unix timestamp (milliseconds) (the number of seconds since the Unix Epoch)
  animationConfig: defaultAnimationConfig,

  editor: DEFAULT_EDITOR
};

function updateStateWithLayerAndData(state, {layerData, layer, idx}) {
  return {
    ...state,
    layers: state.layers.map((lyr, i) => (i === idx ? layer : lyr)),
    layerData: layerData
      ? state.layerData.map((d, i) => (i === idx ? layerData : d))
      : state.layerData
  };
}

export function updateStateOnLayerVisibilityChange(state, layer) {
  let newState = state;
  if (state.splitMaps.length) {
    newState = {
      ...state,
      splitMaps: layer.config.isVisible
        ? addNewLayersToSplitMap(state.splitMaps, layer)
        : removeLayerFromSplitMaps(state.splitMaps, layer)
    };
  }

  if (layer.config.animation.enabled) {
    newState = updateAnimationDomain(state);
  }

  return newState;
}

/**
 * Update layer base config: dataId, label, column, isVisible
 * @memberof visStateUpdaters
 * @param {Object} state `visState`
 * @param {Object} action action
 * @param {Object} action.oldLayer layer to be updated
 * @param {Object} action.newConfig new config
 * @returns {Object} nextState
 */
export function layerConfigChangeUpdater(state, action) {
  const {oldLayer} = action;
  const idx = state.layers.findIndex(l => l.id === oldLayer.id);
  const props = Object.keys(action.newConfig);
  let newLayer = oldLayer.updateLayerConfig(action.newConfig);

  let layerData;

  // let newLayer;
  if (newLayer.shouldCalculateLayerData(props)) {
    const oldLayerData = state.layerData[idx];
    const updateLayerDataResult = calculateLayerData(newLayer, state, oldLayerData);

    layerData = updateLayerDataResult.layerData;
    newLayer = updateLayerDataResult.layer;
  }

  let newState = state;
  if ('isVisible' in action.newConfig) {
    newState = updateStateOnLayerVisibilityChange(state, newLayer);
  }

  return updateStateWithLayerAndData(newState, {
    layer: newLayer,
    layerData,
    idx
  });
}

function addOrRemoveTextLabels(newFields, textLabel) {
  let newTextLabel = textLabel.slice();

  const currentFields = textLabel.map(tl => tl.field && tl.field.name).filter(d => d);

  const addFields = newFields.filter(f => !currentFields.includes(f.name));
  const deleteFields = currentFields.filter(f => !newFields.find(fd => fd.name === f));

  // delete
  newTextLabel = newTextLabel.filter(tl => tl.field && !deleteFields.includes(tl.field.name));
  newTextLabel = !newTextLabel.length ? [DEFAULT_TEXT_LABEL] : newTextLabel;

  // add
  newTextLabel = [
    ...newTextLabel.filter(tl => tl.field),
    ...addFields.map(af => ({
      ...DEFAULT_TEXT_LABEL,
      field: af
    }))
  ];

  return newTextLabel;
}

function updateTextLabelPropAndValue(idx, prop, value, textLabel) {
  if (!textLabel[idx].hasOwnProperty(prop)) {
    return textLabel;
  }

  let newTextLabel = textLabel.slice();

  if (prop && (value || textLabel.length === 1)) {
    newTextLabel = textLabel.map((tl, i) => (i === idx ? {...tl, [prop]: value} : tl));
  } else if (prop === 'field' && value === null && textLabel.length > 1) {
    // remove label when field value is set to null
    newTextLabel.splice(idx, 1);
  }

  return newTextLabel;
}

export function layerTextLabelChangeUpdater(state, action) {
  const {oldLayer, idx, prop, value} = action;
  const {textLabel} = oldLayer.config;

  let newTextLabel = textLabel.slice();
  if (!textLabel[idx] && idx === textLabel.length) {
    // if idx is set to length, add empty text label
    newTextLabel = [...textLabel, DEFAULT_TEXT_LABEL];
  }

  if (idx === 'all' && prop === 'fields') {
    newTextLabel = addOrRemoveTextLabels(value, textLabel);
  } else {
    newTextLabel = updateTextLabelPropAndValue(idx, prop, value, newTextLabel);
  }

  // update text label prop and value
  return layerConfigChangeUpdater(state, {
    oldLayer,
    newConfig: {textLabel: newTextLabel}
  });
}

/**
 * Update layer type. Previews layer config will be copied if applicable.
 * @memberof visStateUpdaters
 * @param {Object} state `visState`
 * @param {Object} action action
 * @param {Object} action.oldLayer layer to be updated
 * @param {string} action.newType new type
 * @returns {Object} nextState
 * @public
 */
export function layerTypeChangeUpdater(state, action) {
  const {oldLayer, newType} = action;
  if (!oldLayer) {
    return state;
  }
  const oldId = oldLayer.id;
  const idx = state.layers.findIndex(l => l.id === oldId);

  if (!state.layerClasses[newType]) {
    Console.error(`${newType} is not a valid layer type`);
    return state;
  }

  // get a mint layer, with new id and type
  // because deck.gl uses id to match between new and old layer.
  // If type has changed but id is the same, it will break
  const newLayer = new state.layerClasses[newType]();

  newLayer.assignConfigToLayer(oldLayer.config, oldLayer.visConfigSettings);

  // if (newLayer.config.dataId) {
  //   const dataset = state.datasets[newLayer.config.dataId];
  //   newLayer.updateLayerDomain(dataset);
  // }
  newLayer.updateLayerDomain(state.datasets);
  const {layerData, layer} = calculateLayerData(newLayer, state);
  let newState = updateStateWithLayerAndData(state, {layerData, layer, idx});

  if (layer.config.animation.enabled || oldLayer.config.animation.enabled) {
    newState = updateAnimationDomain(newState);
  }

  // update splitMap layer id
  if (state.splitMaps.length) {
    newState = {
      ...newState,
      splitMaps: newState.splitMaps.map(settings => {
        const {[oldId]: oldLayerMap, ...otherLayers} = settings.layers;
        return oldId in settings.layers
          ? {
              ...settings,
              layers: {
                ...otherLayers,
                [layer.id]: oldLayerMap
              }
            }
          : settings;
      })
    };
  }

  return newState;
}

/**
 * Update layer visual channel
 * @memberof visStateUpdaters
 * @param {Object} state `visState`
 * @param {Object} action action
 * @param {Object} action.oldLayer layer to be updated
 * @param {Object} action.newConfig new visual channel config
 * @param {string} action.channel channel to be updated
 * @returns {Object} nextState
 * @public
 */
export function layerVisualChannelChangeUpdater(state, action) {
  const {oldLayer, newConfig, channel} = action;
  const dataset = state.datasets[oldLayer.config.dataId];

  const idx = state.layers.findIndex(l => l.id === oldLayer.id);
  const newLayer = oldLayer.updateLayerConfig(newConfig);

  newLayer.updateLayerVisualChannel(dataset, channel);

  const oldLayerData = state.layerData[idx];
  const {layerData, layer} = calculateLayerData(newLayer, state, oldLayerData);

  return updateStateWithLayerAndData(state, {layerData, layer, idx});
}

/**
 * Update layer `visConfig`
 * @memberof visStateUpdaters
 * @param {Object} state `visState`
 * @param {Object} action action
 * @param {Object} action.oldLayer layer to be updated
 * @param {Object} action.newVisConfig new visConfig as a key value map: e.g. `{opacity: 0.8}`
 * @returns {Object} nextState
 * @public
 */
export function layerVisConfigChangeUpdater(state, action) {
  const {oldLayer} = action;
  const idx = state.layers.findIndex(l => l.id === oldLayer.id);
  const props = Object.keys(action.newVisConfig);
  const newVisConfig = {
    ...oldLayer.config.visConfig,
    ...action.newVisConfig
  };

  const newLayer = oldLayer.updateLayerConfig({visConfig: newVisConfig});

  if (newLayer.shouldCalculateLayerData(props)) {
    const oldLayerData = state.layerData[idx];
    const {layerData, layer} = calculateLayerData(newLayer, state, oldLayerData);
    return updateStateWithLayerAndData(state, {layerData, layer, idx});
  }

  return updateStateWithLayerAndData(state, {layer: newLayer, idx});
}

/* eslint-enable max-statements */

/**
 * Update `interactionConfig`
 * @memberof visStateUpdaters
 * @param {Object} state `visState`
 * @param {Object} action action
 * @param {Object} action.config new config as key value map: `{tooltip: {enabled: true}}`
 * @returns {Object} nextState
 * @public
 */
export function interactionConfigChangeUpdater(state, action) {
  const {config} = action;

  const interactionConfig = {
    ...state.interactionConfig,
    ...{[config.id]: config}
  };

  // Don't enable tooltip and brush at the same time
  // but coordinates can be shown at all time
  const contradict = ['brush', 'tooltip'];

  if (
    contradict.includes(config.id) &&
    config.enabled &&
    !state.interactionConfig[config.id].enabled
  ) {
    // only enable one interaction at a time
    contradict.forEach(k => {
      if (k !== config.id) {
        interactionConfig[k] = {...interactionConfig[k], enabled: false};
      }
    });
  }

  return {
    ...state,
    interactionConfig
  };
}

/**
 * Update filter property
 * @memberof visStateUpdaters
 * @param {Object} state `visState`
 * @param {Object} action action
 * @param {Number} action.idx `idx` of filter to be updated
 * @param {string} action.prop `prop` of filter, e,g, `dataId`, `name`, `value`
 * @param {*} action.value new value
 * @returns {Object} nextState
 * @public
 */
/* eslint-disable complexity,max-statements */
export function setFilterUpdater(state, action) {
  const {idx, prop, value, valueIndex} = action;

  const oldFilter = state.filters[idx];
  let newFilter = set([prop], value, oldFilter);
  let newState = state;

  const currentValueIndex = valueIndex || 0;
  const {dataId} = newFilter;

  // Ensuring backward compatibility
  let datasetIdsToFilter = toArray(dataId);

  switch (prop) {
    case FILTER_UPDATER_PROPS.dataId:
      // if no index is provided we replace the  current filter with a new one
      if (oldFilter.dataId.length === 0 || Array.isArray(value)) {
        newFilter = updateFilterDataId(dataId);
      } else if (valueIndex) {
        // if we specify an index, we are going to replace an existing value
        newFilter.dataId[valueIndex] = value;
      } else {
        // otherwise we are going to append it
        newFilter.dataId = [...oldFilter.dataId, value];
      }
      break;
    case FILTER_UPDATER_PROPS.name:
      // if value is an array replace all elements and must re-filter everything
      // we could do some optmization in case some elements are the same
      // we are supporting the current functionality
      if (Array.isArray(value)) {
        const names = toArray(value);
        names.forEach((name, index) => {
          const datasetId = newFilter.dataId[currentValueIndex];
          const {filter: updatedFilter, dataset: newDataset} = applyFilterFieldName(
            newFilter,
            state.datasets[datasetId],
            name,
            index,
            // merge domain only if we have multiple datasets
            {mergeDomain: value.length > 1}
          );

          if (updatedFilter) {
            newFilter = applyFilterGPU(updatedFilter, state.filters);
            newState = set(['datasets', datasetId], newDataset, state);
          }
        });
      } else {
        const datasetId = newFilter.dataId[currentValueIndex];
        const {filter: updatedFilter, dataset: newDataset} = applyFilterFieldName(
          newFilter,
          state.datasets[datasetId],
          value,
          valueIndex,
          // merge domain only if we have multiple datasets
          {mergeDomain: newFilter.dataId.length > 1}
        );

        if (!updatedFilter) {
          return state;
        }

        newFilter.name = Object.assign([].concat(oldFilter.name), {[currentValueIndex]: value});
        newFilter = applyFilterGPU(updatedFilter, state.filters);
        newState = set(['datasets', datasetId], newDataset, state);
        datasetIdsToFilter = [datasetIdsToFilter[currentValueIndex]];
      }

      break;
    case FILTER_UPDATER_PROPS.layerId:
      // We need to update only datasetId/s if we have added/removed layers
      // - check for layerId changes (XOR works because of string values)
      // if no differences between layerIds, don't do any filtering
      const layerIdDifference = xor(newFilter.layerId, oldFilter.layerId);

      if (!layerIdDifference.length) {
        return state;
      }

      const layerDataIds = uniq(
        layerIdDifference
          .map(lid =>
            get(
              state.layers.find(l => l.id === lid),
              ['config', 'dataId']
            )
          )
          .filter(d => d)
      );

      // only filter datasetIds
      datasetIdsToFilter = layerDataIds;

      // Update newFilter dataIds
      const newDataIds = uniq(
        newFilter.layerId
          .map(lid =>
            get(
              state.layers.find(l => l.id === lid),
              ['config', 'dataId']
            )
          )
          .filter(d => d)
      );

      newFilter = {
        ...newFilter,
        dataId: newDataIds
      };

      break;
    default:
      break;
  }

  const enlargedFilter = state.filters.find(f => f.enlarged);

  if (enlargedFilter && enlargedFilter.id !== newFilter.id) {
    // there should be only one enlarged filter
    newFilter.enlarged = false;
  }

  // save new filters to newState
  newState = set(['filters', idx], newFilter, newState);

  // filter data
  const filteredDatasets = applyFiltersToDatasets(
    datasetIdsToFilter,
    newState.datasets,
    newState.filters,
    newState.layers
  );

  newState = set(['datasets'], filteredDatasets, newState);

  // dataId is an array
  // pass only the dataset we need to update
  newState = updateAllLayerDomainData(newState, datasetIdsToFilter, newFilter);

  return newState;
}
/* eslint-enable complexity */

/**
 * Set the property of a filter plot
 * @memberof visStateUpdaters
 * @param {Object} state `visState`
 * @param {Object} action action
 * @param {Number} action.idx
 * @param {Object} action.newProp key value mapping of new prop `{yAxis: 'histogram'}`
 * @returns {Object} nextState
 * @public
 */
export const setFilterPlotUpdater = (state, {idx, newProp}) => {
  let newFilter = {...state.filters[idx], ...newProp};
  const prop = Object.keys(newProp)[0];
  if (prop === 'yAxis') {
    const plotType = getDefaultFilterPlotType(newFilter);

    if (plotType) {
      newFilter = {
        ...newFilter,
        ...getFilterPlot({...newFilter, plotType}, state.datasets[newFilter.dataId].allData),
        plotType
      };
    }
  }

  return {
    ...state,
    filters: state.filters.map((f, i) => (i === idx ? newFilter : f))
  };
};

/**
 * Add a new filter
 * @memberof visStateUpdaters
 * @param {Object} state `visState`
 * @param {Object} action action
 * @param {string} action.dataId dataset `id` this new filter is associated with
 * @returns {Object} nextState
 * @public
 */
export const addFilterUpdater = (state, action) =>
  !action.dataId
    ? state
    : {
        ...state,
        filters: [...state.filters, getDefaultFilter(action.dataId)]
      };

/**
 * Set layer color palette ui state
 * @memberof visStateUpdaters
 * @param {Object} state
 * @param {Object} action
 * @param {Object} action.prop
 * @param {Object} action.newConfig
 */
export const layerColorUIChangeUpdater = (state, {oldLayer, prop, newConfig}) => {
  const newLayer = oldLayer.updateLayerColorUI(prop, newConfig);
  return {
    ...state,
    layers: state.layers.map(l => (l.id === oldLayer.id ? newLayer : l))
  };
};

/**
 * Start and end filter animation
 * @memberof visStateUpdaters
 * @param {Object} state `visState`
 * @param {Object} action action
 * @param {Number} action.idx idx of filter
 * @returns {Object} nextState
 * @public
 */
export const toggleFilterAnimationUpdater = (state, action) => ({
  ...state,
  filters: state.filters.map((f, i) => (i === action.idx ? {...f, isAnimating: !f.isAnimating} : f))
});

/**
 * Change filter animation speed
 * @memberof visStateUpdaters
 * @param {Object} state `visState`
 * @param {Object} action action
 * @param {Number} action.idx  `idx` of filter
 * @param {Number} action.speed `speed` to change it to. `speed` is a multiplier
 * @returns {Object} nextState
 * @public
 */
export const updateFilterAnimationSpeedUpdater = (state, action) => ({
  ...state,
  filters: state.filters.map((f, i) => (i === action.idx ? {...f, speed: action.speed} : f))
});

/**
 * Reset animation config current time to a specified value
 * @memberof visStateUpdaters
 * @param {Object} state `visState`
 * @param {Object} action action
 * @param {Number} action.value the value current time will be set to
 * @returns {Object} nextState
 * @public
 *
 */
export const updateAnimationTimeUpdater = (state, {value}) => ({
  ...state,
  animationConfig: {
    ...state.animationConfig,
    currentTime: value
  }
});

/**
 * Update animation speed with the vertical speed slider
 * @memberof visStateUpdaters
 * @param {Object} state `visState`
 * @param {Object} action action
 * @param {Number} action.speed the updated speed of the animation
 * @returns {Object} nextState
 * @public
 *
 */
export const updateLayerAnimationSpeedUpdater = (state, {speed}) => {
  return {
    ...state,
    animationConfig: {
      ...state.animationConfig,
      speed
    }
  };
};

/**
 * Show larger time filter at bottom for time playback (apply to time filter only)
 * @memberof visStateUpdaters
 * @param {Object} state `visState`
 * @param {Object} action action
 * @param {Number} action.idx index of filter to enlarge
 * @returns {Object} nextState
 * @public
 */
export const enlargeFilterUpdater = (state, action) => {
  const isEnlarged = state.filters[action.idx].enlarged;

  return {
    ...state,
    filters: state.filters.map((f, i) => {
      f.enlarged = !isEnlarged && i === action.idx;
      return f;
    })
  };
};

/**
 * Toggles filter feature visibility
 * @memberof visStateUpdaters
 * @param {Object} state `visState`
 * @param {Object} action action
 * @param {Number} action.idx index of filter to enlarge
 * @returns {Object} nextState
 */
export const toggleFilterFeatureUpdater = (state, action) => {
  const filter = state.filters[action.idx];
  const isVisible = get(filter, ['value', 'properties', 'isVisible']);
  const newFilter = {
    ...filter,
    value: featureToFilterValue(filter.value, filter.id, {
      isVisible: !isVisible
    })
  };

  return {
    ...state,
    filters: Object.assign([].concat(state.filters), {[action.idx]: newFilter})
  };
};

/**
 * Remove a filter
 * @memberof visStateUpdaters
 * @param {Object} state `visState`
 * @param {Object} action action
 * @param {Number} action.idx index of filter to b e removed
 * @returns {Object} nextState
 * @public
 */
export const removeFilterUpdater = (state, action) => {
  const {idx} = action;
  const {dataId, id} = state.filters[idx];

  const newFilters = [
    ...state.filters.slice(0, idx),
    ...state.filters.slice(idx + 1, state.filters.length)
  ];

  const filteredDatasets = applyFiltersToDatasets(dataId, state.datasets, newFilters, state.layers);
  const newEditor =
    getFilterIdInFeature(state.editor.selectedFeature) === id
      ? {
          ...state.editor,
          selectedFeature: null
        }
      : state.editor;

  let newState = set(['filters'], newFilters, state);
  newState = set(['datasets'], filteredDatasets, newState);
  newState = set(['editor'], newEditor, newState);

  return updateAllLayerDomainData(newState, dataId);
};

/**
 * Add a new layer
 * @memberof visStateUpdaters
 * @param {Object} state `visState`
 * @param {Object} action action
 * @param {Object} action.props - new layer props
 * @returns {Object} nextState
 * @public
 */
export const addLayerUpdater = (state, action) => {
  const defaultDataset = Object.keys(state.datasets)[0];
  const newLayer = new Layer({
    isVisible: true,
    isConfigActive: true,
    dataId: defaultDataset,
    ...action.props
  });

  return {
    ...state,
    layers: [...state.layers, newLayer],
    layerData: [...state.layerData, {}],
    layerOrder: [...state.layerOrder, state.layerOrder.length],
    splitMaps: addNewLayersToSplitMap(state.splitMaps, newLayer)
  };
};

/**
 * remove layer
 * @memberof visStateUpdaters
 * @param {Object} state `visState`
 * @param {Object} action action
 * @param {Number} action.idx index of layer to b e removed
 * @returns {Object} nextState
 * @public
 */
export const removeLayerUpdater = (state, {idx}) => {
  const {layers, layerData, clicked, hoverInfo} = state;
  const layerToRemove = state.layers[idx];
  const newMaps = removeLayerFromSplitMaps(state.splitMaps, layerToRemove);

  const newState = {
    ...state,
    layers: [...layers.slice(0, idx), ...layers.slice(idx + 1, layers.length)],
    layerData: [...layerData.slice(0, idx), ...layerData.slice(idx + 1, layerData.length)],
    layerOrder: state.layerOrder.filter(i => i !== idx).map(pid => (pid > idx ? pid - 1 : pid)),
    clicked: layerToRemove.isLayerHovered(clicked) ? undefined : clicked,
    hoverInfo: layerToRemove.isLayerHovered(hoverInfo) ? undefined : hoverInfo,
    splitMaps: newMaps
    // TODO: update filters, create helper to remove layer form filter (remove layerid and dataid) if mapped
  };

  return updateAnimationDomain(newState);
};

/**
 * Reorder layer
 * @memberof visStateUpdaters
 * @param {Object} state `visState`
 * @param {Object} action action
 * @param {Array<Number>} action.order an array of layer indexes
 * @returns {Object} nextState
 * @public
 */
export const reorderLayerUpdater = (state, {order}) => ({
  ...state,
  layerOrder: order
});

/**
 * Remove a dataset and all layers, filters, tooltip configs that based on it
 * @memberof visStateUpdaters
 * @param {Object} state `visState`
 * @param {Object} action action
 * @param {string} action.key dataset id
 * @returns {Object} nextState
 * @public
 */
export const removeDatasetUpdater = (state, action) => {
  // extract dataset key
  const {key: datasetKey} = action;
  const {datasets} = state;

  // check if dataset is present
  if (!datasets[datasetKey]) {
    return state;
  }

  /* eslint-disable no-unused-vars */
  const {
    layers,
    datasets: {[datasetKey]: dataset, ...newDatasets}
  } = state;
  /* eslint-enable no-unused-vars */

  const indexes = layers.reduce((listOfIndexes, layer, index) => {
    if (layer.config.dataId === datasetKey) {
      listOfIndexes.push(index);
    }
    return listOfIndexes;
  }, []);

  // remove layers and datasets
  const {newState} = indexes.reduce(
    ({newState: currentState, indexCounter}, idx) => {
      const currentIndex = idx - indexCounter;
      currentState = removeLayerUpdater(currentState, {idx: currentIndex});
      indexCounter++;
      return {newState: currentState, indexCounter};
    },
    {newState: {...state, datasets: newDatasets}, indexCounter: 0}
  );

  // remove filters
  const filters = state.filters.filter(filter => !filter.dataId.includes(datasetKey));

  // update interactionConfig
  let {interactionConfig} = state;
  const {tooltip} = interactionConfig;
  if (tooltip) {
    const {config} = tooltip;
    /* eslint-disable no-unused-vars */
    const {[datasetKey]: fields, ...fieldsToShow} = config.fieldsToShow;
    /* eslint-enable no-unused-vars */
    interactionConfig = {
      ...interactionConfig,
      tooltip: {...tooltip, config: {...config, fieldsToShow}}
    };
  }

  return {...newState, filters, interactionConfig};
};

/**
 * update layer blending mode
 * @memberof visStateUpdaters
 * @param {Object} state `visState`
 * @param {Object} action action
 * @param {string} action.mode one of `additive`, `normal` and `subtractive`
 * @returns {Object} nextState
 * @public
 */
export const updateLayerBlendingUpdater = (state, action) => ({
  ...state,
  layerBlending: action.mode
});

/**
 * Display dataset table in a modal
 * @memberof visStateUpdaters
 * @param {Object} state `visState`
 * @param {Object} action action
 * @param {string} action.dataId dataset id to show in table
 * @returns {Object} nextState
 * @public
 */
export const showDatasetTableUpdater = (state, action) => {
  return {
    ...state,
    editingDataset: action.dataId
  };
};

/**
 * reset visState to initial State
 * @memberof visStateUpdaters
 * @param {Object} state `visState`
 * @returns {Object} nextState
 * @public
 */
export const resetMapConfigUpdater = state => ({
  ...INITIAL_VIS_STATE,
  ...state.initialState,
  initialState: state.initialState
});

/**
 * Propagate `visState` reducer with a new configuration. Current config will be override.
 * @memberof visStateUpdaters
 * @param {Object} state `visState`
 * @param {Object} action action
 * @param {Object} action.payload map config to be propagated
 * @param {Object} action.payload.config map config to be propagated
 * @param {Object} action.payload.option {keepExistingConfig: true | false}
 * @returns {Object} nextState
 * @public
 */
export const receiveMapConfigUpdater = (state, {payload: {config = {}, options = {}}}) => {
  if (!config.visState) {
    return state;
  }

  const {
    filters,
    layers,
    interactionConfig,
    layerBlending,
    splitMaps,
    animationConfig
  } = config.visState;

  const {keepExistingConfig} = options;

  // reset config if keepExistingConfig is falsy
  let mergedState = !keepExistingConfig ? resetMapConfigUpdater(state) : state;
  mergedState = mergeLayers(mergedState, layers);
  mergedState = mergeFilters(mergedState, filters);
  mergedState = mergeInteractions(mergedState, interactionConfig);
  mergedState = mergeLayerBlending(mergedState, layerBlending);
  mergedState = mergeSplitMaps(mergedState, splitMaps);
  mergedState = mergeAnimationConfig(mergedState, animationConfig);

  return mergedState;
};

/**
 * Trigger layer hover event with hovered object
 * @memberof visStateUpdaters
 * @param {Object} state `visState`
 * @param {Object} action action
 * @param {Object} action.info Object hovered, returned by deck.gl
 * @returns {Object} nextState
 * @public
 */
export const layerHoverUpdater = (state, action) => ({
  ...state,
  hoverInfo: action.info
});

/**
 * Trigger layer click event with clicked object
 * @memberof visStateUpdaters
 * @param {Object} state `visState`
 * @param {Object} action action
 * @param {Object} action.info Object clicked, returned by deck.gl
 * @returns {Object} nextState
 * @public
 */
export const layerClickUpdater = (state, action) => ({
  ...state,
  mousePos: state.interactionConfig.coordinate.enabled
    ? {
        ...state.mousePos,
        pinned: state.mousePos.pinned ? null : cloneDeep(state.mousePos)
      }
    : state.mousePos,
  clicked: action.info && action.info.picked ? action.info : null
});

/**
 * Trigger map click event, unselect clicked object
 * @memberof visStateUpdaters
 * @param {Object} state `visState`
 * @returns {Object} nextState
 * @public
 */
export const mapClickUpdater = state => {
  return {
    ...state,
    clicked: null
  };
};

export const mouseMoveUpdater = (state, {evt}) => {
  if (Object.values(state.interactionConfig).some(config => config.enabled)) {
    return {
      ...state,
      mousePos: {
        ...state.mousePos,
        mousePosition: [...evt.point],
        coordinate: [...evt.lngLat]
      }
    };
  }

  return state;
};
/**
 * Toggle visibility of a layer for a split map
 * @memberof visStateUpdaters
 * @param {Object} state `visState`
 * @param {Object} action action
 * @param {Number|undefined} action.payload index of the split map
 * @returns {Object} nextState
 * @public
 */
export const toggleSplitMapUpdater = (state, action) =>
  state.splitMaps && state.splitMaps.length === 0
    ? {
        ...state,
        // maybe we should use an array to store state for a single map as well
        // if current maps length is equal to 0 it means that we are about to split the view
        splitMaps: computeSplitMapLayers(state.layers)
      }
    : closeSpecificMapAtIndex(state, action);

/**
 * Toggle visibility of a layer in a split map
 * @memberof visStateUpdaters
 * @param {Object} state
 * @param {Object} action
 * @param {Number} action.mapIndex index of the split map
 * @param {string} action.layerId id of the layer
 * @returns {Object} nextState
 * @public
 */
export const toggleLayerForMapUpdater = (state, {mapIndex, layerId}) => {
  const {splitMaps} = state;

  return {
    ...state,
    splitMaps: splitMaps.map((sm, i) =>
      i === mapIndex
        ? {
            ...splitMaps[i],
            layers: {
              ...splitMaps[i].layers,
              // if layerId not in layers, set it to visible
              [layerId]: !splitMaps[i].layers[layerId]
            }
          }
        : sm
    )
  };
};

/**
 * Add new dataset to `visState`, with option to load a map config along with the datasets
 * @memberof visStateUpdaters
 * @param {Object} state `visState`
 * @param {Object} action action
 * @param {Array<Object>|Object} action.datasets - ***required** datasets can be a dataset or an array of datasets
 * Each dataset object needs to have `info` and `data` property.
 * @param {Object} action.datasets.info -info of a dataset
 * @param {string} action.datasets.info.id - id of this dataset. If config is defined, `id` should matches the `dataId` in config.
 * @param {string} action.datasets.info.label - A display name of this dataset
 * @param {Object} action.datasets.data - ***required** The data object, in a tabular format with 2 properties `fields` and `rows`
 * @param {Array<Object>} action.datasets.data.fields - ***required** Array of fields,
 * @param {string} action.datasets.data.fields.name - ***required** Name of the field,
 * @param {Array<Array>} action.datasets.data.rows - ***required** Array of rows, in a tabular format with `fields` and `rows`
 * @param {Object} action.options option object `{centerMap: true, keepExistingConfig: false}`
 * @param {Object} action.config map config
 * @returns {Object} nextState
 * @public
 */
/* eslint-disable max-statements */
export const updateVisDataUpdater = (state, action) => {
  // datasets can be a single data entries or an array of multiple data entries
  const {config, options} = action;

  const datasets = toArray(action.datasets);

  const newDataEntries = datasets.reduce(
    (accu, {info = {}, data}) => ({
      ...accu,
      ...(createNewDataEntry({info, data}, state.datasets) || {})
    }),
    {}
  );

  if (!Object.keys(newDataEntries).length) {
    return state;
  }

  // apply config if passed from action
  const previousState = config
    ? receiveMapConfigUpdater(state, {
        payload: {config, options}
      })
    : state;

  const stateWithNewData = {
    ...previousState,
    datasets: {
      ...previousState.datasets,
      ...newDataEntries
    }
  };

  // previously saved config before data loaded
  const {
    filterToBeMerged = [],
    layerToBeMerged = [],
    interactionToBeMerged = {},
    splitMapsToBeMerged = []
  } = stateWithNewData;

  // We need to merge layers before filters because polygon filters requires layers to be loaded
  let mergedState = mergeLayers(stateWithNewData, layerToBeMerged);

  mergedState = mergeFilters(mergedState, filterToBeMerged);

  // merge state with saved splitMaps
  mergedState = mergeSplitMaps(mergedState, splitMapsToBeMerged);

  let newLayers = mergedState.layers.filter(l => l.config.dataId in newDataEntries);

  if (!newLayers.length) {
    // no layer merged, find defaults
    const result = addDefaultLayers(mergedState, newDataEntries);
    mergedState = result.state;
    newLayers = result.newLayers;
  }

  if (mergedState.splitMaps.length) {
    // if map is split, add new layers to splitMaps
    newLayers = mergedState.layers.filter(l => l.config.dataId in newDataEntries);
    mergedState = {
      ...mergedState,
      splitMaps: addNewLayersToSplitMap(mergedState.splitMaps, newLayers)
    };
  }

  // merge state with saved interactions
  mergedState = mergeInteractions(mergedState, interactionToBeMerged);

  // if no tooltips merged add default tooltips
  Object.keys(newDataEntries).forEach(dataId => {
    const tooltipFields = mergedState.interactionConfig.tooltip.config.fieldsToShow[dataId];
    if (!Array.isArray(tooltipFields) || !tooltipFields.length) {
      mergedState = addDefaultTooltips(mergedState, newDataEntries[dataId]);
    }
  });

  let updatedState = updateAllLayerDomainData(mergedState, Object.keys(newDataEntries));

  // register layer animation domain,
  // need to be called after layer data is calculated
  updatedState = updateAnimationDomain(updatedState);

  return updatedState;
};
/* eslint-enable max-statements */

/**
 * When a user clicks on the specific map closing icon
 * the application will close the selected map
 * and will merge the remaining one with the global state
 * TODO: i think in the future this action should be called merge map layers with global settings
 * @param {Object} state `visState`
 * @param {Object} action action
 * @returns {Object} nextState
 */
function closeSpecificMapAtIndex(state, action) {
  // retrieve layers meta data from the remaining map that we need to keep
  const indexToRetrieve = 1 - action.payload;
  const mapLayers = state.splitMaps[indexToRetrieve].layers;
  const {layers} = state;

  // update layer visibility
  const newLayers = layers.map(layer =>
    !mapLayers[layer.id] && layer.config.isVisible
      ? layer.updateLayerConfig({
          // if layer.id is not in mapLayers, it should be inVisible
          isVisible: false
        })
      : layer
  );

  // delete map
  return {
    ...state,
    layers: newLayers,
    splitMaps: []
  };
}

/**
 * Trigger file loading dispatch `addDataToMap` if succeed, or `loadFilesErr` if failed
 * @memberof visStateUpdaters
 * @param {Object} state `visState`
 * @param {Object} action action
 * @param {Array<Object>} action.files array of fileblob
 * @returns {Object} nextState
 * @public
 */
export const loadFilesUpdater = (state, action) => {
  const {files} = action;
  if (!files.length) {
    return state;
  }

  const fileCache = [];
  return withTask(
    {
      ...state,
      fileLoading: true,
      fileLoadingProgress: 0
    },
    makeLoadFileTask(files.length, files, fileCache)
  );
};

function makeLoadFileTask(totalCount, filesToLoad, fileCache) {
  const file = filesToLoad.pop();

  return LOAD_FILE_TASK({file, fileCache}).bimap(
    // success
    result =>
      loadFileSuccess({
        fileCache: result,
        filesToLoad: [...filesToLoad],
        totalCount
      }),
    // error
    loadFilesErr
  );
}

export const loadFileSuccessUpdater = (state, action) => {
  const {fileCache, filesToLoad = [], totalCount} = action;

  // still more to load
  if (filesToLoad.length) {
    const fileLoadingProgress = ((totalCount - filesToLoad.length) / totalCount) * 100;

    return withTask(
      {
        ...state,
        fileLoadingProgress
      },
      makeLoadFileTask(totalCount, filesToLoad, fileCache)
    );
  }

  const result = fileCache.reduce(
    (accu, file) => {
      const {data, info = {}} = file;
      const {format} = info;

      if (format) {
        if (format !== DATASET_FORMATS.keplergl) {
          const newDataset = {
            data,
            info: {
              id: generateHashId(4),
              ...info
            }
          };

          accu.datasets.push(newDataset);
          return accu;
        }

        return {
          datasets: accu.datasets.concat(data.datasets),
          // we need to deep merge this thing unless we find a better solution
          // this case will only happen if we allow to load multiple keplergl json files
          config: {
            ...accu.config,
            ...(data.config || {})
          }
        };
      }
      return accu;
    },
    {datasets: [], config: {}}
  );

  const options = {
    centerMap: !(result.config && result.config.mapState)
  };

  return withTask(
    {
      ...state,
      fileLoading: false,
      fileLoadingProgress: 100
    },
    ACTION_TASK().map(_ => addDataToMap({...result, options}))
  );
};

/**
 * Trigger loading file error
 * @memberof visStateUpdaters
 * @param {Object} state `visState`
 * @param {Object} action action
 * @param {*} action.error
 * @returns {Object} nextState
 * @public
 */
export const loadFilesErrUpdater = (state, {error}) => ({
  ...state,
  fileLoading: false,
  fileLoadingErr: error
});

/**
 * When select dataset for export, apply cpu filter to selected dataset
 * @memberof visStateUpdaters
 * @param {Object} state `visState`
 * @param {Object} action
 * @param {string} action.dataId dataset id
 * @returns {Object} nextState
 * @public
 */
export const applyCPUFilterUpdater = (state, {dataId}) => {
  // apply cpuFilter
  const dataIds = toArray(dataId);

  return dataIds.reduce((accu, id) => filterDatasetCPU(accu, id), state);
};

/**
 * User input to update the info of the map
 * @memberof visStateUpdaters
 * @param {Object} state `visState`
 * @param {Object} action action
 * @param {Object} action.info {title: 'hello'}
 * @returns {Object} nextState
 * @public
 */
export const setMapInfoUpdater = (state, action) => ({
  ...state,
  mapInfo: {
    ...state.mapInfo,
    ...action.info
  }
});
/**
 * Helper function to update All layer domain and layer data of state
 * @memberof visStateUpdaters
 * @param {Object} state `visState`
 * @param {Array<string>} datasets
 * @returns {Object} nextState
 */
export function addDefaultLayers(state, datasets) {
  const defaultLayers = Object.values(datasets).reduce(
    (accu, dataset) => [...accu, ...(findDefaultLayer(dataset, state.layerClasses) || [])],
    []
  );

  return {
    state: {
      ...state,
      layers: [...state.layers, ...defaultLayers],
      layerOrder: [
        // put new layers on top of old ones
        ...defaultLayers.map((_, i) => state.layers.length + i),
        ...state.layerOrder
      ]
    },
    newLayers: defaultLayers
  };
}

/**
 * helper function to find default tooltips
 * @param {Object} state
 * @param {Object} dataset
 * @returns {Object} nextState
 */
export function addDefaultTooltips(state, dataset) {
  const tooltipFields = findFieldsToShow(dataset);
  const merged = {
    ...state.interactionConfig.tooltip.config.fieldsToShow,
    ...tooltipFields
  };

  return set(['interactionConfig', 'tooltip', 'config', 'fieldsToShow'], merged, state);
}

/**
 * Helper function to update layer domains for an array of datasets
 * @param {Object} state
 * @param {Array|Array<string>} dataId dataset id or array of dataset ids
 * @param {Object} updatedFilter if is called by setFilter, the filter that has updated
 * @returns {Object} nextState
 */
export function updateAllLayerDomainData(state, dataId, updatedFilter) {
  const dataIds = typeof dataId === 'string' ? [dataId] : dataId;
  const newLayers = [];
  const newLayerData = [];

  state.layers.forEach((oldLayer, i) => {
    if (oldLayer.config.dataId && dataIds.includes(oldLayer.config.dataId)) {
      // No need to recalculate layer domain if filter has fixed domain
      const newLayer =
        updatedFilter && updatedFilter.fixedDomain
          ? oldLayer
          : oldLayer.updateLayerDomain(state.datasets, updatedFilter);

      const {layerData, layer} = calculateLayerData(newLayer, state, state.layerData[i]);

      // console.log('LayerData', layerData);
      newLayers.push(layer);
      newLayerData.push(layerData);
    } else {
      newLayers.push(oldLayer);
      newLayerData.push(state.layerData[i]);
    }
  });

  const newState = {
    ...state,
    layers: newLayers,
    layerData: newLayerData
  };

  return newState;
}

export function updateAnimationDomain(state) {
  // merge all animatable layer domain and update global config
  const animatableLayers = state.layers.filter(
    l =>
      l.config.isVisible &&
      l.config.animation &&
      l.config.animation.enabled &&
      Array.isArray(l.animationDomain)
  );

  if (!animatableLayers.length) {
    return {
      ...state,
      animationConfig: defaultAnimationConfig
    };
  }

  const mergedDomain = animatableLayers.reduce(
    (accu, layer) => [
      Math.min(accu[0], layer.animationDomain[0]),
      Math.max(accu[1], layer.animationDomain[1])
    ],
    [Number(Infinity), -Infinity]
  );

  return {
    ...state,
    animationConfig: {
      ...state.animationConfig,
      currentTime: isInRange(state.animationConfig.currentTime, mergedDomain)
        ? state.animationConfig.currentTime
        : mergedDomain[0],
      domain: mergedDomain
    }
  };
}

/**
 * Update the status of the editor
 * @memberof visStateUpdaters
 * @param {Object} state `visState`
 * @param {string} mode to set to editor to
 * @return {Object} nextState
 */
export const setEditorModeUpdater = (state, {mode}) => ({
  ...state,
  editor: {
    ...state.editor,
    mode,
    selectedFeature: null
  }
});

// const featureToFilterValue = (feature) => ({...feature, id: feature.id});
/**
 * Update editor features
 * @memberof visStateUpdaters
 * @param {Object} state `visState`
 * @param {[Object]} features to store
 * @return {Object} nextState
 */
export function setFeaturesUpdater(state, {features = []}) {
  const lastFeature = features.length && features[features.length - 1];

  const newState = {
    ...state,
    editor: {
      ...state.editor,
      // only save none filter features to editor
      features: features.filter(f => !getFilterIdInFeature(f)),
      mode: lastFeature && lastFeature.properties.isClosed ? EDITOR_MODES.EDIT : state.editor.mode
    }
  };

  // Retrieve existing feature
  const {selectedFeature} = state.editor;

  // If no feature is selected we can simply return since no operations
  if (!selectedFeature) {
    return newState;
  }

  // TODO: check if the feature has changed
  const feature = features.find(f => f.id === selectedFeature.id);

  // if feature is part of a filter
  const filterId = feature && getFilterIdInFeature(feature);
  if (filterId) {
    const featureValue = featureToFilterValue(feature, filterId);
    const filterIdx = state.filters.findIndex(fil => fil.id === filterId);
    return setFilterUpdater(newState, {
      idx: filterIdx,
      prop: 'value',
      value: featureValue
    });
  }

  return newState;
}

/**
 * Set the current selected feature
 * @memberof uiStateUpdaters
 * @param {Object} state `uiState`
 * @param {[Object]} features to store
 * @return {Object} nextState
 */
export const setSelectedFeatureUpdater = (state, {feature}) => ({
  ...state,
  editor: {
    ...state.editor,
    selectedFeature: feature
  }
});

/**
 * Delete existing feature from filters
 * @memberof visStateUpdaters
 * @param {Object} state `visState`
 * @param {string} selectedFeatureId feature to delete
 * @return {Object} nextState
 */
export function deleteFeatureUpdater(state, {feature}) {
  if (!feature) {
    return state;
  }

  const newState = {
    ...state,
    editor: {
      ...state.editor,
      selectedFeature: null
    }
  };

  if (getFilterIdInFeature(feature)) {
    const filterIdx = newState.filters.findIndex(f => f.id === getFilterIdInFeature(feature));

    return filterIdx > -1 ? removeFilterUpdater(newState, {idx: filterIdx}) : newState;
  }

  // modify editor object
  const newEditor = {
    ...state.editor,
    features: state.editor.features.filter(f => f.id !== feature.id),
    selectedFeature: null
  };

  return {
    ...state,
    editor: newEditor
  };
}

/**
 * Toggle feature as layer filter
 * @memberof visStateUpdaters
 * @param state
 * @param {Object} payload
 * @param {string} payload.featureId
 * @param {Object} payload.layer
 * @return {Object} nextState
 */
export function setPolygonFilterLayerUpdater(state, payload) {
  const {layer, feature} = payload;
  const filterId = getFilterIdInFeature(feature);

  // let newFilter = null;
  let filterIdx;
  let newLayerId = [layer.id];
  let newState = state;
  // If polygon filter already exists, we need to find out if the current layer is already included
  if (filterId) {
    filterIdx = state.filters.findIndex(f => f.id === filterId);

    if (!state.filters[filterIdx]) {
      // what if filter doesn't exist?... not possible.
      // because features in the editor is passed in from filters and editors.
      // but we will move this feature back to editor just in case
      const noneFilterFeature = {
        ...feature,
        properties: {
          ...feature.properties,
          filterId: null
        }
      };

      return {
        ...state,
        editor: {
          ...state.editor,
          features: [...state.editor.features, noneFilterFeature],
          selectedFeature: noneFilterFeature
        }
      };
    }

    const {layerId} = state.filters[filterIdx] || [];
    const isLayerIncluded = layerId.includes(layer.id);
    const filter = state.filters[filterIdx];

    newLayerId = isLayerIncluded
      ? // if layer is included, remove it
        filter.layerId.filter(l => l !== layer.id)
      : [...filter.layerId, layer.id];
  } else {
    // if we haven't create the polygon filter, create it
    const newFilter = generatePolygonFilter([], feature);
    filterIdx = state.filters.length;

    // add feature, remove feature from eidtor
    newState = {
      ...state,
      filters: [...state.filters, newFilter],
      editor: {
        ...state.editor,
        features: state.editor.features.filter(f => f.id !== feature.id),
        selectedFeature: newFilter.value
      }
    };
  }

  return setFilterUpdater(newState, {
    idx: filterIdx,
    prop: 'layerId',
    value: newLayerId
  });
}

/**
 * Update editor
 * @param {Object} state `visState`
 * @param visible
 * @return {Object} nextState
 */
export function toggleEditorVisibility(state, {visible}) {
  return {
    ...state,
    editor: {
      ...state.editor,
      visible: !state.editor.visible
    }
  };
}
