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

// @ts-nocheck
import {
  ADD_DATA_ID,
  DATA_TABLE_ID,
  DEFAULT_NOTIFICATION_TOPICS,
  DELETE_DATA_ID,
  EXPORT_DATA_TYPE,
  EXPORT_HTML_MAP_MODES,
  EXPORT_IMG_RATIOS,
  EXPORT_MAP_FORMATS,
  RESOLUTIONS
} from 'constants/default-settings';
import {LOCALE_CODES} from 'localization/locales';
import {createNotification, errorNotification} from 'utils/notifications-utils';
import {calculateExportImageSize} from 'utils/export-utils';
import {payload_, apply_, compose_} from './composer-helpers';

export const DEFAULT_ACTIVE_SIDE_PANEL = 'layer';
export const DEFAULT_MODAL = ADD_DATA_ID;

/**
 * Updaters for `uiState` reducer. Can be used in your root reducer to directly modify kepler.gl's state.
 * Read more about [Using updaters](../advanced-usage/using-updaters.md)
 *
 * @public
 * @example
 *
 * import keplerGlReducer, {uiStateUpdaters} from 'kepler.gl/reducers';
 * // Root Reducer
 * const reducers = combineReducers({
 *  keplerGl: keplerGlReducer,
 *  app: appReducer
 * });
 *
 * const composedReducer = (state, action) => {
 *  switch (action.type) {
 *    // click button to close side panel
 *    case 'CLICK_BUTTON':
 *      return {
 *        ...state,
 *        keplerGl: {
 *          ...state.keplerGl,
 *          foo: {
 *             ...state.keplerGl.foo,
 *             uiState: uiStateUpdaters.toggleSidePanelUpdater(
 *               uiState, {payload: null}
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
const uiStateUpdaters = null;
/* eslint-enable no-unused-vars */

const DEFAULT_MAP_CONTROLS_FEATURES = {
  show: true,
  active: false,
  disableClose: false,
  // defines which map index users are interacting with (through map controls)
  activeMapIndex: 0
};

/**
 * A list of map control visibility and whether is it active.
 * @memberof uiStateUpdaters
 * @constant
 * @property visibleLayers Default: `{show: true, active: false}`
 * @property mapLegend Default: `{show: true, active: false}`
 * @property toggle3d Default: `{show: true}`
 * @property splitMap Default: `{show: true}`
 * @property mapDraw Default: `{show: true, active: false}`
 * @property mapLocale Default: `{show: false, active: false}`
 * @type {import('./ui-state-updaters').MapControls}
 * @public
 */
export const DEFAULT_MAP_CONTROLS = [
  'visibleLayers',
  'mapLegend',
  'toggle3d',
  'splitMap',
  'mapDraw',
  'mapLocale'
].reduce(
  (final, current) => ({
    ...final,
    [current]: DEFAULT_MAP_CONTROLS_FEATURES
  }),
  {}
);

/**
 * Default image export config
 * @memberof uiStateUpdaters
 * @constant
 * @property ratio Default: `'SCREEN'`,
 * @property resolution Default: `'ONE_X'`,
 * @property legend Default: `false`,
 * @property mapH Default: 0,
 * @property mapW Default: 0,
 * @property imageSize Default: {zoomOffset: 0, scale: 1, imageW: 0, imageH: 0},
 * @property imageDataUri Default: `''`,
 * @property exporting Default: `false`
 * @property error Default: `false`
 * @type {import('./ui-state-updaters').ExportImage}
 * @public
 */
export const DEFAULT_EXPORT_IMAGE = {
  // user options
  ratio: EXPORT_IMG_RATIOS.SCREEN,
  resolution: RESOLUTIONS.ONE_X,
  legend: false,
  mapH: 0,
  mapW: 0,
  imageSize: {
    zoomOffset: 0,
    scale: 1,
    imageW: 0,
    imageH: 0
  },
  // when this is set to true, the mock map viewport will move to the center of data
  center: false,
  // exporting state
  imageDataUri: '',
  // exporting: used to attach plot-container to dom
  exporting: false,
  // processing: used as loading indicator when export image is being produced
  processing: false,
  error: false
};

export const DEFAULT_LOAD_FILES = {
  fileLoading: false
};

