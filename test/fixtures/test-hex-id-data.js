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
const {H3Layer} = KeplerGlLayers;
import {DEFAULT_COLOR_UI} from 'layers/layer-factory';

export default `hex_id,value
89283082c2fffff,64
8928308288fffff,73
89283082c07ffff,65
89283082817ffff,74
89283082c3bffff,66
89283082883ffff,76
89283082c33ffff,43
89283082c23ffff,40
89283082887ffff,36
89283082ca7ffff,27
89283082cb3ffff,32
89283082c0bffff,26
89283082ca3ffff,19
89283082dcfffff,18
89283082d8fffff,1
89283095347ffff,3
89283095363ffff,2
8928309537bffff,4
89283082d93ffff,6
89283082d73ffff,1
8928309530bffff,1
8928309532bffff,1`;

export const dataId = 'h3-hex-id';

export const hexIdDataConfig = {
  dataId,
  config: {
    version: 'v1',
    config: {
      visState: {
        filters: [
          {
            dataId: [dataId],
            id: 'byjasfp0u',
            name: 'value',
            type: 'range',
            value: [11.2, 28],
            enlarged: false,
            plotType: 'histogram',
            yAxis: null
          }
        ],
        layers: [
          {
            id: 'avlgol',
            type: 'hexagonId',
            config: {
              dataId,
              label: 'H3 Hexagon',
              color: [241, 92, 23],
              columns: {
                hex_id: 'hex_id'
              },
              hidden: false,
              isVisible: true,
              visConfig: {
                opacity: 0.8,
                colorRange: {
                  name: 'Global Warming',
                  type: 'sequential',
                  category: 'Uber',
                  colors: ['#5A1846', '#900C3F', '#C70039', '#E3611C', '#F1920E', '#FFC300']
                },
                coverage: 1,
                sizeRange: [0, 500],
                coverageRange: [0, 1],
                elevationScale: 5,
                enableElevationZoomFactor: true
              },
              textLabel: [
                {
                  field: null,
                  color: [255, 255, 255],
                  size: 18,
                  offset: [0, 0],
                  anchor: 'start',
                  alignment: 'center'
                }
              ]
            },
            visualChannels: {
              colorField: {
                name: 'value',
                type: 'integer'
              },
              colorScale: 'quantile',
              sizeField: null,
              sizeScale: 'linear',
              coverageField: null,
              coverageScale: 'linear'
            }
          }
        ],
        interactionConfig: {
          tooltip: {
            fieldsToShow: {
              [dataId]: ['hex_id', 'value']
            },
            enabled: true
          },
          brush: {
            size: 0.5,
            enabled: false
          },
          geocoder: {
            enabled: false
          }
        },
        layerBlending: 'normal',
        splitMaps: []
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
          land: true,
          '3d building': false
        },
        mapStyles: {}
      }
    }
  }
};

export const mergedFilters = [
  {
    dataId: [dataId],
    id: 'value',
    name: ['value'],
    type: 'range',
    value: [11.2, 28],
    enlarged: false,
    freeze: true,
    plotType: 'histogram',
    yAxis: null,
    isAnimating: false,
    animationWindow: 'free',
    fieldIdx: [1],
    domain: [1, 76],
    step: 0.01,
    interval: null,
    histogram: ['Not tested'],
    enlargedHistogram: ['Not tested'],
    speed: 1,
    fieldType: 'integer',
    typeOptions: ['range'],
    fixedDomain: false,
    gpuChannel: [0],
    gpu: true
  }
];

