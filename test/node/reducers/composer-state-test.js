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

/* eslint-disable max-statements */

import test from 'tape';
import keplerGlReducer from 'reducers';
import {addDataToMapUpdater} from 'reducers/combined-updaters';
import {registerEntry} from 'actions/identity-actions';
import {processCsvData} from 'processors/data-processor';

import testCsvData, {sampleConfig} from 'test/fixtures/test-csv-data';
import testHexIdData, {
  hexIdDataConfig,
  mergedH3Layer,
  mergedFilters,
  expectedMergedDataset
} from 'test/fixtures/test-hex-id-data';
import {cmpLayers, cmpFilters, cmpDataset, cmpInteraction} from 'test/helpers/comparison-utils';
import {INITIAL_UI_STATE} from 'reducers/ui-state-updaters';

const mockRawData = {
  fields: [
    {
      name: 'start_point_lat',
      id: 'start_point_lat',
      displayName: 'start_point_lat',
      type: 'real',
      fieldIdx: 0
    },
    {
      name: 'start_point_lng',
      id: 'start_point_lng',
      displayName: 'start_point_lng',
      type: 'real',
      fieldIdx: 2
    },
    {
      name: 'end_point_lat',
      id: 'end_point_lat',
      displayName: 'end_point_lat',
      type: 'real',
      fieldIdx: 3
    },
    {
      name: 'end_point_lng',
      id: 'end_point_lng',
      displayName: 'end_point_lng',
      type: 'real',
      fieldIdx: 4
    }
  ],
  rows: [
    [12.25, 37.75, 45.21, 100.12],
    [null, 35.2, 45.0, 21.3],
    [12.29, 37.64, 46.21, 99.127],
    [null, null, 33.1, 29.34]
  ]
};

test('#composerStateReducer - addDataToMapUpdater: mapStyle', t => {
  // init kepler.gl root and instance
  const state = keplerGlReducer(undefined, registerEntry({id: 'test'})).test;

  const newState = addDataToMapUpdater(state, {
    payload: {
      datasets: {
        data: mockRawData,
        info: {
          id: 'foo'
        }
      },
      options: null,
      config: {
        mapStyle: {
          styleType: 'light'
        }
      }
    }
  });

  t.equal(newState.mapStyle.styleType, 'light', 'Map style is set correctly');

  t.end();
});

test('#composerStateReducer - addDataToMapUpdater: mapState should be centered', t => {
  // init kepler.gl root and instance
  const state = keplerGlReducer({}, registerEntry({id: 'test'})).test;
  const mapStateProperties = {
    latitude: 33.88608913680742,
    longitude: -84.43459130456425
  };
  const newState = addDataToMapUpdater(state, {
    payload: {
      datasets: {
        data: mockRawData,
        info: {
          id: 'foo'
        }
      },
      options: {
        centerMap: true
      },
      config: {
        mapState: mapStateProperties
      }
    }
  });

  t.equal(newState.mapState.latitude, 29.23, 'centerMap: true should override mapState config');
  t.equal(newState.mapState.longitude, 60.71, 'centerMap: true should override mapState config');

  t.end();
});

test('#composerStateReducer - addDataToMapUpdater: uiState', t => {
  // init kepler.gl root and instance
  const state = keplerGlReducer(undefined, registerEntry({id: 'test'})).test;

  const newState = addDataToMapUpdater(state, {
    payload: {
      datasets: {
        data: mockRawData,
        info: {
          id: 'foo'
        }
      }
    }
  });

  const expectedUIState = {
    ...INITIAL_UI_STATE,
    initialState: {},
    readOnly: false,
    currentModal: null
  };

  t.deepEqual(
    newState.uiState,
    expectedUIState,
    'ui state should be set readOnly:false,currentModal: null'
  );

  t.end();
});

