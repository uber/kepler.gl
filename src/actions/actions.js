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

import ActionTypes from 'constants/action-types';
import {createAction} from 'redux-actions';

/**
 * Add data to kepler.gl reducer, prepare map with preset configuration if config is passed.
 * Kepler.gl provides a handy set of utils to parse data from different formats to the `data` object required in dataset. You rarely need to manually format the data obejct.
 *
 * Use `KeplerGlSchema.getConfigToSave` to generate a json blob of the currents instance config.
 * The config object value will always have higher precedence than the options properties.
 *
 * Kepler.gl uses `dataId` in the config to match with loaded dataset. If you pass a config object, you need
 * to match the `info.id` of your dataset to the `dataId` in each `layer`, `filter` and `interactionConfig.tooltips.fieldsToShow`
 *
 * @memberof main
 * @param {Object} data
 * @param {Array<Object>|Object} data.datasets - ***required** datasets can be a dataset or an array of datasets
 * Each dataset object needs to have `info` and `data` property.
 * @param {Object} data.datasets.info -info of a dataset
 * @param {string} data.datasets.info.id - id of this dataset. If config is defined, `id` should matches the `dataId` in config.
 * @param {string} data.datasets.info.label - A display name of this dataset
 * @param {Object} data.datasets.data - ***required** The data object, in a tabular format with 2 properties `fields` and `rows`
 * @param {Array<Object>} data.datasets.data.fields - ***required** Array of fields,
 * @param {string} data.datasets.data.fields.name - ***required** Name of the field,
 * @param {Array<Array>} data.datasets.data.rows - ***required** Array of rows, in a tabular format with `fields` and `rows`
 *
 * @param {Object} data.options
 * @param {boolean} data.options.centerMap `default: true` if `centerMap` is set to `true` kepler.gl will
 * place the map view within the data points boundaries.  `options.centerMap` will override `config.mapState` if passed in.
 * @param {boolean} data.options.readOnly `default: false` if `readOnly` is set to `true`
 * the left setting panel will be hidden
 * @param {boolean} data.options.keepExistingConfig whether to keep exiting map data and associated layer filter  interaction config `default: false`.
 * @param {Object} data.config this object will contain the full kepler.gl instance configuration {mapState, mapStyle, visState}
 * @public
 * @example
 *
 * // app.js
 * import {addDataToMap} from 'kepler.gl/actions';
 *
 * const sampleTripData = {
 *  fields: [
 *    {name: 'tpep_pickup_datetime', format: 'YYYY-M-D H:m:s', type: 'timestamp'},
 *    {name: 'pickup_longitude', format: '', type: 'real'},
 *    {name: 'pickup_latitude', format: '', type: 'real'}
 *  ],
 *  rows: [
 *    ['2015-01-15 19:05:39 +00:00', -73.99389648, 40.75011063],
 *    ['2015-01-15 19:05:39 +00:00', -73.97642517, 40.73981094],
 *    ['2015-01-15 19:05:40 +00:00', -73.96870422, 40.75424576],
 *  ]
 * };
 *
 * const sampleConfig = {
 *   visState: {
 *     filters: [
 *       {
 *         id: 'me',
 *         dataId: 'test_trip_data',
 *         name: 'tpep_pickup_datetime',
 *         type: 'timeRange',
 *         enlarged: true
 *       }
 *     ]
 *   }
 * }
 *
 * this.props.dispatch(
 *   addDataToMap({
 *     datasets: {
 *       info: {
 *         label: 'Sample Taxi Trips in New York City',
 *         id: 'test_trip_data'
 *       },
 *       data: sampleTripData
 *     },
 *     options: {
 *       centerMap: true,
 *       readOnly: false,
 *       keepExistingConfig: false
 *     },
 *     info: {
 *       title: 'Taro and Blue',
 *       description: 'This is my map'
 *     }
 *     config: sampleConfig
 *   })
 * );
 */
export const addDataToMap = createAction(ActionTypes.ADD_DATA_TO_MAP, data => data);

/**
 * Reset all sub-reducers to its initial state. This can be used to clear out all configuration in the reducer.
 * @memberof main
 * @public
 */
export const resetMapConfig = createAction(ActionTypes.RESET_MAP_CONFIG);

/**
 * Pass config to kepler.gl instance, prepare the state with preset configs.
 * Calling `KeplerGlSchema.parseSavedConfig` to convert saved config before passing it in is required.
 *
 * You can call `receiveMapConfig` before passing in any data. The reducer will store layer and filter config, waiting for
 * data to come in. When data arrives, you can call `addDataToMap` without passing any config, and the reducer will try to match
 * preloaded configs. This behavior is designed to allow asynchronous data loading.
 *
 * It is also useful when you want to prepare the kepler.gl instance with some preset layer and filter settings.
 * **Note** Sequence is important, `receiveMapConfig` needs to be called __before__ data is loaded. Currently kepler.gl doesn't allow calling `receiveMapConfig` after data is loaded.
 * It will reset current configuration first then apply config to it.
 * @memberof main
 * @param {Object} config - ***required** The Config Object
 * @param {Object} options - ***optional** The Option object
 * @param {boolean} options.centerMap `default: true` if `centerMap` is set to `true` kepler.gl will
 * place the map view within the data points boundaries
 * @param {boolean} options.readOnly `default: false` if `readOnly` is set to `true`
 * the left setting panel will be hidden
 * @param {boolean} options.keepExistingConfig whether to keep exiting layer filter and interaction config `default: false`.
 * @param {boolean} options.autoCreateLayers whether to automatically create layers based on dataset columns `default: true`.
 * @public
 * @example
 * import {receiveMapConfig} from 'kepler.gl/actions';
 * import KeplerGlSchema from 'kepler.gl/schemas';
 *
 * const parsedConfig = KeplerGlSchema.parseSavedConfig(config);
 * this.props.dispatch(receiveMapConfig(parsedConfig));
 */
export const receiveMapConfig = createAction(ActionTypes.RECEIVE_MAP_CONFIG, (config, options) => ({
  config,
  options
}));

/**
 * Initialize kepler.gl reducer. It is used to pass in `mapboxApiAccessToken` to `mapStyle` reducer.
 * @memberof main
 * @param {object} payload
 * @param payload.mapboxApiAccessToken - mapboxApiAccessToken to be saved to mapStyle reducer
 * @param payload.mapboxApiUrl - mapboxApiUrl to be saved to mapStyle reducer.
 * @param payload.mapStylesReplaceDefault - mapStylesReplaceDefault to be saved to mapStyle reducer
 * @param payload.initialUiState - initial ui state
 * @type {typeof import('./actions').keplerGlInit}
 * @public
 */
export const keplerGlInit = createAction(
  ActionTypes.INIT,
  // @ts-ignore
  payload => payload
);

/**
 * This declaration is needed to group actions in docs
 */
/**
 * Main kepler.gl actions, these actions handles loading data and config into kepler.gl reducer. These actions
 * is listened by all subreducers,
 * @public
 */
/* eslint-disable no-unused-vars */
// @ts-ignore
const main = null;
/* eslint-enable no-unused-vars */
