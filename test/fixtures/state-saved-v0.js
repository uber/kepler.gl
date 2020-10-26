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
const {PointLayer, ArcLayer, HexagonLayer, GeojsonLayer} = KeplerGlLayers;
import {getDefaultInteraction} from 'utils/interaction-utils';
import {DEFAULT_TEXT_LABEL, DEFAULT_COLOR_UI} from 'layers/layer-factory';

export const savedStateV0 = {
  config: {
    version: 'v0',
    config: {
      visState: {
        filters: [
          {
            dataId: '9h10t7fyb',
            id: 'vxzfwyg2v',
            name: 'song_name',
            type: 'multiSelect',
            value: ['3.68.4', '2.117.1', '2.103.2', '2.116.2'],
            enlarged: false
          },
          {
            dataId: '9h10t7fyb',
            id: 'fo9tjm2unl',
            name: 'timestamp_local',
            type: 'timeRange',
            value: [1453770124000, 1453770415000],
            enlarged: true
          },
          {
            dataId: '9h10t7fyb',
            id: 'aesy96t5',
            name: 'type_boolean',
            type: 'select',
            value: false,
            enlarged: false
          },
          {
            dataId: '9h10t7fyb',
            id: 's1bhgjt1',
            name: 'int_range',
            type: 'range',
            value: [78, 309],
            enlarged: false
          },
          {
            dataId: 'v79816te8',
            id: '5nfmxjjzl',
            name: 'ZIP_CODE',
            type: 'range',
            value: [94115.3, 94132],
            histogram: [
              {count: 1, x0: 94107, x1: 94107.2},
              {count: 0, x0: 94107.2, x1: 94107.4},
              {count: 0, x0: 94107.4, x1: 94107.6},
              {count: 0, x0: 94107.6, x1: 94107.8},
              {count: 0, x0: 94107.8, x1: 94108},
              {count: 0, x0: 94108, x1: 94108.2},
              {count: 0, x0: 94108.2, x1: 94108.4},
              {count: 0, x0: 94108.4, x1: 94108.6},
              {count: 0, x0: 94108.6, x1: 94108.8},
              {count: 0, x0: 94108.8, x1: 94109},
              {count: 0, x0: 94109, x1: 94109.2},
              {count: 0, x0: 94109.2, x1: 94109.4},
              {count: 0, x0: 94109.4, x1: 94109.6},
              {count: 0, x0: 94109.6, x1: 94109.8},
              {count: 0, x0: 94109.8, x1: 94110},
              {count: 0, x0: 94110, x1: 94110.2},
              {count: 0, x0: 94110.2, x1: 94110.4},
              {count: 0, x0: 94110.4, x1: 94110.6},
              {count: 0, x0: 94110.6, x1: 94110.8},
              {count: 0, x0: 94110.8, x1: 94111},
              {count: 0, x0: 94111, x1: 94111.2},
              {count: 0, x0: 94111.2, x1: 94111.4},
              {count: 0, x0: 94111.4, x1: 94111.6},
              {count: 0, x0: 94111.6, x1: 94111.8},
              {count: 0, x0: 94111.8, x1: 94112},
              {count: 0, x0: 94112, x1: 94112.2},
              {count: 0, x0: 94112.2, x1: 94112.4},
              {count: 0, x0: 94112.4, x1: 94112.6},
              {count: 0, x0: 94112.6, x1: 94112.8},
              {count: 0, x0: 94112.8, x1: 94113},
              {count: 0, x0: 94113, x1: 94113.2},
              {count: 0, x0: 94113.2, x1: 94113.4},
              {count: 0, x0: 94113.4, x1: 94113.6},
              {count: 0, x0: 94113.6, x1: 94113.8},
              {count: 0, x0: 94113.8, x1: 94114},
              {count: 0, x0: 94114, x1: 94114.2},
              {count: 0, x0: 94114.2, x1: 94114.4},
              {count: 0, x0: 94114.4, x1: 94114.6},
              {count: 0, x0: 94114.6, x1: 94114.8},
              {count: 0, x0: 94114.8, x1: 94115},
              {count: 0, x0: 94115, x1: 94115.2},
              {count: 0, x0: 94115.2, x1: 94115.4},
              {count: 0, x0: 94115.4, x1: 94115.6},
              {count: 0, x0: 94115.6, x1: 94115.8},
              {count: 0, x0: 94115.8, x1: 94116},
              {count: 0, x0: 94116, x1: 94116.2},
              {count: 0, x0: 94116.2, x1: 94116.4},
              {count: 0, x0: 94116.4, x1: 94116.6},
              {count: 0, x0: 94116.6, x1: 94116.8},
              {count: 0, x0: 94116.8, x1: 94117},
              {count: 0, x0: 94117, x1: 94117.2},
              {count: 0, x0: 94117.2, x1: 94117.4},
              {count: 0, x0: 94117.4, x1: 94117.6},
              {count: 0, x0: 94117.6, x1: 94117.8},
              {count: 0, x0: 94117.8, x1: 94118},
              {count: 0, x0: 94118, x1: 94118.2},
              {count: 0, x0: 94118.2, x1: 94118.4},
              {count: 0, x0: 94118.4, x1: 94118.6},
              {count: 0, x0: 94118.6, x1: 94118.8},
              {count: 0, x0: 94118.8, x1: 94119},
              {count: 0, x0: 94119, x1: 94119.2},
              {count: 0, x0: 94119.2, x1: 94119.4},
              {count: 0, x0: 94119.4, x1: 94119.6},
              {count: 0, x0: 94119.6, x1: 94119.8},
              {count: 0, x0: 94119.8, x1: 94120},
              {count: 0, x0: 94120, x1: 94120.2},
              {count: 0, x0: 94120.2, x1: 94120.4},
              {count: 0, x0: 94120.4, x1: 94120.6},
              {count: 0, x0: 94120.6, x1: 94120.8},
              {count: 0, x0: 94120.8, x1: 94121},
              {count: 0, x0: 94121, x1: 94121.2},
              {count: 0, x0: 94121.2, x1: 94121.4},
              {count: 0, x0: 94121.4, x1: 94121.6},
              {count: 0, x0: 94121.6, x1: 94121.8},
              {count: 0, x0: 94121.8, x1: 94122},
              {count: 0, x0: 94122, x1: 94122.2},
              {count: 0, x0: 94122.2, x1: 94122.4},
              {count: 0, x0: 94122.4, x1: 94122.6},
              {count: 0, x0: 94122.6, x1: 94122.8},
              {count: 0, x0: 94122.8, x1: 94123},
              {count: 0, x0: 94123, x1: 94123.2},
              {count: 0, x0: 94123.2, x1: 94123.4},
              {count: 0, x0: 94123.4, x1: 94123.6},
              {count: 0, x0: 94123.6, x1: 94123.8},
              {count: 0, x0: 94123.8, x1: 94124},
              {count: 0, x0: 94124, x1: 94124.2},
              {count: 0, x0: 94124.2, x1: 94124.4},
              {count: 0, x0: 94124.4, x1: 94124.6},
              {count: 0, x0: 94124.6, x1: 94124.8},
              {count: 0, x0: 94124.8, x1: 94125},
              {count: 0, x0: 94125, x1: 94125.2},
              {count: 0, x0: 94125.2, x1: 94125.4},
              {count: 0, x0: 94125.4, x1: 94125.6},
              {count: 0, x0: 94125.6, x1: 94125.8},
              {count: 0, x0: 94125.8, x1: 94126},
              {count: 0, x0: 94126, x1: 94126.2},
              {count: 0, x0: 94126.2, x1: 94126.4},
              {count: 0, x0: 94126.4, x1: 94126.6},
              {count: 0, x0: 94126.6, x1: 94126.8},
              {count: 0, x0: 94126.8, x1: 94127},
              {count: 0, x0: 94127, x1: 94127.2},
              {count: 0, x0: 94127.2, x1: 94127.4},
              {count: 0, x0: 94127.4, x1: 94127.6},
              {count: 0, x0: 94127.6, x1: 94127.8},
              {count: 0, x0: 94127.8, x1: 94128},
              {count: 0, x0: 94128, x1: 94128.2},
              {count: 0, x0: 94128.2, x1: 94128.4},
              {count: 0, x0: 94128.4, x1: 94128.6},
              {count: 0, x0: 94128.6, x1: 94128.8},
              {count: 0, x0: 94128.8, x1: 94129},
              {count: 1, x0: 94129, x1: 94129.2},
              {count: 0, x0: 94129.2, x1: 94129.4},
              {count: 0, x0: 94129.4, x1: 94129.6},
              {count: 0, x0: 94129.6, x1: 94129.8},
              {count: 0, x0: 94129.8, x1: 94130},
              {count: 0, x0: 94130, x1: 94130.2},
              {count: 0, x0: 94130.2, x1: 94130.4},
              {count: 0, x0: 94130.4, x1: 94130.6},
              {count: 0, x0: 94130.6, x1: 94130.8},
              {count: 0, x0: 94130.8, x1: 94131},
              {count: 0, x0: 94131, x1: 94131.2},
              {count: 0, x0: 94131.2, x1: 94131.4},
              {count: 0, x0: 94131.4, x1: 94131.6},
              {count: 0, x0: 94131.6, x1: 94131.8},
              {count: 0, x0: 94131.8, x1: 94132},
              {count: 1, x0: 94132, x1: 94132}
            ],
            enlarged: false
          }
        ],
        layers: [
          {
            id: '1eh',
            dataId: '9h10t7fyb',
            label: 'dropoff',
            color: [76, 154, 78],
            columns: {
              lat: {
                value: 'dropoff_lat',
                fieldIdx: 6
              },
              lng: {
                value: 'dropoff_lng',
                fieldIdx: 7
              }
            },
            isVisible: false,
            isAggregated: false,
            type: 'point',
            colorField: null,
            colorScale: 'quantile',
            sizeField: null,
            sizeScale: 'linear',
            visConfig: {
              radius: 270.4,
              opacity: 0.8,
              outline: false,
              thickness: 2,
              colorRange: {
                name: 'Global Warming',
                type: 'sequential',
                category: 'Uber',
                colors: ['#5A1846', '#900C3F', '#C70039', '#E3611C', '#F1920E', '#FFC300']
              },
              radiusRange: [1, 100],
              'hi-precision': false
            }
          },
          {
            id: 'tud',
            dataId: '9h10t7fyb',
            label: 'trip arc',
            color: [18, 147, 154],
            columns: {
              lat0: {
                value: 'begintrip_lat',
                fieldIdx: 1
              },
              lng0: {
                value: 'begintrip_lng',
                fieldIdx: 2
              },
              lat1: {
                value: 'dropoff_lat',
                fieldIdx: 6
              },
              lng1: {
                value: 'dropoff_lng',
                fieldIdx: 7
              }
            },
            isVisible: true,
            isAggregated: false,
            type: 'arc',
            colorField: null,
            colorScale: 'quantile',
            sizeField: null,
            sizeScale: 'linear',
            visConfig: {
              opacity: 0.41,
              thickness: 2,
              colorRange: {
                name: 'Global Warming',
                type: 'sequential',
                category: 'Uber',
                colors: ['#5A1846', '#900C3F', '#C70039', '#E3611C', '#F1920E', '#FFC300']
              },
              sizeRange: [0, 10],
              'hi-precision': false
            }
          },
          {
            id: 'pwl',
            dataId: '9h10t7fyb',
            label: 'begintrip',
            color: [218, 112, 191],
            columns: {
              lat: {
                value: 'begintrip_lat',
                fieldIdx: 1
              },
              lng: {
                value: 'begintrip_lng',
                fieldIdx: 2
              }
            },
            isVisible: true,
            isAggregated: false,
            type: 'point',
            colorField: {
              name: 'song_name',
              type: 'string'
            },
            colorScale: 'ordinal',
            sizeField: {
              name: 'int_range',
              type: 'integer'
            },
            sizeScale: 'linear',
            visConfig: {
              radius: 10,
              opacity: 0.8,
              outline: false,
              thickness: 2,
              colorRange: {
                name: 'Sunrise',
                type: 'sequential',
                category: 'Uber',
                colors: ['#355C7D', '#6C5B7B', '#C06C84', '#F67280', '#F8B195'],
                reversed: false
              },
              radiusRange: [1, 854.16],
              'hi-precision': false
            }
          },
          {
            id: 'p5',
            dataId: '9h10t7fyb',
            label: 'begintrip_hex',
            color: [241, 92, 23],
            columns: {
              lat: {
                value: 'begintrip_lat',
                fieldIdx: 1
              },
              lng: {
                value: 'begintrip_lng',
                fieldIdx: 2
              }
            },
            isVisible: true,
            isAggregated: true,
            type: 'hexagon',
            colorField: {
              name: 'int_range',
              type: 'integer'
            },
            colorScale: 'quantile',
            sizeField: null,
            sizeScale: 'linear',
            visConfig: {
              opacity: 0.8,
              worldUnitSize: 0.5,
              resolution: 8,
              colorRange: {
                name: 'Global Warming',
                type: 'sequential',
                category: 'Uber',
                colors: ['#5A1846', '#900C3F', '#C70039', '#E3611C', '#F1920E', '#FFC300']
              },
              coverage: 1,
              sizeRange: [0, 50],
              upperPercentile: 100,
              elevationScale: 10
            },
            enable3d: true,
            colorAggregation: 'maximum',
            sizeAggregation: 'average'
          },
          {
            id: 'vta',
            dataId: 'v79816te8',
            label: 'zip',
            color: [255, 153, 31, 255],
            columns: {
              geojson: {
                value: '_geojson',
                fieldIdx: 0
              }
            },
            isVisible: true,
            isAggregated: false,
            type: 'geojson',
            colorField: {
              name: 'ID',
              type: 'integer'
            },
            colorScale: 'quantize',
            sizeField: null,
            sizeScale: 'linear',
            visConfig: {
              colorRange: {
                name: 'Uber Viz Qualitative 3',
                type: 'qualitative',
                category: 'Uber',
                colors: [
                  '#12939A',
                  '#DDB27C',
                  '#88572C',
                  '#FF991F',
                  '#F15C17',
                  '#223F9A',
                  '#DA70BF',
                  '#125C77',
                  '#4DC19C',
                  '#776E57',
                  '#17B8BE',
                  '#F6D18A',
                  '#B7885E',
                  '#FFCB99',
                  '#F89570'
                ],
                reversed: false
              },
              opacity: 0.8,
              thickness: 2,
              sizeRange: [0, 10],
              stroked: false,
              filled: true,
              extruded: false,
              wireframe: false,
              'hi-precision': false
            }
          }
        ],
        interactionConfig: {
          tooltip: {
            fieldsToShow: {
              '9h10t7fyb': ['int_range', 'detail', 'type_boolean'],
              v79816te8: ['ID', 'ZIP_CODE']
            }
          }
        },
        layerBlending: 'normal'
      },
      mapStyle: {
        styleType: 'muted',
        topLayerGroups: {
          label: true
        },
        visibleLayerGroups: {
          label: true,
          places: true,
          road: false,
          border: false,
          building: true,
          water: true,
          land: true
        }
      },
      mapState: {
        bearing: 0,
        dragRotate: false,
        latitude: 37.766239122943205,
        longitude: -122.48468972813009,
        pitch: 0,
        zoom: 11.433560418908408
      }
    }
  },
  datasets: [
    {
      version: 'v0',
      data: {
        id: '9h10t7fyb',
        label: 'small_dataset.csv',
        color: [53, 92, 125],
        allData: [
          [
            '3.68.4',
            38.4163786,
            -121.7922809,
            '2016-01-26T01:13:30.000Z',
            -83.7,
            'blue',
            38.5590766,
            -121.3686062,
            '2016-01-26T02:42:13.000Z',
            694,
            false
          ],
          [
            '2.117.1',
            37.75159991,
            -122.4761712,
            '2016-01-26T01:04:39.000Z',
            -6.79,
            'red',
            37.79887225,
            -122.419046,
            '2016-01-26T01:20:42.000Z',
            335,
            false
          ],
          [
            '2.117.1',
            37.8323825,
            -122.2736475,
            '2016-01-26T01:05:58.000Z',
            -12,
            'red',
            37.8983639,
            -122.2906993,
            '2016-01-26T01:21:27.000Z',
            363,
            false
          ],
          [
            '2.116.2',
            37.77565501,
            -122.4403984,
            '2016-01-26T01:02:04.000Z',
            -8.75,
            'red',
            37.78188901,
            -122.4784396,
            '2016-01-26T01:12:15.000Z',
            78,
            false
          ],
          [
            '2.103.2',
            37.79659543,
            -122.4219072,
            '2016-01-26T01:02:11.000Z',
            -10.58,
            'red',
            37.78444762,
            -122.470581,
            '2016-01-26T01:18:12.000Z',
            192,
            false
          ],
          [
            '2.117.1',
            37.7980847,
            -122.4050548,
            '2016-01-26T01:06:35.000Z',
            -5.23,
            'red',
            37.80089,
            -122.4268962,
            '2016-01-26T01:13:40.000Z',
            242,
            false
          ],
          [
            '2.117.1',
            37.79242329,
            -122.3986584,
            '2016-01-26T01:02:53.000Z',
            -7.81,
            'red',
            37.7832852,
            -122.4252576,
            '2016-01-26T01:13:02.000Z',
            175,
            false
          ],
          [
            '2.107.3',
            37.79669585,
            -122.4219416,
            '2016-01-26T01:06:34.000Z',
            -5.76,
            'red',
            37.79929617,
            -122.4182267,
            '2016-01-26T01:14:24.000Z',
            223,
            false
          ],
          [
            '2.117.1',
            37.6169644,
            -122.384047,
            '2016-01-26T01:09:00.000Z',
            -17.77,
            'red',
            37.7838334,
            -122.4329964,
            '2016-01-26T01:30:14.000Z',
            298,
            false
          ]
        ],
        fields: [
          {
            name: 'song_name',
            type: 'string'
          },
          {
            name: 'begintrip_lat',
            type: 'real'
          },
          {
            name: 'begintrip_lng',
            type: 'real'
          },
          {
            name: 'timestamp_local',
            type: 'timestamp'
          },
          {
            name: 'counting',
            type: 'real'
          },
          {
            name: 'detail',
            type: 'string'
          },
          {
            name: 'dropoff_lat',
            type: 'real'
          },
          {
            name: 'dropoff_lng',
            type: 'real'
          },
          {
            name: 'dropoff_timestamp_local',
            type: 'timestamp'
          },
          {
            name: 'int_range',
            type: 'integer'
          },
          {
            name: 'type_boolean',
            type: 'boolean'
          }
        ]
      }
    },
    {
      version: 'v0',
      data: {
        id: 'v79816te8',
        label: 'zip_geo.json',
        color: [192, 108, 132],
        allData: [
          [
            {
              type: 'Feature',
              properties: {
                OBJECTID: 1,
                ZIP_CODE: 94107,
                ID: 94107,
                index: 0
              },
              geometry: {
                type: 'Polygon',
                coordinates: [
                  [
                    [-122.40115971858505, 37.78202426695214],
                    [-122.40037436684331, 37.78264451554517],
                    [-122.40001902006377, 37.782925153640136],
                    [-122.39989147796784, 37.783025880124256],
                    [-122.40115971858505, 37.78202426695214]
                  ]
                ]
              }
            },
            1,
            94107,
            94107
          ],
          [
            {
              type: 'Feature',
              properties: {
                OBJECTID: 3,
                ZIP_CODE: 94129,
                ID: 94129,
                index: 1
              },
              geometry: {
                type: 'Polygon',
                coordinates: [
                  [
                    [-122.47099072114979, 37.787534455433345],
                    [-122.47229053418182, 37.78739591716227],
                    [-122.47240190249055, 37.787384046501884],
                    [-122.47254342327507, 37.787368961705944],
                    [-122.47099072114979, 37.787534455433345]
                  ]
                ]
              }
            },
            3,
            94129,
            94129
          ],
          [
            {
              type: 'Feature',
              properties: {
                OBJECTID: 25,
                ZIP_CODE: 94132,
                ID: 94132,
                index: 2
              },
              geometry: {
                type: 'Polygon',
                coordinates: [
                  [
                    [-122.50828762723958, 37.733266432915535],
                    [-122.50828361009823, 37.7333097667607],
                    [-122.50825842264912, 37.73333766599817],
                    [-122.50825465624375, 37.73339026610973],
                    [-122.50826138138635, 37.73344715152078],
                    [-122.50826063283236, 37.73354742941749],
                    [-122.50826859537165, 37.73358609492605],
                    [-122.50828762723958, 37.733266432915535]
                  ]
                ]
              }
            },
            25,
            94132,
            94132
          ],
          [
            {
              type: 'Feature',
              properties: {
                OBJECTID: 25,
                ZIP_CODE: 94132,
                ID: 94132,
                index: 3
              },
              geometry: {
                type: 'Polygon',
                coordinates: [
                  [
                    [-122.50828762723958, 37.733266432915535],
                    [-122.50828361009823, 37.7333097667607],
                    [-122.50825842264912, 37.73333766599817],
                    [-122.50825465624375, 37.73339026610973],
                    [-122.50826138138635, 37.73344715152078],
                    [-122.50826063283236, 37.73354742941749],
                    [-122.50826859537165, 37.73358609492605],
                    [-122.50828762723958, 37.733266432915535]
                  ]
                ]
              }
            },
            25,
            94132,
            94132
          ]
        ],
        fields: [
          {
            name: '_geojson',
            type: 'geojson'
          },
          {
            name: 'OBJECTID',
            type: 'integer'
          },
          {
            name: 'ZIP_CODE',
            type: 'integer'
          },
          {
            name: 'ID',
            type: 'integer'
          }
        ]
      }
    }
  ]
};