test('#composerStateReducer - addDataToMapUpdater: keepExistingConfig', t => {
  const data = processCsvData(testCsvData);

  const state = keplerGlReducer({}, registerEntry({id: 'test'})).test;

  // old state contain splitMaps
  const oldState = addDataToMapUpdater(state, {
    payload: {
      datasets: {
        data,
        info: {
          id: sampleConfig.dataId
        }
      },
      config: sampleConfig.config
    }
  });

  const {
    layers: oldLayers,
    filters: oldFilters,
    datasets: oldDatasets,
    interactionConfig: oldInteractionConfig,
    splitMaps: oldSplitMaps
  } = oldState.visState;

  const hexData = processCsvData(testHexIdData);
  const hexDataId = hexIdDataConfig.dataId;

  // keepExistingConfig is not defined, default to false
  const nextState1 = addDataToMapUpdater(oldState, {
    payload: {
      datasets: {
        data: hexData,
        info: {
          id: hexDataId
        }
      },
      config: hexIdDataConfig.config
    }
  });

  cmpDataset(t, expectedMergedDataset, nextState1.visState.datasets[hexDataId]);

  t.deepEqual(nextState1.visState.splitMaps, [], 'should clear out splitMaps');

  cmpLayers(t, [mergedH3Layer], nextState1.visState.layers);
  cmpFilters(t, mergedFilters, nextState1.visState.filters);

  // add data and config keep existing data and config
  const nextState2 = addDataToMapUpdater(oldState, {
    payload: {
      datasets: {
        data: hexData,
        info: {
          id: hexDataId
        }
      },
      config: hexIdDataConfig.config,
      options: {
        keepExistingConfig: true
      }
    }
  });

  const actualVisState = nextState2.visState;

  const expectedVisState = {
    layers: [...oldLayers, mergedH3Layer],
    filters: [...oldFilters, ...mergedFilters],
    datasets: 'test seperate',
    interactionConfig: {
      ...oldInteractionConfig,
      tooltip: {
        ...oldInteractionConfig.tooltip,
        config: {
          compareMode: false,
          compareType: 'absolute',
          fieldsToShow: {
            ...oldInteractionConfig.tooltip.config.fieldsToShow,
            [hexDataId]: [
              {
                name: 'hex_id',
                format: null
              },
              {
                name: 'value',
                format: null
              }
            ]
          }
        }
      }
    },
    splitMaps: [
      {
        layers: {
          ...oldSplitMaps[0].layers,
          avlgol: true
        }
      },
      {
        layers: {
          ...oldSplitMaps[1].layers,
          avlgol: true
        }
      }
    ],
    layerOrder: [2, 0, 1]
  };

  cmpLayers(t, expectedVisState.layers, actualVisState.layers);
  cmpFilters(t, expectedVisState.filters, actualVisState.filters);
  // test datasets
  t.deepEqual(
    Object.keys(actualVisState.datasets),
    [sampleConfig.dataId, hexDataId],
    'should save 2 datasets to state'
  );

  t.equal(
    actualVisState.datasets[sampleConfig.dataId],
    oldDatasets[sampleConfig.dataId],
    'should keep oldDataset same'
  );

  cmpDataset(
    t,
    expectedMergedDataset,
    actualVisState.datasets[hexDataId],
    'should merge and filter hexdata'
  );

  cmpInteraction(t, expectedVisState.interactionConfig, actualVisState.interactionConfig);
  t.deepEqual(
    expectedVisState.layerOrder,
    actualVisState.layerOrder,
    'Should create new layer, move it to the top'
  );

  t.deepEqual(
    expectedVisState.splitMaps,
    actualVisState.splitMaps,
    'Should keep existing splitMaps, add new layers to splitMaps'
  );

  t.end();
});

test('#composerStateReducer - addDataToMapUpdater: readOnly', t => {
  const datasets = {
    data: processCsvData(testCsvData),
    info: {
      id: sampleConfig.dataId
    }
  };
  const state = keplerGlReducer({}, registerEntry({id: 'test'})).test;

  // old state contain splitMaps
  const nextState = addDataToMapUpdater(state, {
    payload: {
      datasets,
      options: {
        readOnly: true
      }
    }
  });
  t.equal(nextState.uiState.readOnly, true, 'should set readonly to be true');

  const nextState1 = addDataToMapUpdater(state, {
    payload: {
      datasets
    }
  });
  t.equal(nextState1.uiState.readOnly, false, 'should set readonly to be false');

  const nextState2 = addDataToMapUpdater(state, {
    payload: {
      datasets,
      options: {
        readOnly: false
      }
    }
  });
  t.equal(nextState2.uiState.readOnly, false, 'should set readonly to be false');
  t.end();
});

test('#composerStateReducer - addDataToMapUpdater: autoCreateLayers', t => {
  const datasets = {
    data: processCsvData(testCsvData),
    info: {
      id: sampleConfig.dataId
    }
  };
  const state = keplerGlReducer({}, registerEntry({id: 'test'})).test;

  // old state contain splitMaps
  const nextState = addDataToMapUpdater(state, {
    payload: {
      datasets,
      options: {
        autoCreateLayers: false
      }
    }
  });
  t.equal(nextState.visState.layers.length, 0, 'should not create layers');

  t.end();
});
