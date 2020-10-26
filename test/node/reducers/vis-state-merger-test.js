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
import cloneDeep from 'lodash.clonedeep';

import {
  mergeFilters,
  mergeLayers,
  mergeInteractions,
  mergeLayerBlending,
  mergeSplitMaps,
  insertLayerAtRightOrder
} from 'reducers/vis-state-merger';

import SchemaManager from 'schemas';
import visStateReducer from 'reducers/vis-state';
import coreReducer from 'reducers/core';
import {updateVisData} from 'actions/vis-state-actions';
import {receiveMapConfig, addDataToMap} from 'actions/actions';
import {getDefaultInteraction} from 'utils/interaction-utils';
import {processKeplerglJSON} from 'processors/data-processor';

// fixtures
import {
  savedStateV0,
  mergedFilters as mergedFiltersV0,
  mergedLayers as mergedLayersV0,
  mergedInteractions as mergedInteractionsV0
} from 'test/fixtures/state-saved-v0';

import {
  savedStateV1,
  mergedFilters as mergedFiltersV1,
  mergedLayers as mergedLayersV1,
  mergedInteraction as MergedInteractionV1
} from 'test/fixtures/state-saved-v1-1';

import {
  savedStateV1 as savedStateV1Split,
  mergedLayers as mergedLayersV1Split,
  mergedSplitMaps as mergedSplitMapsV1
} from 'test/fixtures/state-saved-v1-3';

import {
  stateSavedV1 as savedStateV1Label,
  mergedLayers as mergedLayersV1Label
} from 'test/fixtures/state-saved-v1-4';

import {
  savedStateV1TripGeoJson,
  mergedLayer0 as mergedTripLayer
} from 'test/fixtures/state-saved-v1-5';

import {savedStateV1InteractionCoordinate} from 'test/fixtures/state-saved-v1-7';

import {savedStateWIthNonValidFilters as NonValidFilterState} from 'test/fixtures/state-saved-v1-6';

import {polygonFilterMap} from 'test/fixtures/polygon-filter-map';

// helpers
import {cmpFilters, cmpLayers, cmpDatasets} from 'test/helpers/comparison-utils';

// mock app state
import {
  InitialState,
  StateWFilters,
  StateWMultiFilters,
  StateWFilesFiltersLayerColor,
  StateWSplitMaps,
  testCsvDataId,
  testGeoJsonDataId
} from 'test/helpers/mock-state';

import {
  testFields,
  testAllData,
  timeFilterProps,
  dateFilterProps,
  epochFilterProps,
  mergedTimeFilter,
  mergedDateFilter,
  mergedEpochFilter
} from 'test/fixtures/test-csv-data';

import {
  fields,
  datasetAllData as testGeoJsonAllData,
  geoJsonRateFilterProps,
  geoJsonTripFilterProps,
  mergedTripFilter,
  mergedRateFilter
} from 'test/fixtures/geojson';

test('VisStateMerger.v0 -> mergeFilters -> toEmptyState', t => {
  const savedConfig = cloneDeep(savedStateV0);
  const oldState = cloneDeep(InitialState);
  const oldVisState = oldState.visState;

  const parsedConfig = SchemaManager.parseSavedConfig(savedConfig.config, oldState);
  const parsedFilters = parsedConfig.visState.filters;
  const mergedState = mergeFilters(oldState.visState, parsedFilters);

  Object.keys(oldVisState).forEach(key => {
    if (key === 'filterToBeMerged') {
      t.deepEqual(
        mergedState.filterToBeMerged,
        parsedFilters,
        'Should save filters to filterToBeMerged before data loaded'
      );
    } else {
      t.deepEqual(mergedState[key], oldVisState[key], 'Should keep the rest of state same');
    }
  });

  const parsedData = SchemaManager.parseSavedData(savedConfig.datasets);

  // load data into reducer
  const stateWData = visStateReducer(mergedState, updateVisData(parsedData));

  // test parsed filters
  cmpFilters(t, mergedFiltersV0, stateWData.filters);

  t.end();
});

test('VisStateMerger.v1 -> mergeFilters -> toEmptyState', t => {
  const savedConfig = cloneDeep(savedStateV1);
  const oldState = cloneDeep(InitialState);
  const oldVisState = oldState.visState;
  const expectedMergedFilterV1 = mergedFiltersV1;

  const parsedConfig = SchemaManager.parseSavedConfig(savedConfig.config, oldState);
  const parsedFilters = parsedConfig.visState.filters;

  const mergedState = mergeFilters(oldState.visState, parsedFilters);
  Object.keys(oldVisState).forEach(key => {
    if (key === 'filterToBeMerged') {
      t.deepEqual(
        mergedState.filterToBeMerged,
        parsedFilters,
        'Should save filters to filterToBeMerged before data loaded'
      );
    } else {
      t.deepEqual(mergedState[key], oldVisState[key], 'Should keep the rest of state same');
    }
  });

  const parsedData = SchemaManager.parseSavedData(savedConfig.datasets);

  // load data into reducer
  const stateWData = visStateReducer(mergedState, updateVisData(parsedData));

  // test parsed filters
  cmpFilters(t, expectedMergedFilterV1, stateWData.filters);
  t.end();
});

test('VisStateMerger.v0 -> mergeFilters -> toWorkingState', t => {
  const savedConfig = cloneDeep(savedStateV0);
  const oldState = cloneDeep(StateWFilters);

  const oldVisState = oldState.visState;
  const oldFilters = [...oldState.visState.filters];

  const parsedConfig = SchemaManager.parseSavedConfig(savedConfig.config, oldState);
  const parsedFilters = parsedConfig.visState.filters;

  const mergedState = mergeFilters(oldState.visState, parsedFilters);

  Object.keys(oldVisState).forEach(key => {
    if (key === 'filterToBeMerged') {
      t.deepEqual(
        mergedState.filterToBeMerged,
        parsedFilters,
        'Should save filters to filterToBeMerged before data loaded'
      );
    } else {
      t.deepEqual(mergedState[key], oldVisState[key], 'Should keep the rest of state same');
    }
  });

  const parsedData = SchemaManager.parseSavedData(savedConfig.datasets);

  // load data into reducer
  const stateWData = visStateReducer(mergedState, updateVisData(parsedData));

  // test parsed filters
  cmpFilters(t, [...oldFilters, ...mergedFiltersV0], stateWData.filters);
  t.deepEqual(stateWData.filterToBeMerged, [], 'should clear up filterToBeMerged');

  // should filter data
  t.end();
});

