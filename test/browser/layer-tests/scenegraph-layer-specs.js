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
import global from 'global';
import sinon from 'sinon';
import sinonStubPromise from 'sinon-stub-promise';
sinonStubPromise(sinon);

import {
  testCreateCases,
  testFormatLayerDataCases,
  testRenderLayerCases,
  preparedDataset,
  dataId,
  testRows,
  pointLayerMeta,
  preparedFilterDomain0
} from 'test/helpers/layer-utils';
import {KeplerGlLayers} from 'layers';
const {ScenegraphLayer} = KeplerGlLayers;
const columns = {lat: 'lat', lng: 'lng'};

test('#ScenegraphLayer -> constructor', t => {
  const TEST_CASES = {
    CREATE: [
      {
        props: {
          dataId: 'smoothie',
          isVisible: true,
          label: 'test 3d layer'
        },
        test: layer => {
          t.ok(layer.config.dataId === 'smoothie', 'ScenegraphLayer dataId should be correct');
          t.ok(layer.type === '3D', 'type should be 3D');
          t.ok(layer.isAggregated === false, 'ScenegraphLayer is not aggregated');
          t.ok(layer.config.label === 'test 3d layer', 'label should be correct');
          t.ok(Object.keys(layer.columnPairs).length, 'should have columnPairs');
        }
      }
    ]
  };

  testCreateCases(t, ScenegraphLayer, TEST_CASES.CREATE);
  t.end();
});

test('#ScenegraphLayer -> formatLayerData', t => {
  const filteredIndex = [0, 2, 4];

  const TEST_CASES = [
    {
      name: 'Scenegraph gps point.1',
      layer: {
        type: '3D',
        id: 'test_layer_1',
        config: {
          dataId,
          label: 'gps 3d',
          columns
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
          data: [
            {
              refDataContainer: preparedDataset.dataContainer,
              index: 0,
              position: [testRows[0][2], testRows[0][1], 0]
            },
            {
              refDataContainer: preparedDataset.dataContainer,
              index: 4,
              position: [testRows[4][2], testRows[4][1], 0]
            }
          ],
          getFilterValue: () => {},
          getPosition: () => {}
        };

        t.deepEqual(
          Object.keys(layerData).sort(),
          Object.keys(expectedLayerData).sort(),
          'layerData should have 3 keys'
        );
        t.deepEqual(
          layerData.data,
          expectedLayerData.data,
          'should format correct point layerData data'
        );
        t.deepEqual(
          layerData.data.map(layerData.getPosition),
          [
            [testRows[0][2], testRows[0][1], 0],
            [testRows[4][2], testRows[4][1], 0]
          ],
          'getPosition should return correct lat lng'
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
        t.deepEqual(layer.meta, pointLayerMeta, 'should format correct point layer meta');
      }
    }
  ];

  testFormatLayerDataCases(t, ScenegraphLayer, TEST_CASES);
  t.end();
});

test('#ScenegraphLayer -> renderLayer', t => {
  // TODO: mock actual gltf response
  const mockSuccessResponse = {};
  const mockJsonPromise = sinon.stub().returnsPromise();
  mockJsonPromise.resolves(mockSuccessResponse);
  const stubedFetch = sinon.stub(global, 'fetch').returnsPromise();

  stubedFetch.resolves({
    json: mockJsonPromise
  });

  const filteredIndex = [0, 2, 4];

  const TEST_CASES = [
    {
      name: 'Scenegraph gps point.1',
      layer: {
        type: '3D',
        id: 'test_layer_1',
        config: {
          dataId,
          label: 'gps 3d',
          columns
        }
      },
      datasets: {
        [dataId]: {
          ...preparedDataset,
          filteredIndex
        }
      },
      assert: (deckLayers, layer) => {
        t.equal(deckLayers.length, 1, 'Should create 1 deck.gl layer');
        const {props} = deckLayers[0];

        const expectedProps = {
          opacity: layer.config.visConfig.opacity,
          sizeScale: layer.config.visConfig.sizeScale,
          filterRange: preparedDataset.gpuFilter.filterRange
        };
        Object.keys(expectedProps).forEach(key => {
          t.equal(props[key], expectedProps[key], `should have correct props.${key}`);
        });
      }
    }
  ];

  testRenderLayerCases(t, ScenegraphLayer, TEST_CASES);

  stubedFetch.restore();
  t.end();
});