/**
 * Default initial `exportData` settings
 * @memberof uiStateUpdaters
 * @constant
 * @property selectedDataset Default: `''`,
 * @property dataType Default: `'csv'`,
 * @property filtered Default: `true`,
 * @type {import('./ui-state-updaters').ExportData}
 * @public
 */
export const DEFAULT_EXPORT_DATA = {
  selectedDataset: '',
  dataType: EXPORT_DATA_TYPE.CSV,
  filtered: true
};

/**
 * @constant
 */
export const DEFAULT_NOTIFICATIONS = [];

/**
 * @constant
 * @property exportMapboxAccessToken - Default: null, this is used when we provide a default mapbox token for users to take advantage of
 * @property userMapboxToken - Default: '', mapbox token provided by user through input field
 * @property mode - Default: 'READ', read only or editable
 * @type {import('./ui-state-updaters').ExportHtml}
 * @public
 */
export const DEFAULT_EXPORT_HTML = {
  exportMapboxAccessToken: null,
  userMapboxToken: '',
  mode: EXPORT_HTML_MAP_MODES.READ
};

/**
 * @constant
 * @property hasData - Default: 'true',
 * @type {import('./ui-state-updaters').ExportJson}
 * @public
 */
export const DEFAULT_EXPORT_JSON = {
  hasData: true
};

/**
 * Export Map Config
 * @constant
 * @property HTML - Default: 'DEFAULT_EXPORT_HTML',
 * @property JSON - Default: 'DEFAULT_EXPORT_JSON',
 * @property format - Default: 'HTML',
 * @type {import('./ui-state-updaters').ExportMap}
 * @public
 */
export const DEFAULT_EXPORT_MAP = {
  [EXPORT_MAP_FORMATS.HTML]: DEFAULT_EXPORT_HTML,
  [EXPORT_MAP_FORMATS.JSON]: DEFAULT_EXPORT_JSON,
  format: EXPORT_MAP_FORMATS.HTML
};

/**
 * Default initial `uiState`
 * @memberof uiStateUpdaters
 * @constant
 * @property readOnly Default: `false`
 * @property activeSidePanel Default: `'layer'`
 * @property currentModal Default: `'addData'`
 * @property datasetKeyToRemove Default: `null`
 * @property visibleDropdown Default: `null`
 * @property exportImage Default: [`DEFAULT_EXPORT_IMAGE`](#default_export_image)
 * @property exportData Default: [`DEFAULT_EXPORT_DATA`](#default_export_data)
 * @property exportMap Default: [`DEFAULT_EXPORT_MAP`](#default_export_map)
 * @property mapControls Default: [`DEFAULT_MAP_CONTROLS`](#default_map_controls)
 * @property notifications Default: `[]`
 * @property notifications Default: `[]`
 * @property loadFiles
 * @type {import('./ui-state-updaters').UiState}
 * @public
 */
export const INITIAL_UI_STATE = {
  readOnly: false,
  activeSidePanel: DEFAULT_ACTIVE_SIDE_PANEL,
  currentModal: DEFAULT_MODAL,
  datasetKeyToRemove: null,
  visibleDropdown: null,
  // export image modal ui
  exportImage: DEFAULT_EXPORT_IMAGE,
  // export data modal ui
  exportData: DEFAULT_EXPORT_DATA,
  // html export
  exportMap: DEFAULT_EXPORT_MAP,
  // map control panels
  mapControls: DEFAULT_MAP_CONTROLS,
  // ui notifications
  notifications: DEFAULT_NOTIFICATIONS,
  // load files
  loadFiles: DEFAULT_LOAD_FILES,
  // Locale of the UI
  locale: LOCALE_CODES.en
};

/* Updaters */
/**
 * @memberof uiStateUpdaters

 */
export const initUiStateUpdater = (state, action) => ({
  ...state,
  ...(action.payload || {}).initialUiState
});

/**
 * Toggle active side panel
 * @memberof uiStateUpdaters
 * @param state `uiState`
 * @param action
 * @param action.payload id of side panel to be shown, one of `layer`, `filter`, `interaction`, `map`. close side panel if `null`
 * @returns nextState
 * @type {typeof import('./ui-state-updaters').toggleSidePanelUpdater}
 * @public
 */
export const toggleSidePanelUpdater = (state, {payload: id}) => {
  return id === state.activeSidePanel
    ? state
    : {
        ...state,
        activeSidePanel: id
      };
};