test('VisStateMerger.v1 -> mergeFilters -> toWorkingState', t => {
  const savedConfig = cloneDeep(savedStateV1);
  const oldState = cloneDeep(StateWFilters);

  const oldVisState = oldState.visState;
  const oldFilters = [...oldState.visState.filters];

  const parsedConfig = SchemaManager.parseSavedConfig(savedConfig.config, oldState);
  const parsedFilters = parsedConfig.visState.filters;

  const mergedState = mergeFilters(oldState.visState, parsedFilters);

  Object.keys(oldVisState).forEach(key => {
    if (key === 'filterToBeMerged') {
      t.deepEqual(
        mergedState.filterToBeMerged,
        parsedFilters,
        'Should save filters to filterToBeMerged before data loaded'
      );
    } else {
      t.deepEqual(mergedState[key], oldVisState[key], 'Should keep the rest of state same');
    }
  });

  const parsedData = SchemaManager.parseSavedData(savedConfig.datasets);

  // load data into reducer
  const stateWData = visStateReducer(mergedState, updateVisData(parsedData));

  // test parsed filters
  cmpFilters(t, [...oldFilters, ...mergedFiltersV1], stateWData.filters);
  t.deepEqual(stateWData.filterToBeMerged, [], 'should clear up filterToBeMerged');

  // should filter data
  t.end();
});

test('VisStateMerger -> mergeLayers -> invalid layer config', t => {
  const oldState = cloneDeep(InitialState);
  const oldVisState = oldState.visState;

  const layers = [
    {id: 'abc'},
    {type: 'taro'}, // no type
    {type: 'point', id: 'yes'} // no config
  ];
  const mergedState = mergeLayers(oldVisState, layers, true);

  t.equal(mergedState.layers, oldVisState.layers, 'merge invalid layer should not error');
  t.deepEqual(mergedState.layerToBeMerged, layers, 'layerToBeMerged should contain invalid layers');
  t.end();
});

test('VisStateMerger.current -> mergeLayers -> toEmptyState', t => {
  const stateToSave = cloneDeep(StateWFilesFiltersLayerColor);
  const appStateToSave = SchemaManager.save(stateToSave);
  const configToSave = appStateToSave.config;
  const configParsed = SchemaManager.parseSavedConfig(configToSave);
  const oldState = cloneDeep(InitialState);
  const oldVisState = oldState.visState;

  const parsedLayers = configParsed.visState.layers;
  // mergeLayers
  const mergedState = mergeLayers(oldState.visState, parsedLayers, true);

  Object.keys(oldVisState).forEach(key => {
    if (key === 'layerToBeMerged') {
      t.deepEqual(
        mergedState.layerToBeMerged,
        parsedLayers,
        'Should save layers to layerToBeMerged before data loaded'
      );
    } else {
      t.deepEqual(mergedState[key], oldVisState[key], 'Should keep the rest of state same');
    }
  });
  const parsedData = SchemaManager.parseSavedData(appStateToSave.datasets);

  // load data into reducer
  const stateWData = visStateReducer(mergedState, updateVisData(parsedData));

  // test parsed layers
  const genericLayersByOrder = stateToSave.visState.layerOrder.map(
    idx => stateToSave.visState.layers[idx]
  );

  cmpLayers(t, genericLayersByOrder, stateWData.layers, {id: true});
  t.end();
});

test('visStateMerger -> mergeLayer -> imcremental load', t => {
  const stateToSave = cloneDeep(StateWFilesFiltersLayerColor);
  const appStateToSave = SchemaManager.save(stateToSave);
  const {datasets, config} = appStateToSave;

  const [dataset1, dataset2] = datasets;
  // load config first
  const stateWithConfig = coreReducer(stateToSave, addDataToMap({config}));

  t.deepEqual(
    stateWithConfig.visState.preserveLayerOrder,
    ['hexagon-2', 'point-0', 'geojson-1'],
    'shoud preserve layer order'
  );

  t.deepEqual(
    stateWithConfig.visState.layerToBeMerged.map(l => l.id),
    ['hexagon-2', 'point-0', 'geojson-1'],
    'should save to layerToBeMerged'
  );

  // load dataset2
  const parsedData2 = SchemaManager.parseSavedData([dataset2]);
  const stateWithData2 = coreReducer(stateWithConfig, addDataToMap({datasets: parsedData2}));
  t.deepEqual(
    stateWithData2.visState.preserveLayerOrder,
    ['hexagon-2', 'point-0', 'geojson-1'],
    'shoud preserve layer order'
  );

  t.deepEqual(
    stateWithData2.visState.layers.map(l => l.id),
    ['geojson-1'],
    'shoud load geojeon layer'
  );

  t.deepEqual(stateWithData2.visState.layerOrder, [0], 'layerOrder should be correct');
  t.deepEqual(
    stateWithData2.visState.layerToBeMerged.map(l => l.id),
    ['hexagon-2', 'point-0'],
    'should save to layerToBeMerged'
  );

  // load dataset1
  const parsedData1 = SchemaManager.parseSavedData([dataset1]);
  const stateWithData1 = coreReducer(stateWithData2, addDataToMap({datasets: parsedData1}));
  t.deepEqual(
    stateWithData1.visState.preserveLayerOrder,
    ['hexagon-2', 'point-0', 'geojson-1'],
    'shoud preserve layer order'
  );
  t.deepEqual(
    stateWithData1.visState.layers.map(l => l.id),
    ['geojson-1', 'hexagon-2', 'point-0'],
    'shoud load 2 layers'
  );
  t.deepEqual(stateWithData1.visState.layerOrder, [1, 2, 0], 'layerOrder should be correct');
  t.deepEqual(
    stateWithData1.visState.layerToBeMerged.map(l => l.id),
    [],
    'layerToBeMerged should be empty'
  );

  t.end();
});

