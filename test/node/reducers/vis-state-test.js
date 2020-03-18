// Copyright (c) 2020 Uber Technologies, Inc.
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

/* eslint-disable max-statements */
import test from 'tape-catch';
import CloneDeep from 'lodash.clonedeep';

import * as VisStateActions from 'actions/vis-state-actions';
import * as MapStateActions from 'actions/map-state-actions';
import reducer from 'reducers/vis-state';

import {INITIAL_VIS_STATE, defaultAnimationConfig} from 'reducers/vis-state-updaters';

import {getDefaultInteraction} from 'utils/interaction-utils';
import {getDefaultFilter} from 'utils/filter-utils';
import {createNewDataEntry} from 'utils/dataset-utils';
import {processCsvData, processGeojson} from 'processors/data-processor';
import {Layer, KeplerGlLayers} from 'layers';
import {EDITOR_MODES} from 'constants/default-settings';

const {ArcLayer, PointLayer, GeojsonLayer, LineLayer, TripLayer} = KeplerGlLayers;

// fixtures
import testData, {mergedTimeFilter, testFields, testAllData} from 'test/fixtures/test-csv-data';
import {
  geojsonData,
  geoJsonTripFilterProps,
  expectedDataToFeature,
  updatedGeoJsonLayer,
  fields as geojsonFields
} from 'test/fixtures/geojson';

import tripGeojson, {timeStampDomain} from 'test/fixtures/trip-geojson';
import {mockPolygonFeature, mockPolygonData, mockPolygonSecondData} from '../../fixtures/polygon';

// test helpers
import {
  cmpFilters,
  cmpLayers,
  cmpDatasets,
  cmpDataset,
  cmpObjectKeys
} from 'test/helpers/comparison-utils';
import {
  applyActions,
  StateWTripGeojson,
  StateWSplitMaps,
  StateWFilters,
  StateWFiles,
  testCsvDataId,
  testGeoJsonDataId
} from 'test/helpers/mock-state';
import {LAYER_VIS_CONFIGS, DEFAULT_TEXT_LABEL, DEFAULT_COLOR_UI} from 'layers/layer-factory';
import {getNextColorMakerValue} from 'test/helpers/layer-utils';
import {StateWFilesFiltersLayerColor} from 'test/helpers/mock-state';

const mockData = {
  fields: [
    {
      name: 'start_point_lat',
      type: 'real'
    },
    {
      name: 'start_point_lng',
      type: 'real'
    },
    {
      name: 'end_point_lat',
      type: 'real'
    },
    {
      name: 'end_point_lng',
      type: 'real'
    }
  ],
  data: [
    [12.25, 37.75, 45.21, 100.12],
    [null, 35.2, 45.0, 21.3],
    [12.29, 37.64, 46.21, 99.127],
    [null, null, 33.1, 29.34]
  ]
};

const expectedFields = [
  {
    name: 'start_point_lat',
    id: 'start_point_lat',
    type: 'real',
    tableFieldIndex: 1,
    analyzerType: 'FLOAT',
    format: ''
  },
  {
    name: 'start_point_lng',
    id: 'start_point_lng',
    type: 'real',
    tableFieldIndex: 2,
    analyzerType: 'FLOAT',
    format: ''
  },
  {
    name: 'end_point_lat',
    id: 'end_point_lat',
    type: 'real',
    tableFieldIndex: 3,
    analyzerType: 'FLOAT',
    format: ''
  },
  {
    name: 'end_point_lng',
    id: 'end_point_lng',
    type: 'real',
    tableFieldIndex: 4,
    analyzerType: 'FLOAT',
    format: ''
  }
];

const mockFilter = {
  fieldIdx: 0,
  name: mockData.fields[0].name,
  type: 'range',
  fieldType: 'real',
  value: [12.25, 12.28]
};

const mockRawData = {
  fields: [
    {
      name: 'start_point_lat',
      type: 'real',
      tableFieldIndex: 1
    },
    {
      name: 'start_point_lng',
      type: 'real',
      tableFieldIndex: 3
    },
    {
      name: 'end_point_lat',
      type: 'real',
      tableFieldIndex: 4
    },
    {
      name: 'end_point_lng',
      type: 'real',
      tableFieldIndex: 2
    }
  ],
  rows: [
    [12.25, 37.75, 45.21, 100.12],
    [null, 35.2, 45.0, 21.3],
    [12.29, 37.64, 46.21, 99.127],
    [null, null, 33.1, 29.34]
  ]
};

test('#visStateReducer', t => {
  t.deepEqual(
    reducer(undefined, {}),
    {...INITIAL_VIS_STATE, initialState: {}},
    'should return the initial state'
  );

  t.end();
});

test('#visStateReducer -> ADD_FILTER', t => {
  const dataId = 'kitten';
  const newFilter = getDefaultFilter(dataId);
  const newReducer = reducer({filters: [mockFilter]}, VisStateActions.addFilter(dataId));

  const expectedReducer = {filters: [mockFilter, newFilter]};

  t.equal(newReducer.filters.length, expectedReducer.filters.length, 'should add a default filter');

  t.deepEqual(newReducer.filters[0], expectedReducer.filters[0], 'should add a default filter');

  cmpFilters(t, newReducer.filters[1], expectedReducer.filters[1]);
  t.end();
});

test('#visStateReducer -> ADD_LAYER.1', t => {
  const oldState = {
    ...INITIAL_VIS_STATE,
    datasets: {
      puppy: {
        data: mockData.data,
        fields: mockData.fields
      }
    },
    layers: [{id: 'existing_layer'}],
    layerData: [[{data: [1, 2, 3]}, {data: [4, 5, 6]}]],
    layerOrder: [0],
    splitMaps: [
      {
        layers: {existing_layer: false}
      },
      {
        layers: {existing_layer: false}
      }
    ]
  };

  const newReducer = reducer(oldState, VisStateActions.addLayer());
  const newId = newReducer.layers[1].id;
  const expectedSplitMaps = [
    {
      layers: {
        existing_layer: false,
        [newId]: true
      }
    },
    {
      layers: {
        existing_layer: false,
        [newId]: true
      }
    }
  ];

  t.equal(newReducer.layers.length, 2, 'should have 2 layers');
  t.equal(newReducer.layers[1].config.isVisible, true, 'newLayer visibility should be set to true');
  t.equal(
    newReducer.layers[1].config.isConfigActive,
    true,
    'newLayer isConfigActive should be set to true'
  );
  t.equal(newReducer.layers[1].config.dataId, 'puppy', 'newLayer dataId should be set to default');
  t.deepEqual(
    newReducer.layerData,
    [oldState.layerData[0], {}],
    'newState should have empty layer datat'
  );
  t.deepEqual(newReducer.layerOrder, [0, 1], 'should add to layerOrder');
  t.deepEqual(newReducer.splitMaps, expectedSplitMaps, 'should add to SplitMaps');

  t.end();
});

test('#visStateReducer -> LAYER_TYPE_CHANGE.0', t => {
  const layer = new Layer({id: 'blue'});

  const oldState = {
    ...INITIAL_VIS_STATE
  };

  const nextState = reducer(oldState, VisStateActions.layerTypeChange());

  t.equal(oldState, nextState, 'should return state when no argument is given');

  const nextState2 = reducer(oldState, VisStateActions.layerTypeChange(layer, 'no_type'));
  t.equal(oldState, nextState2, 'should return state when pass a none existing type');

  t.end();
});

test('#visStateReducer -> LAYER_TYPE_CHANGE.1', t => {
  const layer = new Layer({id: 'more_layer'});
  const oldState = {
    ...INITIAL_VIS_STATE,
    datasets: {
      puppy: {
        data: mockData.data,
        fields: mockData.fields
      }
    },
    layers: [{id: 'existing_layer'}, layer],
    layerData: [[{data: [1, 2, 3]}, {data: [4, 5, 6]}]],
    layerOrder: [1, 0],
    splitMaps: [
      {
        layers: {
          existing_layer: false,
          more_layer: true
        }
      },
      {
        layers: {
          existing_layer: false,
          more_layer: false
        }
      }
    ]
  };

  const nextState = reducer(oldState, VisStateActions.layerTypeChange(layer, 'point'));
  const newId = nextState.layers[1].id;
  const expectedSplitMaps = [
    {
      layers: {
        existing_layer: false,
        [newId]: true
      }
    },
    {
      layers: {
        existing_layer: false,
        [newId]: false
      }
    }
  ];

  t.ok(nextState.layers[1].id !== 'more_layer', 'should update layer id');

  t.equal(nextState.layers[1].type, 'point', 'should update type to point');

  t.deepEqual(
    nextState.splitMaps,
    expectedSplitMaps,
    'should add newId to SplitMaps, and replace old id'
  );

  t.end();
});

test('#visStateReducer -> LAYER_TYPE_CHANGE.2', t => {
  const pointLayer = new PointLayer({id: 'a', dataId: 'smoothie'});
  const mockColorRange = {
    name: 'abc',
    isReversed: true,
    colors: ['a', 'b', 'c']
  };
  const smoothie = createNewDataEntry({
    info: {id: 'smoothie'},
    data: {
      rows: testAllData,
      fields: testFields
    }
  });
  const oldState = {
    ...INITIAL_VIS_STATE,
    datasets: smoothie,
    layers: [pointLayer],
    layerData: []
  };

  // set point layer colorField to a string field
  const stringField = testFields.find(f => f.type === 'string');
  let nextState = reducer(
    oldState,
    VisStateActions.layerVisualChannelConfigChange(pointLayer, {colorField: stringField}, 'color')
  );
  nextState = reducer(
    nextState,
    VisStateActions.layerVisConfigChange(nextState.layers[0], {
      colorRange: mockColorRange
    })
  );
  const newLayer = nextState.layers[0];
  t.equal(newLayer.config.colorField, stringField, 'should update colorField');
  t.equal(newLayer.config.colorScale, 'ordinal', 'should scale to ordinal');
  t.deepEqual(
    newLayer.config.colorDomain,
    ['driver_analytics', 'driver_analytics_0', 'driver_gps'],
    'should calculate color domain'
  );
  t.equal(newLayer.config.visConfig.colorRange, mockColorRange, 'should update color range');

  // set point layer sizeField to a int field
  const intField = testFields.find(f => f.type === 'integer');
  let nextState2 = reducer(
    nextState,
    VisStateActions.layerVisualChannelConfigChange(newLayer, {sizeField: intField}, 'size')
  );
  nextState2 = reducer(
    nextState2,
    VisStateActions.layerVisConfigChange(nextState2.layers[0], {
      radiusRange: [5, 10]
    })
  );
  const newLayer2 = nextState2.layers[0];
  t.equal(newLayer2.config.sizeField, intField, 'should update sizeField');
  t.equal(newLayer2.config.sizeScale, 'sqrt', 'should scale to sqrt');
  t.deepEqual(newLayer2.config.sizeDomain, [1, 12124], 'should calculate size domain');
  t.deepEqual(newLayer2.config.visConfig.radiusRange, [5, 10], 'should update size range');

  // change point layer type to hexagon
  const nextState3 = reducer(nextState2, VisStateActions.layerTypeChange(newLayer2, 'hexagon'));

  const newLayer3 = nextState3.layers[0];
  t.equal(newLayer3.type, 'hexagon', 'should change type to hexagon');
  t.equal(newLayer3.config.colorField, stringField, 'should keep colorField');
  t.deepEqual(
    newLayer3.config.colorDomain,
    [0, 1],
    'should set colorDomain to default, it is calculated inside deck.gl layer'
  );
  t.equal(newLayer3.config.colorScale, 'ordinal', 'should set colorScale to ordinal');
  t.equal(newLayer3.config.sizeScale, 'sqrt', 'should set sizeScale to default');
  t.deepEqual(newLayer3.config.sizeDomain, [0, 1], 'should set sizeDomain to default');
  t.equal(newLayer3.config.sizeField, intField, 'should keep sizeField');
  t.notEqual(newLayer3.id, newLayer2.id, 'should change id');
  t.equal(newLayer3.config.visConfig.colorRange, mockColorRange, 'should not deep copy colorRange');
  t.equal(
    newLayer3.config.visConfig.sizeRange,
    LAYER_VIS_CONFIGS.elevationRange.defaultValue,
    'should set sizeRange back to default'
  );

  // change point layer type to icon
  const nextState4 = reducer(nextState2, VisStateActions.layerTypeChange(newLayer2, 'icon'));
  const newLayer4 = nextState4.layers[0];
  t.equal(newLayer4.type, 'icon', 'should change type to icon');
  t.notEqual(newLayer4.id, newLayer2.id, 'should change id');
  t.equal(newLayer4.config.colorField, stringField, 'should keep colorField');
  t.deepEqual(
    newLayer4.config.colorDomain,
    ['driver_analytics', 'driver_analytics_0', 'driver_gps'],
    'should calculate color domain'
  );
  t.equal(newLayer4.config.colorScale, 'ordinal', 'should keep color scale');
  t.equal(newLayer4.config.sizeField, intField, 'should keep sizeField');
  t.equal(newLayer4.config.sizeScale, 'sqrt', 'should scale to linear');
  t.deepEqual(newLayer4.config.sizeDomain, [1, 12124], 'should keep size domain');
  t.deepEqual(newLayer4.config.visConfig.radiusRange, [5, 10], 'should keep size range');
  t.equal(newLayer4.config.visConfig.colorRange, mockColorRange, 'should not deep copy colorRange');
  t.end();
});

test('#visStateReducer -> LAYER_TYPE_CHANGE.3 -> animationConfig', t => {
  const layer = new GeojsonLayer({
    label: 'taro and blue',
    dataId: 'taro',
    columns: {geojson: {fieldIdx: 0, value: '_geojson'}},
    isVisible: true,
    color: [1, 1, 1],
    id: 'taro'
  });

  const dataset = createNewDataEntry({
    info: {id: 'taro'},
    data: processGeojson(tripGeojson)
  });

  const oldState = {
    ...INITIAL_VIS_STATE,
    datasets: dataset,
    layers: [layer],
    layerData: [{}],
    layerOrder: [0]
  };

  // change GeoJson layer to Trip layer
  const nextState = reducer(oldState, VisStateActions.layerTypeChange(layer, 'trip'));

  const foundLayer = nextState.layers[0];
  const foundLayerId = foundLayer.id;
  t.ok(foundLayerId !== 'taro', 'should update layer id');
  t.equal(foundLayer.type, 'trip', 'should update type to trip');
  t.deepEqual(
    foundLayer.config.animation,
    {enabled: true, domain: timeStampDomain},
    'should set correct animation domain'
  );

  t.deepEqual(
    nextState.animationConfig,
    {
      ...defaultAnimationConfig,
      domain: timeStampDomain,
      currentTime: timeStampDomain[0]
    },
    'should update visState.animationConfig'
  );

  // change Trip layer to Geojson layer
  const nextState2 = reducer(oldState, VisStateActions.layerTypeChange(foundLayer, 'geojson'));
  const foundLayer2 = nextState2.layers[0];
  t.ok(foundLayer2.id !== foundLayerId, 'should update layer id');
  t.equal(foundLayer2.type, 'geojson', 'should update type to trip');

  t.deepEqual(
    foundLayer2.config.animation,
    {enabled: false},
    'should set correct animation domain fro Geojson layer'
  );

  t.deepEqual(
    nextState2.animationConfig,
    defaultAnimationConfig,
    'should set animationConfig to default'
  );

  t.end();
});