/**
 * Show and hide modal dialog
 * @memberof uiStateUpdaters
 * @param state `uiState`
 * @param action
 * @paramaction.payload id of modal to be shown, null to hide modals. One of:
 *  - [`DATA_TABLE_ID`](../constants/default-settings.md#data_table_id)
 *  - [`DELETE_DATA_ID`](../constants/default-settings.md#delete_data_id)
 *  - [`ADD_DATA_ID`](../constants/default-settings.md#add_data_id)
 *  - [`EXPORT_IMAGE_ID`](../constants/default-settings.md#export_image_id)
 *  - [`EXPORT_DATA_ID`](../constants/default-settings.md#export_data_id)
 *  - [`ADD_MAP_STYLE_ID`](../constants/default-settings.md#add_map_style_id)
 * @returns nextState
 * @type {typeof import('./ui-state-updaters').toggleModalUpdater}
 * @public
 */
export const toggleModalUpdater = (state, {payload: id}) => ({
  ...state,
  currentModal: id
});

/**
 * Hide and show side panel header dropdown, activated by clicking the share link on top of the side panel
 * @memberof uiStateUpdaters
 * @type {typeof import('./ui-state-updaters').showExportDropdownUpdater}
 * @public
 */
export const showExportDropdownUpdater = (state, {payload: id}) => ({
  ...state,
  visibleDropdown: id
});

/**
 * Hide side panel header dropdown, activated by clicking the share link on top of the side panel
 * @memberof uiStateUpdaters
 * @type {typeof import('./ui-state-updaters').hideExportDropdownUpdater}
 * @public
 */
export const hideExportDropdownUpdater = state => ({
  ...state,
  visibleDropdown: null
});

/**
 * Toggle active map control panel
 * @memberof uiStateUpdaters
 * @param state `uiState`
 * @param action action
 * @param action.payload map control panel id, one of the keys of: [`DEFAULT_MAP_CONTROLS`](#default_map_controls)
 * @returns nextState
 * @type {typeof import('./ui-state-updaters').toggleMapControlUpdater}
 * @public
 */
export const toggleMapControlUpdater = (state, {payload: {panelId, index = 0}}) => ({
  ...state,
  mapControls: {
    ...state.mapControls,
    [panelId]: {
      ...state.mapControls[panelId],
      // this handles split map interaction
      // Toggling from within the same map will simply toggle the active property
      // Toggling from within different maps we set the active property to true
      active:
        index === state.mapControls[panelId].activeMapIndex
          ? !state.mapControls[panelId].active
          : true,
      activeMapIndex: index
    }
  }
});

/**
 * Toggle active map control panel
 * @memberof uiStateUpdaters
 * @param state `uiState`
 * @param action
 * @param action.payload dataset id
 * @returns nextState
 * @type {typeof import('./ui-state-updaters').openDeleteModalUpdater}
 * @public
 */
export const openDeleteModalUpdater = (state, {payload: datasetKeyToRemove}) => ({
  ...state,
  currentModal: DELETE_DATA_ID,
  datasetKeyToRemove
});

/**
 * Set `exportImage.legend` to `true` or `false`
 * @memberof uiStateUpdaters
 * @param state `uiState`
 * @returns nextState
 * @type {typeof import('./ui-state-updaters').setExportImageSettingUpdater}
 * @public
 */
export const setExportImageSettingUpdater = (state, {payload: newSetting}) => {
  const updated = {...state.exportImage, ...newSetting};
  const imageSize = calculateExportImageSize(updated) || state.exportImage.imageSize;

  return {
    ...state,
    exportImage: {
      ...updated,
      imageSize
    }
  };
};

/**
 * Set `exportImage.setExportImageDataUri` to a image dataUri
 * @memberof uiStateUpdaters
 * @param state `uiState`
 * @param action
 * @param action.payload export image data uri
 * @returns nextState
 * @type {typeof import('./ui-state-updaters').setExportImageDataUriUpdater}
 * @public
 */
export const setExportImageDataUriUpdater = (state, {payload: dataUri}) => ({
  ...state,
  exportImage: {
    ...state.exportImage,
    processing: false,
    imageDataUri: dataUri
  }
});

/**
 * @memberof uiStateUpdaters
 * @type {typeof import('./ui-state-updaters').setExportImageErrorUpdater}
 * @public
 */