test('VisStateMerger.v1 -> mergeLayers -> toEmptyState', t => {
  const savedConfig = cloneDeep(savedStateV1);
  const parsedConfig = SchemaManager.parseSavedConfig(savedConfig.config);

  const oldState = cloneDeep(InitialState);
  const oldVisState = oldState.visState;

  const parsedLayers = parsedConfig.visState.layers;

  // mergeLayers
  const mergedState = mergeLayers(oldState.visState, parsedLayers, true);

  Object.keys(oldVisState).forEach(key => {
    if (key === 'layerToBeMerged') {
      t.deepEqual(
        mergedState.layerToBeMerged,
        parsedLayers,
        'Should save layers to layerToBeMerged before data loaded'
      );
    } else {
      t.deepEqual(mergedState[key], oldVisState[key], 'Should keep the rest of state same');
    }
  });
  const parsedData = SchemaManager.parseSavedData(savedStateV1.datasets);

  // load data into reducer
  const stateWData = visStateReducer(mergedState, updateVisData(parsedData));

  // test parsed layers
  cmpLayers(t, mergedLayersV1, stateWData.layers, {id: true, color: true});
  t.end();
});

test('VisStateMerger.v1.label -> mergeLayers -> toEmptyState', t => {
  const savedConfig = cloneDeep(savedStateV1Label);
  const parsedConfig = SchemaManager.parseSavedConfig(savedConfig.config);

  const oldState = cloneDeep(InitialState);
  const oldVisState = oldState.visState;

  const parsedLayers = parsedConfig.visState.layers;

  // mergeLayers
  const mergedState = mergeLayers(oldState.visState, parsedLayers, true);

  Object.keys(oldVisState).forEach(key => {
    if (key === 'layerToBeMerged') {
      t.deepEqual(
        mergedState.layerToBeMerged,
        parsedLayers,
        'Should save layers to layerToBeMerged before data loaded'
      );
    } else {
      t.deepEqual(mergedState[key], oldVisState[key], 'Should keep the rest of state same');
    }
  });
  const parsedData = SchemaManager.parseSavedData(savedStateV1Label.datasets);

  // load data into reducer
  const stateWData = visStateReducer(mergedState, updateVisData(parsedData));

  // test parsed layers
  cmpLayers(t, mergedLayersV1Label, stateWData.layers, {id: true});
  t.end();
});

test('VisStateMerger.v1.split -> mergeLayers -> toEmptyState', t => {
  const savedConfig = cloneDeep(savedStateV1Split);
  const parsedConfig = SchemaManager.parseSavedConfig(savedConfig.config);
  const expectedConfig = mergedSplitMapsV1;
  const oldState = cloneDeep(InitialState);

  const oldVisState = oldState.visState;

  const parsedLayers = parsedConfig.visState.layers;

  // merge State
  const mergedState = visStateReducer(oldVisState, receiveMapConfig(parsedConfig));

  Object.keys(oldVisState).forEach(key => {
    if (key === 'layerToBeMerged') {
      t.deepEqual(
        mergedState.layerToBeMerged,
        parsedLayers,
        'Should save layers to layerToBeMerged before data loaded'
      );
    } else if (key === 'splitMaps') {
      t.deepEqual(mergedState.splitMaps, [], 'Should wait to merge splitMaps');
    } else if (key === 'splitMapsToBeMerged') {
      t.deepEqual(
        mergedState.splitMapsToBeMerged,
        expectedConfig,
        'Should save to splitMapsToBeMerged'
      );
    } else if (key === 'interactionToBeMerged') {
      t.deepEqual(
        mergedState.interactionToBeMerged,
        {tooltip: parsedConfig.visState.interactionConfig.tooltip},
        'Should save interactionConfig to interactionToBeMerged'
      );
    } else {
      t.deepEqual(mergedState[key], oldVisState[key], `Should keep ${key} the same`);
    }
  });

  const parsedData = SchemaManager.parseSavedData(savedConfig.datasets);

  // load data into reducer
  const stateWData = visStateReducer(mergedState, updateVisData(parsedData));

  // test split Maps
  t.deepEqual(stateWData.splitMaps, expectedConfig, 'should merge splitMaps');

  // test parsed layers
  cmpLayers(t, mergedLayersV1Split, stateWData.layers, {id: true});
  t.end();
});

test('VisStateMerger.v0 -> mergeLayers -> toWorkingState', t => {
  const savedConfig = cloneDeep(savedStateV0);
  const parsedConfig = SchemaManager.parseSavedConfig(savedConfig.config);

  const oldState = cloneDeep(StateWFilesFiltersLayerColor);
  const oldVisState = oldState.visState;
  const oldLayers = [...oldVisState.layers];

  const parsedLayers = parsedConfig.visState.layers;

  // mergeLayers
  const mergedState = mergeLayers(oldState.visState, parsedLayers, true);

  Object.keys(oldVisState).forEach(key => {
    if (key === 'layerToBeMerged') {
      t.deepEqual(
        mergedState.layerToBeMerged,
        parsedLayers,
        'Should save layers to layerToBeMerged before data loaded'
      );
    } else {
      t.deepEqual(mergedState[key], oldVisState[key], 'Should keep the rest of state same');
    }
  });

  const parsedData = SchemaManager.parseSavedData(savedConfig.datasets);

  // load data into reducer
  const stateWData = visStateReducer(mergedState, updateVisData(parsedData));

  // test parsed layers
  cmpLayers(t, [...oldLayers, ...mergedLayersV0], stateWData.layers);

  t.deepEqual(
    stateWData.layerOrder,
    [3, 4, 5, 6, 7, 2, 0, 1],
    'should put new layers on top of old ones'
  );
  t.deepEqual(stateWData.layerToBeMerged, [], 'should clean up layer to be merged');
  t.equal(stateWData.layerData.length, 8, 'should calculate layer data');

  t.end();
});