test('#visStateReducer -> LAYER_CONFIG_CHANGE -> isVisible -> animationConfig', t => {
  const initialState = StateWTripGeojson;
  const layer = initialState.visState.layers[0];

  // change Trip layer isVisible
  const nextState = reducer(
    StateWTripGeojson.visState,
    VisStateActions.layerConfigChange(layer, {isVisible: false})
  );

  t.deepEqual(
    nextState.animationConfig,
    defaultAnimationConfig,
    'should set animationConfig to default'
  );

  const nextState2 = reducer(
    nextState,
    VisStateActions.layerConfigChange(nextState.layers[0], {isVisible: true})
  );

  t.deepEqual(
    nextState2.animationConfig,
    {
      ...nextState2.animationConfig,
      domain: timeStampDomain,
      currentTime: timeStampDomain[0]
    },
    'should set animationConfig domain and currentTime'
  );

  t.end();
});

test('#visStateReducer -> LAYER_CONFIG_CHANGE -> isVisible -> splitMaps', t => {
  const initialState = StateWSplitMaps.visState;
  const layer = initialState.layers[0];

  const initialSplitMaps = [
    {layers: {'point-0': false, 'geojson-1': true}},
    {layers: {'point-0': true, 'geojson-1': true}}
  ];
  const expectedSplitMaps = [{layers: {'geojson-1': true}}, {layers: {'geojson-1': true}}];
  t.deepEqual(initialState.splitMaps, initialSplitMaps, 'should has the same initial splitMaps');

  const nextState = reducer(
    initialState,
    VisStateActions.layerConfigChange(layer, {isVisible: false})
  );

  t.equal(nextState.layers[0].config.isVisible, false, 'should set layer 0 visibility to false');
  t.equal(initialState.layerData[0], nextState.layerData[0], 'should not update layerData');
  t.deepEqual(nextState.splitMaps, expectedSplitMaps, 'should remove layer from splitMaps');

  const nextState2 = reducer(
    nextState,
    VisStateActions.layerConfigChange(layer, {isVisible: true})
  );

  const initialSplitMaps2 = [
    {layers: {'point-0': true, 'geojson-1': true}},
    {layers: {'point-0': true, 'geojson-1': true}}
  ];
  t.deepEqual(nextState2.splitMaps, initialSplitMaps2, 'should add layer to splitMaps');

  t.end();
});

test('#visStateReducer -> LAYER_VIS_CONFIG_CHANGE -> opacity', t => {
  const initialState = StateWFiles.visState;
  const layer = initialState.layers[0];

  const nextState = reducer(
    initialState,
    VisStateActions.layerVisConfigChange(layer, {opacity: 0.3})
  );

  t.equal(nextState.layers[0].config.visConfig.opacity, 0.3, 'should update layer opacity');
  t.end();
});

test('#visStateReducer -> LAYER_TEXT_LABEL_CHANGE', t => {
  const initialState = StateWFiles.visState;
  // point layer
  const layer = initialState.layers[0];

  t.deepEqual(layer.config.textLabel, [DEFAULT_TEXT_LABEL], 'should set initial textLabel');

  const nextState = reducer(
    initialState,
    VisStateActions.layerTextLabelChange(layer, 0, 'random', 1)
  );

  t.equal(
    nextState.layers[0].config.textLabel,
    layer.config.textLabel,
    'should not update textLabel if prop is not in textLabel'
  );

  const nextState2 = reducer(
    nextState,
    VisStateActions.layerTextLabelChange(nextState.layers[0], 0, 'anchor', 'start')
  );

  t.deepEqual(
    nextState2.layers[0].config.textLabel[0],
    {...DEFAULT_TEXT_LABEL, anchor: 'start'},
    'should start text label prop'
  );

  // set text label field
  const nextState3 = reducer(
    nextState2,
    VisStateActions.layerTextLabelChange(nextState2.layers[0], 0, 'field', {
      name: 'taro'
    })
  );

  const expectedTextLabel1 = {
    ...DEFAULT_TEXT_LABEL,
    anchor: 'start',
    field: {name: 'taro'}
  };

  t.deepEqual(
    nextState3.layers[0].config.textLabel[0],
    expectedTextLabel1,
    'should set text field'
  );

  // add empty field
  const nextState4 = reducer(
    nextState3,
    VisStateActions.layerTextLabelChange(nextState3.layers[0], 1)
  );
  t.deepEqual(
    nextState4.layers[0].config.textLabel,
    [expectedTextLabel1, DEFAULT_TEXT_LABEL],
    'should add text label'
  );

  // add or remove labels
  const nextState5 = reducer(
    nextState4,
    VisStateActions.layerTextLabelChange(nextState4.layers[0], 'all', 'fields', [
      {name: 'blue'},
      {name: 'taro'}
    ])
  );
  const expected5 = [expectedTextLabel1, {...DEFAULT_TEXT_LABEL, field: {name: 'blue'}}];
  t.deepEqual(nextState5.layers[0].config.textLabel, expected5, 'should add text label taro');

  // add 1 more label
  const nextState6 = reducer(
    nextState5,
    VisStateActions.layerTextLabelChange(nextState5.layers[0], 2, 'field', {
      name: 'cat'
    })
  );
  const expected6 = [
    expectedTextLabel1,
    {...DEFAULT_TEXT_LABEL, field: {name: 'blue'}},
    {...DEFAULT_TEXT_LABEL, field: {name: 'cat'}}
  ];
  t.deepEqual(nextState6.layers[0].config.textLabel, expected6, 'should add text label cat');

  // remove label
  const nextState7 = reducer(
    nextState6,
    VisStateActions.layerTextLabelChange(nextState6.layers[0], 2, 'field', null)
  );
  const expected7 = [expectedTextLabel1, {...DEFAULT_TEXT_LABEL, field: {name: 'blue'}}];
  t.deepEqual(nextState7.layers[0].config.textLabel, expected7, 'should remove text label cat');

  // remove label with all
  const nextState8 = reducer(
    nextState7,
    VisStateActions.layerTextLabelChange(nextState7.layers[0], 'all', 'fields', [{name: 'blue'}])
  );
  const expected8 = [{...DEFAULT_TEXT_LABEL, field: {name: 'blue'}}];
  t.deepEqual(nextState8.layers[0].config.textLabel, expected8, 'should remove text label blue');

  t.end();
});

test('#visStateReducer -> REORDER_LAYER', t => {
  const newReducer = reducer(
    {layers: [], layerOrder: [0, 1, 2]},
    VisStateActions.reorderLayer([0, 2, 1])
  );

  t.deepEqual(newReducer, {layers: [], layerOrder: [0, 2, 1]}, 'should re order layers');

  t.end();
});

test('#visStateReducer -> UPDATE_LAYER_BLENDING', t => {
  const newReducer = reducer(
    {layerBlending: 'none'},
    VisStateActions.updateLayerBlending('additive')
  );

  t.deepEqual(newReducer, {layerBlending: 'additive'}, 'should update layerBlending');

  t.end();
});

test('#visStateReducer -> REMOVE_FILTER', t => {
  const initialState = StateWFilters.visState;
  // filter[0]: 'time' testCsvData
  // filter[1]: 'RATE' testGeoJsonData

  const dataset0 = initialState.datasets[testCsvDataId];
  const dataset1 = initialState.datasets[testGeoJsonDataId];

  const expectedData0 = {
    ...dataset0,
    gpuFilter: {
      filterRange: [
        [1474606800000 - 1474588800000, 1474617600000 - 1474588800000],
        [0, 0],
        [0, 0],
        [0, 0]
      ],
      filterValueUpdateTriggers: {
        gpuFilter_0: 'time',
        gpuFilter_1: null,
        gpuFilter_2: null,
        gpuFilter_3: null
      },
      filterValueAccessor: {
        inputs: [
          {
            data: dataset0.allData[0],
            index: 0
          }
        ],
        result: [0, 0, 0, 0]
      }
    },
    filterRecord: {
      dynamicDomain: [],
      fixedDomain: [initialState.filters[0]],
      cpu: [],
      gpu: [initialState.filters[0]]
    }
  };

  const expectedData1 = {
    ...dataset1,
    filteredIndex: dataset1.allIndexes,
    filteredIndexForDomain: dataset1.allIndexes,
    filterRecord: {
      dynamicDomain: [],
      fixedDomain: [],
      cpu: [],
      gpu: []
    }
  };

  const expectedFilters = [mergedTimeFilter];

  // remove smoothie filter - gpu: true, fixedDomain: false
  const newReducer = reducer(initialState, VisStateActions.removeFilter(1));

  const expectedLayerData1 = {data: dataset1.allData.map(d => d)};
  const expectedState = {
    ...initialState,
    filters: expectedFilters,
    datasets: {
      [testCsvDataId]: expectedData0,
      [testGeoJsonDataId]: expectedData1
    },
    layerData: [initialState.layerData[0], expectedLayerData1]
  };

  cmpObjectKeys(t, expectedState, newReducer, 'After removing filter, visState');

  Object.keys(newReducer).forEach(key => {
    switch (key) {
      case 'datasets':
        cmpDatasets(t, expectedState.datasets, newReducer.datasets);
        break;
      case 'filters':
        cmpFilters(t, expectedState.filters, newReducer.filters);
        break;
      case 'layers':
        cmpLayers(t, expectedState.layers, newReducer.layers);
        break;
      case 'layerData':
        // only compare length

        t.equal(
          expectedState.layerData.length,
          newReducer.layerData.length,
          'should have same number of layerData'
        );
        newReducer.layerData.forEach((ld, i) => {
          t.equal(
            expectedState.layerData[i].data.length,
            newReducer.layerData[i].data.length,
            'layerData.data should have same length'
          );
        });
        break;
      default:
        t.deepEqual(
          newReducer[key],
          expectedState[key],
          `visState.${key} should be correct after removing filter`
        );
        break;
    }
  });

  t.end();
});

test('#visStateReducer -> REMOVE_LAYER', t => {
  const layer1 = new PointLayer({id: 'a'});
  const layer2 = new PointLayer({id: 'b'});
  const oldState = {
    layers: [layer1, layer2],
    layerData: [{data: 1}, {data: 2}],
    layerOrder: [1, 0],
    hoverInfo: {
      layer: {props: {id: 'b'}},
      picked: true
    },
    clicked: {
      layer: {props: {id: 'a'}},
      picked: true
    },
    splitMaps: [],
    animationConfig: defaultAnimationConfig
  };

  const newReducer = reducer(oldState, VisStateActions.removeLayer(1));

  t.deepEqual(
    newReducer,
    {
      layers: [layer1],
      layerData: [{data: 1}],
      layerOrder: [0],
      hoverInfo: undefined,
      clicked: {
        layer: {props: {id: 'a'}},
        picked: true
      },
      splitMaps: [],
      animationConfig: defaultAnimationConfig
    },
    'should remove layer and layerData'
  );

  // test remove
  t.end();
});

test('#visStateReducer -> UPDATE_VIS_DATA.1 -> No data', t => {
  const oldState = {
    datasets: {},
    layers: [{name: 'a'}, {name: 'b'}],
    layerData: [{data: 1}, {data: 2}]
  };

  t.deepEqual(
    reducer(oldState, VisStateActions.updateVisData([{info: null, data: null}])),
    oldState,
    'should return current state if no data'
  );

  t.deepEqual(
    reducer(
      oldState,
      VisStateActions.updateVisData([
        {
          data: {
            fields: null,
            rows: [1, 2]
          }
        }
      ])
    ),
    oldState,
    'should return current state if no fields'
  );

  t.deepEqual(
    reducer(
      oldState,
      VisStateActions.updateVisData([
        {
          data: {
            fields: [{name: 'a'}],
            rows: null
          }
        }
      ])
    ),
    oldState,
    'should return current state if no rows'
  );

  t.end();
});

