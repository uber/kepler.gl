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
import React from 'react';
import {mount} from 'enzyme';
import sinon from 'sinon';
import sinonStubPromise from 'sinon-stub-promise';
import {getDistanceScales} from 'viewport-mercator-project';
import {DEFAULT_TEXT_LABEL} from 'layers/layer-factory';

sinonStubPromise(sinon);

import {
  testCreateCases,
  testFormatLayerDataCases,
  testRenderLayerCases,
  preparedDataset,
  dataId,
  testRows,
  pointLayerMeta,
  iconGeometry
} from 'test/helpers/layer-utils';
import {KeplerGlLayers} from 'layers';
import {INITIAL_MAP_STATE} from 'reducers/map-state-updaters';
import {IntlWrapper} from '../../helpers/component-utils';
import {copyTableAndUpdate} from 'utils/table-utils/kepler-table';

const {IconLayer} = KeplerGlLayers;
const columns = {
  lat: 'lat',
  lng: 'lng',
  icon: 'icon'
};

const mockSvgIcons = [
  {
    id: 'alert',
    mesh: {
      positions: [
        [1, -0.5, 0],
        [0.9, -0.52, 0],
        [0.97, -0.5, 0],
        [0.3, -0.4, 0]
      ],
      cells: [
        [0, 1, 3],
        [1, 2, 3]
      ]
    }
  }
];

test('#IconLayer -> constructor', t => {
  const TEST_CASES = {
    CREATE: [
      {
        props: {
          dataId: 'smoothie',
          isVisible: true,
          label: 'test icon layer'
        },
        test: layer => {
          t.ok(layer.config.dataId === 'smoothie', 'IconLayer dataId should be correct');
          t.ok(layer.type === 'icon', 'type should be icon');
          t.ok(layer.isAggregated === false, 'IconLayer is not aggregated');
          t.ok(layer.config.label === 'test icon layer', 'label should be correct');
          t.ok(Object.keys(layer.columnPairs).length, 'should have columnPairs');

          // t.ok(spy.calledOnce, 'should call window.fetch once');
        }
      }
    ]
  };

  testCreateCases(t, IconLayer, TEST_CASES.CREATE);
  t.end();
});

test('#IconLayer -> formatLayerData', t => {
  const filteredIndex = [0, 2, 4];

  const TEST_CASES = [
    {
      name: 'gps point with icon.1',
      layer: {
        config: {
          dataId,
          label: 'gps point icon',
          columns,
          color: [2, 3, 4],
          textLabel: [
            {
              field: {
                name: 'types',
                type: 'string'
              }
            },
            {
              field: {
                name: 'has_result',
                type: 'boolean'
              }
            }
          ]
        },
        type: 'icon',
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
              icon: 'accel'
            }
          ],
          textLabels: [
            {
              characterSet: [],
              getText: () => {}
            },
            {
              characterSet: [],
              getText: () => {}
            }
          ],
          getFilterValue: () => {},
          getFillColor: () => {},
          getRadius: () => {},
          getPosition: () => {}
        };
        t.deepEqual(
          Object.keys(layerData).sort(),
          Object.keys(expectedLayerData).sort(),
          'layerData should have 5 keys'
        );
        t.deepEqual(
          layerData.data,
          expectedLayerData.data,
          'should format correct point layerData data'
        );
        // getPosition
        t.deepEqual(
          layerData.getPosition(layerData.data[0]),
          [testRows[0][2], testRows[0][1]],
          'getPosition should return correct position'
        );
        // getFillColor
        t.deepEqual(layerData.getFillColor, [2, 3, 4], 'getFillColor should be a constant');
        // getRadius
        t.equal(layerData.getRadius, 1, 'getRadius should be a constant');
        // getFilterValue
        t.deepEqual(
          layerData.data.map(layerData.getFilterValue),
          [[Number.MIN_SAFE_INTEGER, 0, 0, 0]],
          'getFilterValue should return [value, 0, 0, 0]'
        );
        // textLabels
        t.deepEqual(
          layerData.textLabels.length,
          expectedLayerData.textLabels.length,
          'textLabels should have 2 items'
        );
        t.deepEqual(
          layerData.textLabels[0].characterSet,
          ['d', 'r', 'i', 'v', 'e', '_', 'a', 'n', 'l', 'y', 't', 'c', 's', '0'],
          'textLabels should have correct characterSet'
        );
        t.deepEqual(
          layerData.textLabels[0].getText(layerData.data[0]),
          'driver_analytics_0',
          'textLabels getText should have correct text'
        );
        // layerMeta
        t.deepEqual(layer.meta, pointLayerMeta, 'should format correct point layer meta');
      }
    },
    {
      name: 'Icon data. with colorField and sizeField',
      layer: {
        config: {
          dataId,
          label: 'icons',
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
            radiusRange: [10, 20]
          }
        },
        type: 'icon',
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
          [[2, 2, 2]],
          'getFillColor should be correct'
        );
        // getRadius
        // domain: [1.59, 11]
        // range: [10, 20]
        // value [1.59, 2.37]
        t.deepEqual(
          layerData.data.map(layerData.getRadius),
          [10],
          'getRadius should be a constant'
        );
        // getFilterValue
        t.deepEqual(
          layerData.data.map(layerData.getFilterValue),
          [[Number.MIN_SAFE_INTEGER, 0, 0, 0]],
          'getFilterValue should return [value, 0, 0, 0]'
        );
      }
    }
  ];

  testFormatLayerDataCases(t, IconLayer, TEST_CASES);
  t.end();
});