test('VisStateMerger.v1 -> mergeLayers -> toWorkingState', t => {
  const savedConfig = cloneDeep(savedStateV1);
  const parsedConfig = SchemaManager.parseSavedConfig(savedConfig.config);

  const oldState = cloneDeep(StateWFilesFiltersLayerColor);
  const oldVisState = oldState.visState;
  const oldLayers = [...oldVisState.layers];

  const parsedLayers = parsedConfig.visState.layers;

  // mergeLayers
  const mergedState = mergeLayers(oldState.visState, parsedLayers, true);

  Object.keys(oldVisState).forEach(key => {
    if (key === 'layerToBeMerged') {
      t.deepEqual(
        mergedState.layerToBeMerged,
        parsedLayers,
        'Should save layers to layerToBeMerged before data loaded'
      );
    } else {
      t.deepEqual(mergedState[key], oldVisState[key], 'Should keep the rest of state same');
    }
  });

  const parsedData = SchemaManager.parseSavedData(savedConfig.datasets);

  // load data into reducer
  const stateWData = visStateReducer(mergedState, updateVisData(parsedData));

  // test parsed filters
  cmpLayers(t, [...oldLayers, ...mergedLayersV1], stateWData.layers);

  t.deepEqual(stateWData.layerOrder, [3, 4, 2, 0, 1], 'should put new layers on top of old ones');
  t.deepEqual(stateWData.layerToBeMerged, [], 'should clean up layer to be merged');
  t.equal(stateWData.layerData.length, 5, 'should calculate layer data');

  t.end();
});

test('VisStateMerger.v0 -> mergeInteractions -> toEmptyState', t => {
  const savedConfig = cloneDeep(savedStateV0);
  const oldState = cloneDeep(InitialState);
  const oldVisState = oldState.visState;

  const parsedConfig = SchemaManager.parseSavedConfig(savedConfig.config, oldState);
  const parsedInteraction = parsedConfig.visState.interactionConfig;

  // merge interactions
  const mergedState = mergeInteractions(oldState.visState, parsedInteraction);

  Object.keys(oldVisState).forEach(key => {
    if (key === 'interactionToBeMerged') {
      t.deepEqual(
        mergedState.interactionToBeMerged,
        {
          tooltip: {
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
            },
            enabled: true
          }
        },
        'Should save interactions to interactionToBeMerged before data loaded'
      );
    } else if (key === 'interactionConfig') {
      t.deepEqual(
        mergedState.interactionConfig,
        oldState.visState.interactionConfig,
        'Should disable interaction: null'
      );
    } else {
      t.deepEqual(mergedState[key], oldVisState[key], 'Should keep the rest of state same');
    }
  });

  const parsedData = SchemaManager.parseSavedData(savedConfig.datasets);

  // load data into reducer
  const stateWData = visStateReducer(mergedState, updateVisData(parsedData));

  // test parsed interactions
  t.deepEqual(stateWData.interactionConfig, mergedInteractionsV0, 'should merge interactionConfig');
  t.deepEqual(stateWData.interactionToBeMerged, {}, 'should clear interaction');

  t.end();
});

