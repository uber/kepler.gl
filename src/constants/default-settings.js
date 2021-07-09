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

import keyMirror from 'keymirror';
import {EditorModes} from 'react-map-gl-draw';

import {
  scaleLinear,
  scaleQuantize,
  scaleQuantile,
  scaleOrdinal,
  scaleSqrt,
  scaleLog,
  scalePoint
} from 'd3-scale';
import {
  Layers,
  FilterFunnel,
  Settings,
  CursorClick,
  Pin,
  ArrowDown,
  ArrowUp,
  Clipboard,
  Cancel
} from 'components/common/icons';
import {getHTMLMapModeTileUrl} from 'utils/utils';
import {TOOLTIP_FORMAT_TYPES} from './tooltip';
import {LAYER_TYPES} from 'layers/types';

export const ACTION_PREFIX = '@@kepler.gl/';
export const CLOUDFRONT = 'https://d1a3f4spazzrp4.cloudfront.net/kepler.gl';
export const ICON_PREFIX = `${CLOUDFRONT}/geodude`;
export const DEFAULT_MAPBOX_API_URL = 'https://api.mapbox.com';

// Modal Ids
/**
 * Modal id: data table
 * @constant
 * @type {string}
 * @public
 */
export const DATA_TABLE_ID = 'dataTable';
/**
 * Modal id: delete dataset confirm dialog
 * @constant
 * @type {string}
 * @public
 */
export const DELETE_DATA_ID = 'deleteData';
/**
 * Modal id: add data modal
 * @constant
 * @type {string}
 * @public
 */
export const ADD_DATA_ID = 'addData';
/**
 * Modal id: export image modal
 * @constant
 * @type {string}
 * @public
 */
export const EXPORT_IMAGE_ID = 'exportImage';
/**
 * Modal id: export data modal
 * @constant
 * @type {string}
 * @public
 */
export const EXPORT_DATA_ID = 'exportData';
/**
 * Modal id: add custom map style modal
 * @constant
 * @type {string}
 * @public
 */
export const ADD_MAP_STYLE_ID = 'addMapStyle';
/**
 * Modal id: export map modal
 * @constant
 * @type {string}
 * @public
 */
export const EXPORT_MAP_ID = 'exportMap';
/**
 * Modal id: save map modal
 * @constant
 * @type {string}
 * @public
 */
export const SAVE_MAP_ID = 'saveMap';
/**
 * Modal id: confirm to overwrite saved map
 * @constant
 * @type {string}
 * @public
 */
export const OVERWRITE_MAP_ID = 'overwriteMap';
/**
 * Modal id: share map url modal
 * @constant
 * @type {string}
 * @public
 */
export const SHARE_MAP_ID = 'shareMap';

export const KEPLER_GL_NAME = 'kepler.gl';

// __PACKAGE_VERSION__ is automatically injected by Babel/Webpack during the building process
// Since we are injecting this during the build process with babel
// while developing VERSION is not defined, we capture the exception and return
// an empty string which will allow us to retrieve the latest umd version
export const KEPLER_GL_VERSION = '__PACKAGE_VERSION__';
export const KEPLER_GL_WEBSITE = 'http://kepler.gl/';

export const DIMENSIONS = {
  sidePanel: {
    width: 300,
    margin: {top: 20, left: 20, bottom: 30, right: 20},
    headerHeight: 96
  },
  mapControl: {
    width: 184,
    padding: 12
  }
};

/**
 * Theme name that can be passed to `KeplerGl` `prop.theme`.
 * Available themes are `THEME.light` and `THEME.dark`. Default theme is `THEME.dark`
 * @constant
 * @type {object}
 * @public
 * @example
 * ```js
 * const Map = () => <KeplerGl theme={THEME.light} id="map"/>
 * ```
 */
export const THEME = keyMirror({
  light: null,
  dark: null,
  base: null
});

