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
import sinon from 'sinon';

import {
  testCreateCases,
  testFormatLayerDataCases,
  testRenderLayerCases,
  preparedDataset,
  dataId,
  testRows,
  pointLayerMeta
} from 'test/helpers/layer-utils';

import {KeplerGlLayers} from 'layers';
import {INITIAL_MAP_STATE} from 'reducers/map-state-updaters';

const {ClusterLayer} = KeplerGlLayers;

const columns = {
  lat: 'lat',
  lng: 'lng'
};

test('#ClusterLayer -> constructor', t => {
  const TEST_CASES = {
    CREATE: [
      {
        props: {
          dataId: 'taro',
          isVisible: true,
          label: 'test cluster layer'
        },
        test: layer => {
          t.ok(layer.config.dataId === 'taro', 'clusterLayer dataId should be correct');
          t.ok(layer.type === 'cluster', 'type should be cluster');
          t.ok(layer.isAggregated === true, 'clusterLayer is aggregated');
          t.ok(layer.config.label === 'test cluster layer', 'label should be correct');
          t.ok(Object.keys(layer.columnPairs).length, 'should have columnPairs');
        }
      }
    ]
  };

  testCreateCases(t, ClusterLayer, TEST_CASES.CREATE);
  t.end();
});

test('#ClusterLayer -> formatLayerData', t => {
  const filteredIndex = [0, 1, 2, 4, 5, 7];

  const TEST_CASES = [
    {
      name: 'Cluster gps point.1',
      layer: {
        type: 'cluster',
        id: 'test_layer_1',
        config: {
          dataId,
          label: 'some geometry file',
          columns,
          color: [1, 2, 3]
        }
      },
      datasets: {
        [dataId]: {
          ...preparedDataset,
          filteredIndex
        }
      },
      assert: result => {
        const {layerData, layer} = result;
        const expectedLayerData = {
          data: [0, 1, 4, 5, 7].map(index => ({
            refDataContainer: preparedDataset.dataContainer,
            index
          })),
          _filterData: () => {},
          getColorValue: () => {},
          getElevationValue: () => {},
          getPosition: () => {}
        };

        t.deepEqual(
          Object.keys(layerData).sort(),
          Object.keys(expectedLayerData).sort(),
          'layerData should have 4 keys'
        );
        t.deepEqual(layerData.data, expectedLayerData.data, 'should format correct grid layerData');
        // test getPosition
        t.deepEqual(
          layerData.getPosition(layerData.data[0]),
          [testRows[0][2], testRows[0][1]],
          'getPosition should return correct position'
        );
        // test getColorValue  [1474071095000, 1474071608000]
        // 0: Null - 0
        // 1: 2016-09-17 00:10:56 1474071056000 - 0
        // 4: 2016-09-17 00:14:00 1474071240000 - 1
        // 5: 2016-09-17 00:15:01 1474071301000 - 1
        // 7: 2016-09-17 00:17:05 1474071425000 - 1
        t.equal(
          // assume all points fall into one bin
          layerData.getColorValue(expectedLayerData.data),
          5,
          'should return unfiltered point count'
        );
        t.equal(
          // assume all points fall into one bin
          layerData.getElevationValue(expectedLayerData.data),
          5,
          'should return unfiltered point count'
        );
        t.deepEqual(
          layerData.data.map(layerData._filterData),
          [false, false, true, true, true],
          '_filterData should filter data correctly'
        );
        // test layer.meta
        t.deepEqual(layer.meta, pointLayerMeta, 'should format correct grid layer meta');
      }
    },
    {
      name: 'Cluster gps point.2',
      layer: {
        type: 'cluster',
        id: 'test_layer_2',
        config: {
          dataId,
          label: 'some geometry file',
          columns,
          color: [1, 2, 3],
          // color by types(string)
          colorField: {
            type: 'string',
            name: 'types'
          },
          // size by id(integer)
          sizeField: {
            type: 'real',
            name: 'trip_distance'
          }
        }
      },
      datasets: {
        [dataId]: {
          ...preparedDataset,
          filteredIndex
        }
      },
      assert: result => {
        const {layerData} = result;
        const expectedLayerData = {
          data: [0, 1, 4, 5, 7].map(index => ({
            refDataContainer: preparedDataset.dataContainer,
            index
          })),
          _filterData: () => {},
          getColorValue: () => {},
          getElevationValue: () => {},
          getPosition: () => {}
        };

        t.deepEqual(
          Object.keys(layerData).sort(),
          Object.keys(expectedLayerData).sort(),
          'layerData should have 4 keys'
        );
        // test getColorValue aggregate by mode
        // 0: driver_analytics_0 - 0
        // 1: null  - 0
        // 4: driver_analytics - 1
        // 5: driver_analytics - 1
        // 7: driver_analytics - 1
        t.equal(
          // assume all points fall into one bin
          layerData.getColorValue(expectedLayerData.data),
          'driver_analytics',
          'should return filtered mode of (types)'
        );
        t.deepEqual(
          layerData.data.map(layerData._filterData),
          [false, false, true, true, true],
          '_filterData should filter data correctly'
        );
      }
    }
  ];

  testFormatLayerDataCases(t, ClusterLayer, TEST_CASES);
  t.end();
});