export const expectedInfo0 = {
  id: '9h10t7fyb',
  label: 'small_dataset.csv',
  color: [53, 92, 125]
};

export const expectedFields0 = [
  {
    name: 'song_name',
    type: 'string',
    format: '',
    analyzerType: 'STRING'
  },
  {
    name: 'begintrip_lat',
    type: 'real',
    format: '',
    analyzerType: 'FLOAT'
  },
  {
    name: 'begintrip_lng',
    type: 'real',
    format: '',
    analyzerType: 'FLOAT'
  },
  {
    name: 'timestamp_local',
    type: 'timestamp',
    format: 'YYYY-M-DTHH:mm:ss.SSSS',
    analyzerType: 'DATETIME'
  },
  {
    name: 'counting',
    type: 'real',
    format: '',
    analyzerType: 'FLOAT'
  },
  {
    name: 'detail',
    type: 'string',
    format: '',
    analyzerType: 'STRING'
  },
  {
    name: 'dropoff_lat',
    type: 'real',
    format: '',
    analyzerType: 'FLOAT'
  },
  {
    name: 'dropoff_lng',
    type: 'real',
    format: '',
    analyzerType: 'FLOAT'
  },
  {
    name: 'dropoff_timestamp_local',
    type: 'timestamp',
    format: 'YYYY-M-DTHH:mm:ss.SSSS',
    analyzerType: 'DATETIME'
  },
  {
    name: 'int_range',
    type: 'integer',
    format: '',
    analyzerType: 'INT'
  },
  {
    name: 'type_boolean',
    type: 'boolean',
    format: '',
    analyzerType: 'BOOLEAN'
  }
];