export const setExportImageErrorUpdater = (state, {payload: error}) => ({
  ...state,
  exportImage: {
    ...state.exportImage,
    processing: false,
    error
  }
});

/**
 * Delete cached export image
 * @memberof uiStateUpdaters
 * @type {typeof import('./ui-state-updaters').cleanupExportImageUpdater}
 * @public
 */
export const cleanupExportImageUpdater = state => ({
  ...state,
  exportImage: {
    ...state.exportImage,
    exporting: false,
    imageDataUri: '',
    error: false,
    processing: false,
    center: false
  }
});

/**
 * Start image exporting flow
 * @memberof uiStateUpdaters
 * @param state
 * @param options
 * @returns {UiState}
 * @type {typeof import('./ui-state-updaters').startExportingImage}
 * @public
 */
export const startExportingImageUpdater = (state, {payload: options = {}}) => {
  const imageSettings = {
    ...options,
    exporting: true
  };

  return compose_([
    cleanupExportImageUpdater,
    apply_(setExportImageSettingUpdater, payload_(imageSettings))
  ])(state);
};

/**
 * Set selected dataset for export
 * @memberof uiStateUpdaters
 * @param state `uiState`
 * @param action
 * @param action.payload dataset id
 * @returns nextState
 * @type {typeof import('./ui-state-updaters').setExportSelectedDatasetUpdater}
 * @public
 */
export const setExportSelectedDatasetUpdater = (state, {payload: dataset}) => ({
  ...state,
  exportData: {
    ...state.exportData,
    selectedDataset: dataset
  }
});

/**
 * Set data format for exporting data
 * @memberof uiStateUpdaters
 * @param state `uiState`
 * @param action
 * @param action.payload one of `'text/csv'`
 * @returns nextState
 * @type {typeof import('./ui-state-updaters').setExportDataTypeUpdater}
 * @public
 */
export const setExportDataTypeUpdater = (state, {payload: dataType}) => ({
  ...state,
  exportData: {
    ...state.exportData,
    dataType
  }
});

/**
 * Whether to export filtered data, `true` or `false`
 * @memberof uiStateUpdaters
 * @param state `uiState`
 * @param action
 * @param action.payload
 * @returns nextState
 * @type {typeof import('./ui-state-updaters').setExportFilteredUpdater}
 * @public
 */
export const setExportFilteredUpdater = (state, {payload: filtered}) => ({
  ...state,
  exportData: {
    ...state.exportData,
    filtered
  }
});

/**
 * Whether to including data in map config, toggle between `true` or `false`
 * @memberof uiStateUpdaters
 * @param state `uiState`
 * @returns nextState
 * @type {typeof import('./ui-state-updaters').setExportDataUpdater}
 * @public
 */
export const setExportDataUpdater = state => ({
  ...state,
  exportMap: {
    ...state.exportMap,
    [EXPORT_MAP_FORMATS.JSON]: {
      ...state.exportMap[EXPORT_MAP_FORMATS.JSON],
      hasData: !state.exportMap[EXPORT_MAP_FORMATS.JSON].hasData
    }
  }
});

/**
 * whether to export a mapbox access to HTML single page
 * @param state - `uiState`
 * @param action
 * @param action.payload
 * @returns nextState
 * @type {typeof import('./ui-state-updaters').setUserMapboxAccessTokenUpdater}
 * @public
 */
export const setUserMapboxAccessTokenUpdater = (state, {payload: userMapboxToken}) => ({
  ...state,
  exportMap: {
    ...state.exportMap,
    [EXPORT_MAP_FORMATS.HTML]: {
      ...state.exportMap[EXPORT_MAP_FORMATS.HTML],
      userMapboxToken
    }
  }
});

/**
 * Sets the export map format
 * @param state - `uiState`
 * @param action
 * @param action.payload format to use to export the map into
 * @return nextState
 * @type {typeof import('./ui-state-updaters').setExportMapFormatUpdater}
 */
export const setExportMapFormatUpdater = (state, {payload: format}) => ({
  ...state,
  exportMap: {
    ...state.exportMap,
    format
  }
});

/**
 * Set the export html map mode
 * @param state - `uiState`
 * @param action
 * @param action.payload to be set (available modes: EXPORT_HTML_MAP_MODES)
 * @return nextState
 * @type {typeof import('./ui-state-updaters').setExportMapHTMLModeUpdater}
 */
