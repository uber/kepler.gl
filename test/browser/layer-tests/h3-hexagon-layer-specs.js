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
import moment from 'moment';

import {
  testCreateCases,
  testFormatLayerDataCases,
  testRenderLayerCases,
  preparedDataset,
  dataId,
  testRows,
  preparedFilterDomain0,
  hexagonIdLayerMeta
} from 'test/helpers/layer-utils';
import {KeplerGlLayers} from 'layers';
import {getCentroid} from 'layers/h3-hexagon-layer/h3-utils';
import {defaultElevation} from 'layers/h3-hexagon-layer/h3-hexagon-layer';
import {copyTableAndUpdate} from 'utils/table-utils/kepler-table';

const {H3Layer} = KeplerGlLayers;
const columns = {
  lat: 'lat',
  lng: 'lng',
  hex_id: 'hex_id'
};

test('#H3Layer -> constructor', t => {
  const TEST_CASES = {
    CREATE: [
      {
        props: {
          dataId: 'smoothie',
          isVisible: true,
          label: 'test h3 layer'
        },
        test: layer => {
          t.ok(layer.config.dataId === 'smoothie', 'H3Layer dataId should be correct');
          t.ok(layer.type === 'hexagonId', 'type should be h3');
          t.ok(layer.isAggregated === false, 'H3Layer is not aggregated');
          t.ok(layer.config.label === 'test h3 layer', 'label should be correct');
        }
      }
    ]
  };

  testCreateCases(t, H3Layer, TEST_CASES.CREATE);
  t.end();
});

test('#H3Layer -> formatLayerData', t => {
  const filteredIndex = [0, 2, 4];

  const TEST_CASES = [
    {
      name: 'h3.1',
      layer: {
        config: {
          dataId,
          label: 'gps point h3',
          columns,
          color: [2, 3, 4]
        },
        type: 'hexagonId',
        id: 'test_layer_1'
      },
      datasets: {
        [dataId]: copyTableAndUpdate(preparedDataset, {filteredIndex})
      },
      assert: result => {
        const {layerData, layer} = result;
        const expectedLayerData = {
          data: [
            {
              refDataContainer: preparedDataset.dataContainer,
              index: 0,
              id: '89283082c2fffff',
              centroid: getCentroid({id: '89283082c2fffff'})
            },
            {
              refDataContainer: preparedDataset.dataContainer,
              index: 4,
              id: '89283082c3bffff',
              centroid: getCentroid({id: '89283082c3bffff'})
            }
          ],
          getElevation: () => {},
          getFilterValue: () => {},
          getFillColor: () => {},
          getHexId: () => {},
          getCoverage: () => {}
        };
        t.deepEqual(
          Object.keys(layerData).sort(),
          Object.keys(expectedLayerData).sort(),
          `layerData should have ${expectedLayerData.length} keys`
        );
        t.deepEqual(
          layerData.data,
          expectedLayerData.data,
          'should format correct point layerData data'
        );
        // getFillColor
        t.deepEqual(layerData.getFillColor, [2, 3, 4], 'getFillColor should be a constant');
        // getElevation
        t.deepEqual(layerData.getElevation, defaultElevation, 'getElevation should be a constant');
        // getHexId
        t.deepEqual(
          layerData.data.map(layerData.getHexId),
          ['89283082c2fffff', '89283082c3bffff'],
          'getHexId should return correct hex id'
        );
        // getFilterValue
        t.deepEqual(
          layerData.data.map(layerData.getFilterValue),
          [
            [Number.MIN_SAFE_INTEGER, 0, 0, 0],
            [moment.utc(testRows[4][0]).valueOf() - preparedFilterDomain0, 0, 0, 0]
          ],
          'getFilterValue should return [value, 0, 0, 0]'
        );

        // layerMeta
        t.deepEqual(layer.meta, hexagonIdLayerMeta, 'should format correct point layer meta');
      }
    },
    {
      name: 'H3 layer format data. with colorField and sizeField',
      layer: {
        config: {
          dataId,
          label: 'h3.2',
          columns,
          color: [10, 10, 10],
          // color by types(string)
          colorField: {
            type: 'string',
            name: 'types'
          },
          // size by id(integer)
          sizeField: {
            type: 'real',
            name: 'trip_distance'
          },
          visConfig: {
            colorRange: {
              colors: ['#010101', '#020202', '#030303']
            },
            elevationRange: [10, 20],
            enable3d: true
          }
        },
        type: 'hexagonId',
        id: 'test_layer_2'
      },
      datasets: {
        [dataId]: copyTableAndUpdate(preparedDataset, {filteredIndex})
      },
      assert: result => {
        const {layerData} = result;

        // getSourceColor
        // domain: ['driver_analytics', 'driver_analytics_0', 'driver_gps']
        // range ['#010101', '#020202', '#030303']
        t.deepEqual(
          layerData.data.map(layerData.getFillColor),
          [
            [2, 2, 2],
            [1, 1, 1]
          ],
          'getFillColor should be correct'
        );
        // getElevation
        // domain: [1.59, 11]
        // range: [0, 500]
        // value [1.59, 2.37]
        t.deepEqual(
          layerData.data.map(layerData.getElevation),
          [0, 41.445270988310305],
          'getElevation should correct'
        );
        // getFilterValue
        t.deepEqual(
          layerData.data.map(layerData.getFilterValue),
          [
            [Number.MIN_SAFE_INTEGER, 0, 0, 0],
            [moment.utc(testRows[4][0]).valueOf() - preparedFilterDomain0, 0, 0, 0]
          ],
          'getFilterValue should return [value, 0, 0, 0]'
        );
      }
    }
  ];

  testFormatLayerDataCases(t, H3Layer, TEST_CASES);
  t.end();
});

test('#H3Layer -> renderLayer', t => {
  const filteredIndex = [0, 2, 4];

  const TEST_CASES = [
    {
      name: 'Test render h3.2',
      layer: {
        id: 'test_layer_1',
        type: 'hexagonId',
        config: {
          dataId,
          label: 'h3 hex',
          columns,
          color: [1, 2, 3],
          visCondig: {
            worldUnitSize: 0.5,
            elevationScale: 5
          }
        }
      },
      datasets: {
        [dataId]: copyTableAndUpdate(preparedDataset, {filteredIndex})
      },
      assert: (deckLayers, layer) => {
        t.equal(layer.type, 'hexagonId', 'should create 1 hexagonId layer');
        t.equal(deckLayers.length, 2, 'Should create 2 deck.gl layers');
        const expectedLayerIds = ['test_layer_1', 'test_layer_1-hexagon-cell'];

        t.deepEqual(
          deckLayers.map(l => l.id),
          expectedLayerIds,
          'should create 1 composite, 1 hexagon-cell layer'
        );

        const {props} = deckLayers[0];

        const expectedProps = {
          opacity: layer.config.visConfig.opacity,
          filterRange: preparedDataset.gpuFilter.filterRange,
          wrapLongitude: false,
          coverage: 1,
          autoHighlight: false,
          highlightColor: [255, 255, 255, 60],
          extruded: false,
          elevationScale: 5
        };
        Object.keys(expectedProps).forEach(key => {
          t.deepEqual(props[key], expectedProps[key], `should have correct props.${key}`);
        });
      }
    }
  ];

  testRenderLayerCases(t, H3Layer, TEST_CASES);
  t.end();
});