export const SIDEBAR_PANELS = [
  {
    id: 'layer',
    label: 'sidebar.panels.layer',
    iconComponent: Layers,
    onClick: null
  },
  {
    id: 'filter',
    label: 'sidebar.panels.filter',
    iconComponent: FilterFunnel,
    onClick: null
  },
  {
    id: 'interaction',
    label: 'sidebar.panels.interaction',
    iconComponent: CursorClick,
    onClick: null
  },
  {
    id: 'map',
    label: 'sidebar.panels.basemap',
    iconComponent: Settings,
    onClick: null
  }
];

// backward compatibility
export const PANELS = SIDEBAR_PANELS;

// MAP STYLES

export const DEFAULT_LAYER_GROUPS = [
  {
    slug: 'label',
    filter: ({id}) => id.match(/(?=(label|place-|poi-))/),
    defaultVisibility: true
  },
  {
    slug: 'road',
    filter: ({id}) => id.match(/(?=(road|railway|tunnel|street|bridge))(?!.*label)/),
    defaultVisibility: true
  },
  {
    slug: 'border',
    filter: ({id}) => id.match(/border|boundaries/),
    defaultVisibility: false
  },
  {
    slug: 'building',
    filter: ({id}) => id.match(/building/),
    defaultVisibility: true
  },
  {
    slug: 'water',
    filter: ({id}) => id.match(/(?=(water|stream|ferry))/),
    defaultVisibility: true
  },
  {
    slug: 'land',
    filter: ({id}) => id.match(/(?=(parks|landcover|industrial|sand|hillshade))/),
    defaultVisibility: true
  },
  {
    slug: '3d building',
    filter: () => false,
    defaultVisibility: false
  }
];

export const DEFAULT_MAP_STYLES = [
  {
    id: 'dark',
    label: 'Dark',
    url: 'mapbox://styles/uberdata/cjoqbbf6l9k302sl96tyvka09',
    icon: `${ICON_PREFIX}/UBER_DARK_V2.png`,
    layerGroups: DEFAULT_LAYER_GROUPS
  },
  {
    id: 'light',
    label: 'Light',
    url: 'mapbox://styles/uberdata/cjoqb9j339k1f2sl9t5ic5bn4',
    icon: `${ICON_PREFIX}/UBER_LIGHT_V2.png`,
    layerGroups: DEFAULT_LAYER_GROUPS
  },
  {
    id: 'muted',
    label: 'Muted Light',
    url: 'mapbox://styles/uberdata/cjfyl03kp1tul2smf5v2tbdd4',
    icon: `${ICON_PREFIX}/UBER_MUTED_LIGHT.png`,
    layerGroups: DEFAULT_LAYER_GROUPS
  },
  {
    id: 'muted_night',
    label: 'Muted Night',
    url: 'mapbox://styles/uberdata/cjfxhlikmaj1b2soyzevnywgs',
    icon: `${ICON_PREFIX}/UBER_MUTED_NIGHT.png`,
    layerGroups: DEFAULT_LAYER_GROUPS
  },
  {
    id: 'satellite',
    label: 'Satellite',
    url: `mapbox://styles/mapbox/satellite-v9`,
    icon: `${ICON_PREFIX}/UBER_SATELLITE.png`
  }
];

export const GEOJSON_FIELDS = {
  geojson: ['_geojson', 'all_points', 'geojson']
};

export const ICON_FIELDS = {
  icon: ['icon']
};

export const TRIP_POINT_FIELDS = [
  ['lat', 'lng'],
  ['lat', 'lon'],
  ['latitude', 'longitude']
];

export const TRIP_ARC_FIELDS = {
  lat0: 'begintrip',
  lng0: 'begintrip',
  lat1: 'dropoff',
  lng1: 'dropoff'
};

export const FILTER_TYPES = keyMirror({
  range: null,
  select: null,
  input: null,
  timeRange: null,
  multiSelect: null,
  polygon: null
});