const mergedFields = [
  {
    name: 'hex_id',
    id: 'hex_id',
    displayName: 'hex_id',
    format: '',
    fieldIdx: 0,
    type: 'string',
    analyzerType: 'STRING',
    valueAccessor: values => values[0]
  },
  {
    name: 'value',
    id: 'value',
    displayName: 'value',
    format: '',
    fieldIdx: 1,
    type: 'integer',
    analyzerType: 'INT',
    valueAccessor: values => values[1],
    filterProps: {
      domain: [1, 76],
      step: 0.01,
      histogram: [
        {count: 4, x0: 1, x1: 2},
        {count: 2, x0: 2, x1: 4},
        {count: 1, x0: 4, x1: 6},
        {count: 1, x0: 6, x1: 8},
        {count: 0, x0: 8, x1: 10},
        {count: 0, x0: 10, x1: 12},
        {count: 0, x0: 12, x1: 14},
        {count: 0, x0: 14, x1: 16},
        {count: 0, x0: 16, x1: 18},
        {count: 2, x0: 18, x1: 20},
        {count: 0, x0: 20, x1: 22},
        {count: 0, x0: 22, x1: 24},
        {count: 0, x0: 24, x1: 26},
        {count: 2, x0: 26, x1: 28},
        {count: 0, x0: 28, x1: 30},
        {count: 0, x0: 30, x1: 32},
        {count: 1, x0: 32, x1: 34},
        {count: 0, x0: 34, x1: 36},
        {count: 1, x0: 36, x1: 38},
        {count: 0, x0: 38, x1: 40},
        {count: 1, x0: 40, x1: 42},
        {count: 1, x0: 42, x1: 44},
        {count: 0, x0: 44, x1: 46},
        {count: 0, x0: 46, x1: 48},
        {count: 0, x0: 48, x1: 50},
        {count: 0, x0: 50, x1: 52},
        {count: 0, x0: 52, x1: 54},
        {count: 0, x0: 54, x1: 56},
        {count: 0, x0: 56, x1: 58},
        {count: 0, x0: 58, x1: 60},
        {count: 0, x0: 60, x1: 62},
        {count: 0, x0: 62, x1: 64},
        {count: 2, x0: 64, x1: 66},
        {count: 1, x0: 66, x1: 68},
        {count: 0, x0: 68, x1: 70},
        {count: 0, x0: 70, x1: 72},
        {count: 1, x0: 72, x1: 74},
        {count: 1, x0: 74, x1: 76},
        {count: 1, x0: 76, x1: 76}
      ],
      enlargedHistogram: [
        {count: 4, x0: 1, x1: 2},
        {count: 1, x0: 2, x1: 3},
        {count: 1, x0: 3, x1: 4},
        {count: 1, x0: 4, x1: 5},
        {count: 0, x0: 5, x1: 6},
        {count: 1, x0: 6, x1: 7},
        {count: 0, x0: 7, x1: 8},
        {count: 0, x0: 8, x1: 9},
        {count: 0, x0: 9, x1: 10},
        {count: 0, x0: 10, x1: 11},
        {count: 0, x0: 11, x1: 12},
        {count: 0, x0: 12, x1: 13},
        {count: 0, x0: 13, x1: 14},
        {count: 0, x0: 14, x1: 15},
        {count: 0, x0: 15, x1: 16},
        {count: 0, x0: 16, x1: 17},
        {count: 0, x0: 17, x1: 18},
        {count: 1, x0: 18, x1: 19},
        {count: 1, x0: 19, x1: 20},
        {count: 0, x0: 20, x1: 21},
        {count: 0, x0: 21, x1: 22},
        {count: 0, x0: 22, x1: 23},
        {count: 0, x0: 23, x1: 24},
        {count: 0, x0: 24, x1: 25},
        {count: 0, x0: 25, x1: 26},
        {count: 1, x0: 26, x1: 27},
        {count: 1, x0: 27, x1: 28},
        {count: 0, x0: 28, x1: 29},
        {count: 0, x0: 29, x1: 30},
        {count: 0, x0: 30, x1: 31},
        {count: 0, x0: 31, x1: 32},
        {count: 1, x0: 32, x1: 33},
        {count: 0, x0: 33, x1: 34},
        {count: 0, x0: 34, x1: 35},
        {count: 0, x0: 35, x1: 36},
        {count: 1, x0: 36, x1: 37},
        {count: 0, x0: 37, x1: 38},
        {count: 0, x0: 38, x1: 39},
        {count: 0, x0: 39, x1: 40},
        {count: 1, x0: 40, x1: 41},
        {count: 0, x0: 41, x1: 42},
        {count: 0, x0: 42, x1: 43},
        {count: 1, x0: 43, x1: 44},
        {count: 0, x0: 44, x1: 45},
        {count: 0, x0: 45, x1: 46},
        {count: 0, x0: 46, x1: 47},
        {count: 0, x0: 47, x1: 48},
        {count: 0, x0: 48, x1: 49},
        {count: 0, x0: 49, x1: 50},
        {count: 0, x0: 50, x1: 51},
        {count: 0, x0: 51, x1: 52},
        {count: 0, x0: 52, x1: 53},
        {count: 0, x0: 53, x1: 54},
        {count: 0, x0: 54, x1: 55},
        {count: 0, x0: 55, x1: 56},
        {count: 0, x0: 56, x1: 57},
        {count: 0, x0: 57, x1: 58},
        {count: 0, x0: 58, x1: 59},
        {count: 0, x0: 59, x1: 60},
        {count: 0, x0: 60, x1: 61},
        {count: 0, x0: 61, x1: 62},
        {count: 0, x0: 62, x1: 63},
        {count: 0, x0: 63, x1: 64},
        {count: 1, x0: 64, x1: 65},
        {count: 1, x0: 65, x1: 66},
        {count: 1, x0: 66, x1: 67},
        {count: 0, x0: 67, x1: 68},
        {count: 0, x0: 68, x1: 69},
        {count: 0, x0: 69, x1: 70},
        {count: 0, x0: 70, x1: 71},
        {count: 0, x0: 71, x1: 72},
        {count: 0, x0: 72, x1: 73},
        {count: 1, x0: 73, x1: 74},
        {count: 1, x0: 74, x1: 75},
        {count: 0, x0: 75, x1: 76},
        {count: 1, x0: 76, x1: 76}
      ],
      fieldType: 'integer',
      value: [1, 76],
      type: 'range',
      typeOptions: ['range'],
      gpu: true
    }
  }
];