test('VisStateMerger.v0 -> mergeInteractions -> toWorkingState', t => {
  const savedConfig = cloneDeep(savedStateV0);
  const oldState = cloneDeep(StateWFilesFiltersLayerColor);
  const oldVisState = oldState.visState;

  // add random items to interactionToBeMerged
  oldVisState.interactionToBeMerged = {
    ...oldVisState.interactionToBeMerged,
    tooltip: {
      fieldsToShow: {
        milkshake: [
          {
            name: 'have',
            format: null
          },
          {
            name: 'a',
            format: null
          },
          {
            name: 'good',
            format: null
          },
          {
            name: 'day',
            format: null
          }
        ]
      }
    }
  };

  const parsedConfig = SchemaManager.parseSavedConfig(savedConfig.config, oldState);

  const parsedInteraction = parsedConfig.visState.interactionConfig;

  // merge interactions
  const mergedState = mergeInteractions(oldState.visState, parsedInteraction);

  const expectedInteractionToBeMerged = {
    tooltip: {
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
      },
      enabled: true
    }
  };

  Object.keys(oldVisState).forEach(key => {
    if (key === 'interactionToBeMerged') {
      t.deepEqual(
        mergedState.interactionToBeMerged,
        expectedInteractionToBeMerged,
        'Should save interactions to interactionToBeMerged before data loaded'
      );
    } else {
      t.deepEqual(mergedState[key], oldVisState[key], 'Should keep the rest of state same');
    }
  });

  const parsedData = SchemaManager.parseSavedData(savedConfig.datasets);

  // load data into reducer
  const stateWData = visStateReducer(mergedState, updateVisData(parsedData));
  const defaultInteraction = getDefaultInteraction();

  const expectedInteractions = {
    ...defaultInteraction,
    tooltip: {
      ...defaultInteraction.tooltip,
      enabled: true,
      config: {
        compareMode: false,
        compareType: 'absolute',
        fieldsToShow: {
          [testCsvDataId]: [
            {
              name: 'gps_data.utc_timestamp',
              format: null
            },
            {
              name: 'gps_data.types',
              format: null
            },
            {
              name: 'epoch',
              format: null
            },
            {
              name: 'has_result',
              format: null
            },
            {
              name: 'id',
              format: null
            }
          ],
          [testGeoJsonDataId]: [
            {
              name: 'OBJECTID',
              format: null
            },
            {
              name: 'ZIP_CODE',
              format: null
            },
            {
              name: 'ID',
              format: null
            },
            {
              name: 'TRIPS',
              format: null
            },
            {
              name: 'RATE',
              format: null
            }
          ],
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

  // test parsed interactions
  t.deepEqual(stateWData.interactionConfig, expectedInteractions, 'should merge interactionconfig');
  t.deepEqual(stateWData.interactionToBeMerged, {}, 'should clear interaction');

  t.end();
});

test('VisStateMerger.v1 -> mergeInteractions -> toEmptyState', t => {
  const savedConfig = cloneDeep(savedStateV1);
  const oldState = cloneDeep(InitialState);
  const oldVisState = oldState.visState;

  const parsedConfig = SchemaManager.parseSavedConfig(savedConfig.config, oldState);
  const parsedInteraction = parsedConfig.visState.interactionConfig;

  // merge interactions
  const mergedState = mergeInteractions(oldState.visState, parsedInteraction);
  const defaultInteraction = getDefaultInteraction();

  Object.keys(oldVisState).forEach(key => {
    if (key === 'interactionToBeMerged') {
      t.deepEqual(
        mergedState.interactionToBeMerged,
        {
          tooltip: {
            fieldsToShow: {
              a5ybmwl2d: [
                {
                  name: 'a_zip',
                  format: null
                },
                {
                  name: 'str_type',
                  format: null
                },
                {
                  name: 'int_type',
                  format: null
                }
              ]
            },
            enabled: false
          }
        },
        'Should save nothing interactions to interactionToBeMerged before data loaded'
      );
    } else if (key === 'interactionConfig') {
      t.deepEqual(
        mergedState.interactionConfig,
        {
          ...defaultInteraction,
          tooltip: {
            ...defaultInteraction.tooltip,
            enabled: false,
            config: {
              fieldsToShow: {},
              compareMode: false,
              compareType: 'absolute'
            }
          },
          brush: {
            ...defaultInteraction.brush,
            enabled: false,
            config: {
              size: 1
            }
          }
        },
        'Should disable tooltip'
      );
    } else {
      t.deepEqual(mergedState[key], oldVisState[key], 'Should keep the rest of state same');
    }
  });

  const parsedData = SchemaManager.parseSavedData(savedConfig.datasets);

  // load data into reducer
  const stateWData = visStateReducer(mergedState, updateVisData(parsedData));

  // test parsed interactions
  t.deepEqual(stateWData.interactionConfig, MergedInteractionV1, 'should merge interactionConfig');
  t.deepEqual(stateWData.interactionToBeMerged, {}, 'should clear interaction');

  t.end();
});

test('VisStateMerger.v1 -> mergeInteractions -> toWorkingState', t => {
  const savedConfig = cloneDeep(savedStateV1);
  const oldState = cloneDeep(StateWFilesFiltersLayerColor);
  const oldVisState = oldState.visState;

  // add random items to interactionToBeMerged
  oldVisState.interactionToBeMerged = {
    ...oldVisState.interactionToBeMerged,
    tooltip: {
      fieldsToShow: {
        milkshake: [
          {
            name: 'have',
            format: null
          },
          {
            name: 'a',
            format: null
          },
          {
            name: 'good',
            format: null
          },
          {
            name: 'day',
            format: null
          }
        ]
      }
    }
  };

  const parsedConfig = SchemaManager.parseSavedConfig(savedConfig.config, oldState);

  const parsedInteraction = parsedConfig.visState.interactionConfig;

  // merge interactions
  const mergedState = mergeInteractions(oldState.visState, parsedInteraction);
  const defaultInteraction = getDefaultInteraction();

  const expectedInteractionToBeMerged = {
    tooltip: {
      fieldsToShow: {
        a5ybmwl2d: [
          {
            name: 'a_zip',
            format: null
          },
          {
            name: 'str_type',
            format: null
          },
          {
            name: 'int_type',
            format: null
          }
        ]
      },
      enabled: false
    }
  };

  Object.keys(oldVisState).forEach(key => {
    if (key === 'interactionToBeMerged') {
      t.deepEqual(
        mergedState.interactionToBeMerged,
        expectedInteractionToBeMerged,
        'Should save interactions to interactionToBeMerged before data loaded'
      );
    } else if (key === 'interactionConfig') {
      t.deepEqual(
        mergedState.interactionConfig,
        {
          ...defaultInteraction,
          tooltip: {
            ...defaultInteraction.tooltip,
            enabled: false,
            config: {
              compareMode: false,
              compareType: 'absolute',
              fieldsToShow: {
                [testCsvDataId]: [
                  {
                    name: 'gps_data.utc_timestamp',
                    format: null
                  },
                  {
                    name: 'gps_data.types',
                    format: null
                  },
                  {
                    name: 'epoch',
                    format: null
                  },
                  {
                    name: 'has_result',
                    format: null
                  },
                  {
                    name: 'id',
                    format: null
                  }
                ],
                [testGeoJsonDataId]: [
                  {
                    name: 'OBJECTID',
                    format: null
                  },
                  {
                    name: 'ZIP_CODE',
                    format: null
                  },
                  {
                    name: 'ID',
                    format: null
                  },
                  {
                    name: 'TRIPS',
                    format: null
                  },
                  {
                    name: 'RATE',
                    format: null
                  }
                ]
              }
            }
          },

          brush: {
            ...defaultInteraction.brush,
            enabled: false,
            config: {
              size: 1
            }
          },

          coordinate: {
            ...defaultInteraction.coordinate,
            enabled: false
          }
        },
        'Should disable interaction: null'
      );
    } else {
      t.deepEqual(mergedState[key], oldVisState[key], 'Should keep the rest of state same');
    }
  });

  const parsedData = SchemaManager.parseSavedData(savedConfig.datasets);

  // load data into reducer
  const stateWData = visStateReducer(mergedState, updateVisData(parsedData));

  const expectedInteractions = {
    ...defaultInteraction,
    tooltip: {
      ...defaultInteraction.tooltip,
      enabled: false,
      config: {
        compareMode: false,
        compareType: 'absolute',
        fieldsToShow: {
          [testCsvDataId]: [
            {
              name: 'gps_data.utc_timestamp',
              format: null
            },
            {
              name: 'gps_data.types',
              format: null
            },
            {
              name: 'epoch',
              format: null
            },
            {
              name: 'has_result',
              format: null
            },
            {
              name: 'id',
              format: null
            }
          ],
          [testGeoJsonDataId]: [
            {
              name: 'OBJECTID',
              format: null
            },
            {
              name: 'ZIP_CODE',
              format: null
            },
            {
              name: 'ID',
              format: null
            },
            {
              name: 'TRIPS',
              format: null
            },
            {
              name: 'RATE',
              format: null
            }
          ],
          a5ybmwl2d: [
            {
              name: 'a_zip',
              format: null
            },
            {
              name: 'str_type',
              format: null
            },
            {
              name: 'int_type',
              format: null
            }
          ]
        }
      }
    },
    brush: {
      ...defaultInteraction.brush,
      enabled: false,
      config: {size: 1}
    }
  };

  // test parsed interactions
  t.deepEqual(stateWData.interactionConfig, expectedInteractions, 'should merge interactionConfig');
  t.deepEqual(stateWData.interactionToBeMerged, {}, 'should clear interaction');

  t.end();
});

test('VisStateMerger.v1 -> mergeInteractions -> coordinate', t => {
  const savedConfig = cloneDeep(savedStateV1InteractionCoordinate);
  const oldState = cloneDeep(InitialState);
  const oldVisState = oldState.visState;

  const parsedConfig = SchemaManager.parseSavedConfig(savedConfig.config, oldState);

  const parsedInteraction = parsedConfig.visState.interactionConfig;

  // merge interactions
  const mergedState = mergeInteractions(oldState.visState, parsedInteraction);
  const defaultInteraction = getDefaultInteraction();

  const expectedInteractionToBeMerged = {};

  Object.keys(oldVisState).forEach(key => {
    if (key === 'interactionToBeMerged') {
      t.deepEqual(
        mergedState.interactionToBeMerged,
        expectedInteractionToBeMerged,
        'Should save interactions to interactionToBeMerged before data loaded'
      );
    } else if (key === 'interactionConfig') {
      t.deepEqual(
        mergedState.interactionConfig,
        {
          ...defaultInteraction,

          tooltip: {
            ...defaultInteraction.tooltip,
            enabled: false
          },

          brush: {
            ...defaultInteraction.brush,
            config: {
              size: 1
            }
          },

          coordinate: {
            ...defaultInteraction.coordinate,
            enabled: true
          }
        },
        'Should disable interaction: null'
      );
    } else {
      t.deepEqual(mergedState[key], oldVisState[key], 'Should keep the rest of state same');
    }
  });

  const parsedData = SchemaManager.parseSavedData(savedConfig.datasets);

  // load data into reducer
  const stateWData = visStateReducer(mergedState, updateVisData(parsedData));

  const expectedInteractions = {
    ...defaultInteraction,
    tooltip: {
      ...defaultInteraction.tooltip,
      enabled: false,
      config: {
        compareMode: false,
        compareType: 'absolute',
        fieldsToShow: {
          a5ybmwl2d: [
            {
              name: 'a_zip',
              format: null
            },
            {
              name: 'zip_area',
              format: null
            },
            {
              name: 'avg_number',
              format: null
            },
            {
              name: 'str_type',
              format: null
            },
            {
              name: 'int_type',
              format: null
            }
          ]
        }
      }
    },
    brush: {
      ...defaultInteraction.brush,
      enabled: false,
      config: {size: 1}
    },
    coordinate: {
      ...defaultInteraction.coordinate,
      enabled: true
    }
  };

  // test parsed interactions
  t.deepEqual(stateWData.interactionConfig, expectedInteractions, 'should merge interactionConfig');

  t.deepEqual(stateWData.interactionToBeMerged, {}, 'should clear interaction');

  t.end();
});

test('VisStateMerger - mergeLayerBlending', t => {
  const preState = {
    layerBlending: 'additive'
  };

  t.deepEqual(
    mergeLayerBlending(preState, 'normal'),
    {layerBlending: 'normal'},
    'should merge layerBlending'
  );
  t.deepEqual(
    mergeLayerBlending(preState, undefined),
    {layerBlending: 'additive'},
    'should merge layerBlending'
  );
  t.deepEqual(
    mergeLayerBlending(preState, 'not_exist'),
    {layerBlending: 'additive'},
    'should merge layerBlending'
  );
  t.deepEqual(
    mergeLayerBlending(preState, null),
    {layerBlending: 'additive'},
    'should merge layerBlending'
  );

  t.end();
});

test('VisStateMerger - mergeSplitMaps -> split to split', t => {
  // state with splitMaps
  const oldState = cloneDeep(StateWSplitMaps).visState;
  // saved config with splitMaps
  const savedConfig = cloneDeep(savedStateV1Split);
  const parsedConfig = SchemaManager.parseSavedConfig(savedConfig.config);

  // 1. merge State reset current splitMaps
  const mergedState = visStateReducer(oldState, receiveMapConfig(parsedConfig));

  const expectedToMerge = [
    {
      layers: {
        f24uw1: false,
        '9x77w7h': true
      }
    },
    {
      layers: {
        f24uw1: true,
        '9x77w7h': false
      }
    }
  ];

  const expectedToMergeAll = [
    {
      layers: {
        f24uw1: false,
        '9x77w7h': true,
        'point-0': false,
        'geojson-1': true
      }
    },
    {
      layers: {
        f24uw1: true,
        '9x77w7h': false,
        'point-0': true,
        'geojson-1': true
      }
    }
  ];
  t.deepEqual(mergedState.splitMaps, [], 'Should reset splitMaps');
  t.deepEqual(mergedState.splitMapsToBeMerged, expectedToMerge);

  // 2. merge State keep current splitMaps
  const mergedState2 = visStateReducer(
    oldState,
    receiveMapConfig(parsedConfig, {keepExistingConfig: true})
  );
  t.deepEqual(mergedState2.splitMaps, oldState.splitMaps, 'Should keep current splitMaps');
  t.deepEqual(
    mergedState2.splitMapsToBeMerged,
    expectedToMerge,
    'Should save unmerged to splitMapsToBeMerged'
  );

  const parsedData = SchemaManager.parseSavedData(savedConfig.datasets);
  // 3. load data into reducer
  const mergedState3 = visStateReducer(mergedState2, updateVisData(parsedData));

  t.deepEqual(mergedState3.splitMaps, expectedToMergeAll, 'Should merge all splitMaps');
  t.deepEqual(mergedState3.splitMapsToBeMerged, [], 'Should empty splitMapsToBeMerged');

  t.end();
});

test('VisStateMerger - mergeSplitMaps', t => {
  const testState1 = {
    layers: [],
    splitMaps: [{layers: {a: true}}, {layers: {a: false}}],
    splitMapsToBeMerged: []
  };

  t.deepEqual(
    mergeSplitMaps(testState1, []),
    {...testState1, splitMapsToBeMerged: []},
    'should return empty'
  );

  const testSM = [{layers: {c: true}}, {layers: {c: false}}];

  t.deepEqual(
    mergeSplitMaps(testState1, testSM),
    {...testState1, splitMapsToBeMerged: testSM},
    'should save non-exist layers to splitMapsToBeMerged'
  );

  const testState2 = {
    layers: [{id: 'c', config: {isVisible: true}}],
    splitMaps: [{layers: {a: true}}, {layers: {a: false}}],
    splitMapsToBeMerged: []
  };

  t.deepEqual(
    mergeSplitMaps(testState2, testSM),
    {
      ...testState2,
      splitMaps: [{layers: {a: true, c: true}}, {layers: {a: false, c: false}}],
      splitMapsToBeMerged: []
    },
    'should merge split maps'
  );

  const testState3 = {
    layers: [{id: 'c', config: {isVisible: true}}],
    splitMaps: [],
    splitMapsToBeMerged: []
  };
  t.deepEqual(
    mergeSplitMaps(testState3, testSM),
    {
      ...testState3,
      splitMaps: [{layers: {c: true}}, {layers: {c: false}}],
      splitMapsToBeMerged: []
    },
    'should create split maps panel and merge split maps'
  );

  const testState4 = {
    layers: [
      {id: 'a', config: {isVisible: true}},
      {id: 'b', config: {isVisible: false}},
      {id: 'c', config: {isVisible: true}}
    ],
    splitMaps: [],
    splitMapsToBeMerged: []
  };
  t.deepEqual(
    mergeSplitMaps(testState4, testSM),
    {
      ...testState4,
      splitMaps: [{layers: {a: true, c: true}}, {layers: {a: true, c: false}}],
      splitMapsToBeMerged: []
    },
    'should create split maps panel, add current layer to splitMaps and merge split maps'
  );

  t.end();
});

test('VisStateMerger - mergeTripGeojson', t => {
  const initialState = cloneDeep(InitialState);

  // processKeplerglJSON
  const result = processKeplerglJSON(savedStateV1TripGeoJson);
  const updatedCore = coreReducer(initialState, addDataToMap(result));

  const mergedVieState = updatedCore.visState;

  t.equal(mergedVieState.layers.length, 1, 'should create 1 layer');
  const tripLayer = mergedVieState.layers[0];

  t.equal(tripLayer.type, 'trip', 'should create 1 trip layer');

  cmpLayers(t, tripLayer, mergedTripLayer, {id: true, color: true});

  t.deepEqual(
    tripLayer.dataToFeature,
    mergedTripLayer.dataToFeature,
    'dataToFeature should be correct'
  );

  t.deepEqual(
    tripLayer.dataToTimeStamp,
    mergedTripLayer.dataToTimeStamp,
    'dataToTimeStamp should be correct'
  );

  t.deepEqual(tripLayer.meta.bounds, mergedTripLayer.meta.bounds, 'meta.bounds should be correct');

  t.deepEqual(
    tripLayer.meta.featureTypes,
    mergedTripLayer.meta.featureTypes,
    'meta.featureTypes should be correct'
  );

  t.end();
});

test('VisStateMerger.v1 -> mergeFilters -> nonValidFilter', t => {
  const savedConfig = cloneDeep(NonValidFilterState);
  const oldState = cloneDeep(InitialState);
  const oldVisState = oldState.visState;

  const parsedConfig = SchemaManager.parseSavedConfig(savedConfig.config, oldState);
  const parsedFilters = parsedConfig.visState.filters;

  const mergedState = mergeFilters(oldState.visState, parsedFilters);

  Object.keys(oldVisState).forEach(key => {
    if (key === 'filterToBeMerged') {
      t.deepEqual(
        mergedState.filterToBeMerged,
        parsedFilters,
        'Should save filters to filterToBeMerged before data loaded'
      );
    } else {
      t.deepEqual(mergedState[key], oldVisState[key], 'Should keep the rest of state same');
    }
  });

  const parsedData = SchemaManager.parseSavedData(savedConfig.datasets);

  // load data into reducer
  const stateWData = visStateReducer(mergedState, updateVisData(parsedData));

  // parsed filters must be empty
  cmpFilters(t, [], stateWData.filters);
  t.end();
});

test('VisStateMerger.v1 -> mergeFilters -> multiFilters', t => {
  const stateToSave = cloneDeep(StateWMultiFilters);
  const oldCsvData = stateToSave.visState.datasets[testCsvDataId];
  const oldGeoJsonData = stateToSave.visState.datasets[testGeoJsonDataId];
  const appStateToSave = SchemaManager.save(stateToSave);
  const stateParsed = SchemaManager.load(appStateToSave);

  const oldState = cloneDeep(InitialState);
  const oldVisState = oldState.visState;

  const mergedState = visStateReducer(
    oldVisState,
    updateVisData(stateParsed.datasets, {}, stateParsed.config)
  );
  // check datasets is filtered
  // and field has filterProps
  const expectedDatasets = {
    [testCsvDataId]: {
      metadata: {
        id: testCsvDataId,
        label: 'hello.csv'
      },
      fields: testFields.map(f => ({
        ...f,
        ...(f.name === 'time'
          ? {filterProps: timeFilterProps}
          : f.name === 'date'
          ? {filterProps: dateFilterProps}
          : f.name === 'epoch'
          ? {filterProps: epochFilterProps}
          : {})
      })),
      allData: testAllData,
      allIndexes: [
        0,
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15,
        16,
        17,
        18,
        19,
        20,
        21,
        22,
        23
      ],
      id: testCsvDataId,
      label: 'hello.csv',
      color: 'donot test me',
      filteredIndex: [0, 1, 2, 3, 7, 8, 9, 10, 11, 12],
      filteredIndexForDomain: [0, 1, 2, 3, 7, 8, 9, 10, 11, 12],
      fieldPairs: oldCsvData.fieldPairs,
      filterRecord: {
        dynamicDomain: [mergedDateFilter],
        fixedDomain: [mergedTimeFilter, mergedEpochFilter],
        cpu: [mergedDateFilter],
        gpu: [mergedTimeFilter, mergedEpochFilter]
      },
      gpuFilter: {
        filterRange: [
          [1474606800000 - 1474588800000, 1474617600000 - 1474588800000],
          [1472700000000 - 1472688000000, 1472760000000 - 1472688000000],
          [0, 0],
          [0, 0]
        ],
        filterValueUpdateTriggers: {
          gpuFilter_0: 'time',
          gpuFilter_1: 'epoch',
          gpuFilter_2: null,
          gpuFilter_3: null
        },
        filterValueAccessor: {
          inputs: [
            {
              data: testAllData[1],
              index: 1
            }
          ],
          result: [1474588800000 - 1474588800000, 1472688000000 - 1472688000000, 0, 0]
        }
      },
      changedFilters: {
        dynamicDomain: {'date-2': 'added'},
        fixedDomain: {'time-0': 'added', 'epoch-4': 'added'},
        cpu: {'date-2': 'added'},
        gpu: {'time-0': 'added', 'epoch-4': 'added'}
      }
    },
    [testGeoJsonDataId]: {
      metadata: {
        id: testGeoJsonDataId,
        label: 'zip.geojson'
      },
      fields: fields.map(f => ({
        ...f,
        ...(f.name === 'TRIPS'
          ? {filterProps: geoJsonTripFilterProps}
          : f.name === 'RATE'
          ? {filterProps: geoJsonRateFilterProps}
          : {})
      })),
      filterRecord: {
        dynamicDomain: [mergedRateFilter, mergedTripFilter],
        fixedDomain: [],
        cpu: [mergedRateFilter],
        gpu: [mergedTripFilter]
      },
      gpuFilter: {
        filterRange: [
          [0, 8],
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
          inputs: [
            {
              data: testGeoJsonAllData[1],
              index: 1
            }
          ],
          result: [0, 0, 0, 0]
        }
      },
      allData: testGeoJsonAllData,
      allIndexes: [0, 1, 2, 3, 4],
      id: testGeoJsonDataId,
      label: 'zip.geojson',
      color: 'donot test me',
      filteredIndex: [0],
      filteredIndexForDomain: [0],
      fieldPairs: oldGeoJsonData.fieldPairs,
      changedFilters: {
        dynamicDomain: {'RATE-1': 'added', 'TRIPS-3': 'added'},
        fixedDomain: null,
        cpu: {'RATE-1': 'added'},
        gpu: {'TRIPS-3': 'added'}
      }
    }
  };

  cmpDatasets(t, expectedDatasets, mergedState.datasets);

  const expectedFilters = [
    mergedTimeFilter,
    mergedRateFilter,
    mergedDateFilter,
    mergedTripFilter,
    mergedEpochFilter
  ];

  cmpFilters(t, expectedFilters, mergedState.filters);
  t.end();
});

test('VisStateMerger -> import polygon filter map', t => {
  const oldState = cloneDeep(InitialState);
  const savedConfig = cloneDeep(polygonFilterMap);
  const oldVisState = oldState.visState;

  const parsedConfig = SchemaManager.parseSavedConfig(savedConfig.config, oldState);

  const parsedFilters = parsedConfig.visState.filters;

  const mergedState = mergeFilters(oldState.visState, parsedFilters);

  Object.keys(oldVisState).forEach(key => {
    if (key === 'filterToBeMerged') {
      t.deepEqual(
        mergedState.filterToBeMerged,
        parsedFilters,
        'Should save filters to filterToBeMerged before data loaded'
      );
    } else {
      t.deepEqual(mergedState[key], oldVisState[key], 'Should keep the rest of state same');
    }
  });

  const parsedData = SchemaManager.parseSavedData(savedConfig.datasets);

  // load data into reducer
  const stateWData = visStateReducer(mergedState, updateVisData(parsedData));

  // parsed filters must be empty
  cmpFilters(t, [], stateWData.filters);
  t.end();
});

test('VisStateMerger -> insertLayerAtRightOrder -> to empty config', t => {
  const preservedOrder = ['a', 'b', 'c', 'd'];

  const batches = [
    {load: [{id: 'b'}], expectedLayers: [{id: 'b'}], expectedOrder: [0]},
    {
      load: [{id: 'a'}, {id: 'c'}],
      expectedLayers: [{id: 'b'}, {id: 'a'}, {id: 'c'}],
      expectedOrder: [1, 0, 2]
    },
    {
      load: [{id: 'd'}],
      expectedLayers: [{id: 'b'}, {id: 'a'}, {id: 'c'}, {id: 'd'}],
      expectedOrder: [1, 0, 2, 3]
    }
  ];

  let currentLayers = [];
  let currentOrder = [];

  // add layers in batch
  for (const batch of batches) {
    const {newLayerOrder, newLayers} = insertLayerAtRightOrder(
      currentLayers,
      batch.load,
      currentOrder,
      preservedOrder
    );
    currentLayers = newLayers;
    currentOrder = newLayerOrder;

    t.deepEqual(currentLayers, batch.expectedLayers, 'Should insert layer at correct Order');
    t.deepEqual(currentOrder, batch.expectedOrder, 'Should reconstruct layer order');
  }

  t.end();
});

test('VisStateMerger -> insertLayerAtRightOrder -> to empty config', t => {
  const preservedOrder = ['a', 'b', 'c', 'd'];

  const batches = [
    {load: [{id: 'b'}], expectedLayers: [{id: 'm'}, {id: 'b'}], expectedOrder: [1, 0]},
    {
      load: [{id: 'a'}, {id: 'c'}],
      expectedLayers: [{id: 'm'}, {id: 'b'}, {id: 'a'}, {id: 'c'}],
      expectedOrder: [2, 1, 3, 0]
    },
    {
      load: [{id: 'd'}],
      expectedLayers: [{id: 'm'}, {id: 'b'}, {id: 'a'}, {id: 'c'}, {id: 'd'}],
      expectedOrder: [2, 1, 3, 4, 0]
    }
  ];

  let currentLayers = [{id: 'm'}];
  let currentOrder = [0];

  // add layers in batch
  for (const batch of batches) {
    const {newLayerOrder, newLayers} = insertLayerAtRightOrder(
      currentLayers,
      batch.load,
      currentOrder,
      preservedOrder
    );
    currentLayers = newLayers;
    currentOrder = newLayerOrder;

    t.deepEqual(currentLayers, batch.expectedLayers, 'Should insert layer at correct Order');
    t.deepEqual(currentOrder, batch.expectedOrder, 'Should reconstruct layer order');
  }

  t.end();
});