export const expectedInfo1 = {
  id: 'v79816te8',
  label: 'zip_geo.json',
  color: [192, 108, 132]
};

export const expectedFields1 = [
  {
    name: '_geojson',
    type: 'geojson',
    format: '',
    analyzerType: 'GEOMETRY'
  },
  {
    name: 'OBJECTID',
    type: 'integer',
    format: '',
    analyzerType: 'INT'
  },
  {
    name: 'ZIP_CODE',
    type: 'integer',
    format: '',
    analyzerType: 'INT'
  },
  {
    name: 'ID',
    type: 'integer',
    format: '',
    analyzerType: 'INT'
  }
];

export const mergedFilters = [
  {
    dataId: ['9h10t7fyb'],
    freeze: true,
    id: 'vxzfwyg2v',
    enlarged: false,
    isAnimating: false,
    animationWindow: 'free',
    name: ['song_name'],
    type: 'multiSelect',
    fieldIdx: [0],
    domain: ['2.103.2', '2.107.3', '2.116.2', '2.117.1', '3.68.4'],
    value: ['3.68.4', '2.117.1', '2.103.2', '2.116.2'],
    fieldType: 'string',
    plotType: 'histogram',
    yAxis: null,
    interval: null,
    speed: 1,
    fixedDomain: false,
    gpu: false
  },
  {
    dataId: ['9h10t7fyb'],
    freeze: true,
    id: 'fo9tjm2unl',
    enlarged: true,
    isAnimating: false,
    animationWindow: 'free',
    name: ['timestamp_local'],
    type: 'timeRange',
    fieldIdx: [3],
    plotType: 'histogram',
    yAxis: null,
    interval: null,
    histogram: ['not tested'],
    enlargedHistogram: ['not tested'],
    domain: [1453770124000, 1453770810000],
    value: [1453770124000, 1453770415000],
    step: 1000,
    speed: 1,
    mappedValue: [
      1453770810000,
      1453770279000,
      1453770358000,
      1453770124000,
      1453770131000,
      1453770395000,
      1453770173000,
      1453770394000,
      1453770540000
    ],
    fieldType: 'timestamp',
    fixedDomain: true,
    gpu: true,
    gpuChannel: [0],
    defaultTimeFormat: 'L LTS'
  },
  {
    dataId: ['9h10t7fyb'],
    id: 'aesy96t5',
    name: ['type_boolean'],
    type: 'select',
    freeze: true,
    value: false,
    enlarged: false,
    isAnimating: false,
    animationWindow: 'free',
    fieldIdx: [10],
    domain: [true, false],
    fieldType: 'boolean',
    plotType: 'histogram',
    yAxis: null,
    interval: null,
    speed: 1,
    fixedDomain: false,
    gpu: false
  },
  {
    dataId: ['9h10t7fyb'],
    id: 's1bhgjt1',
    name: ['int_range'],
    type: 'range',
    value: [78, 309],
    freeze: true,
    enlarged: false,
    plotType: 'histogram',
    yAxis: null,
    interval: null,
    histogram: ['not tested'],
    enlargedHistogram: ['not tested'],
    isAnimating: false,
    animationWindow: 'free',
    fieldIdx: [9],
    domain: [78, 694],
    step: 1,
    speed: 1,
    fieldType: 'integer',
    typeOptions: ['range'],
    fixedDomain: false,
    gpu: true,
    gpuChannel: [1]
  },
  {
    dataId: ['v79816te8'],
    freeze: true,
    id: '5nfmxjjzl',
    enlarged: false,
    isAnimating: false,
    animationWindow: 'free',
    name: ['ZIP_CODE'],
    type: 'range',
    fieldIdx: [2],
    plotType: 'histogram',
    yAxis: null,
    interval: null,
    histogram: ['not tested'],
    enlargedHistogram: ['not tested'],
    domain: [94107, 94132],
    value: [94115.3, 94132],
    step: 0.01,
    speed: 1,
    fieldType: 'integer',
    typeOptions: ['range'],
    fixedDomain: false,
    gpu: true,
    gpuChannel: [0]
  }
];