export const mergedH3Layer = new H3Layer({
  id: 'avlgol'
});

mergedH3Layer.config = {
  dataId,
  label: 'H3 Hexagon',
  color: [241, 92, 23],
  columns: {
    hex_id: {
      value: 'hex_id',
      fieldIdx: 0
    }
  },
  hidden: false,
  isVisible: true,
  highlightColor: [252, 242, 26, 255],
  isConfigActive: false,
  colorField: {
    name: 'value',
    id: 'value',
    displayName: 'value',
    format: '',
    fieldIdx: 1,
    type: 'integer',
    analyzerType: 'INT',
    valueAccessor: values => values[1]
  },
  colorScale: 'quantile',
  colorDomain: [18, 19, 26, 27],
  sizeField: null,
  sizeDomain: [0, 1],
  sizeScale: 'linear',
  coverageField: null,
  coverageScale: 'linear',
  coverageDomain: [0, 1],
  visConfig: {
    opacity: 0.8,
    colorRange: {
      name: 'Global Warming',
      type: 'sequential',
      category: 'Uber',
      colors: ['#5A1846', '#900C3F', '#C70039', '#E3611C', '#F1920E', '#FFC300']
    },
    coverage: 1,
    sizeRange: [0, 500],
    coverageRange: [0, 1],
    elevationScale: 5,
    enableElevationZoomFactor: true,
    enable3d: false
  },
  textLabel: [
    {
      field: null,
      color: [255, 255, 255],
      size: 18,
      offset: [0, 0],
      anchor: 'start',
      alignment: 'center'
    }
  ],
  colorUI: {
    color: DEFAULT_COLOR_UI,
    colorRange: DEFAULT_COLOR_UI
  },
  animation: {
    enabled: false
  }
};

export const expectedMergedDataset = {
  id: 'h3-hex-id',
  label: 'new dataset',
  color: 'dont test me',
  metadata: {
    id: 'h3-hex-id',
    label: 'new dataset'
  },
  allData: [
    ['89283082c2fffff', 64],
    ['8928308288fffff', 73],
    ['89283082c07ffff', 65],
    ['89283082817ffff', 74],
    ['89283082c3bffff', 66],
    ['89283082883ffff', 76],
    ['89283082c33ffff', 43],
    ['89283082c23ffff', 40],
    ['89283082887ffff', 36],
    ['89283082ca7ffff', 27],
    ['89283082cb3ffff', 32],
    ['89283082c0bffff', 26],
    ['89283082ca3ffff', 19],
    ['89283082dcfffff', 18],
    ['89283082d8fffff', 1],
    ['89283095347ffff', 3],
    ['89283095363ffff', 2],
    ['8928309537bffff', 4],
    ['89283082d93ffff', 6],
    ['89283082d73ffff', 1],
    ['8928309530bffff', 1],
    ['8928309532bffff', 1]
  ],
  allIndexes: new Array(22).fill(0).map((d, i) => i),
  filteredIndex: new Array(22).fill(0).map((d, i) => i),
  filteredIndexForDomain: [9, 11, 12, 13],
  fieldPairs: [],
  fields: mergedFields,
  gpuFilter: {
    filterRange: [
      [10.2, 27],
      [0, 0],
      [0, 0],
      [0, 0]
    ],
    filterValueUpdateTriggers: {
      gpuFilter_0: 'value',
      gpuFilter_1: null,
      gpuFilter_2: null,
      gpuFilter_3: null
    },
    filterValueAccessor: {
      inputs: [{data: ['89283082c33ffff', 43], index: 6}],
      result: [42, 0, 0, 0]
    }
  },
  filterRecord: {
    dynamicDomain: [mergedFilters[0]],
    fixedDomain: [],
    cpu: [],
    gpu: [mergedFilters[0]]
  },
  changedFilters: {
    dynamicDomain: {byjasfp0u: 'added'},
    fixedDomain: null,
    cpu: null,
    gpu: {byjasfp0u: 'added'}
  }
};