export const SCALE_TYPES = keyMirror({
  ordinal: null,
  quantile: null,
  quantize: null,
  linear: null,
  sqrt: null,
  log: null,

  // ordinal domain to linear range
  point: null
});

export const SCALE_FUNC = {
  [SCALE_TYPES.linear]: scaleLinear,
  [SCALE_TYPES.quantize]: scaleQuantize,
  [SCALE_TYPES.quantile]: scaleQuantile,
  [SCALE_TYPES.ordinal]: scaleOrdinal,
  [SCALE_TYPES.sqrt]: scaleSqrt,
  [SCALE_TYPES.log]: scaleLog,
  [SCALE_TYPES.point]: scalePoint
};

export const ALL_FIELD_TYPES = keyMirror({
  boolean: null,
  date: null,
  geojson: null,
  integer: null,
  real: null,
  string: null,
  timestamp: null,
  point: null
});

// Data Table
export const SORT_ORDER = keyMirror({
  ASCENDING: null,
  DESCENDING: null,
  UNSORT: null
});

export const TABLE_OPTION = keyMirror({
  SORT_ASC: null,
  SORT_DES: null,
  UNSORT: null,
  PIN: null,
  UNPIN: null,
  COPY: null
});

export const TABLE_OPTION_LIST = [
  {
    value: TABLE_OPTION.SORT_ASC,
    display: 'Sort Ascending',
    icon: ArrowUp,
    condition: props => props.sortMode !== SORT_ORDER.ASCENDING
  },
  {
    value: TABLE_OPTION.SORT_DES,
    display: 'Sort Descending',
    icon: ArrowDown,
    condition: props => props.sortMode !== SORT_ORDER.DESCENDING
  },
  {
    value: TABLE_OPTION.UNSORT,
    display: 'Unsort Column',
    icon: Cancel,
    condition: props => props.isSorted
  },
  {value: TABLE_OPTION.PIN, display: 'Pin Column', icon: Pin, condition: props => !props.isPinned},
  {
    value: TABLE_OPTION.UNPIN,
    display: 'Unpin Column',
    icon: Cancel,
    condition: props => props.isPinned
  },
  {value: TABLE_OPTION.COPY, display: 'Copy Column', icon: Clipboard}
];

const ORANGE = '248, 194, 28';
const PINK = '231, 189, 194';
const PURPLE = '160, 106, 206';
const BLUE = '140, 210, 205';
const BLUE2 = '106, 160, 206';
const BLUE3 = '0, 172, 237';
const GREEN = '106, 160, 56';
const RED = '237, 88, 106';

export const FILED_TYPE_DISPLAY = {
  [ALL_FIELD_TYPES.boolean]: {
    label: 'bool',
    color: PINK
  },
  [ALL_FIELD_TYPES.date]: {
    label: 'date',
    color: PURPLE
  },
  [ALL_FIELD_TYPES.geojson]: {
    label: 'geo',
    color: BLUE2
  },
  [ALL_FIELD_TYPES.integer]: {
    label: 'int',
    color: ORANGE
  },
  [ALL_FIELD_TYPES.real]: {
    label: 'float',
    color: ORANGE
  },
  [ALL_FIELD_TYPES.string]: {
    label: 'string',
    color: BLUE
  },
  [ALL_FIELD_TYPES.timestamp]: {
    label: 'time',
    color: GREEN
  },
  // field pairs
  [ALL_FIELD_TYPES.point]: {
    label: 'point',
    color: BLUE3
  }
};

export const FIELD_COLORS = {
  default: RED
};
export const HIGHLIGH_COLOR_3D = [255, 255, 255, 60];
export const CHANNEL_SCALES = keyMirror({
  color: null,
  radius: null,
  size: null,
  colorAggr: null,
  sizeAggr: null
});

export const AGGREGATION_TYPES = {
  // default
  count: 'count',
  // linear
  average: 'average',
  maximum: 'maximum',
  minimum: 'minimum',
  median: 'median',
  stdev: 'stdev',
  sum: 'sum',
  variance: 'variance',
  // ordinal
  mode: 'mode',
  countUnique: 'count unique'
};

