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

import test from 'tape';
import {
  testCreateCases,
  testFormatLayerDataCases,
  preparedDataset,
  dataId,
  pointLayerMeta
} from 'test/helpers/layer-utils';
import {StateWFiles, testCsvDataId} from 'test/helpers/mock-state';
import {gpsPointBounds} from 'test/fixtures/test-csv-data';

import HeatmapLayer, {MAX_ZOOM_LEVEL} from 'layers/heatmap-layer/heatmap-layer';
import {copyTableAndUpdate} from 'utils/table-utils/kepler-table';

const columns = {
  lat: 'lat',
  lng: 'lng'
};

test('#HeatmapLayer -> contructor', t => {
  const TEST_CASES = {
    CREATE: [
      {
        props: {
          dataId: 'taro',
          isVisible: true,
          label: 'test heatmap layer'
        },
        test: layer => {
          // test constructor
          t.equal(layer.config.visConfig.radius, 20, 'Heatmap default radius should be 20');
          t.ok(layer.config.dataId === 'taro', 'heatmaplayer dataId should be correct');
          t.ok(layer.type === 'heatmap', 'type should be heatmap');
          t.ok(layer.isAggregated === true, 'heatmaplayer is aggregated');
          t.ok(layer.config.label === 'test heatmap layer', 'label should be correct');
          t.ok(Object.keys(layer.columnPairs).length, 'should have columnPairs');
        }
      }
    ]
  };

  testCreateCases(t, HeatmapLayer, TEST_CASES.CREATE);
  t.end();
});

test('#Heatmaplayer -> formatLayerData -> w/ GpuFilter', t => {
  const filteredIndex = [0, 2, 4];

  const expectedConfig = {
    type: 'heatmap',
    id: 'heatmap-test-1',
    source: `${dataId}-1-2`,
    layout: {visibility: 'visible'},
    maxzoom: 18,
    filter: ['all', ['>=', 'gpu:utc_timestamp', 39000], ['<=', 'gpu:utc_timestamp', 552000]],
    paint: {
      'heatmap-weight': ['interpolate', ['linear'], ['get', 'id'], 1, 0, 345, 1],
      'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 18, 3],
      'heatmap-color': [
        'interpolate',
        ['linear'],
        ['heatmap-density'],
        0,
        'rgba(0,0,0,0)',
        0.14285714285714285,
        'rgb(90,24,70)',
        0.2857142857142857,
        'rgb(144,12,63)',
        0.42857142857142855,
        'rgb(199,0,57)',
        0.5714285714285714,
        'rgb(227,97,28)',
        0.7142857142857143,
        'rgb(241,146,14)',
        0.8571428571428571,
        'rgb(255,195,0)'
      ],
      'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 2, 18, 20],
      'heatmap-opacity': 0.8
    }
  };

  const TEST_CASES = [
    {
      name: 'Heatmap gps point.1',
      layer: {
        type: 'heatmap',
        id: 'heatmap-test-1',
        config: {
          dataId,
          label: 'mapbox heatmap',
          isVisible: true,
          columns,
          weightField: {
            type: 'integer',
            name: 'id'
          }
        }
      },
      datasets: {
        [dataId]: copyTableAndUpdate(preparedDataset, {filteredIndex})
      },
      assert: result => {
        const {layerData, layer} = result;

        const expectedLayerData = {
          columns: {
            lat: {value: 'lat', fieldIdx: 1},
            lng: {value: 'lng', fieldIdx: 2}
          },
          config: expectedConfig,
          data: {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                properties: {
                  index: 0,
                  'gpu:utc_timestamp': Number.MIN_SAFE_INTEGER,
                  id: 1
                },
                geometry: {type: 'Point', coordinates: [-122.39096, 37.778564]}
              },
              {
                type: 'Feature',
                properties: {
                  index: 4,
                  'gpu:utc_timestamp': 184000,
                  id: 5
                },
                geometry: {type: 'Point', coordinates: [-122.136795, 37.456535]}
              }
            ]
          },
          weightField: null,
          getPosition: () => {}
        };

        t.deepEqual(
          Object.keys(layerData).sort(),
          Object.keys(expectedLayerData).sort(),
          'lheatmap ayerData should have correct keys'
        );
        t.deepEqual(
          layerData.columns,
          expectedLayerData.columns,
          'should format correct heatmap layerData.columns'
        );

        // test data
        t.deepEqual(
          layerData.data,
          expectedLayerData.data,
          'should format correct heatmap layerData.data'
        );

        // test columns,
        expectedLayerData.config.id = layer.id;
        // test config
        t.deepEqual(
          layerData.config,
          expectedLayerData.config,
          'should format correct heatmap layerData.config'
        );

        // test layer.meta
        t.deepEqual(layer.meta, pointLayerMeta, 'should format correct heatmap layer.meta');
      }
    }
  ];

  testFormatLayerDataCases(t, HeatmapLayer, TEST_CASES);
  t.end();
});