const mergedLayer0 = new PointLayer({
  id: '1eh',
  dataId: '9h10t7fyb',
  label: 'dropoff',
  color: [76, 154, 78],
  columns: {
    lat: {
      value: 'dropoff_lat',
      fieldIdx: 6
    },
    lng: {
      value: 'dropoff_lng',
      fieldIdx: 7
    },
    altitude: {
      value: null,
      fieldIdx: -1,
      optional: true
    }
  },
  isVisible: false
});

mergedLayer0.config = {
  ...mergedLayer0.config,
  colorField: null,
  colorScale: 'quantile',
  colorDomain: [0, 1],
  strokeColorField: null,
  strokeColorScale: 'quantile',
  strokeColorDomain: [0, 1],
  sizeField: null,
  sizeScale: 'linear',
  sizeDomain: [0, 1],
  textLabel: [DEFAULT_TEXT_LABEL],
  hidden: false,
  visConfig: {
    radius: 270.4,
    opacity: 0.8,
    outline: false,
    filled: true,
    thickness: 2,
    fixedRadius: false,
    colorRange: {
      name: 'Global Warming',
      type: 'sequential',
      category: 'Uber',
      colors: ['#5A1846', '#900C3F', '#C70039', '#E3611C', '#F1920E', '#FFC300']
    },
    strokeColorRange: {
      name: 'Global Warming',
      type: 'sequential',
      category: 'Uber',
      colors: ['#5A1846', '#900C3F', '#C70039', '#E3611C', '#F1920E', '#FFC300']
    },
    strokeColor: [76, 154, 78],
    radiusRange: [1, 100]
  }
};

