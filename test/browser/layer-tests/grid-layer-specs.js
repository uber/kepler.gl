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

import GridLayer from 'layers/grid-layer/grid-layer';
import {pointToPolygonGeo} from 'layers/grid-layer/grid-utils';
import {INITIAL_MAP_STATE} from 'reducers/map-state-updaters';

const columns = {
  lat: 'lat',
  lng: 'lng'
};

test('#GridLayer -> constructor', t => {
  const TEST_CASES = {
    CREATE: [
      {
        props: {
          dataId: 'taro',
          isVisible: true,
          label: 'test grid layer'
        },
        test: layer => {
          t.ok(layer.config.dataId === 'taro', 'gridLayer dataId should be correct');
          t.ok(layer.type === 'grid', 'type should be grid');
          t.ok(layer.isAggregated === true, 'gridLayer is aggregated');
          t.ok(layer.config.label === 'test grid layer', 'label should be correct');
          t.ok(Object.keys(layer.columnPairs).length, 'should have columnPairs');
        }
      }
    ]
  };

  testCreateCases(t, GridLayer, TEST_CASES.CREATE);
  t.end();
});

test('#GridLayer -> formatLayerData', t => {
  const filteredIndex = [0, 1, 2, 4, 5, 7];

  const TEST_CASES = [
    {
      name: 'Grid gps point.1',
      layer: {
        type: 'grid',
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
      name: 'Grid gps point.2',
      layer: {
        type: 'grid',
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
        // test getColorValue aggregate by avg
        // 0: 1.59 - 0
        // 1: 2.38  - 0
        // 4: 2.37 - 1
        // 5: 7.13 - 1
        // 7: 11 - 1
        t.equal(
          // assume all points fall into one bin
          layerData.getElevationValue(expectedLayerData.data),
          (1.59 + 2.38 + 2.37 + 7.13 + 11) / 5,
          'should return filtered avg trip_distance'
        );
      }
    }
  ];

  testFormatLayerDataCases(t, GridLayer, TEST_CASES);
  t.end();
});

test('#GridLayer -> renderLayer', t => {
  const filteredIndex = [0, 1, 2, 4, 5, 7];
  const spyLayerCallbacks = sinon.spy();

  const TEST_CASES = [
    {
      name: 'Grid gps point.1',
      layer: {
        type: 'grid',
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
          ['test_layer_1', 'test_layer_1-grid-cell'],
          'Should create 2 deck.gl layers'
        );
        const [cpuGridLayer, gridCellLayer] = deckLayers;
        const {props} = cpuGridLayer;
        const gridCellLayerProp = gridCellLayer.props;

        const expectedProps = {
          coverage: layer.config.visConfig.coverage,
          cellSize: layer.config.visConfig.worldUnitSize * 1000,
          colorRange: [
            [8, 8, 8],
            [9, 9, 9],
            [7, 7, 7]
          ],
          colorScaleType: layer.config.colorScale,
          elevationScaleType: layer.config.sizeScale,
          elevationScale: layer.config.visConfig.elevationScale,
          upperPercentile: layer.config.visConfig.percentile[1],
          lowerPercentile: layer.config.visConfig.percentile[0]
        };

        Object.keys(expectedProps).forEach(key => {
          t.deepEqual(props[key], expectedProps[key], `should have correct props.${key}`);
        });

        const expectedGridCellData = [
          {
            index: 0,
            position: [-122.59661271087748, 37.743177277521255],
            count: 2,
            points: [
              {
                index: 0,
                refDataContainer: preparedDataset.dataContainer
              },
              {
                index: 1,
                refDataContainer: preparedDataset.dataContainer
              }
            ],
            lonIdx: 253,
            latIdx: 711,
            filteredPoints: []
          },
          {
            index: 1,
            position: [-122.14283099317691, 37.38384344551697],
            count: 2,
            points: [
              {
                index: 4,
                refDataContainer: preparedDataset.dataContainer
              },
              {
                index: 5,
                refDataContainer: preparedDataset.dataContainer
              }
            ],
            lonIdx: 255,
            latIdx: 709,
            filteredPoints: [
              {
                index: 4,
                refDataContainer: preparedDataset.dataContainer
              },
              {
                index: 5,
                refDataContainer: preparedDataset.dataContainer
              }
            ]
          },
          {
            index: 2,
            position: [-122.3697218520272, 37.743177277521255],
            count: 1,
            points: [
              {
                index: 7,
                refDataContainer: preparedDataset.dataContainer
              }
            ],
            lonIdx: 254,
            latIdx: 711,
            filteredPoints: [
              {
                index: 7,
                refDataContainer: preparedDataset.dataContainer
              }
            ]
          }
        ];
        const expectedColorBins = [
          {i: 2, value: 1, counts: 1},
          {i: 1, value: 2, counts: 2}
        ];

        const expectedElevationBins = [
          {i: 2, value: 1, counts: 1},
          {i: 1, value: 2, counts: 2}
        ];

        t.deepEqual(
          gridCellLayerProp.data,
          expectedGridCellData,
          'should pass correct data to grid cell layer'
        );
        gridCellLayerProp.data.forEach((ac, i) => {
          t.deepEqual(
            gridCellLayerProp.data[i],
            expectedGridCellData[i],
            `should pass correct data:${i} to grid cell layer`
          );
        });
        t.deepEqual(
          spyLayerCallbacks.args[0][0],
          [1, 2],
          'should call onSetLayerDomain with correct domain'
        );

        t.deepEqual(
          cpuGridLayer.state.aggregatorState.dimensions.fillColor.sortedBins.sortedBins,
          expectedColorBins,
          'should create correct color bins'
        );

        t.deepEqual(
          cpuGridLayer.state.aggregatorState.dimensions.elevation.sortedBins.sortedBins,
          expectedElevationBins,
          'should create correct elevation bins'
        );
      }
    }
  ];

  testRenderLayerCases(t, GridLayer, TEST_CASES);
  t.end();
});

test('#GridLayer -> pointToPolygonGeo', t => {
  const polygonGeo = pointToPolygonGeo({
    object: {
      position: [-122.39096, 37.769897]
    },
    cellSize: 20000,
    coverage: 1,
    properties: {
      name: 'a'
    },
    mapState: INITIAL_MAP_STATE
  });

  const expected = {
    geometry: {
      coordinates: [
        [-122.39095999999999, 37.769897000000014],
        [-122.1634200224827, 37.769897000000014],
        [-122.16286655375738, 37.94954323177784],
        [-122.39095999999999, 37.94954323177784],
        [-122.39095999999999, 37.769897000000014]
      ],
      type: 'LineString'
    },
    properties: {name: 'a'}
  };

  t.deepEqual(polygonGeo, expected, 'should create correct polygonGeo');
  t.end();
});