export const setExportMapHTMLModeUpdater = (state, {payload: mode}) => ({
  ...state,
  exportMap: {
    ...state.exportMap,
    [EXPORT_MAP_FORMATS.HTML]: {
      ...state.exportMap[EXPORT_MAP_FORMATS.HTML],
      mode
    }
  }
});

/**
 * Adds a new notification.
 * Updates a notification in case of matching ids.
 * @memberof uiStateUpdaters
 * @param state `uiState`
 * @param action
 * @param action.payload Params of a notification
 * @returns nextState
 * @type {typeof import('./ui-state-updaters').addNotificationUpdater}
 * @public
 */
export const addNotificationUpdater = (state, {payload}) => {
  let notifications;

  const payloadId = payload?.id;
  const notificationToUpdate = payloadId ? state.notifications.find(n => n.id === payloadId) : null;
  if (notificationToUpdate) {
    notifications = state.notifications.map(n =>
      n.id === payloadId ? createNotification(payload) : n
    );
  } else {
    notifications = [...(state.notifications || []), createNotification(payload)];
  }

  return {...state, notifications};
};

/**
 * Remove a notification
 * @memberof uiStateUpdaters
 * @param state `uiState`
 * @param action
 * @param action.payload id of the notification to be removed
 * @returns nextState
 * @type {typeof import('./ui-state-updaters').removeNotificationUpdater}
 * @public
 */
export const removeNotificationUpdater = (state, {payload: id}) => ({
  ...state,
  notifications: state.notifications.filter(n => n.id !== id)
});

/**
 * Fired when file loading begin
 * @memberof uiStateUpdaters
 * @param state `uiState`
 * @returns nextState
 * @type {typeof import('./ui-state-updaters').loadFilesUpdater}
 * @public
 */
export const loadFilesUpdater = state => ({
  ...state,
  loadFiles: {
    ...state.loadFiles,
    fileLoading: true
  }
});

/**
 * Handles loading file success and set fileLoading property to false
 * @memberof uiStateUpdaters
 * @param state `uiState`
 * @returns nextState
 * @type {typeof import('./ui-state-updaters').loadFilesSuccessUpdater}
 */
export const loadFilesSuccessUpdater = state => ({
  ...state,
  loadFiles: {
    ...state.loadFiles,
    fileLoading: false
  }
});

/**
 * Handles load file error and set fileLoading property to false
 * @memberof uiStateUpdaters
 * @param state
 * @param action
 * @param action.error
 * @returns nextState
 * @type {typeof import('./ui-state-updaters').loadFilesErrUpdater}
 * @public
 */
export const loadFilesErrUpdater = (state, {error}) =>
  addNotificationUpdater(
    {
      ...state,
      loadFiles: {
        ...state.loadFiles,
        fileLoading: false
      }
    },
    {
      payload: errorNotification({
        message: (error || {}).message || 'Failed to upload files',
        topic: DEFAULT_NOTIFICATION_TOPICS.global
      })
    }
  );

/**
 * Handles toggle map split and reset all map control index to 0
 * @memberof uiStateUpdaters
 * @param state
 * @returns nextState
 * @type {typeof import('./ui-state-updaters').toggleSplitMapUpdater}
 * @public
 */
export const toggleSplitMapUpdater = state => ({
  ...state,
  mapControls: Object.entries(state.mapControls).reduce(
    (acc, entry) => ({
      ...acc,
      [entry[0]]: {
        ...entry[1],
        activeMapIndex: 0
      }
    }),
    {}
  )
});

/**
 * Toggle modal data
 * @memberof uiStateUpdaters
 * @param state
 * @returns nextState
 * @type {typeof import('./ui-state-updaters').showDatasetTableUpdater}
 * @public
 */
export const showDatasetTableUpdater = state => toggleModalUpdater(state, {payload: DATA_TABLE_ID});

/**
 * Set the locale of the UI
 * @memberof uiStateUpdaters
 * @param state `uiState`
 * @param action
 * @param action.payload
 * @param action.payload.locale locale
 * @returns nextState
 * @type {typeof import('./ui-state-updaters').setLocaleUpdater}
 * @public
 */
export const setLocaleUpdater = (state, {payload: {locale}}) => ({
  ...state,
  locale
});