/* eslint-disable max-statements */
test('#visStateReducer -> UPDATE_VIS_DATA.2 -> to empty state', t => {
  const oldState = INITIAL_VIS_STATE;

  const newState = reducer(
    oldState,
    VisStateActions.updateVisData([
      {
        data: mockRawData,
        info: {id: 'smoothie', label: 'exciting dataset'}
      }
    ])
  );

  const newStateLayers = CloneDeep(newState.layers);

  const expectedDatasets = {
    smoothie: {
      fields: expectedFields,
      filteredIndex: mockRawData.rows.map((_, i) => i),
      filteredIndexForDomain: mockRawData.rows.map((_, i) => i),
      allIndexes: mockRawData.rows.map((_, i) => i),
      allData: mockRawData.rows,
      gpuFilter: {
        filterRange: [
          [0, 0],
          [0, 0],
          [0, 0],
          [0, 0]
        ],
        filterValueUpdateTriggers: {
          gpuFilter_0: null,
          gpuFilter_1: null,
          gpuFilter_2: null,
          gpuFilter_3: null
        },
        filterValueAccessor: {
          inputs: ['a', 'b', 'c', 'd', 'e'],
          result: [0, 0, 0, 0]
        }
      },
      color: 'donnot test me',
      id: 'smoothie',
      label: 'exciting dataset',
      fieldPairs: [
        {
          defaultName: 'start point',
          pair: {
            lat: {
              value: 'start_point_lat',
              fieldIdx: 0
            },
            lng: {
              value: 'start_point_lng',
              fieldIdx: 1
            }
          },
          suffix: ['lat', 'lng']
        },
        {
          defaultName: 'end point',
          pair: {
            lat: {
              value: 'end_point_lat',
              fieldIdx: 2
            },
            lng: {
              value: 'end_point_lng',
              fieldIdx: 3
            }
          },
          suffix: ['lat', 'lng']
        }
      ]
    }
  };

  const expectedArcLayer = new ArcLayer({
    dataId: 'smoothie',
    label: 'start point -> end point arc',
    columns: {
      lat0: {fieldIdx: 0, value: 'start_point_lat'},
      lng0: {fieldIdx: 1, value: 'start_point_lng'},
      lat1: {fieldIdx: 2, value: 'end_point_lat'},
      lng1: {fieldIdx: 3, value: 'end_point_lng'}
    }
  });

  const expectedLineLayer = new LineLayer({
    dataId: 'smoothie',
    label: 'start point -> end point line',
    columns: {
      lat0: {fieldIdx: 0, value: 'start_point_lat'},
      lng0: {fieldIdx: 1, value: 'start_point_lng'},
      lat1: {fieldIdx: 2, value: 'end_point_lat'},
      lng1: {fieldIdx: 3, value: 'end_point_lng'}
    }
  });

  const expectedPointLayer1 = new PointLayer({
    dataId: 'smoothie',
    label: 'start point',
    columns: {
      lat: {fieldIdx: 0, value: 'start_point_lat'},
      lng: {fieldIdx: 1, value: 'start_point_lng'},
      altitude: {fieldIdx: -1, value: null, optional: true}
    },
    isVisible: true
  });

  expectedPointLayer1.meta = {
    bounds: [35.2, 12.25, 37.75, 12.29]
  };

  const expectedPointLayer2 = new PointLayer({
    dataId: 'smoothie',
    label: 'end point',
    columns: {
      lat: {fieldIdx: 2, value: 'end_point_lat'},
      lng: {fieldIdx: 3, value: 'end_point_lng'},
      altitude: {fieldIdx: -1, value: null, optional: true}
    }
  });

  expectedPointLayer2.meta = {
    bounds: [21.3, 33.1, 100.12, 46.21]
  };

  const expectedLayers = [
    expectedPointLayer1,
    expectedPointLayer2,
    expectedArcLayer,
    expectedLineLayer
  ];
  t.deepEqual(Object.keys(newState.datasets), ['smoothie'], 'should save data to smoothie');

  cmpDatasets(t, expectedDatasets, newState.datasets);
  cmpLayers(t, expectedLayers, newStateLayers);

  t.equal(newState.layerData.length, expectedLayers.length, 'should calculate layerdata');
  t.deepEqual(newState.layerOrder, [0, 1, 2, 3], 'should calculate layerOrder');

  t.end();
});

test('#visStateReducer -> UPDATE_VIS_DATA.3 -> merge w/ existing state', t => {
  const mockLayer = new PointLayer({
    dataId: 'snowflake',
    columns: {
      lat: {
        value: 'start_point_lat',
        fieldIdx: 0
      },
      lng: {
        value: 'start_point_lng',
        fieldIdx: 1
      }
    }
  });

  const oldState = {
    ...INITIAL_VIS_STATE,
    layers: [mockLayer],
    layerData: [
      [1, 2],
      [3, 4],
      [5, 6],
      [7, 8]
    ],
    datasets: {
      snowflake: {
        fields: [{id: 'a'}, {id: 'b'}],
        allData: [['something'], ['something_else']]
      }
    },
    filters: [{name: 'hello'}, {name: 'world'}],
    interactionConfig: {
      tooltip: {
        id: 'tooltip',
        enabled: true,
        icon: 'messages',
        config: {
          fieldsToShow: {snowflake: ['a']}
        }
      }
    },
    layerOrder: [0],
    layerBlending: 'additive',
    splitMaps: []
  };

  const expectedDatasets = {
    snowflake: {
      fields: [{id: 'a'}, {id: 'b'}],
      allData: [['something'], ['something_else']]
    },
    smoothie: {
      fields: expectedFields,
      allData: mockRawData.rows,
      color: 'donnot test me',
      filteredIndex: mockRawData.rows.map((_, i) => i),
      filteredIndexForDomain: mockRawData.rows.map((_, i) => i),
      allIndexes: mockRawData.rows.map((_, i) => i),
      gpuFilter: {
        filterRange: [
          [0, 0],
          [0, 0],
          [0, 0],
          [0, 0]
        ],
        filterValueUpdateTriggers: {
          gpuFilter_0: null,
          gpuFilter_1: null,
          gpuFilter_2: null,
          gpuFilter_3: null
        },
        filterValueAccessor: {
          inputs: [{data: mockData.data[0], index: 0}],
          result: [0, 0, 0, 0]
        }
      },
      id: 'smoothie',
      label: 'smoothie and milkshake',
      fieldPairs: [
        {
          defaultName: 'start point',
          pair: {
            lat: {
              value: 'start_point_lat',
              fieldIdx: 0
            },
            lng: {
              value: 'start_point_lng',
              fieldIdx: 1
            }
          },
          suffix: ['lat', 'lng']
        },
        {
          defaultName: 'end point',
          pair: {
            lat: {
              value: 'end_point_lat',
              fieldIdx: 2
            },
            lng: {
              value: 'end_point_lng',
              fieldIdx: 3
            }
          },
          suffix: ['lat', 'lng']
        }
      ]
    }
  };

  const expectedInteractionTooltip = {
    fieldsToShow: {snowflake: ['a'], smoothie: []}
  };

  const newState = reducer(
    oldState,
    VisStateActions.updateVisData([
      {
        data: mockRawData,
        info: {id: 'smoothie', label: 'smoothie and milkshake'}
      }
    ])
  );

  Object.keys(expectedDatasets).forEach(key =>
    cmpDataset(t, expectedDatasets[key], newState.datasets[key])
  );
  t.equal(newState.layers.length, 5, 'should find 1 arc aline and 2 point layers');
  t.deepEqual(
    newState.layerOrder,
    [1, 2, 3, 4, 0],
    'should add new layer index to layer order, put them on top'
  );
  t.equal(newState.layers[1].config.dataId, 'smoothie', 'should save dataId to layer');
  t.equal(newState.layers[2].config.dataId, 'smoothie', 'should save dataId to layer');
  t.equal(newState.layers[3].config.dataId, 'smoothie', 'should save dataId to layer');
  t.equal(newState.layerData.length, 5, 'should calculate layerData');
  t.equal(newState.filters.length, 2, 'should keep original filters');
  t.deepEqual(
    newState.interactionConfig.tooltip.config,
    expectedInteractionTooltip,
    'should set interaction config back to default'
  );
  t.equal(newState.layerBlending, 'additive', 'should keep layerBlending');

  t.end();
});

test('#visStateReducer -> UPDATE_VIS_DATA.4.Geojson -> geojson data', t => {
  const initialVisState = CloneDeep(INITIAL_VIS_STATE);

  const {fields, rows} = processGeojson(CloneDeep(geojsonData));

  const payload = [
    {
      info: {
        id: 'milkshake',
        label: 'king milkshake'
      },
      data: {fields, rows}
    }
  ];

  const [layer1Color, layer1StrokeColor] = getNextColorMakerValue(2);

  // receive data
  const initialState = reducer(initialVisState, VisStateActions.updateVisData(payload));

  const expectedDatasets = {
    id: 'milkshake',
    label: 'king milkshake',
    color: 'donnot test me',
    allData: rows,
    filteredIndex: rows.map((_, i) => i),
    filteredIndexForDomain: rows.map((_, i) => i),
    allIndexes: rows.map((_, i) => i),
    fields: fields.map(f => ({...f, id: f.name})),
    fieldPairs: [],
    gpuFilter: {
      filterRange: [
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0]
      ],
      filterValueUpdateTriggers: {
        gpuFilter_0: null,
        gpuFilter_1: null,
        gpuFilter_2: null,
        gpuFilter_3: null
      },
      filterValueAccessor: {
        inputs: [{data: mockData.data[0], index: 0}],
        result: [0, 0, 0, 0]
      }
    }
  };

  const expectedLayer = new GeojsonLayer({
    label: 'king milkshake',
    dataId: 'milkshake',
    columns: {geojson: {fieldIdx: 0, value: '_geojson'}},
    isVisible: true,
    color: layer1Color
  });

  expectedLayer.updateLayerVisConfig({
    stroked: true,
    filled: true,
    strokeColor: layer1StrokeColor
  });
  expectedLayer.dataToFeature = expectedDataToFeature;
  expectedLayer.meta = updatedGeoJsonLayer.meta;

  const expectedLayerData = {
    data: geojsonData.features.map((f, i) => ({
      ...f,
      properties: {...f.properties, index: i}
    }))
  };

  t.deepEqual(Object.keys(initialState.datasets), ['milkshake'], 'should save geojson to datasets');
  cmpDataset(
    t,
    expectedDatasets,
    initialState.datasets.milkshake,
    'should save correct geojson to datasets'
  );

  t.equal(initialState.layers.length, 1, 'should find 1 geojson layer');
  cmpLayers(t, expectedLayer, initialState.layers[0], 'should save dataFeature to geojson layer');

  t.deepEqual(
    initialState.layerData[0].data,
    expectedLayerData.data,
    'should save geojson to datasets'
  );

  t.end();
});

test('#visStateReducer -> UPDATE_VIS_DATA.4.Geojson -> with config', t => {
  const initialVisState = CloneDeep(INITIAL_VIS_STATE);

  const {fields, rows} = processGeojson(CloneDeep(geojsonData));

  const payload = [
    {
      info: {
        id: 'milkshake',
        label: 'king milkshake'
      },
      data: {fields, rows}
    }
  ];

  // receive data
  const initialState = reducer(initialVisState, VisStateActions.updateVisData(payload));

  t.equal(initialState.layers.length, 1, 'should create 1 layer');

  // add data and config again

  // data
  const datasets = [
    {
      info: {
        id: 'milkshake2',
        label: 'king milkshake'
      },
      data: {fields, rows}
    }
  ];

  const config = {
    visState: {
      layers: [
        {
          id: 'test_layer_2',
          type: 'geojson',
          config: {
            dataId: 'milkshake2',
            columns: {
              geojson: '_geojson'
            }
          }
        }
      ]
    }
  };

  const testState = reducer(initialState, VisStateActions.updateVisData(datasets, {}, config));

  t.deepEqual(
    Object.keys(testState.datasets),
    ['milkshake2'],
    'should reset state, and load dataset'
  );
  t.equal(testState.layers.length, 1, 'should create 1 layer');
  t.equal(testState.layers[0].id, 'test_layer_2', 'should merge 1 layer from config');

  t.end();
});

test('#visStateReducer -> UPDATE_VIS_DATA -> mergeFilters', t => {
  const oldState = CloneDeep(INITIAL_VIS_STATE);
  oldState.filterToBeMerged = [
    {
      dataId: 'smoothie',
      id: '38chejr',
      enlarged: true,
      name: mockFilter.name,
      type: mockFilter.type,
      value: mockFilter.value
    },
    {
      dataId: 'nothing_here',
      id: 'vuey55d',
      enlarged: true,
      name: 'test_test',
      type: 'select',
      value: true
    }
  ];

  const expectedFilterProps = {
    domain: [12.249990000000002, 12.290000000000001],
    step: 0.00001,
    histogram: [1], // test not empty
    enlargedHistogram: [2], // test not empty
    fieldType: 'real',
    type: mockFilter.type,
    gpu: true,
    typeOptions: ['range'],
    value: [12.249990000000002, 12.290000000000001]
  };

  const expectedFilter = {
    ...expectedFilterProps,
    dataId: ['smoothie'],
    fieldIdx: [0],
    id: '38chejr',
    freeze: true,
    fixedDomain: false,
    enlarged: true,
    plotType: 'histogram',
    yAxis: null,
    gpu: true,
    gpuChannel: [0],
    interval: null,
    name: [mockFilter.name],
    speed: 1,
    isAnimating: false,
    typeOptions: ['range'],
    value: mockFilter.value
  };

  const newState = reducer(
    oldState,
    VisStateActions.updateVisData([
      {
        data: mockRawData,
        info: {id: 'smoothie', label: 'smoothie and milkshake'}
      }
    ])
  );

  const allIndexes = mockRawData.rows.map((_, i) => i);

  const expectedDatasets = {
    smoothie: {
      fields: expectedFields.map(f =>
        f.name === mockFilter.name
          ? {
              ...f,
              filterProps: expectedFilterProps
            }
          : f
      ),
      // gpu filter in place, filteredIndex should not be updated
      filteredIndex: allIndexes,
      filteredIndexForDomain: [0],
      filterRecord: {
        dynamicDomain: [newState.filters.find(f => f.id === '38chejr')],
        fixedDomain: [],
        cpu: [],
        gpu: [newState.filters.find(f => f.id === '38chejr')]
      },
      gpuFilter: {
        filterRange: [
          [
            mockFilter.value[0] - expectedFilter.domain[0],
            mockFilter.value[1] - expectedFilter.domain[0]
          ],
          [0, 0],
          [0, 0],
          [0, 0]
        ],
        filterValueUpdateTriggers: {
          gpuFilter_0: mockFilter.name,
          gpuFilter_1: null,
          gpuFilter_2: null,
          gpuFilter_3: null
        },
        filterValueAccessor: {
          inputs: [{data: mockRawData.rows[0], index: 1}],
          result: [12.25 - expectedFilter.domain[0], 0, 0, 0]
        }
      },
      allIndexes,
      allData: mockRawData.rows,
      color: 'donot test me',
      id: 'smoothie',
      label: 'smoothie and milkshake',
      fieldPairs: [
        {
          defaultName: 'start point',
          pair: {
            lat: {
              value: 'start_point_lat',
              fieldIdx: 0
            },
            lng: {
              value: 'start_point_lng',
              fieldIdx: 1
            }
          },
          suffix: ['lat', 'lng']
        },
        {
          defaultName: 'end point',
          pair: {
            lat: {
              value: 'end_point_lat',
              fieldIdx: 2
            },
            lng: {
              value: 'end_point_lng',
              fieldIdx: 3
            }
          },
          suffix: ['lat', 'lng']
        }
      ]
    }
  };

  const expectedState = {
    filterToBeMerged: [oldState.filterToBeMerged[1]],
    filters: [expectedFilter],
    datasets: expectedDatasets
  };

  cmpFilters(t, expectedState.filters, newState.filters);

  t.deepEqual(
    newState.filterToBeMerged,
    expectedState.filterToBeMerged,
    'should saved unmerged filter to filterToBeMerged'
  );

  cmpDatasets(t, expectedState.datasets, newState.datasets);

  // filteredIndex should be shallow equal
  t.equal(
    newState.datasets.smoothie.filteredIndex,
    newState.datasets.smoothie.allIndexes,
    'filteredIndex should be shallow equal'
  );
  t.end();
});

