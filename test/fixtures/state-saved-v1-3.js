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

import {KeplerGlLayers} from 'layers';
const {PointLayer, HexagonLayer} = KeplerGlLayers;
import {DEFAULT_TEXT_LABEL, DEFAULT_COLOR_UI} from 'layers/layer-factory';

// saved state v1 with split maps
export const savedStateV1 = {
  datasets: [
    {
      version: 'v1',
      data: {
        id: 'fm8v2jcza',
        label: 'eats_res_radius.csv',
        color: [53, 92, 125],
        allData: [
          [
            1000,
            38.4163786,
            -121.7922809,
            false,
            false,
            1,
            false,
            'Hello',
            '11/1/17 11:00',
            1512780000000
          ],
          [
            1000,
            37.75159991,
            -122.4761712,
            false,
            false,
            2,
            false,
            'Smoothie',
            '11/1/17 11:01',
            1512780000000
          ],
          [
            2000,
            37.8323825,
            -122.2736475,
            false,
            false,
            3,
            false,
            'Milkshake',
            '11/1/17 11:02',
            1512770000000
          ],
          [
            2000,
            37.77565501,
            -122.4403984,
            false,
            false,
            4,
            false,
            'Amsterdam',
            '11/1/17 11:03',
            1512770000000
          ],
          [
            3000,
            37.79659543,
            -122.4219072,
            false,
            false,
            0,
            false,
            'Smoothie',
            '11/1/17 11:04',
            1512770000000
          ],
          [
            3000,
            37.7980847,
            -122.4050548,
            false,
            false,
            1,
            false,
            'Smoothie',
            '11/1/17 11:00',
            1512770000000
          ],
          [
            3000,
            37.79242329,
            -122.3986584,
            false,
            false,
            0,
            false,
            'World',
            '11/1/17 11:00',
            1512270000000
          ],
          [
            3000,
            37.79669585,
            -122.4219416,
            false,
            false,
            1,
            false,
            'yo',
            '11/1/17 11:05',
            1512270000000
          ],
          [
            2000,
            37.6169644,
            -122.384047,
            false,
            false,
            0,
            false,
            'really',
            '11/1/17 11:10',
            1512270000000
          ]
        ],
        fields: [
          {
            name: 'deliver_radius',
            type: 'integer',
            format: ''
          },
          {
            name: 'restaurant_lat',
            type: 'real',
            format: ''
          },
          {
            name: 'restaurant_lng',
            type: 'real',
            format: ''
          },
          {
            name: 'boolean',
            type: 'boolean',
            format: ''
          },
          {
            name: 'num_boolean',
            type: 'boolean',
            format: ''
          },
          {
            name: 'int',
            type: 'integer',
            format: ''
          },
          {
            name: 'boolean_1',
            type: 'boolean',
            format: ''
          },
          {
            name: 'name',
            type: 'string',
            format: ''
          },
          {
            name: 'time',
            type: 'timestamp',
            format: 'M/D/YYYY H:m'
          },
          {
            name: 'epoch',
            type: 'timestamp',
            format: 'X'
          }
        ]
      }
    }
  ],
  config: {
    version: 'v1',
    config: {
      visState: {
        filters: [],
        layers: [
          {
            id: 'f24uw1',
            type: 'point',
            config: {
              dataId: 'fm8v2jcza',
              label: 'restaurant',
              color: [18, 147, 154],
              columns: {
                lat: 'restaurant_lat',
                lng: 'restaurant_lng',
                altitude: null
              },
              isVisible: true,
              visConfig: {
                radius: 10,
                fixedRadius: true,
                opacity: 0.29,
                outline: false,
                thickness: 2,
                colorRange: {
                  name: 'ColorBrewer YlGn-6',
                  type: 'sequential',
                  category: 'ColorBrewer',
                  colors: ['#006837', '#31a354', '#78c679', '#addd8e', '#d9f0a3', '#ffffcc'],
                  reversed: true
                },
                radiusRange: [0, 50]
              }
            },
            visualChannels: {
              colorField: {name: 'deliver_radius', type: 'integer'},
              colorScale: 'quantile',
              sizeField: {name: 'deliver_radius', type: 'integer'},
              sizeScale: 'sqrt'
            }
          },
          {
            id: '9x77w7h',
            type: 'hexagon',
            config: {
              dataId: 'fm8v2jcza',
              label: 'hexagon',
              color: [221, 178, 124],
              columns: {lat: 'restaurant_lat', lng: 'restaurant_lng'},
              isVisible: true,
              visConfig: {
                opacity: 0.8,
                worldUnitSize: 2.73,
                resolution: 8,
                colorRange: {
                  name: 'Uber Viz Diverging 1',
                  type: 'diverging',
                  category: 'Uber',
                  colors: ['#00939C', '#85C4C8', '#FEEEE8', '#EC9370', '#C22E00'],
                  reversed: false
                },
                coverage: 1,
                sizeRange: [0, 500],
                percentile: [0, 96.54],
                elevationPercentile: [0, 100],
                elevationScale: 5,
                colorAggregation: 'average',
                sizeAggregation: 'average',
                enable3d: false
              }
            },
            visualChannels: {
              colorField: null,
              colorScale: 'quantize',
              sizeField: null,
              sizeScale: 'linear'
            }
          }
        ],
        interactionConfig: {
          tooltip: {
            fieldsToShow: {
              fm8v2jcza: ['deliver_radius', 'boolean', 'num_boolean', 'int', 'boolean_1']
            },
            enabled: true
          },
          brush: {size: 0.5, enabled: false}
        },
        layerBlending: 'normal',
        splitMaps: [
          {
            layers: {
              f24uw1: {isAvailable: true, isVisible: false},
              '9x77w7h': {isAvailable: true, isVisible: true}
            }
          },
          {
            layers: {
              f24uw1: {isAvailable: true, isVisible: true},
              '9x77w7h': {isAvailable: true, isVisible: false}
            }
          }
        ]
      },
      mapStyle: {
        styleType: 'dark',
        topLayerGroups: {},
        visibleLayerGroups: {
          label: true,
          places: true,
          road: true,
          border: false,
          building: true,
          water: true,
          land: true
        },
        buildingLayer: {
          isVisible: false,
          color: [32, 32, 37],
          opacity: 0.7
        }
      },
      mapState: {
        bearing: 0,
        dragRotate: false,
        latitude: 37.77321745781781,
        longitude: -122.566946177778,
        pitch: 0,
        zoom: 10.39910631173387,
        isSplit: true
      }
    }
  }
};