mergedLayer0.meta = {
  bounds: [-122.4784396, 37.78188901, -121.3686062, 38.5590766]
};

const mergedLayer1 = new ArcLayer({
  id: 'tud',
  dataId: '9h10t7fyb',
  label: 'trip arc',
  color: [18, 147, 154],
  columns: {
    lat0: {
      value: 'begintrip_lat',
      fieldIdx: 1
    },
    lng0: {
      value: 'begintrip_lng',
      fieldIdx: 2
    },
    lat1: {
      value: 'dropoff_lat',
      fieldIdx: 6
    },
    lng1: {
      value: 'dropoff_lng',
      fieldIdx: 7
    }
  },
  isVisible: true
});

mergedLayer1.config = {
  ...mergedLayer1.config,
  colorField: null,
  colorScale: 'quantile',
  colorDomain: [0, 1],
  sizeField: null,
  sizeScale: 'linear',
  sizeDomain: [0, 1],
  textLabel: [DEFAULT_TEXT_LABEL],
  colorUI: {
    color: DEFAULT_COLOR_UI,
    colorRange: DEFAULT_COLOR_UI
  },
  hidden: false,
  visConfig: {
    opacity: 0.41,
    thickness: 2,
    targetColor: null,
    colorRange: {
      name: 'Global Warming',
      type: 'sequential',
      category: 'Uber',
      colors: ['#5A1846', '#900C3F', '#C70039', '#E3611C', '#F1920E', '#FFC300']
    },
    sizeRange: [0, 10]
  }
};