test('#ClusterLayer -> renderLayer', t => {
  const filteredIndex = [0, 1, 2, 4, 5, 7];
  const spyLayerCallbacks = sinon.spy();

  // 0 2016-09-17 00:09:55: 1474070995000 - false
  // 1 2016-09-17 00:10:56: 1474071056000 - false
  // 2 2016-09-17 00:11:56: 1474071116000 - true
  // 4 2016-09-17 00:14:00: 1474071240000 - true
  // 5 2016-09-17 00:15:01: 1474071301000 - true
  // 7 2016-09-17 00:17:05: 1474071425000 - true

  // timeFilter [1474071095000, 1474071608000]
  const TEST_CASES = [
    {
      name: 'Cluster gps point.1',
      layer: {
        type: 'cluster',
        id: 'test_layer_1',
        config: {
          dataId,
          label: 'some geometry file',
          columns,
          color: [1, 2, 3],
          visConfig: {
            worldUnitSize: 20,
            colorRange: {
              colors: ['#080808', '#090909', '#070707']
            }
          }
        }
      },
      datasets: {
        [dataId]: {
          ...preparedDataset,
          filteredIndex
        }
      },
      renderArgs: {
        layerCallbacks: {
          onSetLayerDomain: spyLayerCallbacks
        }
      },
      assert: (deckLayers, layer) => {
        t.deepEqual(
          deckLayers.map(l => l.id),
          ['test_layer_1', 'test_layer_1-cluster'],
          'Should create 2 deck.gl layers'
        );
        const [clusterLayer, scatterplotLayer] = deckLayers;
        const {props} = clusterLayer;
        const scatterplotLayerProp = scatterplotLayer.props;

        const expectedProps = {
          colorRange: [
            [8, 8, 8],
            [9, 9, 9],
            [7, 7, 7]
          ],
          radiusScale: 1,
          radiusRange: layer.config.visConfig.radiusRange,
          clusterRadius: layer.config.visConfig.clusterRadius,
          colorScaleType: layer.config.colorScale,
          zoom: Math.round(INITIAL_MAP_STATE.zoom),
          width: INITIAL_MAP_STATE.width,
          height: INITIAL_MAP_STATE.height
        };

        Object.keys(expectedProps).forEach(key => {
          t.deepEqual(props[key], expectedProps[key], `should have correct props.${key}`);
        });

        const expectedScatterplotData = [
          {
            points: [
              {
                index: 4,
                refDataContainer: preparedDataset.dataContainer
              }
            ],
            position: [-122.136795, 37.456535],
            index: 0,
            filteredPoints: null
          },
          {
            points: [
              {
                index: 5,
                refDataContainer: preparedDataset.dataContainer
              }
            ],
            position: [-122.10239, 37.40066],
            index: 1,
            filteredPoints: null
          },
          {
            points: [
              {
                index: 7,
                refDataContainer: preparedDataset.dataContainer
              }
            ],
            position: [-122.26108, 37.879066],
            index: 2,
            filteredPoints: null
          }
        ];
        const expectedColorBins = [
          {i: 0, value: 1, counts: 1},
          {i: 1, value: 1, counts: 1},
          {i: 2, value: 1, counts: 1}
        ];

        t.deepEqual(
          scatterplotLayerProp.data,
          expectedScatterplotData,
          'should pass correct data to cluster layer'
        );
        t.deepEqual(
          spyLayerCallbacks.args[0][0],
          [1, 1, 1],
          'should call onSetLayerDomain with correct domain'
        );

        // fillColor
        t.deepEqual(
          clusterLayer.state.aggregatorState.dimensions.fillColor.sortedBins.sortedBins,
          expectedColorBins,
          'should create correct color bins sortedBins'
        );
        t.deepEqual(
          clusterLayer.state.aggregatorState.dimensions.fillColor.valueDomain,
          [1, 1, 1],
          'should create correct radius valueDomain based on filteredPoints'
        );

        // radius
        t.deepEqual(
          clusterLayer.state.aggregatorState.dimensions.radius.valueDomain,
          [0, 1],
          'should create correct radius valueDomain based on filteredPoints'
        );
      }
    }
  ];

  testRenderLayerCases(t, ClusterLayer, TEST_CASES);
  t.end();
});