export const linearFieldScaleFunctions = {
  [CHANNEL_SCALES.color]: [SCALE_TYPES.quantize, SCALE_TYPES.quantile],
  [CHANNEL_SCALES.radius]: [SCALE_TYPES.sqrt],
  [CHANNEL_SCALES.size]: [SCALE_TYPES.linear, SCALE_TYPES.sqrt, SCALE_TYPES.log]
};

export const linearFieldAggrScaleFunctions = {
  [CHANNEL_SCALES.colorAggr]: {
    [AGGREGATION_TYPES.average]: [SCALE_TYPES.quantize, SCALE_TYPES.quantile],
    [AGGREGATION_TYPES.maximum]: [SCALE_TYPES.quantize, SCALE_TYPES.quantile],
    [AGGREGATION_TYPES.minimum]: [SCALE_TYPES.quantize, SCALE_TYPES.quantile],
    [AGGREGATION_TYPES.median]: [SCALE_TYPES.quantize, SCALE_TYPES.quantile],
    [AGGREGATION_TYPES.stdev]: [SCALE_TYPES.quantize, SCALE_TYPES.quantile],
    [AGGREGATION_TYPES.sum]: [SCALE_TYPES.quantize, SCALE_TYPES.quantile],
    [AGGREGATION_TYPES.variance]: [SCALE_TYPES.quantize, SCALE_TYPES.quantile]
  },

  [CHANNEL_SCALES.sizeAggr]: {
    [AGGREGATION_TYPES.average]: [SCALE_TYPES.linear, SCALE_TYPES.sqrt, SCALE_TYPES.log],
    [AGGREGATION_TYPES.maximum]: [SCALE_TYPES.linear, SCALE_TYPES.sqrt, SCALE_TYPES.log],
    [AGGREGATION_TYPES.minimum]: [SCALE_TYPES.linear, SCALE_TYPES.sqrt, SCALE_TYPES.log],
    [AGGREGATION_TYPES.median]: [SCALE_TYPES.linear, SCALE_TYPES.sqrt, SCALE_TYPES.log],
    [AGGREGATION_TYPES.stdev]: [SCALE_TYPES.linear, SCALE_TYPES.sqrt, SCALE_TYPES.log],
    [AGGREGATION_TYPES.sum]: [SCALE_TYPES.linear, SCALE_TYPES.sqrt, SCALE_TYPES.log],
    [AGGREGATION_TYPES.variance]: [SCALE_TYPES.linear, SCALE_TYPES.sqrt, SCALE_TYPES.log]
  }
};

export const ordinalFieldScaleFunctions = {
  [CHANNEL_SCALES.color]: [SCALE_TYPES.ordinal],
  [CHANNEL_SCALES.radius]: [SCALE_TYPES.point],
  [CHANNEL_SCALES.size]: [SCALE_TYPES.point]
};

export const ordinalFieldAggrScaleFunctions = {
  // [CHANNEL_SCALES.colorAggr]: [SCALE_TYPES.ordinal, SCALE_TYPES.linear],
  [CHANNEL_SCALES.colorAggr]: {
    [AGGREGATION_TYPES.mode]: [SCALE_TYPES.ordinal],
    [AGGREGATION_TYPES.countUnique]: [SCALE_TYPES.quantize, SCALE_TYPES.quantile]
  },

  // Currently doesn't support yet
  [CHANNEL_SCALES.sizeAggr]: {}
};

export const notSupportedScaleOpts = {
  [CHANNEL_SCALES.color]: [],
  [CHANNEL_SCALES.radius]: [],
  [CHANNEL_SCALES.size]: []
};

export const notSupportAggrOpts = {
  [CHANNEL_SCALES.colorAggr]: {},
  [CHANNEL_SCALES.sizeAggr]: {}
};

/**
 * Default aggregation are based on ocunt
 */