const mergedLayer2 = new PointLayer({
  id: 'pwl'
});

mergedLayer2.config = {
  dataId: '9h10t7fyb',
  label: 'begintrip',
  color: [218, 112, 191],
  columns: {
    lat: {
      value: 'begintrip_lat',
      fieldIdx: 1
    },
    lng: {
      value: 'begintrip_lng',
      fieldIdx: 2
    },
    altitude: {
      value: null,
      fieldIdx: -1,
      optional: true
    }
  },
  highlightColor: [252, 242, 26, 255],
  isConfigActive: false,
  isVisible: true,
  colorField: {
    name: 'song_name',
    id: 'song_name',
    displayName: 'song_name',
    type: 'string',
    format: '',
    fieldIdx: 0,
    analyzerType: 'STRING',
    valueAccessor: values => values[0]
  },
  colorScale: 'ordinal',
  colorDomain: ['2.103.2', '2.107.3', '2.116.2', '2.117.1', '3.68.4'],
  strokeColorField: null,
  strokeColorScale: 'quantile',
  strokeColorDomain: [0, 1],
  sizeField: {
    name: 'int_range',
    id: 'int_range',
    displayName: 'int_range',
    format: '',
    type: 'integer',
    fieldIdx: 9,
    analyzerType: 'INT',
    valueAccessor: values => values[9]
  },
  sizeDomain: [78, 694],
  sizeScale: 'sqrt',
  textLabel: [DEFAULT_TEXT_LABEL],
  colorUI: {
    color: DEFAULT_COLOR_UI,
    colorRange: DEFAULT_COLOR_UI
  },
  hidden: false,
  visConfig: {
    radius: 10,
    opacity: 0.8,
    outline: false,
    filled: true,
    thickness: 2,
    colorRange: {
      name: 'Sunrise',
      type: 'sequential',
      category: 'Uber',
      colors: ['#355C7D', '#6C5B7B', '#C06C84', '#F67280', '#F8B195'],
      reversed: false
    },
    strokeColorRange: {
      name: 'Sunrise',
      type: 'sequential',
      category: 'Uber',
      colors: ['#355C7D', '#6C5B7B', '#C06C84', '#F67280', '#F8B195'],
      reversed: false
    },
    strokeColor: [218, 112, 191],
    fixedRadius: false,
    radiusRange: [1, 854.16]
  },
  animation: {enabled: false}
};