const mergedLayer0 = new PointLayer({
  id: 'f24uw1'
});

mergedLayer0.config = {
  dataId: 'fm8v2jcza',
  label: 'restaurant',
  color: [18, 147, 154],
  columns: {
    lat: {
      value: 'restaurant_lat',
      fieldIdx: 1
    },
    lng: {
      value: 'restaurant_lng',
      fieldIdx: 2
    },
    altitude: {
      fieldIdx: -1,
      optional: true,
      value: null
    }
  },
  hidden: false,
  isVisible: true,
  colorField: {
    name: 'deliver_radius',
    id: 'deliver_radius',
    displayName: 'deliver_radius',
    type: 'integer',
    format: '',
    fieldIdx: 0,
    analyzerType: 'INT',
    valueAccessor: values => values[0]
  },
  colorDomain: [1000, 1000, 2000, 2000, 2000, 3000, 3000, 3000, 3000],
  highlightColor: [252, 242, 26, 255],
  isConfigActive: false,
  colorScale: 'quantile',
  strokeColorField: null,
  strokeColorDomain: [0, 1],
  strokeColorScale: 'quantile',
  sizeField: {
    name: 'deliver_radius',
    id: 'deliver_radius',
    displayName: 'deliver_radius',
    type: 'integer',
    format: '',
    fieldIdx: 0,
    analyzerType: 'INT',
    valueAccessor: values => values[0]
  },
  sizeScale: 'sqrt',
  sizeDomain: [1000, 3000],
  textLabel: [DEFAULT_TEXT_LABEL],
  colorUI: {
    color: DEFAULT_COLOR_UI,
    colorRange: DEFAULT_COLOR_UI
  },
  visConfig: {
    radius: 10,
    fixedRadius: true,
    opacity: 0.29,
    outline: false,
    filled: true,
    thickness: 2,
    colorRange: {
      name: 'ColorBrewer YlGn-6',
      type: 'sequential',
      category: 'ColorBrewer',
      colors: ['#006837', '#31a354', '#78c679', '#addd8e', '#d9f0a3', '#ffffcc'],
      reversed: true
    },
    strokeColorRange: {
      name: 'ColorBrewer YlGn-6',
      type: 'sequential',
      category: 'ColorBrewer',
      colors: ['#006837', '#31a354', '#78c679', '#addd8e', '#d9f0a3', '#ffffcc'],
      reversed: true
    },
    radiusRange: [0, 50],
    strokeColor: [18, 147, 154]
  },
  animation: {enabled: false}
};

const mergedLayer1 = new HexagonLayer({
  id: '9x77w7h'
});

mergedLayer1.config = {
  dataId: 'fm8v2jcza',
  label: 'hexagon',
  color: [221, 178, 124],
  columns: {
    lat: {
      value: 'restaurant_lat',
      fieldIdx: 1
    },
    lng: {
      value: 'restaurant_lng',
      fieldIdx: 2
    }
  },
  hidden: false,
  isVisible: true,
  colorField: null,
  colorDomain: [0, 1],
  highlightColor: [252, 242, 26, 255],
  isConfigActive: false,
  colorScale: 'quantize',
  sizeField: null,
  sizeScale: 'linear',
  sizeDomain: [0, 1],
  textLabel: [DEFAULT_TEXT_LABEL],
  colorUI: {
    color: DEFAULT_COLOR_UI,
    colorRange: DEFAULT_COLOR_UI
  },
  visConfig: {
    opacity: 0.8,
    worldUnitSize: 2.73,
    resolution: 8,
    colorRange: {
      name: 'Uber Viz Diverging 1',
      type: 'diverging',
      category: 'Uber',
      colors: ['#00939C', '#85C4C8', '#FEEEE8', '#EC9370', '#C22E00'],
      reversed: false
    },
    coverage: 1,
    sizeRange: [0, 500],
    percentile: [0, 96.54],
    elevationPercentile: [0, 100],
    elevationScale: 5,
    enableElevationZoomFactor: true,
    colorAggregation: 'average',
    sizeAggregation: 'average',
    enable3d: false
  },
  animation: {enabled: false}
};

export const mergedLayers = [mergedLayer0, mergedLayer1];

export const mergedSplitMaps = [
  {
    layers: {
      f24uw1: false,
      '9x77w7h': true
    }
  },
  {
    layers: {
      f24uw1: true,
      '9x77w7h': false
    }
  }
];