test('#visStateReducer -> UPDATE_VIS_DATA.SPLIT_MAPS', t => {
  const layer0 = new PointLayer({
    dataId: 'snowflake',
    id: 'a',
    isVisible: true
  });

  const layer1 = new PointLayer({
    dataId: 'milkshake',
    id: 'b',
    isVisible: true
  });

  const layer2 = new PointLayer({
    dataId: 'milkshake',
    id: 'c',
    isVisible: false
  });

  const layer3 = new PointLayer({
    dataId: 'milkshake',
    id: 'd',
    isVisible: false
  });

  const oldState = {
    ...INITIAL_VIS_STATE,
    layers: [layer0, layer1, layer2, layer3],
    splitMaps: [
      {
        layers: {
          a: true,
          b: false
        }
      },
      {
        layers: {
          a: false,
          b: true
        }
      }
    ],
    interactionConfig: {
      tooltip: {
        config: {
          fieldsToShow: {
            milkshake: []
          }
        }
      }
    },
    layerData: [],
    layerOrder: [2, 1, 0, 3]
  };

  const newState = reducer(
    oldState,
    VisStateActions.updateVisData([
      {
        data: mockRawData,
        info: {id: 'smoothie', label: 'smoothie and milkshake'}
      }
    ])
  );

  // first visible layer should be point
  const id1 = newState.layers[4].id;
  const expectedSplitMaps = [
    {
      layers: {
        a: true,
        b: false,
        [id1]: true
      }
    },
    {
      layers: {
        a: false,
        b: true,
        [id1]: true
      }
    }
  ];

  t.equal(newState.layers.length, 8, 'should create 1 arc 1 line and 2 point layers');
  t.deepEqual(newState.layerOrder, [4, 5, 6, 7, 2, 1, 0, 3], 'should move new layers to front');
  t.deepEqual(newState.splitMaps, expectedSplitMaps, 'should add new layers to split maps');

  t.end();
});

test('#visStateReducer -> setFilter.dynamicDomain & cpu', t => {
  // get test data
  const {fields, rows} = processCsvData(testData);
  const payload = [
    {
      info: {
        id: 'smoothie',
        label: 'queen smoothie'
      },
      data: {fields, rows}
    }
  ];

  // receive data
  const initialState = reducer(INITIAL_VIS_STATE, VisStateActions.updateVisData(payload));

  const expectedLayer1 = new PointLayer({
    isVisible: true,
    dataId: 'smoothie',
    label: 'gps data',
    columns: {
      lat: {value: 'gps_data.lat', fieldIdx: 1},
      lng: {value: 'gps_data.lng', fieldIdx: 2},
      altitude: {value: null, fieldIdx: -1, optional: true}
    }
  });

  expectedLayer1.meta = {
    bounds: [31.2148748, 29.9870074, 31.2590542, 30.0614122]
  };

  const expectedLayers = [expectedLayer1];
  // test default layer
  t.equal(initialState.layers.length, 1, 'should find two layers');

  cmpLayers(t, expectedLayers, initialState.layers);

  // add filter
  const stateWithFilter = reducer(initialState, VisStateActions.addFilter('smoothie'));

  const expectedFilter = {
    dataId: ['smoothie'],
    freeze: false,
    id: 'donnot test me yet',
    name: [],
    type: null,
    fixedDomain: false,
    domain: null,
    value: null,
    enlarged: false,
    isAnimating: false,
    plotType: 'histogram',
    yAxis: null,
    speed: 1,
    interval: null,
    gpu: false,
    fieldIdx: []
  };

  cmpFilters(t, expectedFilter, stateWithFilter.filters[0]);
  const filterId = stateWithFilter.filters[0].id;

  // set filter 'name'
  const stateWithFilterName = reducer(
    stateWithFilter,
    VisStateActions.setFilter(0, 'name', 'date')
  );

  const expectedFilterWName = {
    dataId: ['smoothie'],
    freeze: true,
    id: filterId,
    name: ['date'],
    type: 'multiSelect',
    fieldIdx: [10],
    fixedDomain: false,
    domain: ['2016-09-23', '2016-09-24', '2016-10-10'],
    value: [],
    enlarged: false,
    isAnimating: false,
    fieldType: 'date',
    plotType: 'histogram',
    yAxis: null,
    speed: 1,
    interval: null,
    gpu: false
  };

  // test filter
  cmpFilters(t, expectedFilterWName, stateWithFilterName.filters[0]);

  const updatedField = {
    ...initialState.datasets.smoothie.fields[10],
    filterProps: {
      type: 'multiSelect',
      value: [],
      fieldType: 'date',
      domain: ['2016-09-23', '2016-09-24', '2016-10-10'],
      gpu: false
    }
  };

  const {allData} = initialState.datasets.smoothie;

  // test dataset
  const expectedDataset = {
    id: 'smoothie',
    label: 'queen smoothie',
    color: 'donnot test me',
    allData,
    fields: [...initialState.datasets.smoothie.fields.slice(0, 10), updatedField],
    filteredIndex: allData.map((d, i) => i),
    filteredIndexForDomain: allData.map((d, i) => i),
    allIndexes: allData.map((d, i) => i),
    filterRecord: {
      dynamicDomain: [],
      fixedDomain: [],
      cpu: [],
      gpu: []
    },
    gpuFilter: {
      filterRange: [
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0]
      ],
      filterValueUpdateTriggers: {
        gpuFilter_0: null,
        gpuFilter_1: null,
        gpuFilter_2: null,
        gpuFilter_3: null
      },
      filterValueAccessor: {
        inputs: [{data: allData[0], index: 0}],
        result: [0, 0, 0, 0]
      }
    },
    fieldPairs: [
      {
        defaultName: 'gps data',
        pair: {
          lat: {
            value: 'gps_data.lat',
            fieldIdx: 1
          },
          lng: {
            value: 'gps_data.lng',
            fieldIdx: 2
          }
        },
        suffix: ['lat', 'lng']
      }
    ]
  };

  cmpDataset(t, expectedDataset, stateWithFilterName.datasets.smoothie);

  // set filter value
  const stateWithFilterValue = reducer(
    stateWithFilterName,
    VisStateActions.setFilter(0, 'value', ['2016-10-10'])
  );

  const expectedFilterWValue = {
    ...expectedFilterWName,
    value: ['2016-10-10']
  };

  // test filter
  cmpFilters(t, expectedFilterWValue, stateWithFilterValue.filters[0]);

  const updatedFilterWValue = stateWithFilterValue.filters[0];

  const expectedFilteredDataset = {
    ...expectedDataset,
    filterRecord: {
      dynamicDomain: [updatedFilterWValue],
      fixedDomain: [],
      cpu: [updatedFilterWValue],
      gpu: []
    },
    allData,
    filteredIndex: [17, 18, 19, 20, 21, 22],
    filteredIndexForDomain: [17, 18, 19, 20, 21, 22]
  };

  cmpDataset(t, expectedFilteredDataset, stateWithFilterValue.datasets.smoothie);

  const expectedLayerData1 = {
    data: [
      {data: allData[17], index: 17, position: [31.2165983, 30.0538936, 0]},
      {data: allData[18], index: 18, position: [31.2148748, 30.060911, 0]},
      {data: allData[19], index: 19, position: [31.2212278, 30.060334, 0]},
      {data: allData[20], index: 20, position: [31.2288985, 30.0554663, 0]},
      {data: allData[21], index: 21, position: [31.2187021, 30.0614122, 0]},
      {data: allData[22], index: 22, position: [31.2191059, 30.0612697, 0]}
    ],
    getPosition: () => {},
    getColor: () => {},
    getRadius: () => {}
  };

  t.deepEqual(
    stateWithFilterValue.layerData[0].data,
    expectedLayerData1.data,
    'should format layer data correctly'
  );

  t.end();
});

test('#visStateReducer -> SET_FILTER.name', t => {
  const oldState = StateWFilters.visState;
  const oldFilter0 = oldState.filters[0];
  // change filter name from RATE to ZIP_CODE
  const updated = reducer(oldState, VisStateActions.setFilter(1, 'name', 'ZIP_CODE', 0));

  const expectedFilter0 = oldFilter0;
  const expectedFilter1 = {
    dataId: [testGeoJsonDataId],
    freeze: true,
    id: 'RATE-1',
    fixedDomain: false,
    enlarged: false,
    isAnimating: false,
    speed: 1,
    name: ['ZIP_CODE'],
    type: 'range',
    fieldIdx: [2],
    domain: [94105, 94111],
    value: [94105, 94111],
    plotType: 'histogram',
    yAxis: null,
    interval: null,
    fieldType: 'integer',
    step: 0.01,
    histogram: [],
    enlargedHistogram: 'dont test me',
    typeOptions: ['range'],
    gpu: true,
    gpuChannel: [0]
  };

  cmpFilters(t, [expectedFilter0, expectedFilter1], updated.filters);

  t.end();
});

test('#visStateReducer -> SET_FILTER.dataId', t => {
  const oldState = StateWFilters.visState;
  let newState = reducer(oldState, VisStateActions.setFilter(1, 'dataId', testCsvDataId));

  let newFilter = newState.filters[1];
  let expectedFilter = {
    ...oldState.filters[1],
    dataId: [...oldState.filters[1].dataId, testCsvDataId]
  };

  t.deepEqual(newFilter, expectedFilter, 'Should add a new dataId value');

  // Using an array of dataId
  newState = reducer(newState, VisStateActions.setFilter(1, 'dataId', [testCsvDataId]));

  newFilter = newState.filters[1];

  expectedFilter = {
    ...getDefaultFilter(testCsvDataId),
    id: newFilter.id
  };

  t.deepEqual(
    newFilter,
    expectedFilter,
    'Should create a new filter using the provided list of dataId'
  );

  t.end();
});

test('#visStateReducer -> setFilter.dynamicDomain & gpu', t => {
  const {fields, rows} = processGeojson(CloneDeep(geojsonData));
  const payload = [
    {
      info: {
        id: 'milkshake',
        label: 'king milkshake'
      },
      data: {fields, rows}
    }
  ];

  // receive data
  const initialState = reducer(INITIAL_VIS_STATE, VisStateActions.updateVisData(payload));

  // add filter
  const stateWithFilter = reducer(initialState, VisStateActions.addFilter('milkshake'));

  // set filter 'name'
  const stateWithFilterName = reducer(
    stateWithFilter,
    VisStateActions.setFilter(0, 'name', 'TRIPS')
  );

  const expectedFilterWName = {
    dataId: ['milkshake'],
    freeze: true,
    id: stateWithFilter.filters[0].id,
    name: ['TRIPS'],
    type: 'range',
    fieldIdx: [4],
    domain: [4, 20],
    step: 0.01,
    value: [4, 20],
    enlarged: false,
    fixedDomain: false,
    histogram: [],
    enlargedHistogram: [],
    isAnimating: false,
    fieldType: 'integer',
    typeOptions: ['range'],
    plotType: 'histogram',
    yAxis: null,
    interval: null,
    speed: 1,
    gpu: true,
    gpuChannel: [0]
  };

  // test filter
  cmpFilters(t, expectedFilterWName, stateWithFilterName.filters[0]);

  // set filter value
  const stateWithFilterValue = reducer(
    stateWithFilterName,
    VisStateActions.setFilter(0, 'value', [8, 20])
  );

  const expectedFilterWValue = {
    ...expectedFilterWName,
    value: [8, 20]
  };

  // test filter
  cmpFilters(t, expectedFilterWValue, stateWithFilterValue.filters[0]);

  const expectedFilteredDataset = {
    ...initialState.datasets.milkshake,

    // receive Vis Data will add id to fields
    // filter will add filterProps to fields
    fields: geojsonFields.map(f =>
      f.name === 'TRIPS'
        ? {
            ...f,
            id: f.name,
            filterProps: geoJsonTripFilterProps
          }
        : {...f, id: f.name}
    ),
    gpuFilter: {
      filterRange: [
        [4, 16],
        [0, 0],
        [0, 0],
        [0, 0]
      ],
      filterValueUpdateTriggers: {
        gpuFilter_0: 'TRIPS',
        gpuFilter_1: null,
        gpuFilter_2: null,
        gpuFilter_3: null
      },
      filterValueAccessor: {
        inputs: [{data: initialState.datasets.milkshake.allData[0], index: 0}],
        result: [7, 0, 0, 0]
      }
    },
    filterRecord: {
      dynamicDomain: [stateWithFilterValue.filters[0]],
      fixedDomain: [],
      cpu: [],
      gpu: [stateWithFilterValue.filters[0]]
    },
    filteredIndex: geojsonData.features.map((_, i) => i),
    filteredIndexForDomain: [0, 2],
    allIndexes: geojsonData.features.map((_, i) => i)
  };

  const actualTripField = stateWithFilterValue.datasets.milkshake.fields[4];
  const expectedField = expectedFilteredDataset.fields[4];

  t.deepEqual(
    Object.keys(actualTripField).sort(),
    Object.keys(expectedField).sort(),
    'trip field keys should be same'
  );
  Object.keys(actualTripField).forEach(k => {
    t.deepEqual(actualTripField[k], expectedField[k], `trip field ${k} should be same`);
  });
  cmpDataset(t, expectedFilteredDataset, stateWithFilterValue.datasets.milkshake);

  t.end();
});
/* eslint-enable max-statements */

test('#visStateReducer -> UPDATE_FILTER_ANIMATION_SPEED', t => {
  const initialState = StateWFilters.visState;

  const nextState = reducer(initialState, VisStateActions.updateFilterAnimationSpeed(0, 4));

  t.equal(nextState.filters[0].speed, 4, 'should update filter animation speed');

  t.end();
});