mergedLayer2.meta = {
  bounds: [-122.4761712, 37.6169644, -121.7922809, 38.4163786]
};

const mergedLayer3 = new HexagonLayer({
  id: 'p5'
});

mergedLayer3.config = {
  dataId: '9h10t7fyb',
  label: 'begintrip_hex',
  color: [241, 92, 23],
  columns: {
    lat: {
      value: 'begintrip_lat',
      fieldIdx: 1
    },
    lng: {
      value: 'begintrip_lng',
      fieldIdx: 2
    }
  },
  hidden: false,
  isVisible: true,
  colorField: {
    name: 'int_range',
    displayName: 'int_range',
    id: 'int_range',
    type: 'integer',
    format: '',
    fieldIdx: 9,
    analyzerType: 'INT',
    valueAccessor: values => values[9]
  },
  highlightColor: [252, 242, 26, 255],
  isConfigActive: false,
  colorScale: 'quantile',
  colorDomain: [0, 1],
  sizeField: null,
  sizeScale: 'linear',
  sizeDomain: [0, 1],
  textLabel: [DEFAULT_TEXT_LABEL],
  colorUI: {
    color: DEFAULT_COLOR_UI,
    colorRange: DEFAULT_COLOR_UI
  },
  visConfig: {
    colorAggregation: 'maximum',
    sizeAggregation: 'average',
    enable3d: true,
    opacity: 0.8,
    worldUnitSize: 0.5,
    resolution: 8,
    colorRange: {
      name: 'Global Warming',
      type: 'sequential',
      category: 'Uber',
      colors: ['#5A1846', '#900C3F', '#C70039', '#E3611C', '#F1920E', '#FFC300']
    },
    coverage: 1,
    sizeRange: [0, 50],
    percentile: [0, 100],
    elevationPercentile: [0, 100],
    elevationScale: 10,
    enableElevationZoomFactor: true
  },
  animation: {enabled: false}
};

mergedLayer3.meta = {
  bounds: [-122.4761712, 37.6169644, -121.7922809, 38.4163786]
};

const mergedLayer4 = new GeojsonLayer({id: 'vta'});