test('#IconLayer -> renderLayer', t => {
  const filteredIndex = [0, 2, 4, 5];

  const TEST_CASES = [
    {
      name: 'Test render icon.1 -> no icon Geometry',
      layer: {
        config: {
          dataId,
          label: 'gps point icon',
          columns,
          color: [2, 3, 4]
        },
        type: 'icon',
        id: 'test_layer_1'
      },
      datasets: {
        [dataId]: copyTableAndUpdate(preparedDataset, {filteredIndex})
      },
      assert: (deckLayers, layer) => {
        t.equal(layer.type, 'icon', 'should create 1 icon layer');
        t.equal(
          deckLayers.length,
          0,
          'Should create 0 deck.gl layer when icon geometry is not provided'
        );
      }
    },
    {
      name: 'Test render icon.2 -> has icon geometry',
      layer: {
        id: 'test_layer_1',
        type: 'icon',
        config: {
          dataId,
          label: 'gps point icon',
          columns,
          color: [1, 2, 3]
        }
      },
      afterLayerInitialized: layer => {
        layer.iconGeometry = iconGeometry;
      },
      datasets: {
        [dataId]: copyTableAndUpdate(preparedDataset, {filteredIndex})
      },
      assert: (deckLayers, layer) => {
        t.equal(layer.type, 'icon', 'should create 1 icon layer');
        t.equal(
          deckLayers.length,
          3,
          'Should create 3 deck.gl layer when icon geometry is provided'
        );
        const expectedLayerIds = ['test_layer_1', 'test_layer_1-accel', 'test_layer_1-attach'];

        t.deepEqual(
          deckLayers.map(l => l.id),
          expectedLayerIds,
          'should create 1 composite, 2 svg icon layer'
        );

        const {props} = deckLayers[0];

        const expectedProps = {
          opacity: layer.config.visConfig.opacity,
          radiusMaxPixels: 500,
          radiusScale: layer.getRadiusScaleByZoom(INITIAL_MAP_STATE),
          filterRange: preparedDataset.gpuFilter.filterRange,
          brushingEnabled: false
        };
        Object.keys(expectedProps).forEach(key => {
          t.deepEqual(props[key], expectedProps[key], `should have correct props.${key}`);
        });
      }
    },
    {
      name: 'Test render icon.2 -> has icon geometry -> brushing',
      layer: {
        id: 'test_layer_1',
        type: 'icon',
        config: {
          dataId,
          label: 'gps point icon',
          columns,
          color: [1, 2, 3]
        }
      },
      afterLayerInitialized: layer => {
        layer.iconGeometry = iconGeometry;
      },
      datasets: {
        [dataId]: copyTableAndUpdate(preparedDataset, {filteredIndex})
      },
      renderArgs: {
        interactionConfig: {
          brush: {
            enabled: true,
            config: {
              size: 2.5
            }
          }
        }
      },
      assert: (deckLayers, layer) => {
        t.equal(layer.type, 'icon', 'should create 1 icon layer');
        t.equal(
          deckLayers.length,
          3,
          'Should create 3 deck.gl layer when icon geometry is provided'
        );
        const expectedLayerIds = ['test_layer_1', 'test_layer_1-accel', 'test_layer_1-attach'];

        t.deepEqual(
          deckLayers.map(l => l.id),
          expectedLayerIds,
          'should create 1 composite, 2 svg icon layer'
        );

        const {props} = deckLayers[0];

        const expectedProps = {
          brushingRadius: 2500,
          brushingTarget: 'source',
          brushingEnabled: true
        };
        Object.keys(expectedProps).forEach(key => {
          t.deepEqual(props[key], expectedProps[key], `should have correct props.${key}`);
        });
      }
    },
    {
      name: 'Test render icon.1 -> with text labels',
      layer: {
        config: {
          dataId,
          label: 'gps point icon',
          columns,
          color: [2, 3, 4],
          textLabel: [
            {
              field: {
                name: 'types',
                type: 'string'
              }
              // default anchor: start, alignment: center
            },
            {
              field: {
                name: 'has_result',
                type: 'boolean'
              },
              anchor: 'middle',
              alignment: 'bottom'
            }
          ]
        },
        type: 'icon',
        id: 'test_layer_1'
      },
      afterLayerInitialized: layer => {
        layer.iconGeometry = iconGeometry;
      },
      datasets: {
        [dataId]: copyTableAndUpdate(preparedDataset, {filteredIndex})
      },
      assert: (deckLayers, layer, layerData) => {
        t.equal(deckLayers.length, 7, 'Should create 7 deck.gl layer');
        t.deepEqual(
          deckLayers.map(l => l.id),
          [
            'test_layer_1',
            'test_layer_1-accel',
            'test_layer_1-attach',
            'test_layer_1-label-types',
            'test_layer_1-label-types-characters',
            'test_layer_1-label-has_result',
            'test_layer_1-label-has_result-characters'
          ],
          'Should create 5 deck.gl layers'
        );
        // test test_layer_1-label-types
        const {
          getPosition,
          getColor,
          getSize,
          getPixelOffset,
          getFilterValue
        } = deckLayers[4].props;
        const {getPixelOffset: getPixelOffset1} = deckLayers[6].props;

        const distanceScale = getDistanceScales(INITIAL_MAP_STATE);
        const radiusScale = layer.getRadiusScaleByZoom(INITIAL_MAP_STATE);
        const pixelRadius = radiusScale * distanceScale.pixelsPerMeter[0];

        const padding = 20;

        // anchor: start, alignment: center
        const expectedPixelOffset0 = [1 * (pixelRadius + padding), 0 * (pixelRadius + padding + 0)];

        // anchor: 'middle', alignment: 'bottom'
        const expectedPixelOffset1 = [
          0 * (pixelRadius + padding),
          1 * (pixelRadius + padding + DEFAULT_TEXT_LABEL.size)
        ];

        t.deepEqual(
          getPosition(layerData.data[0]),
          [testRows[0][2], testRows[0][1]],
          'Should calculate correct getPosition'
        );
        t.deepEqual(getColor, DEFAULT_TEXT_LABEL.color, 'Should calculate correct getColor');
        t.deepEqual(getSize, 1, 'Should calculate correct getSize');
        t.deepEqual(
          getPixelOffset,
          expectedPixelOffset0,
          'Should calculate correct instancePixelOffset'
        );
        t.deepEqual(
          getPixelOffset1,
          expectedPixelOffset1,
          'Should calculate correct instancePixelOffset'
        );
        t.deepEqual(
          getFilterValue(layerData.data[0]),
          [Number.MIN_SAFE_INTEGER, 0, 0, 0],
          'Should calculate correct instancePixelOffset'
        );
      }
    }
  ];

  testRenderLayerCases(t, IconLayer, TEST_CASES);
  t.end();
});

test('#IconLayer -> fetch icon geometry -> renderIconModal', t => {
  const mockSuccessResponse = {svgIcons: mockSvgIcons};
  const mockJsonPromise = sinon.stub().returnsPromise();
  mockJsonPromise.resolves(mockSuccessResponse);

  const stubedFetch = sinon.stub(global, 'fetch').returnsPromise();

  stubedFetch.resolves({
    json: mockJsonPromise
  });

  // initialize iconLayer
  const iconLayer = new IconLayer();
  t.deepEqual(iconLayer.iconGeometry, iconLayer.iconGeometry, 'should create correct iconGeometry');

  let wrapper;
  t.doesNotThrow(() => {
    wrapper = mount(
      <IntlWrapper>
        <iconLayer.layerInfoModal.template />
      </IntlWrapper>
    );
  }, 'mount layer info modal with icons should not fail');

  t.equal(wrapper.find('.icon-table__item').length, 3, 'should render 1 icon');
  t.equal(
    wrapper
      .find('.icon-table_item__name')
      .at(0)
      .find('code')
      .text(),
    'alert',
    'should render alert icon'
  );

  stubedFetch.restore();
  t.end();
});