test('#visStateReducer -> setFilter.fixedDomain & DynamicDomain & gpu & cpu', t => {
  // get test data
  const {fields, rows} = processCsvData(testData);
  const payload = [
    {
      info: {
        id: 'smoothie',
        label: 'queen smoothie'
      },
      data: {fields, rows}
    }
  ];

  const datasetSmoothie = createNewDataEntry({
    info: {id: 'smoothie', label: 'queen smoothie'},
    data: {
      rows: testAllData,
      fields: testFields
    }
  }).smoothie;

  // add fixedDomain & gpu filter
  const stateWidthTsFilter = applyActions(reducer, INITIAL_VIS_STATE, [
    // receive data
    {action: VisStateActions.updateVisData, payload: [payload]},

    // add ts filter
    {action: VisStateActions.addFilter, payload: ['smoothie']},

    // set ts filter name
    {
      action: VisStateActions.setFilter,
      payload: [0, 'name', 'gps_data.utc_timestamp']
    },

    // set ts filter value
    {
      action: VisStateActions.setFilter,
      payload: [0, 'value', [1474071425000, 1474071740000]]
    }
  ]);

  const expectedFilterTs = {
    dataId: ['smoothie'],
    freeze: true,
    fixedDomain: true,
    id: 'dont test me',
    name: ['gps_data.utc_timestamp'],
    type: 'timeRange',
    fieldIdx: [0],
    domain: [1474070995000, 1474072208000],
    value: [1474071425000, 1474071740000],
    step: 1000,
    plotType: 'histogram',
    yAxis: null,
    interval: null,
    speed: 1,
    mappedValue: [
      1474070995000,
      1474071056000,
      1474071116000,
      1474071178000,
      1474071240000,
      1474071301000,
      1474071363000,
      1474071425000,
      1474071489000,
      1474071552000,
      1474071567000,
      1474071614000,
      1474071677000,
      1474071740000,
      1474071802000,
      1474071864000,
      1474071928000,
      1474071989000,
      1474072051000,
      1474072115000,
      1474072180000,
      1474072203000,
      1474072203000,
      1474072208000
    ],
    histogram: [],
    enlargedHistogram: [],
    enlarged: true,
    isAnimating: false,
    fieldType: 'timestamp',
    gpu: true,
    gpuChannel: [0]
  };

  cmpFilters(t, expectedFilterTs, stateWidthTsFilter.filters[0]);

  const expectedDatasetSmoothie = {
    ...datasetSmoothie,
    // add filter prop to fields
    fields: datasetSmoothie.fields.map(f =>
      f.name === 'gps_data.utc_timestamp'
        ? {
            ...f,
            filterProps: {
              domain: [1474070995000, 1474072208000],
              step: 1000,
              mappedValue: expectedFilterTs.mappedValue,
              histogram: stateWidthTsFilter.filters[0].histogram,
              enlargedHistogram: stateWidthTsFilter.filters[0].enlargedHistogram,
              fieldType: 'timestamp',
              type: 'timeRange',
              enlarged: true,
              fixedDomain: true,
              value: [1474070995000, 1474072208000],
              gpu: true
            }
          }
        : f
    ),
    filterRecord: {
      dynamicDomain: [],
      fixedDomain: [stateWidthTsFilter.filters[0]],
      cpu: [],
      gpu: [stateWidthTsFilter.filters[0]]
    },
    gpuFilter: {
      filterRange: [
        [1474071425000 - 1474070995000, 1474071740000 - 1474070995000],
        [0, 0],
        [0, 0],
        [0, 0]
      ],
      filterValueUpdateTriggers: {
        gpuFilter_0: 'gps_data.utc_timestamp',
        gpuFilter_1: null,
        gpuFilter_2: null,
        gpuFilter_3: null
      },
      filterValueAccessor: {
        inputs: [{data: datasetSmoothie.allData[1], index: 1}],
        result: [61000, 0, 0, 0]
      }
    },
    // copy everything
    filteredIndex: datasetSmoothie.allData.map((d, i) => i),
    filteredIndexForDomain: datasetSmoothie.allData.map((d, i) => i)
  };

  // check filter by ts
  cmpDataset(t, expectedDatasetSmoothie, stateWidthTsFilter.datasets.smoothie);

  const stateWidthTsAndNameFilter = applyActions(reducer, stateWidthTsFilter, [
    // add ordinal filter
    {action: VisStateActions.addFilter, payload: ['smoothie']},

    // set ordinal filter name
    {
      action: VisStateActions.setFilter,
      payload: [1, 'name', 'date']
    },

    // set ordinal filter value
    {
      action: VisStateActions.setFilter,
      payload: [1, 'value', ['2016-09-24', '2016-10-10']]
    }
  ]);

  const expectedFilteredDataset = {
    ...stateWidthTsFilter.datasets.smoothie,
    fields: stateWidthTsFilter.datasets.smoothie.fields.map(f =>
      f.name === 'date'
        ? {
            ...f,
            filterProps: {
              domain: ['2016-09-23', '2016-09-24', '2016-10-10'],
              fieldType: 'date',
              type: 'multiSelect',
              value: [],
              gpu: false
            }
          }
        : f
    ),
    gpuFilter: {
      filterRange: [
        [1474071425000 - 1474070995000, 1474071740000 - 1474070995000],
        [0, 0],
        [0, 0],
        [0, 0]
      ],
      filterValueUpdateTriggers: {
        gpuFilter_0: 'gps_data.utc_timestamp',
        gpuFilter_1: null,
        gpuFilter_2: null,
        gpuFilter_3: null
      },
      filterValueAccessor: {
        inputs: [{data: datasetSmoothie.allData[1], index: 1}],
        result: [61000, 0, 0, 0]
      }
    },
    filterRecord: {
      dynamicDomain: [stateWidthTsAndNameFilter.filters[1]],
      fixedDomain: [stateWidthTsAndNameFilter.filters[0]],
      cpu: [stateWidthTsAndNameFilter.filters[1]],
      gpu: [stateWidthTsAndNameFilter.filters[0]]
    },
    filteredIndex: [7, 8, 9, 10, 11, 12, 17, 18, 19, 20, 21, 22],
    filteredIndexForDomain: [7, 8, 9, 10, 11, 12, 17, 18, 19, 20, 21, 22]
  };

  cmpDataset(t, expectedFilteredDataset, stateWidthTsAndNameFilter.datasets.smoothie);

  t.end();
});

test('#visStateReducer -> SET_FILTER_PLOT', t => {
  // get test data
  const {fields, rows} = processCsvData(testData);
  const payload = [
    {
      info: {
        id: 'smoothie',
        label: 'queen smoothie'
      },
      data: {fields, rows}
    }
  ];

  // receive data
  const initialState = reducer(INITIAL_VIS_STATE, VisStateActions.updateVisData(payload));

  // add filter
  const stateWithFilter = reducer(initialState, VisStateActions.addFilter('smoothie'));
  const filterId = stateWithFilter.filters[0].id;

  // set filter 'name' to timestamp field
  const stateWithFilterName = reducer(
    stateWithFilter,
    VisStateActions.setFilter(0, 'name', 'gps_data.utc_timestamp')
  );

  // find id which is an integer field
  const yAxisField = stateWithFilterName.datasets.smoothie.fields.find(f => f.id === 'id');

  // set filterPlot yAxis
  const stateWithFilterPlot = reducer(
    stateWithFilterName,
    VisStateActions.setFilterPlot(0, {yAxis: yAxisField})
  );

  const expectedFilterWName = {
    ...getDefaultFilter('smoothie'),
    freeze: true,
    fixedDomain: true,
    id: filterId,
    name: ['gps_data.utc_timestamp'],
    type: 'timeRange',
    fieldIdx: [0],
    domain: [1474070995000, 1474072208000],
    value: [1474070995000, 1474072208000],
    step: 1000,
    plotType: 'lineChart',
    yAxis: {
      type: 'integer',
      name: 'id',
      id: 'id',
      format: '',
      tableFieldIndex: 7,
      analyzerType: 'INT'
    },
    interval: null,
    lineChart: {
      series: [
        {x: 1474070995000, y: 1},
        {x: 1474071056000, y: 2},
        {x: 1474071116000, y: 3},
        {x: 1474071178000, y: 4},
        {x: 1474071240000, y: 5},
        {x: 1474071301000, y: 12124},
        {x: 1474071363000, y: 222},
        {x: 1474071425000, y: 345},
        {x: 1474071864000, y: 1},
        {x: 1474071989000, y: 43},
        {x: 1474072051000, y: 4},
        {x: 1474072115000, y: 5},
        {x: 1474072203000, y: 6},
        {x: 1474072203000, y: 7}
      ],
      yDomain: [1, 12124],
      xDomain: [1474070995000, 1474072203000]
    },
    speed: 1,
    mappedValue: [
      1474070995000,
      1474071056000,
      1474071116000,
      1474071178000,
      1474071240000,
      1474071301000,
      1474071363000,
      1474071425000,
      1474071489000,
      1474071552000,
      1474071567000,
      1474071614000,
      1474071677000,
      1474071740000,
      1474071802000,
      1474071864000,
      1474071928000,
      1474071989000,
      1474072051000,
      1474072115000,
      1474072180000,
      1474072203000,
      1474072203000,
      1474072208000
    ],
    histogram: [],
    enlargedHistogram: [],
    enlarged: true,
    isAnimating: false,
    fieldType: 'timestamp',
    gpu: true,
    gpuChannel: [0]
  };

  // test filter
  cmpFilters(t, expectedFilterWName, stateWithFilterPlot.filters[0]);
  t.end();
});

test('#visStateReducer -> TOGGLE_FILTER_ANIMATION', t => {
  const initialState = StateWFilters.visState;

  const nextState = reducer(initialState, VisStateActions.toggleFilterAnimation(0));
  t.equal(nextState.filters[0].isAnimating, true, 'should set filter to isAnimating: true');

  t.end();
});

test('#visStateReducer -> ENLARGE_FILTER', t => {
  const initialState = StateWFilters.visState;

  const nextState = reducer(initialState, VisStateActions.enlargeFilter(0));

  t.equal(nextState.filters[0].enlarged, false, 'should toggle time filter enlarged to be false');

  const nextState2 = reducer(nextState, VisStateActions.enlargeFilter(0));

  t.equal(nextState2.filters[0].enlarged, true, 'should toggle time filter enlarged to be true');

  t.end();
});

test('#visStateReducer -> REMOVE_DATASET', t => {
  const initialState = StateWFilters.visState;
  const nextState = reducer(initialState, VisStateActions.removeDataset('not_me'));

  t.equal(initialState, nextState, 'should return state if datasetKey doesnot exist');
  t.end();
});

test('#visStateReducer -> REMOVE_DATASET w filter and layer', t => {
  const oldState = StateWFilters.visState;

  const expectedState = {
    layers: [oldState.layers[1]],
    filters: [oldState.filters[1]],
    layerData: [oldState.layerData[1]],
    layerOrder: [0],
    datasets: {
      [testGeoJsonDataId]: oldState.datasets[testGeoJsonDataId]
    },
    interactionConfig: {
      tooltip: {
        id: 'tooltip',
        enabled: true,
        iconComponent: oldState.interactionConfig.tooltip.iconComponent,
        config: {
          fieldsToShow: {
            [testGeoJsonDataId]: ['OBJECTID', 'ZIP_CODE', 'ID', 'TRIPS', 'RATE']
          }
        }
      },
      brush: oldState.interactionConfig.brush,
      coordinate: oldState.interactionConfig.coordinate
    },
    editingDataset: oldState.editingDataset,
    layerBlending: oldState.layerBlending,
    hoverInfo: oldState.hoverInfo,
    clicked: oldState.clicked,
    mousePos: oldState.mousePos,
    splitMaps: oldState.splitMaps,
    layerClasses: oldState.layerClasses,
    animationConfig: oldState.animationConfig,
    initialState: [],
    layerToBeMerged: [],
    filterToBeMerged: [],
    splitMapsToBeMerged: [],
    interactionToBeMerged: [],
    editor: oldState.editor,
    mapInfo: {
      title: '',
      description: ''
    }
  };

  const newReducer = reducer(oldState, VisStateActions.removeDataset(testCsvDataId));

  t.deepEqual(
    Object.keys(newReducer).sort(),
    Object.keys(expectedState).sort(),
    `visState should have same keys`
  );
  Object.keys(expectedState).forEach(key => {
    t.deepEqual(newReducer[key], expectedState[key], `newReducer.${key} should be correct`);
  });

  t.end();
});

test('#visStateReducer -> SPLIT_MAP: TOGGLE', t => {
  const layer0 = new ArcLayer({id: 'a', dataId: 'puppy_0', isVisible: true});
  const layer1 = new ArcLayer({id: 'b', dataId: 'puppy_0', isVisible: false});

  const oldState = {
    layers: [layer0, layer1],
    splitMaps: []
  };

  const newReducer = reducer(oldState, MapStateActions.toggleSplitMap());

  t.deepEqual(
    newReducer.splitMaps,
    [
      {
        layers: {
          a: true
        }
      },
      {
        layers: {
          a: true
        }
      }
    ],
    'should split map'
  );

  t.end();
});

test('#visStateReducer -> SPLIT_MAP: REMOVE_LAYER', t => {
  const layer1 = new PointLayer({id: 'a'});
  const layer2 = new PointLayer({id: 'b'});
  const oldState = {
    layers: [layer1, layer2],
    layerData: [{data: 1}, {data: 2}],
    layerOrder: [1, 0],
    hoverInfo: {
      layer: {props: {id: 'b'}},
      picked: true
    },
    clicked: {
      layer: {props: {id: 'a'}},
      picked: true
    },
    splitMaps: [
      {
        layers: {
          a: true,
          b: true
        }
      },
      {
        layers: {
          a: true,
          b: true
        }
      }
    ],
    animationConfig: defaultAnimationConfig
  };

  const newReducer = reducer(oldState, VisStateActions.removeLayer(1));

  t.deepEqual(
    newReducer,
    {
      layers: [layer1],
      layerData: [{data: 1}],
      layerOrder: [0],
      hoverInfo: undefined,
      clicked: {
        layer: {props: {id: 'a'}},
        picked: true
      },
      splitMaps: [
        {
          layers: {
            a: true
          }
        },
        {
          layers: {
            a: true
          }
        }
      ],
      animationConfig: defaultAnimationConfig
    },
    'should remove layer and layerData in split mode'
  );

  t.end();
});

test('#visStateReducer -> SPLIT_MAP: REMOVE_LAYER', t => {
  const layer1 = new PointLayer({id: 'a'});
  const layer2 = new PointLayer({id: 'b'});
  const layer3 = new TripLayer({id: 't1', isVisible: true});
  const layer4 = new TripLayer({id: 't2', isVisible: true});

  layer3.updateAnimationDomain([1568502710000, 1568502960000]);
  layer4.updateAnimationDomain([1568502810000, 1568503060000]);

  const oldState = {
    layers: [layer1, layer2, layer3, layer4],
    layerData: [{data: 1}, {data: 2}, {data: 3}, {data: 4}],
    layerOrder: [1, 0, 2, 3],
    hoverInfo: null,
    clicked: null,
    splitMaps: [],
    animationConfig: {
      domain: [1568502710000, 1568503060000],
      currentTime: 1568502970000
    }
  };

  const newReducer = reducer(oldState, VisStateActions.removeLayer(2));
  const expectedAnimationConfig = {
    domain: [1568502810000, 1568503060000],
    currentTime: 1568502970000
  };

  t.deepEqual(
    newReducer.animationConfig,
    expectedAnimationConfig,
    'should remove animation layer and adjust animation domain'
  );

  const newReducer2 = reducer(oldState, VisStateActions.removeLayer(3));
  const expectedAnimationConfig2 = {
    domain: [1568502710000, 1568502960000],
    currentTime: 1568502710000
  };
  t.deepEqual(
    newReducer2.animationConfig,
    expectedAnimationConfig2,
    'should remove animation layer and adjust animation domain'
  );

  const newReducer3 = reducer(newReducer2, VisStateActions.removeLayer(2));
  t.deepEqual(
    newReducer3.animationConfig,
    defaultAnimationConfig,
    'remove last animation layer and set animation config to default'
  );

  t.end();
});