mergedLayer4.config = {
  dataId: 'v79816te8',
  label: 'zip',
  color: [255, 153, 31, 255],
  columns: {
    geojson: {
      value: '_geojson',
      fieldIdx: 0
    }
  },
  highlightColor: [252, 242, 26, 255],
  isConfigActive: false,
  hidden: false,
  isVisible: true,
  colorField: {
    name: 'ID',
    displayName: 'ID',
    id: 'ID',
    type: 'integer',
    format: '',
    fieldIdx: 3,
    analyzerType: 'INT',
    valueAccessor: values => values[3]
  },
  colorScale: 'quantize',
  colorDomain: [94107, 94132],
  strokeColorField: null,
  strokeColorScale: 'quantile',
  strokeColorDomain: [0, 1],
  sizeField: null,
  sizeScale: 'linear',
  sizeDomain: [0, 1],
  textLabel: [DEFAULT_TEXT_LABEL],
  colorUI: {
    color: DEFAULT_COLOR_UI,
    colorRange: DEFAULT_COLOR_UI
  },
  heightField: null,
  heightDomain: [0, 1],
  heightScale: 'linear',

  // add radius visual channel
  radiusField: null,
  radiusDomain: [0, 1],
  radiusScale: 'linear',
  visConfig: {
    colorRange: {
      name: 'Uber Viz Qualitative 3',
      type: 'qualitative',
      category: 'Uber',
      colors: [
        '#12939A',
        '#DDB27C',
        '#88572C',
        '#FF991F',
        '#F15C17',
        '#223F9A',
        '#DA70BF',
        '#125C77',
        '#4DC19C',
        '#776E57',
        '#17B8BE',
        '#F6D18A',
        '#B7885E',
        '#FFCB99',
        '#F89570'
      ],
      reversed: false
    },
    strokeColorRange: {
      name: 'Uber Viz Qualitative 3',
      type: 'qualitative',
      category: 'Uber',
      colors: [
        '#12939A',
        '#DDB27C',
        '#88572C',
        '#FF991F',
        '#F15C17',
        '#223F9A',
        '#DA70BF',
        '#125C77',
        '#4DC19C',
        '#776E57',
        '#17B8BE',
        '#F6D18A',
        '#B7885E',
        '#FFCB99',
        '#F89570'
      ],
      reversed: false
    },
    strokeColor: [255, 153, 31, 255],
    opacity: 0.8,
    thickness: 2,
    radius: 10,
    sizeRange: [0, 10],
    radiusRange: [0, 50],
    heightRange: [0, 500],
    elevationScale: 5,
    enableElevationZoomFactor: true,
    stroked: false,
    filled: true,
    enable3d: false,
    wireframe: false,
    strokeOpacity: 0.8
  },
  animation: {enabled: false}
};

mergedLayer4.dataToFeature = {
  0: {
    type: 'Feature',
    properties: {
      OBJECTID: 1,
      ZIP_CODE: 94107,
      ID: 94107,
      index: 0
    },
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [-122.40115971858505, 37.78202426695214],
          [-122.40037436684331, 37.78264451554517],
          [-122.40001902006377, 37.782925153640136],
          [-122.39989147796784, 37.783025880124256],
          [-122.40115971858505, 37.78202426695214]
        ]
      ]
    }
  },
  1: {
    type: 'Feature',
    properties: {
      OBJECTID: 3,
      ZIP_CODE: 94129,
      ID: 94129,
      index: 1
    },
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [-122.47099072114979, 37.787534455433345],
          [-122.47229053418182, 37.78739591716227],
          [-122.47240190249055, 37.787384046501884],
          [-122.47254342327507, 37.787368961705944],
          [-122.47099072114979, 37.787534455433345]
        ]
      ]
    }
  },
  2: {
    type: 'Feature',
    properties: {
      OBJECTID: 25,
      ZIP_CODE: 94132,
      ID: 94132,
      index: 2
    },
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [-122.50828762723958, 37.733266432915535],
          [-122.50828361009823, 37.7333097667607],
          [-122.50825842264912, 37.73333766599817],
          [-122.50825465624375, 37.73339026610973],
          [-122.50826138138635, 37.73344715152078],
          [-122.50826063283236, 37.73354742941749],
          [-122.50826859537165, 37.73358609492605],
          [-122.50828762723958, 37.733266432915535]
        ]
      ]
    }
  }
};

mergedLayer4.meta = {
  bounds: [-122.50828762723958, 37.733266432915535, -122.39989147796784, 37.787534455433345],
  featureTypes: {polygon: true},
  fp64: false,
  fixedRadius: false
};

export const mergedLayers = [mergedLayer0, mergedLayer1, mergedLayer2, mergedLayer3, mergedLayer4];

const defaultInteraction = getDefaultInteraction();
export const mergedInteractions = {
  ...defaultInteraction,
  tooltip: {
    ...defaultInteraction.tooltip,
    enabled: true,
    config: {
      compareMode: false,
      compareType: 'absolute',
      fieldsToShow: {
        '9h10t7fyb': [
          {
            name: 'int_range',
            format: null
          },
          {
            name: 'detail',
            format: null
          },
          {
            name: 'type_boolean',
            format: null
          }
        ],
        v79816te8: [
          {
            name: 'ID',
            format: null
          },
          {
            name: 'ZIP_CODE',
            format: null
          }
        ]
      }
    }
  }
};