export const DEFAULT_AGGREGATION = {
  [CHANNEL_SCALES.colorAggr]: {
    [AGGREGATION_TYPES.count]: [SCALE_TYPES.quantize, SCALE_TYPES.quantile]
  },
  [CHANNEL_SCALES.sizeAggr]: {
    [AGGREGATION_TYPES.count]: [SCALE_TYPES.linear, SCALE_TYPES.sqrt, SCALE_TYPES.log]
  }
};

/**
 * Define what type of scale operation is allowed on each type of fields
 */
export const FIELD_OPTS = {
  string: {
    type: 'categorical',
    scale: {
      ...ordinalFieldScaleFunctions,
      ...ordinalFieldAggrScaleFunctions
    },
    format: {
      legend: d => d,
      tooltip: []
    }
  },
  real: {
    type: 'numerical',
    scale: {
      ...linearFieldScaleFunctions,
      ...linearFieldAggrScaleFunctions
    },
    format: {
      legend: d => d,
      tooltip: [
        TOOLTIP_FORMAT_TYPES.NONE,
        TOOLTIP_FORMAT_TYPES.DECIMAL,
        TOOLTIP_FORMAT_TYPES.PERCENTAGE
      ]
    }
  },
  timestamp: {
    type: 'time',
    scale: {
      ...linearFieldScaleFunctions,
      ...notSupportAggrOpts
    },
    format: {
      legend: d => d,
      tooltip: [
        TOOLTIP_FORMAT_TYPES.NONE,
        TOOLTIP_FORMAT_TYPES.DATE,
        TOOLTIP_FORMAT_TYPES.DATE_TIME
      ]
    }
  },
  integer: {
    type: 'numerical',
    scale: {
      ...linearFieldScaleFunctions,
      ...linearFieldAggrScaleFunctions
    },
    format: {
      legend: d => d,
      tooltip: [
        TOOLTIP_FORMAT_TYPES.NONE,
        TOOLTIP_FORMAT_TYPES.DECIMAL,
        TOOLTIP_FORMAT_TYPES.PERCENTAGE
      ]
    }
  },
  boolean: {
    type: 'boolean',
    scale: {
      ...ordinalFieldScaleFunctions,
      ...ordinalFieldAggrScaleFunctions
    },
    format: {
      legend: d => d,
      tooltip: [TOOLTIP_FORMAT_TYPES.NONE, TOOLTIP_FORMAT_TYPES.BOOLEAN]
    }
  },
  date: {
    scale: {
      ...ordinalFieldScaleFunctions,
      ...ordinalFieldAggrScaleFunctions
    },
    format: {
      legend: d => d,
      tooltip: [TOOLTIP_FORMAT_TYPES.NONE, TOOLTIP_FORMAT_TYPES.DATE]
    }
  },
  geojson: {
    type: 'geometry',
    scale: {
      ...notSupportedScaleOpts,
      ...notSupportAggrOpts
    },
    format: {
      legend: d => '...',
      tooltip: []
    }
  }
};

export const CHANNEL_SCALE_SUPPORTED_FIELDS = Object.keys(CHANNEL_SCALES).reduce(
  (accu, key) => ({
    ...accu,
    [key]: Object.keys(FIELD_OPTS).filter(ft => Object.keys(FIELD_OPTS[ft].scale[key]).length)
  }),
  {}
);

export const DEFAULT_LAYER_COLOR = {
  tripArc: '#9226C6',
  begintrip_lat: '#1E96BE',
  dropoff_lat: '#FF991F',
  request_lat: '#52A353'
};

// let user pass in default tooltip fields
export const DEFAULT_TOOLTIP_FIELDS = [];

export const NO_VALUE_COLOR = [0, 0, 0, 0];