test('#visStateReducer -> SPLIT_MAP: REMOVE_DATASET', t => {
  const oldState = StateWSplitMaps.visState;

  const expectedState = {
    layers: [oldState.layers[0]],
    layerData: [oldState.layerData[0]],
    layerOrder: [0],
    datasets: {
      [testCsvDataId]: oldState.datasets[testCsvDataId]
    },
    filters: [],
    interactionConfig: {
      tooltip: {
        id: 'tooltip',
        enabled: true,
        iconComponent: oldState.interactionConfig.tooltip.iconComponent,
        config: {
          fieldsToShow: {
            [testCsvDataId]: [
              'gps_data.utc_timestamp',
              'gps_data.types',
              'epoch',
              'has_result',
              'id'
            ]
          }
        }
      },
      brush: oldState.interactionConfig.brush,
      coordinate: oldState.interactionConfig.coordinate
    },
    splitMaps: [{layers: {'point-0': false}}, {layers: {'point-0': true}}],
    editingDataset: oldState.editingDataset,
    layerBlending: oldState.layerBlending,
    hoverInfo: oldState.hoverInfo,
    clicked: oldState.clicked,
    mousePos: oldState.mousePos,
    layerClasses: oldState.layerClasses,
    animationConfig: defaultAnimationConfig,
    initialState: [],
    layerToBeMerged: [],
    filterToBeMerged: [],
    splitMapsToBeMerged: [],
    interactionToBeMerged: [],
    editor: oldState.editor,
    mapInfo: {
      title: '',
      description: ''
    }
  };

  const newReducer = reducer(oldState, VisStateActions.removeDataset(testGeoJsonDataId));

  t.deepEqual(
    Object.keys(newReducer).sort(),
    Object.keys(expectedState).sort(),
    `visState should have same keys`
  );
  Object.keys(expectedState).forEach(key => {
    t.deepEqual(newReducer[key], expectedState[key], `newReducer.${key} should be correct`);
  });

  t.end();
});

test('#visStateReducer -> SPLIT_MAP: ADD_LAYER', t => {
  const oldState = {
    datasets: {
      puppy: {
        data: mockData.data,
        fields: mockData.fields
      }
    },
    layers: [{id: 'existing_layer'}],
    layerData: [[{data: [1, 2, 3]}, {data: [4, 5, 6]}]],
    layerOrder: [0],
    splitMaps: [
      {
        layers: {
          existing_layer: true
        }
      },
      {
        layers: {
          existing_layer: true
        }
      }
    ]
  };

  const newReducer = reducer(oldState, VisStateActions.addLayer());

  t.equal(newReducer.layers[1].config.isVisible, true, 'newLayer visibility should be set to true');
  t.equal(
    newReducer.layers[1].config.isConfigActive,
    true,
    'newLayer isConfigActive should be set to true'
  );
  t.equal(newReducer.layers[1].config.dataId, 'puppy', 'newLayer dataId should be set to default');
  t.equal(newReducer.splitMaps.length, 2, 'newLayer was added into splitMaps layers');
  t.deepEqual(
    newReducer.splitMaps[0],
    {
      layers: {
        existing_layer: true,
        [newReducer.layers[1].id]: true
      }
    },
    'newLayer map meta data settings are correct'
  );
  t.deepEqual(
    newReducer.splitMaps[1],
    {
      layers: {
        existing_layer: true,
        [newReducer.layers[1].id]: true
      }
    },
    'newLayer map meta data settings are correct'
  );

  t.end();
});

test('#visStateReducer -> SPLIT_MAP: TOGGLE_SPLIT_MAP', t => {
  const layer0 = new ArcLayer({id: 'a', dataId: 'puppy_0', isVisible: true});
  const layer1 = new PointLayer({id: 'b', dataId: 'puppy_0', isVisible: true});

  const oldState = {
    layers: [layer0, layer1],
    splitMaps: [
      {
        layers: {
          a: true,
          b: true
        }
      },
      {
        layers: {
          a: true,
          b: false
        }
      }
    ]
  };

  const newReducer = reducer(oldState, MapStateActions.toggleSplitMap(0));

  t.equal(newReducer.layers.length, 2, 'should have 2 global layers');
  t.equal(
    newReducer.layers[0].config.isVisible,
    true,
    'global layer should have changed to reflect specific map meta info'
  );
  t.equal(
    newReducer.layers[1].config.isVisible,
    false,
    'global layer should have changed to reflect specific map meta info'
  );
  t.end();
});

test('#visStateReducer -> SPLIT_MAP: HIDE LAYER', t => {
  const oldState = {
    splitMaps: [
      {
        layers: {
          a: true,
          b: true
        }
      },
      {
        layers: {
          a: true,
          b: false
        }
      }
    ]
  };

  const newState = reducer(oldState, VisStateActions.toggleLayerForMap(1, 'a'));

  const expectedState = {
    splitMaps: [
      {
        layers: {
          a: true,
          b: true
        }
      },
      {
        layers: {
          a: false,
          b: false
        }
      }
    ]
  };

  t.deepEqual(newState.splitMaps, expectedState.splitMaps, 'should hide layer B in split map');

  t.end();
});

test('#visStateReducer -> UPDATE_ANIMATION_TIME', t => {
  const initialState = StateWTripGeojson;
  const newState = reducer(initialState, VisStateActions.updateAnimationTime(1000));

  t.equal(newState.animationConfig.currentTime, 1000, 'should update animation time');
  t.end();
});

test('#visStateReducer -> UPDATE_LAYER_ANIMATION_SPEED', t => {
  const initialState = StateWTripGeojson;
  const newState = reducer(initialState, VisStateActions.updateLayerAnimationSpeed(1.23));

  t.equal(newState.animationConfig.speed, 1.23, 'should update animation speed');

  t.end();
});

test('#visStateReducer -> INTERACTION_CONFIG_CHANGE', t => {
  const defaultInteractionConfig = getDefaultInteraction();

  const brushConfig = {
    ...defaultInteractionConfig.brush,
    enabled: true
  };

  const expectedConfig = {
    ...defaultInteractionConfig,
    brush: brushConfig,
    tooltip: {
      ...defaultInteractionConfig.tooltip,
      enabled: false
    }
  };

  const nextState = reducer(
    INITIAL_VIS_STATE,
    VisStateActions.interactionConfigChange(brushConfig)
  );

  t.deepEqual(nextState.interactionConfig, expectedConfig, 'should disable tooltip');

  t.end();
});

test('#visStateReducer -> SHOW_DATASET_TABLE', t => {
  const initialState = StateWFiles.visState;
  const nextState = reducer(initialState, VisStateActions.showDatasetTable('abc'));

  t.equal(nextState.editingDataset, 'abc', 'should set editingDataset');
  t.end();
});

test('#visStateReducer -> MAP_CLICK', t => {
  const initialState = StateWFiles.visState;
  const nextState = reducer(
    initialState,
    VisStateActions.onLayerClick({picked: true, object: 'he'})
  );

  t.deepEqual(
    nextState,
    {...nextState, clicked: {picked: true, object: 'he'}},
    'should set clicked'
  );

  const nextState2 = reducer(nextState, VisStateActions.onMapClick());

  t.equal(nextState2.clicked, null, 'should unset clicked');

  t.end();
});

test('#visStateReducer -> MOUSE_MOVE', t => {
  const defaultInteractionConfig = getDefaultInteraction();
  const initialState = StateWFiles.visState;
  const evt = {
    point: [10, 20],
    lngLat: [37, -122]
  };

  const nextState = reducer(initialState, VisStateActions.onMouseMove(evt));

  t.deepEqual(
    nextState.mousePos,
    {
      ...initialState.mousePos,
      mousePosition: [10, 20],
      coordinate: [37, -122]
    },
    'should set mousePos'
  );

  // disable tooltip
  const tooltipConfig = {
    ...defaultInteractionConfig.tooltip,
    enabled: false
  };

  const nextState1 = reducer(nextState, VisStateActions.interactionConfigChange(tooltipConfig));

  const nextState2 = reducer(
    nextState1,
    VisStateActions.onMouseMove({point: [1, 2], lngLat: [90, 90]})
  );

  t.deepEqual(
    nextState2.mousePos,
    {
      ...initialState.mousePos,
      mousePosition: [10, 20],
      coordinate: [37, -122]
    },
    'should not set mousePos'
  );

  t.end();
});

test('#visStateReducer -> LAYER_COLOR_UI_CHANGE. show dropdown', t => {
  const initialState = CloneDeep(StateWFilesFiltersLayerColor.visState);
  const pointLayer = initialState.layers[0];

  const oldColorRange = CloneDeep(pointLayer.config.visConfig.colorRange);
  // show dropdown
  const nextState = reducer(
    initialState,
    VisStateActions.layerColorUIChange(pointLayer, 'color', {
      showDropdown: 0
    })
  );

  const expectedColorUI = {
    color: {
      ...DEFAULT_COLOR_UI,
      showDropdown: 0
    },
    colorRange: DEFAULT_COLOR_UI
  };

  t.deepEqual(
    nextState.layers[0].config.colorUI,
    expectedColorUI,
    'should update colorUI.showDropdown'
  );
  t.deepEqual(
    nextState.layers[0].config.visConfig.colorRange,
    oldColorRange,
    'should not change colorRange'
  );

  const nextState1 = reducer(
    nextState,
    VisStateActions.layerColorUIChange(pointLayer, 'color', {
      showDropdown: false
    })
  );
  t.deepEqual(
    nextState1.layers[0].config.colorUI,
    {color: DEFAULT_COLOR_UI, colorRange: DEFAULT_COLOR_UI},
    'should update colorUI.showDropdown'
  );

  const nextState2 = reducer(
    nextState1,
    VisStateActions.layerColorUIChange(pointLayer, 'colorRange', {
      showDropdown: 0
    })
  );

  const expectedColorUI2 = {
    color: DEFAULT_COLOR_UI,
    colorRange: {
      ...DEFAULT_COLOR_UI,
      showDropdown: 0,
      colorRangeConfig: {
        type: 'all',
        steps: 4,
        reversed: false,
        custom: false
      }
    }
  };
  t.deepEqual(
    nextState2.layers[0].config.colorUI,
    expectedColorUI2,
    'should update colorUI.showDropdown, set colorRangeConfig step and reversed'
  );

  t.end();
});

// eslint-disable-next-line max-statements
test('#visStateReducer -> LAYER_COLOR_UI_CHANGE. colorRangeConfig.step', t => {
  const initialState = CloneDeep(StateWFilesFiltersLayerColor.visState);
  const pointLayer = initialState.layers[0];

  const oldColorRange = CloneDeep(pointLayer.config.visConfig.colorRange);

  t.equal(oldColorRange.colors.length, 4, 'old color range should have 4 colors');
  // show dropdown
  const prepareState = reducer(
    initialState,
    VisStateActions.layerColorUIChange(pointLayer, 'colorRange', {
      showDropdown: 0
    })
  );

  // set color range steps
  const nextState = reducer(
    prepareState,
    VisStateActions.layerColorUIChange(pointLayer, 'colorRange', {
      colorRangeConfig: {steps: 6}
    })
  );

  const expectedColorUI = {
    color: DEFAULT_COLOR_UI,
    colorRange: {
      ...DEFAULT_COLOR_UI,
      showDropdown: 0,
      colorRangeConfig: {
        type: 'all',
        steps: 6,
        reversed: false,
        custom: false
      }
    }
  };

  const expectedColorRange = {
    name: 'Uber Viz Sequential 4',
    type: 'sequential',
    category: 'Uber',
    colors: ['#E6FAFA', '#C1E5E6', '#9DD0D4', '#75BBC1', '#4BA7AF', '#00939C']
  };
  t.deepEqual(
    nextState.layers[0].config.colorUI,
    expectedColorUI,
    'should update colorUI.colorRangeConfig.steps'
  );
  t.deepEqual(
    nextState.layers[0].config.visConfig.colorRange,
    expectedColorRange,
    'should update visConfig.colorRange based on step'
  );

  // set color range reverse
  const nextState2 = reducer(
    nextState,
    VisStateActions.layerColorUIChange(nextState.layers[0], 'colorRange', {
      colorRangeConfig: {reversed: true}
    })
  );

  const expectedColorUI2 = {
    color: DEFAULT_COLOR_UI,
    colorRange: {
      ...DEFAULT_COLOR_UI,
      showDropdown: 0,
      colorRangeConfig: {
        type: 'all',
        steps: 6,
        reversed: true,
        custom: false
      }
    }
  };

  const expectedColorRange2 = {
    name: 'Uber Viz Sequential 4',
    type: 'sequential',
    category: 'Uber',
    colors: ['#00939C', '#4BA7AF', '#75BBC1', '#9DD0D4', '#C1E5E6', '#E6FAFA'],
    reversed: true
  };

  t.deepEqual(
    nextState2.layers[0].config.colorUI,
    expectedColorUI2,
    'should update colorUI.colorRangeConfig.reversed'
  );
  t.deepEqual(
    nextState2.layers[0].config.visConfig.colorRange,
    expectedColorRange2,
    'should update visConfig.colorRange based on reversed'
  );

  // update step when reversed is true
  const nextState3 = reducer(
    nextState,
    VisStateActions.layerColorUIChange(nextState2.layers[0], 'colorRange', {
      colorRangeConfig: {steps: 8}
    })
  );

  const expectedColorUI3 = {
    color: DEFAULT_COLOR_UI,
    colorRange: {
      ...DEFAULT_COLOR_UI,
      showDropdown: 0,
      colorRangeConfig: {
        type: 'all',
        steps: 8,
        reversed: true,
        custom: false
      }
    }
  };

  const expectedColorRange3 = {
    name: 'Uber Viz Sequential 6',
    type: 'sequential',
    category: 'Uber',
    colors: [
      '#E6FAFA',
      '#C1E5E6',
      '#9DD0D4',
      '#75BBC1',
      '#4BA7AF',
      '#00939C',
      '#108188',
      '#0E7077'
    ].reverse(),
    reversed: true
  };

  t.deepEqual(
    nextState3.layers[0].config.colorUI,
    expectedColorUI3,
    'should update colorUI.colorRangeConfig.steps'
  );
  t.deepEqual(
    nextState3.layers[0].config.visConfig.colorRange,
    expectedColorRange3,
    'should update visConfig.colorRange based on match and set reversed'
  );

  // set to a step that has no match
  const nextState4 = reducer(
    nextState,
    VisStateActions.layerColorUIChange(nextState3.layers[0], 'colorRange', {
      colorRangeConfig: {steps: 11}
    })
  );

  const expectedColorUI4 = {
    color: DEFAULT_COLOR_UI,
    colorRange: {
      ...DEFAULT_COLOR_UI,
      showDropdown: 0,
      colorRangeConfig: {
        type: 'all',
        steps: 11,
        reversed: true,
        custom: false
      }
    }
  };
  t.deepEqual(
    nextState4.layers[0].config.colorUI,
    expectedColorUI4,
    'should update colorUI.colorRangeConfig to step 11'
  );
  t.deepEqual(
    nextState4.layers[0].config.visConfig.colorRange,
    expectedColorRange3,
    'should note update visConfig.colorRange when no match'
  );

  t.end();
});

