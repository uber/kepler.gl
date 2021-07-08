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
const {PointLayer} = KeplerGlLayers;
import {DEFAULT_COLOR_UI} from 'layers/layer-factory';

export const stateSavedV1 = {
  datasets: [
    {
      version: 'v1',
      data: {
        id: '8ppj5gfrs',
        label: 'eats_res_radius.csv',
        color: [143, 47, 191],
        allData: [
          [1000, 38.4163786, -121.7922809, false, true, 1, false, 'Hello'],
          [1000, 37.75159991, -122.4761712, false, false, 2, false, 'Smoothie'],
          [2000, 37.8323825, -122.2736475, false, true, 3, false, 'Milkshake'],
          [2000, 37.77565501, -122.4403984, false, true, 4, false, 'Amsterdam'],
          [3000, 37.79659543, -122.4219072, false, true, 0, false, 'Smoothie'],
          [3000, 37.7980847, -122.4050548, false, false, 1, false, 'Smoothie'],
          [3000, 37.79242329, -122.3986584, false, false, 0, false, 'World'],
          [3000, 37.79669585, -122.4219416, false, false, 1, false, 'yo'],
          [2000, 37.6169644, -122.384047, false, false, 0, false, 'really']
        ],
        fields: [
          {
            name: 'radius',
            type: 'integer',
            format: ''
          },
          {
            name: 'point_lat',
            type: 'real',
            format: ''
          },
          {
            name: 'point_lng',
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
            name: 'int_num',
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
            id: 'k2ghkng',
            type: 'point',
            config: {
              dataId: '8ppj5gfrs',
              label: 'point',
              color: [23, 184, 190, 255],
              columns: {
                lat: 'point_lat',
                lng: 'point_lng',
                altitude: null
              },
              isVisible: true,
              visConfig: {
                radius: 12.5,
                fixedRadius: false,
                opacity: 0.8,
                outline: false,
                thickness: 2,
                colorRange: {
                  name: 'Global Warming',
                  type: 'sequential',
                  category: 'Uber',
                  colors: ['#5A1846', '#900C3F', '#C70039', '#E3611C', '#F1920E', '#FFC300']
                },
                radiusRange: [0, 50],
                'hi-precision': false
              },
              textLabel: {
                field: {
                  name: 'name',
                  type: 'string'
                },
                color: [184, 15, 135, 255],
                size: 27,
                offset: [-10, 0],
                anchor: 'end'
              }
            },
            visualChannels: {
              colorField: null,
              colorScale: 'quantile',
              sizeField: null,
              sizeScale: 'linear'
            }
          }
        ],
        interactionConfig: {
          tooltip: {
            fieldsToShow: {
              '8ppj5gfrs': ['radius', 'boolean', 'num_boolean', 'int_num', 'boolean_1']
            },
            enabled: true
          },
          brush: {
            size: 0.5,
            enabled: false
          }
        },
        layerBlending: 'normal',
        splitMaps: []
      },
      mapState: {
        bearing: 0,
        dragRotate: false,
        latitude: 37.871422572545065,
        longitude: -122.32925002428057,
        pitch: 0,
        zoom: 10.386420916638542,
        isSplit: false
      },
      mapStyle: {
        styleType: 'dark',
        topLayerGroups: {},
        visibleLayerGroups: {
          label: true,
          road: true,
          border: false,
          building: true,
          water: true,
          land: true
        },
        mapStyles: {}
      }
    }
  },
  info: {
    app: 'kepler.gl',
    created_at: 'Tue Oct 02 2018 16:11:32 GMT-0700 (Pacific Daylight Time)'
  }
};

const mergedLayer0 = new PointLayer({
  id: 'k2ghkng'
});

mergedLayer0.config = {
  dataId: '8ppj5gfrs',
  label: 'point',
  color: [23, 184, 190, 255],
  columns: {
    lat: {
      value: 'point_lat',
      fieldIdx: 1
    },
    lng: {
      value: 'point_lng',
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
  colorField: null,
  colorScale: 'quantile',
  colorDomain: [0, 1],
  strokeColorField: null,
  strokeColorScale: 'quantile',
  strokeColorDomain: [0, 1],
  highlightColor: [252, 242, 26, 255],
  isConfigActive: false,
  sizeField: null,
  sizeDomain: [0, 1],
  sizeScale: 'linear',
  textLabel: [
    {
      field: {
        name: 'name',
        id: 'name',
        displayName: 'name',
        type: 'string',
        format: '',
        fieldIdx: 7,
        analyzerType: 'STRING',
        valueAccessor: values => values[7]
      },
      color: [184, 15, 135, 255],
      size: 27,
      offset: [-10, 0],
      anchor: 'end',
      alignment: 'center'
    }
  ],
  colorUI: {
    color: DEFAULT_COLOR_UI,
    colorRange: DEFAULT_COLOR_UI
  },
  visConfig: {
    radius: 12.5,
    fixedRadius: false,
    opacity: 0.8,
    outline: false,
    thickness: 2,
    colorRange: {
      name: 'Global Warming',
      type: 'sequential',
      category: 'Uber',
      colors: ['#5A1846', '#900C3F', '#C70039', '#E3611C', '#F1920E', '#FFC300']
    },
    filled: true,
    strokeColorRange: {
      name: 'Global Warming',
      type: 'sequential',
      category: 'Uber',
      colors: ['#5A1846', '#900C3F', '#C70039', '#E3611C', '#F1920E', '#FFC300']
    },
    strokeColor: [23, 184, 190, 255],
    radiusRange: [0, 50]
  },
  animation: {enabled: false}
};

export const mergedLayers = [mergedLayer0];