export const LAYER_BLENDINGS = {
  additive: {
    label: 'layerBlending.additive',
    blendFunc: ['SRC_ALPHA', 'DST_ALPHA'],
    blendEquation: 'FUNC_ADD'
  },
  normal: {
    // reference to
    // https://limnu.com/webgl-blending-youre-probably-wrong/
    label: 'layerBlending.normal',
    blendFunc: ['SRC_ALPHA', 'ONE_MINUS_SRC_ALPHA', 'ONE', 'ONE_MINUS_SRC_ALPHA'],
    blendEquation: ['FUNC_ADD', 'FUNC_ADD']
  },
  subtractive: {
    label: 'layerBlending.subtractive',
    blendFunc: ['ONE', 'ONE_MINUS_DST_COLOR', 'SRC_ALPHA', 'DST_ALPHA'],
    blendEquation: ['FUNC_SUBTRACT', 'FUNC_ADD']
  }
};

export const MAX_DEFAULT_TOOLTIPS = 5;

export const RESOLUTIONS = keyMirror({
  ONE_X: null,
  TWO_X: null
});

export const EXPORT_IMG_RATIOS = keyMirror({
  SCREEN: null,
  FOUR_BY_THREE: null,
  SIXTEEN_BY_NINE: null,
  CUSTOM: null
});

export const EXPORT_IMG_RATIO_OPTIONS = [
  {
    id: EXPORT_IMG_RATIOS.SCREEN,
    label: 'modal.exportImage.ratioOriginalScreen',
    getSize: (screenW, screenH) => ({width: screenW, height: screenH})
  },
  {
    id: EXPORT_IMG_RATIOS.CUSTOM,
    hidden: true,
    label: 'modal.exportImage.ratioCustom',
    getSize: (mapW, mapH) => ({width: mapW, height: mapH})
  },
  {
    id: EXPORT_IMG_RATIOS.FOUR_BY_THREE,
    label: 'modal.exportImage.ratio4_3',
    getSize: (screenW, screenH) => ({
      width: screenW,
      height: Math.round(screenW * 0.75)
    })
  },
  {
    id: EXPORT_IMG_RATIOS.SIXTEEN_BY_NINE,
    label: 'modal.exportImage.ratio16_9',
    getSize: (screenW, screenH) => ({
      width: screenW,
      height: Math.round(screenW * 0.5625)
    })
  }
];

export const EXPORT_IMG_RESOLUTION_OPTIONS = [
  {
    id: RESOLUTIONS.ONE_X,
    label: '1x',
    available: true,
    scale: 1,
    getSize: (screenW, screenH) => ({
      width: screenW,
      height: screenH
    })
  },
  {
    id: RESOLUTIONS.TWO_X,
    label: '2x',
    available: true,
    scale: 2,
    getSize: (screenW, screenH) => ({
      width: screenW * 2,
      height: screenH * 2
    })
  }
];

export const EXPORT_DATA_TYPE = keyMirror({
  CSV: null
  // SHAPEFILE: null,
  // JSON: null,
  // GEOJSON: null,
  // TOPOJSON: null
});

export const EXPORT_DATA_TYPE_OPTIONS = [
  {
    id: EXPORT_DATA_TYPE.CSV,
    label: EXPORT_DATA_TYPE.CSV.toLowerCase(),
    available: true
  }
  // {
  //   id: EXPORT_DATA_TYPE.SHAPEFILE,
  //   label: 'shapefile',
  //   available: false
  // },
  // {
  //   id: EXPORT_DATA_TYPE.JSON,
  //   label: 'json',
  //   available: false
  // },
  // {
  //   id: EXPORT_DATA_TYPE.GEOJSON,
  //   label: 'geojson',
  //   available: false
  // },
  // {
  //   id: EXPORT_DATA_TYPE.TOPOJSON,
  //   label: 'topojson',
  //   available: false
  // }
];

// Export map types
export const EXPORT_MAP_FORMATS = keyMirror({
  HTML: null,
  JSON: null
});

export const EXPORT_HTML_MAP_MODES = keyMirror({
  READ: null,
  EDIT: null
});