test('#visStateReducer -> LAYER_COLOR_UI_CHANGE. custom Palette', t => {
  const initialState = CloneDeep(StateWFilesFiltersLayerColor.visState);
  const pointLayer = initialState.layers[0];

  const oldColorRange = CloneDeep(pointLayer.config.visConfig.colorRange);
  // show dropdown
  const prepareState = reducer(
    initialState,
    VisStateActions.layerColorUIChange(pointLayer, 'colorRange', {
      showDropdown: 0
    })
  );

  // enable custom
  const nextState = reducer(
    prepareState,
    VisStateActions.layerColorUIChange(pointLayer, 'colorRange', {
      colorRangeConfig: {custom: true}
    })
  );

  const expectedColorUI = {
    color: DEFAULT_COLOR_UI,
    colorRange: {
      ...DEFAULT_COLOR_UI,
      customPalette: {
        name: 'Custom Palette',
        type: 'custom',
        category: 'Custom',
        colors: oldColorRange.colors
      },
      showDropdown: 0,
      colorRangeConfig: {
        type: 'all',
        steps: 4,
        reversed: false,
        custom: true
      }
    }
  };

  t.deepEqual(
    nextState.layers[0].config.colorUI,
    expectedColorUI,
    'should update colorUI.customPalette with current colorRange colors'
  );

  const nextState2 = reducer(
    prepareState,
    VisStateActions.layerColorUIChange(pointLayer, 'colorRange', {
      customPalette: {colors: ['aaa', 'bbb', 'ccc']}
    })
  );

  const expectedColorUI2 = {
    color: DEFAULT_COLOR_UI,
    colorRange: {
      ...DEFAULT_COLOR_UI,
      customPalette: {
        name: 'Custom Palette',
        type: 'custom',
        category: 'Custom',
        colors: ['aaa', 'bbb', 'ccc']
      },
      showDropdown: 0,
      colorRangeConfig: {
        type: 'all',
        steps: 4,
        reversed: false,
        custom: true
      }
    }
  };

  t.deepEqual(
    nextState2.layers[0].config.colorUI,
    expectedColorUI2,
    'should update colorUI.customPalette colors'
  );

  // show sketcher
  const nextState3 = reducer(
    nextState2,
    VisStateActions.layerColorUIChange(pointLayer, 'colorRange', {
      showSketcher: 1
    })
  );

  const expectedColorUI3 = {
    color: DEFAULT_COLOR_UI,
    colorRange: {
      showSketcher: 1,
      customPalette: {
        name: 'Custom Palette',
        type: 'custom',
        category: 'Custom',
        colors: ['aaa', 'bbb', 'ccc']
      },
      showDropdown: 0,
      colorRangeConfig: {
        type: 'all',
        steps: 4,
        reversed: false,
        custom: true
      }
    }
  };

  t.deepEqual(nextState3.layers[0].config.colorUI, expectedColorUI3, 'should set showSketcher: 1');

  // edit color
  const nextState4 = reducer(
    nextState3,
    VisStateActions.layerColorUIChange(pointLayer, 'colorRange', {
      customPalette: {
        colors: ['bbb', 'ccc', 'aaa']
      }
    })
  );

  const expectedColorUI4 = {
    color: DEFAULT_COLOR_UI,
    colorRange: {
      showSketcher: 1,
      customPalette: {
        name: 'Custom Palette',
        type: 'custom',
        category: 'Custom',
        colors: ['bbb', 'ccc', 'aaa']
      },
      showDropdown: 0,
      colorRangeConfig: {
        type: 'all',
        steps: 4,
        reversed: false,
        custom: true
      }
    }
  };

  t.deepEqual(
    nextState4.layers[0].config.colorUI,
    expectedColorUI4,
    'should update colorUI.customPalette colors'
  );

  // apply color
  const nextState5 = reducer(
    nextState4,
    VisStateActions.layerVisConfigChange(nextState4.layers[0], {
      colorRange: {
        name: 'Custom Palette',
        type: 'custom',
        category: 'Custom',
        colors: ['bbb', 'ccc', 'aaa']
      }
    })
  );

  // close custom palette
  const nextState6 = reducer(
    nextState5,
    VisStateActions.layerColorUIChange(nextState5.layers[0], 'colorRange', {
      colorRangeConfig: {
        custom: false
      }
    })
  );

  const expectedColorUI6 = {
    color: DEFAULT_COLOR_UI,
    colorRange: {
      showSketcher: 1,
      // keep the customPalette
      customPalette: {
        name: 'Custom Palette',
        type: 'custom',
        category: 'Custom',
        colors: ['bbb', 'ccc', 'aaa']
      },
      showDropdown: 0,
      colorRangeConfig: {
        type: 'all',
        steps: 4,
        reversed: false,
        custom: false
      }
    }
  };

  t.deepEqual(
    nextState6.layers[0].config.colorUI,
    expectedColorUI6,
    'should set colorRangeConfig.custom false'
  );

  t.deepEqual(
    nextState6.layers[0].config.visConfig.colorRange,
    {
      name: 'Custom Palette',
      type: 'custom',
      category: 'Custom',
      colors: ['bbb', 'ccc', 'aaa']
    },
    'should set visConfig.colorRange'
  );

  // open it again
  const nextState7 = reducer(
    nextState6,
    VisStateActions.layerColorUIChange(pointLayer, 'colorRange', {
      colorRangeConfig: {
        custom: true
      }
    })
  );

  const expectedColorUI7 = {
    color: DEFAULT_COLOR_UI,
    colorRange: {
      showSketcher: 1,
      // keep the customPalette
      customPalette: {
        name: 'Custom Palette',
        type: 'custom',
        category: 'Custom',
        colors: ['bbb', 'ccc', 'aaa']
      },
      showDropdown: 0,
      colorRangeConfig: {
        type: 'all',
        steps: 4,
        reversed: false,
        custom: true
      }
    }
  };

  t.deepEqual(
    nextState7.layers[0].config.colorUI,
    expectedColorUI7,
    'should set colorRangeConfig.custom true'
  );
  t.end();
});

test('#visStateReducer -> setFeatures/delete', t => {
  const expectedFeatures = [mockPolygonFeature];
  let newReducer = reducer(INITIAL_VIS_STATE, VisStateActions.setFeatures([mockPolygonFeature]));

  t.deepEqual(newReducer.editor.features, expectedFeatures, 'should add new feature');

  newReducer = reducer(newReducer, VisStateActions.deleteFeature(mockPolygonFeature));

  t.deepEqual(newReducer.editor.features, [], 'Should not have features');

  t.end();
});

test('#visStateReducer -> POLYGON: Add/Remove new polygon feature', t => {
  const expectedFeatures = [mockPolygonFeature];
  let newReducer = reducer(INITIAL_VIS_STATE, VisStateActions.setFeatures([mockPolygonFeature]));

  t.deepEqual(newReducer.editor.features, expectedFeatures, 'should add new feature');

  newReducer = reducer(newReducer, VisStateActions.setSelectedFeature(mockPolygonFeature));

  const updatedFeature = {
    ...mockPolygonFeature,
    geometry: {
      ...mockPolygonFeature.geometry,
      coordinates: [
        [
          [12.0, 30.0],
          [12.0, 36.0],
          [12.5, 36.0],
          [12.0, 30.0]
        ]
      ]
    }
  };

  newReducer = reducer(newReducer, VisStateActions.setFeatures([updatedFeature]));

  t.deepEqual(
    newReducer.editor.selectedFeature.id,
    mockPolygonFeature.id,
    'should set selected feature'
  );

  newReducer = reducer(newReducer, VisStateActions.deleteFeature(mockPolygonFeature));

  t.deepEqual(
    newReducer.editor,
    {
      features: [],
      selectedFeature: null,
      visible: true,
      mode: 'EDIT_VERTEX'
    },
    'Should remove existing feature and set selected feature to null'
  );

  t.end();
});

/* eslint-disable max-statements */
test('#visStateReducer -> POLYGON: Create polygon filter', t => {
  const state = {
    ...INITIAL_VIS_STATE
  };

  const datasets = [
    {
      data: {
        fields: [
          {
            name: 'start_point_lat',
            format: '',
            tableFieldIndex: 1,
            type: 'real',
            analyzerType: 'FLOAT'
          },
          {
            name: 'start_point_lng',
            format: '',
            tableFieldIndex: 2,
            type: 'real',
            analyzerType: 'FLOAT'
          },
          {
            name: 'end_point_lat',
            format: '',
            tableFieldIndex: 3,
            type: 'real',
            analyzerType: 'FLOAT'
          },
          {
            name: 'end_point_lng',
            format: '',
            tableFieldIndex: 4,
            type: 'real',
            analyzerType: 'FLOAT'
          }
        ],
        rows: mockPolygonData.data
      },
      info: {
        label: 'test.csv',
        size: 144
      }
    }
  ];

  const options = {
    centerMap: true,
    keepExistingConfig: false
  };

  // visStateUpdateVisDataUpdater - creates 4 layers
  let newReducer = reducer(state, VisStateActions.updateVisData(datasets, options, {}));

  // add new polygon feature
  newReducer = reducer(newReducer, VisStateActions.setFeatures([mockPolygonFeature]));

  // set selected feature
  newReducer = reducer(newReducer, VisStateActions.setSelectedFeature(mockPolygonFeature));

  // set it as filter
  newReducer = reducer(
    newReducer,
    VisStateActions.setPolygonFilterLayer(newReducer.layers[0], mockPolygonFeature)
  );

  const newFilter = newReducer.filters[0];

  const firstDataset = Object.keys(newReducer.datasets)[0];
  const expectedFilter = {
    id: newFilter.id,
    dataId: [firstDataset],
    freeze: false,
    fixedDomain: true,
    enlarged: false,
    isAnimating: false,
    speed: 1,
    name: [],
    type: 'polygon',
    fieldIdx: [],
    domain: null,
    value: {
      ...mockPolygonFeature,
      properties: {
        ...mockPolygonFeature.properties,
        isVisible: true,
        filterId: newFilter.id
      }
    },
    plotType: 'histogram',
    yAxis: null,
    interval: null,
    layerId: [newReducer.layers[0].id],
    gpu: false
  };

  t.deepEqual(newFilter, expectedFilter, 'Should have created a polygon filter');

  t.equal(newReducer.layerData[0].data.length, 2, 'Layer Point 1 should only show 2 points');

  t.equal(newReducer.layerData[1].data.length, 2, 'Layer Point 2 should only show 2 points');

  const filterFeature = newReducer.filters[0].value;

  // set polygon filter for the second layer
  newReducer = reducer(
    newReducer,
    VisStateActions.setPolygonFilterLayer(newReducer.layers[1], filterFeature)
  );

  t.equal(newReducer.filters.length, 1, 'Should still have 1 polygon filter');

  t.equal(newReducer.filters[0].layerId.length, 2, 'Should have two values in filter.layerId');

  t.equal(newReducer.layerData[0].data.length, 0, 'Layer Point 1 should show 0 points');

  t.equal(newReducer.layerData[1].data.length, 0, 'Layer Point 2 show show 0 points');

  // Adding a new dataset - creates extra 4 layers
  newReducer = reducer(newReducer, VisStateActions.updateVisData(datasets, options, {}));

  t.equal(newReducer.layerData[4].data.length, 4, 'Layer Point 5 should full data');

  // Set polygon for a different dataset layer
  newReducer = reducer(
    newReducer,
    VisStateActions.setPolygonFilterLayer(newReducer.layers[4], filterFeature)
  );

  t.equal(newReducer.filters[0].layerId.length, 3, 'Should 3 values in filter.layerId');

  t.equal(newReducer.filters[0].dataId.length, 2, 'Should have two values in filter.dataId');

  t.equal(newReducer.layerData[4].data.length, 2, 'Layer Point 5 should 2 points because filtered');

  // Remove second layer from filter
  newReducer = reducer(
    newReducer,
    VisStateActions.setPolygonFilterLayer(newReducer.layers[1], filterFeature)
  );

  t.equal(newReducer.filters[0].layerId.length, 2, 'Should 3 values in filter.layerId');

  t.equal(newReducer.filters[0].dataId.length, 2, 'Should have two values in filter.dataId');

  t.equal(
    newReducer.layerData[0].data.length,
    2,
    'Layer Point 1 show 2 points because we removed layer 2'
  );

  t.equal(newReducer.layerData[4].data.length, 2, 'Layer Point 5 should 2 points because filtered');

  t.equal(
    newReducer.layerData[2].data.length,
    2,
    'Layer Point 2 should still show 2 filters because layer 1 is still filtered'
  );

  t.end();
});
/* eslint-enable max-statements */