test('#Heatmaplayer -> formatLayerData -> w/o GpuFilter', t => {
  const testData = StateWFiles.visState.datasets[testCsvDataId];
  const gpsColumns = {
    lat: 'gps_data.lat',
    lng: 'gps_data.lng'
  };

  const expectedConfig = {
    type: 'heatmap',
    id: 'heatmap-test-1',
    source: `${testCsvDataId}-1-2`,
    layout: {visibility: 'visible'},
    maxzoom: 18,
    paint: {
      'heatmap-weight': 1,
      'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, MAX_ZOOM_LEVEL, 3],
      'heatmap-color': [
        'interpolate',
        ['linear'],
        ['heatmap-density'],
        0,
        'rgba(0,0,0,0)',
        0.25,
        'rgb(1,1,1)',
        0.5,
        'rgb(2,2,2)',
        0.75,
        'rgb(3,3,3)'
      ],
      'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 2, MAX_ZOOM_LEVEL, 100],
      'heatmap-opacity': 0.2
    }
  };

  const TEST_CASES = [
    {
      name: 'Heatmap gps point.1',
      layer: {
        type: 'heatmap',
        id: 'heatmap-test-1',
        config: {
          dataId: testCsvDataId,
          label: 'mapbox heatmap',
          isVisible: true,
          columns: gpsColumns,
          visConfig: {
            colorRange: {
              colors: ['#010101', '#020202', '#030303']
            },
            radius: 100,
            opacity: 0.2
          }
        }
      },
      datasets: StateWFiles.visState.datasets,
      assert: result => {
        const {layerData, layer} = result;

        const expectedLayerData = {
          columns: {
            lat: {value: 'gps_data.lat', fieldIdx: 1},
            lng: {value: 'gps_data.lng', fieldIdx: 2}
          },
          config: expectedConfig,
          weightField: null,
          getPosition: () => {}
        };
        const expectedLayerMeta = {bounds: gpsPointBounds};

        // test columns,
        t.deepEqual(
          layerData.columns,
          expectedLayerData.columns,
          'should format correct heatmap layerData.columns'
        );

        // test data
        t.equal(
          layerData.data.features.length,
          testData.dataContainer.numRows(),
          'should have same number of features'
        );

        t.deepEqual(
          layerData.data.features[0],
          {
            type: 'Feature',
            properties: {
              index: 0
            },
            geometry: {type: 'Point', coordinates: [31.2590542, 29.9900937]}
          },
          'should format correct feature 0'
        );
        // test id
        expectedLayerData.config.id = layer.id;

        // test config
        t.deepEqual(
          layerData.config,
          expectedLayerData.config,
          'should format correct heatmap layerData.config'
        );

        // test layer.meta
        t.deepEqual(layer.meta, expectedLayerMeta, 'should format correct heatmap layer.meta');
      }
    }
  ];

  testFormatLayerDataCases(t, HeatmapLayer, TEST_CASES);
  t.end();
});