// Export map options
export const EXPORT_MAP_FORMAT_OPTIONS = Object.entries(EXPORT_MAP_FORMATS).map(entry => ({
  id: entry[0],
  label: entry[1].toLowerCase(),
  available: true
}));

export const EXPORT_HTML_MAP_MODE_OPTIONS = Object.entries(EXPORT_HTML_MAP_MODES).map(entry => ({
  id: entry[0],
  label: `modal.exportMap.html.${entry[1].toLowerCase()}`,
  available: true,
  url: getHTMLMapModeTileUrl(entry[1])
}));

export const DEFAULT_UUID_COUNT = 6;

export const DEFAULT_NOTIFICATION_MESSAGE = 'MESSAGE_NOT_PROVIDED';

export const DEFAULT_NOTIFICATION_TYPES = keyMirror({
  info: null,
  error: null,
  warning: null,
  success: null
});

export const DEFAULT_NOTIFICATION_TOPICS = keyMirror({
  global: null,
  file: null
});

// Minimum time between identical notifications about deck.gl errors
export const THROTTLE_NOTIFICATION_TIME = 2500;

// Animation
export const BASE_SPEED = 600;
export const FPS = 60;

/**
 * 4 Animation Window Types
 * 1. free
 *  |->  |->
 * Current time is a fixed range, animation controller calls next animation frames continuously to animation a moving window
 * The increment id based on domain / BASE_SPEED * SPEED
 *
 * 2. incremental
 * |    |->
 * Same as free, current time is a growing range, only the max value of range increment during animation.
 * The increment is also based on domain / BASE_SPEED * SPEED
 *
 * 3. point
 * o -> o
 * Current time is a point, animation controller calls next animation frame continuously to animation a moving point
 * The increment is based on domain / BASE_SPEED * SPEED
 *
 * 4. interval
 * o ~> o
 * Current time is a point. An array of sorted time steps need to be provided.
 * animation controller calls next animation at a interval when the point jumps to the next step
 */
export const ANIMATION_WINDOW = keyMirror({
  free: null,
  incremental: null,
  point: null,
  interval: null
});
export const DEFAULT_TIME_FORMAT = 'MM/DD/YY HH:mm:ssa';
export const SPEED_CONTROL_RANGE = [0, 10];
export const SPEED_CONTROL_STEP = 0.001;

// Geocoder
export const GEOCODER_DATASET_NAME = 'geocoder_dataset';
export const GEOCODER_LAYER_ID = 'geocoder_layer';
export const GEOCODER_GEO_OFFSET = 0.05;
export const GEOCODER_ICON_COLOR = [255, 0, 0];
export const GEOCODER_ICON_SIZE = 80;

// We could use directly react-map-gl-draw EditorMode but this would
// create a direct dependency with react-map-gl-draw
// Created this map to be independent from react-map-gl-draw
export const EDITOR_MODES = {
  READ_ONLY: EditorModes.READ_ONLY,
  DRAW_POLYGON: EditorModes.DRAW_POLYGON,
  DRAW_RECTANGLE: EditorModes.DRAW_RECTANGLE,
  EDIT: EditorModes.EDIT_VERTEX
};

export const EDITOR_AVAILABLE_LAYERS = [
  LAYER_TYPES.point,
  LAYER_TYPES.hexagon,
  LAYER_TYPES.arc,
  LAYER_TYPES.line,
  LAYER_TYPES.hexagonId
];
// GPU Filtering
/**
 * Max number of filter value buffers that deck.gl provides
 */
export const MAX_GPU_FILTERS = 4;
export const MAP_THUMBNAIL_DIMENSION = {
  width: 300,
  height: 200
};

export const MAP_INFO_CHARACTER = {
  title: 100,
  description: 100
};

// Load data
export const LOADING_METHODS = keyMirror({
  upload: null,
  storage: null
});

export const DATASET_FORMATS = keyMirror({
  row: null,
  geojson: null,
  csv: null,
  keplergl: null
});