test('#visStateReducer -> POLYGON: Toggle filter feature', t => {
  const state = {
    ...INITIAL_VIS_STATE,
    datasets: {
      puppy: {
        data: mockPolygonData.data,
        allData: mockPolygonData.data,
        fields: mockPolygonData.fields
      },
      cat: {
        data: mockPolygonData.data,
        allData: mockPolygonData.data,
        fields: mockPolygonData.fields
      }
    }
  };

  let newReducer = reducer(state, VisStateActions.addLayer());

  t.equal(newReducer.layers.length, 1, 'Should have created a new layer');

  // add new polygon feature
  newReducer = reducer(newReducer, VisStateActions.setFeatures([mockPolygonFeature]));

  // set selected feature
  newReducer = reducer(newReducer, VisStateActions.setSelectedFeature(mockPolygonFeature));

  // set it as filter
  newReducer = reducer(
    newReducer,
    VisStateActions.setPolygonFilterLayer(newReducer.layers[0], mockPolygonFeature)
  );

  const newFilter = newReducer.filters[0];

  const expectedFilter = {
    id: newFilter.id,
    dataId: ['puppy'],
    freeze: false,
    fixedDomain: true,
    enlarged: false,
    isAnimating: false,
    speed: 1,
    name: [],
    type: 'polygon',
    fieldIdx: [],
    domain: null,
    value: {
      ...mockPolygonFeature,
      properties: {
        ...mockPolygonFeature.properties,
        isVisible: true,
        filterId: newFilter.id
      }
    },
    plotType: 'histogram',
    yAxis: null,
    interval: null,
    layerId: [newReducer.layers[0].id],
    gpu: false
  };

  t.deepEqual(newFilter, expectedFilter, 'Should have created a polygon filter');

  let filterFeature = newReducer.filters[0].value;

  t.deepEqual(
    filterFeature.properties.isVisible,
    true,
    'Should have feature visibility set to true'
  );

  newReducer = reducer(newReducer, VisStateActions.toggleFilterFeature(0));

  filterFeature = newReducer.filters[0].value;

  t.deepEqual(filterFeature.properties.isVisible, false, 'Should hide filter feature');

  t.end();
});

test('#visStateReducer -> POLYGON: delete polygon filter', t => {
  const state = {
    ...INITIAL_VIS_STATE,
    datasets: {
      puppy: {
        data: mockData.data,
        allData: mockData.data,
        fields: mockData.fields
      }
    },
    layers: [],
    layerData: []
  };

  let newReducer = reducer(state, VisStateActions.addLayer());

  t.equal(newReducer.layers.length, 1, 'Should have created a new layer');

  // add new polygon feature
  newReducer = reducer(newReducer, VisStateActions.setFeatures([mockPolygonFeature]));

  // set selected feature
  newReducer = reducer(newReducer, VisStateActions.setSelectedFeature(mockPolygonFeature));

  // set it as filter
  newReducer = reducer(
    newReducer,
    VisStateActions.setPolygonFilterLayer(newReducer.layers[0], mockPolygonFeature)
  );

  // Update filters using setFilter
  newReducer = reducer(newReducer, VisStateActions.setFilter(0, 'layerId', []));

  t.deepEqual(newReducer.filters[0].layerId, [], 'Should have removed layers from filter');

  t.deepEqual(newReducer.filters[0].dataId, [], 'Should have removed datasets from filter');

  // unset it as filter
  newReducer = reducer(newReducer, VisStateActions.removeFilter(0));

  t.deepEqual(newReducer.filters, [], 'Should have removed the created polygon filter');

  // deleting the filter will also delete the feature
  t.deepEqual(newReducer.editor.features.length, 0, 'Should have removed the feature');

  t.end();
});

test('#uiStateReducer -> SET_EDITOR_MODE', t => {
  const newState = reducer(INITIAL_VIS_STATE, VisStateActions.setEditorMode(EDITOR_MODES.EDIT));

  t.equal(newState.editor.mode, EDITOR_MODES.EDIT, 'Editor mode should be set to vertex');

  t.end();
});

test('#uiStateReducer -> TOGGLE_EDITOR_VISIBILITY', t => {
  let newState = reducer(INITIAL_VIS_STATE, VisStateActions.toggleEditorVisibility());

  t.equal(newState.editor.visible, false, 'Should set editor visibility to false');

  newState = reducer(newState, VisStateActions.toggleEditorVisibility());

  t.equal(newState.editor.visible, true, 'Should set editor visibility to true');

  t.end();
});

test('#uiStateReducer -> SET_FEATURES/SET_SELECTED_FEATURE/DELETE_FEATURE', t => {
  let newState = reducer(INITIAL_VIS_STATE, VisStateActions.setFeatures([]));

  t.deepEqual(
    newState,
    INITIAL_VIS_STATE,
    'Editor should not have features and return the same state'
  );

  newState = reducer(
    INITIAL_VIS_STATE,
    VisStateActions.setFeatures([
      {
        ...mockPolygonFeature,
        properties: {
          ...mockPolygonFeature.properties,
          isClosed: false
        }
      }
    ])
  );

  t.equal(
    newState.editor.mode,
    INITIAL_VIS_STATE.editor.mode,
    'Editor mode should not change because feature is not closed'
  );

  newState = reducer(
    newState,
    VisStateActions.setFeatures([
      {
        ...mockPolygonFeature,
        properties: {
          ...mockPolygonFeature.properties,
          isClosed: false
        }
      },
      mockPolygonFeature
    ])
  );

  t.equal(newState.editor.mode, EDITOR_MODES.EDIT, 'Editor mode should be set to edit_vertex');
  t.end();
});

test('#visStateReducer -> APPLY_CPU_FILTER. no filter', t => {
  const initialState = CloneDeep(StateWFiles.visState);
  const dataId = testCsvDataId;
  const previousDataset = initialState.datasets[dataId];

  const nextState = reducer(initialState, VisStateActions.applyCPUFilter(dataId));

  const expectedDataset = {
    ...previousDataset,
    filteredIdxCPU: previousDataset.allIndexes,
    filterRecordCPU: {
      dynamicDomain: [],
      fixedDomain: [],
      cpu: [],
      gpu: []
    }
  };

  cmpDataset(t, expectedDataset, nextState.datasets[dataId]);
  t.end();
});

test('#visStateReducer -> APPLY_CPU_FILTER. has gpu filter', t => {
  const initialState = CloneDeep(StateWFilters.visState);
  // dataset has gpu filter
  const dataId = testCsvDataId;
  const previousDataset = initialState.datasets[dataId];
  const gpuFilter = initialState.filters[0];

  const nextState = reducer(initialState, VisStateActions.applyCPUFilter(dataId));

  const expectedDataset = {
    ...previousDataset,
    filteredIdxCPU: [5, 6, 9, 10, 13, 14, 16, 17, 18, 19, 20, 21, 22, 23],
    filterRecordCPU: {
      dynamicDomain: [],
      fixedDomain: [gpuFilter],
      cpu: [gpuFilter],
      gpu: []
    }
  };

  cmpDataset(t, expectedDataset, nextState.datasets[dataId]);

  // calling it again
  const nextState2 = reducer(nextState, VisStateActions.applyCPUFilter(dataId));

  t.equal(
    nextState.datasets[dataId].filteredIdxCPU,
    nextState2.datasets[dataId].filteredIdxCPU,
    'should directly copy filter result when filter hasnot changed'
  );
  t.end();
});

test('#visStateReducer -> APPLY_CPU_FILTER. has cpu filter', t => {
  const initialState = CloneDeep(StateWFilters.visState);
  // dataset has gpu filter
  const dataId = testGeoJsonDataId;
  const previousDataset2 = initialState.datasets[dataId];
  const ordinalFilter = initialState.filters[1];

  const nextState = reducer(initialState, VisStateActions.applyCPUFilter(dataId));

  const expectedDataset = {
    ...previousDataset2,
    filteredIdxCPU: [0],
    filterRecordCPU: {
      dynamicDomain: [],
      fixedDomain: [ordinalFilter],
      cpu: [ordinalFilter],
      gpu: []
    }
  };

  cmpDataset(t, expectedDataset, nextState.datasets[dataId]);

  const nextState2 = reducer(nextState, VisStateActions.applyCPUFilter(dataId));

  t.equal(
    nextState.datasets[dataId].filteredIdxCPU,
    nextState2.datasets[dataId].filteredIdxCPU,
    'should directly copy filter result when filter hasnot changed'
  );

  t.end();
});

test('#uiStateReducer -> SET_FEATURES/SET_SELECTED_FEATURE/DELETE_FEATURE', t => {
  let newState = reducer(INITIAL_VIS_STATE, VisStateActions.setFeatures([]));

  t.deepEqual(
    newState,
    INITIAL_VIS_STATE,
    'Editor should not have features and return the same state'
  );

  newState = reducer(
    INITIAL_VIS_STATE,
    VisStateActions.setFeatures([
      {
        ...mockPolygonFeature,
        properties: {
          ...mockPolygonFeature.properties,
          isClosed: false
        }
      }
    ])
  );

  t.equal(
    newState.editor.mode,
    INITIAL_VIS_STATE.editor.mode,
    'Editor mode should not change because feature is not closed'
  );

  newState = reducer(
    newState,
    VisStateActions.setFeatures([
      {
        ...mockPolygonFeature,
        properties: {
          ...mockPolygonFeature.properties,
          isClosed: false
        }
      },
      mockPolygonFeature
    ])
  );

  t.equal(newState.editor.mode, EDITOR_MODES.EDIT, 'Editor mode should be set to edit_vertex');
  t.end();
});

test('#visStateReducer -> APPLY_CPU_FILTER. has multi datasets', t => {
  const initialState = CloneDeep(StateWFilters.visState);
  const previousDataset1 = initialState.datasets[testCsvDataId];
  const previousDataset2 = initialState.datasets[testGeoJsonDataId];
  const gpuFilter = initialState.filters[0];
  const ordinalFilter = initialState.filters[1];

  const nextState = reducer(
    initialState,
    VisStateActions.applyCPUFilter([testCsvDataId, testGeoJsonDataId])
  );

  const expectedDataset1 = {
    ...previousDataset1,
    filteredIdxCPU: [5, 6, 9, 10, 13, 14, 16, 17, 18, 19, 20, 21, 22, 23],
    filterRecordCPU: {
      dynamicDomain: [],
      fixedDomain: [gpuFilter],
      cpu: [gpuFilter],
      gpu: []
    }
  };

  const expectedDataset2 = {
    ...previousDataset2,
    filteredIdxCPU: [0],
    filterRecordCPU: {
      dynamicDomain: [],
      fixedDomain: [ordinalFilter],
      cpu: [ordinalFilter],
      gpu: []
    }
  };

  const expectedDatasets = {
    [testCsvDataId]: expectedDataset1,
    [testGeoJsonDataId]: expectedDataset2
  };

  cmpDatasets(t, expectedDatasets, nextState.datasets);

  t.end();
});

/* eslint-disable max-statements */
test('#visStateReducer -> multi dataset filter', t => {
  const state = {
    ...INITIAL_VIS_STATE
  };

  const fields = [
    {
      name: 'start_point_lat',
      format: '',
      tableFieldIndex: 1,
      type: 'real',
      analyzerType: 'FLOAT'
    },
    {
      name: 'start_point_lng',
      format: '',
      tableFieldIndex: 2,
      type: 'real',
      analyzerType: 'FLOAT'
    },
    {
      name: 'end_point_lat',
      format: '',
      tableFieldIndex: 3,
      type: 'real',
      analyzerType: 'FLOAT'
    },
    {
      name: 'end_point_lng',
      format: '',
      tableFieldIndex: 4,
      type: 'real',
      analyzerType: 'FLOAT'
    }
  ];

  const datasets = [
    {
      data: {
        fields,
        rows: mockPolygonData.data
      },
      info: {
        id: 'puppy',
        label: 'test1.csv',
        size: 144
      }
    },
    {
      data: {
        fields,
        rows: mockPolygonSecondData
      },
      info: {
        id: 'cat',
        label: 'test2.csv',
        size: 144
      }
    }
  ];

  const options = {
    centerMap: true,
    keepExistingConfig: false
  };

  // Add all datasets and creates 8 layers
  let newState = reducer(state, VisStateActions.updateVisData(datasets, options, {}));

  newState = reducer(newState, VisStateActions.addFilter('puppy'));

  // set filter name for puppy
  newState = reducer(newState, VisStateActions.setFilter(0, 'name', 'start_point_lat'));

  t.deepEqual(
    newState.filters[0].domain,
    [12.25, 14.25],
    'Should display the correct domain for first dataset'
  );

  // add a new dataId value, does not change domain of the filter
  // because we haven't set a name value according to the new dataId value
  newState = reducer(newState, VisStateActions.setFilter(0, 'dataId', ['puppy']));

  t.equal(
    newState.filters[0].domain,
    null,
    'Should create a new filter because we are passing a an array'
  );

  // re-set filter name for puppy
  newState = reducer(newState, VisStateActions.setFilter(0, 'name', 'start_point_lat'));

  t.deepEqual(
    newState.filters[0].domain,
    [12.25, 14.25],
    'Should display the correct domain for first dataset after  resetting name'
  );

  newState = reducer(newState, VisStateActions.setFilter(0, 'value', [12.25, 13]));

  t.deepEqual(
    newState.datasets.puppy.filteredIndexForDomain,
    [0, 1],
    'Should filter puppy dataset correctly'
  );

  t.deepEqual(
    newState.datasets.cat.filteredIndexForDomain,
    [0, 1, 2, 3],
    'Should not filter cat dataset correctly'
  );

  newState = reducer(newState, VisStateActions.setFilter(0, 'dataId', 'cat'));

  t.deepEqual(newState.filters[0].dataId, ['puppy', 'cat'], 'Should set the correct dataId values');

  t.deepEqual(
    newState.datasets.puppy.filteredIndexForDomain,
    [0, 1],
    'Puppy filteredIndexForDomain should not change'
  );

  // set filter name for cat
  newState = reducer(newState, VisStateActions.setFilter(0, 'name', 'start_point_lat', 1));

  t.deepEqual(
    newState.filters[0].name,
    ['start_point_lat', 'start_point_lat'],
    'Should provide the correct filter name with two values'
  );

  t.deepEqual(
    newState.filters[0].domain,
    [11.25, 18.25],
    'Should display the correct domain after applying the filter to the second dataset'
  );

  t.deepEqual(
    newState.datasets.puppy.filteredIndexForDomain,
    [0, 1],
    'Should not change the first dataset filtered index value'
  );

  t.deepEqual(
    newState.datasets.cat.filteredIndexForDomain,
    [],
    'Should provide the  correct filteredIndexForDomain value for second dataset'
  );

  // reset filter name
  newState = reducer(newState, VisStateActions.setFilter(0, 'name', ['start_point_lat']));

  t.deepEqual(
    newState.filters[0].domain,
    [12.25, 14.25],
    'Should display the correct domain for first dataset after resetting name'
  );

  t.deepEqual(
    newState.datasets.puppy.filteredIndexForDomain,
    [0, 1],
    'Should filter puppy dataset correctly'
  );

  t.deepEqual(
    newState.datasets.cat.filteredIndexForDomain,
    [0, 1, 2, 3],
    'Should not filter cat dataset'
  );

  // // TODO: non existing dataId
  // newState = reducer(newState, VisStateActions.setFilter(0, 'dataId', 'start_point_lat'));

  t.end();
});
/* eslint-enable max-statements */
