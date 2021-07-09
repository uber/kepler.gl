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
  toggleSidePanel,
  toggleModal,
  openDeleteModal,
  setExportImageSetting,
  toggleMapControl,
  setExportSelectedDataset,
  setExportDataType,
  setExportFiltered,
  startExportingImage,
  addNotification,
  removeNotification
} from 'actions/ui-state-actions';
import {loadFiles, loadFilesErr} from 'actions/vis-state-actions';
import {keplerGlInit} from 'actions/actions';
import reducer, {uiStateReducerFactory} from 'reducers/ui-state';
import {INITIAL_UI_STATE} from 'reducers/ui-state-updaters';
import {
  EXPORT_DATA_TYPE,
  RESOLUTIONS,
  DEFAULT_NOTIFICATION_TOPICS,
  DEFAULT_NOTIFICATION_TYPES
} from 'constants/default-settings';

test('#uiStateReducer', t => {
  t.deepEqual(
    reducer(undefined, {}),
    {...INITIAL_UI_STATE, initialState: {}},
    'should return the initial state'
  );
  t.end();
});

test('#uiStateReducer -> INIT', t => {
  const uiStateReducer = uiStateReducerFactory();

  const newState = reducer(
    uiStateReducer(undefined, {}),
    keplerGlInit({
      initialUiState: {readOnly: true}
    })
  );
  t.deepEqual(
    newState,
    {...INITIAL_UI_STATE, readOnly: true, initialState: {}},
    'should apply initialUiState'
  );
  t.end();
});

test('#uiStateReducerFactory', t => {
  const uiStateReducer = uiStateReducerFactory({readOnly: true});

  t.deepEqual(
    uiStateReducer(undefined, {}),
    {...INITIAL_UI_STATE, readOnly: true, initialState: {readOnly: true}},
    'should return the initial state'
  );
  t.end();
});

test('#uiStateReducer -> TOGGLE_SIDE_PANEL', t => {
  const newReducer = reducer(INITIAL_UI_STATE, toggleSidePanel('foo'));

  const expectedState = {
    ...INITIAL_UI_STATE,
    activeSidePanel: 'foo'
  };

  t.deepEqual(newReducer, expectedState, 'should update side panel');

  const nextState2 = reducer(expectedState, toggleModal(null));

  const expectedNextState2 = {
    ...expectedState,
    currentModal: null
  };

  t.deepEqual(nextState2, expectedNextState2, 'should close modal');

  const nextState3 = reducer(expectedState, toggleSidePanel(null));

  const expectedNextState3 = {
    ...expectedState,
    activeSidePanel: null
  };

  t.deepEqual(nextState3, expectedNextState3, 'should close panel');

  t.end();
});

test('#uiStateReducer -> OPEN_DELETE_MODAL', t => {
  const newReducer = reducer(INITIAL_UI_STATE, openDeleteModal('chai'));

  const expectedState = {
    ...INITIAL_UI_STATE,
    currentModal: 'deleteData',
    datasetKeyToRemove: 'chai'
  };

  t.deepEqual(newReducer, expectedState, 'should open delete data modal and save key to remove');

  t.end();
});

test('#uiStateReducer -> SET_EXPORT_IMAGE_SETTING', t => {
  const newReducer = reducer(
    INITIAL_UI_STATE,
    setExportImageSetting({resolution: RESOLUTIONS.TWO_X})
  );

  const expectedState = {
    ...INITIAL_UI_STATE,
    exportImage: {
      ...INITIAL_UI_STATE.exportImage,
      resolution: RESOLUTIONS.TWO_X
    }
  };

  t.deepEqual(newReducer, expectedState, 'should set the resolution to TWO_X');

  t.end();
});

test('#uiStateReducer -> START_EXPORTING_IMAGE', t => {
  const newReducer = reducer(INITIAL_UI_STATE, startExportingImage());

  const expectedState = {
    ...INITIAL_UI_STATE,
    exportImage: {
      ...INITIAL_UI_STATE.exportImage,
      exporting: true
    }
  };

  t.deepEqual(newReducer, expectedState, 'should set exporting to true and modal to export image');

  t.end();
});

test('#uiStateReducer -> TOGGLE_MAP_CONTROL', t => {
  const newReducer = reducer(INITIAL_UI_STATE, toggleMapControl('mapLegend'));

  const expectedState = {
    ...INITIAL_UI_STATE,
    mapControls: {
      ...INITIAL_UI_STATE.mapControls,
      mapLegend: {
        ...INITIAL_UI_STATE.mapControls.mapLegend,
        active: !INITIAL_UI_STATE.mapControls.mapLegend.active,
        activeMapIndex: 0
      }
    }
  };

  t.deepEqual(newReducer, expectedState, 'should set map legend to be seen');

  t.end();
});

test('#uiStateReducer -> SET_EXPORT_SELECTED_DATASET', t => {
  const newReducer = reducer(INITIAL_UI_STATE, setExportSelectedDataset('a'));

  const expectedState = {
    ...INITIAL_UI_STATE,
    exportData: {
      ...INITIAL_UI_STATE.exportData,
      selectedDataset: 'a'
    }
  };

  t.deepEqual(newReducer, expectedState, 'should set the selectedDataset to a');

  t.end();
});

test('#uiStateReducer -> SET_EXPORT_DATA_TYPE', t => {
  const newReducer = reducer(INITIAL_UI_STATE, setExportDataType(EXPORT_DATA_TYPE.JSON));

  const expectedState = {
    ...INITIAL_UI_STATE,
    exportData: {
      ...INITIAL_UI_STATE.exportData,
      dataType: EXPORT_DATA_TYPE.JSON
    }
  };

  t.deepEqual(newReducer, expectedState, 'should set the dataType to json');

  t.end();
});

test('#uiStateReducer -> SET_EXPORT_FILTERED', t => {
  const newReducer = reducer(INITIAL_UI_STATE, setExportFiltered(false));

  const expectedState = {
    ...INITIAL_UI_STATE,
    exportData: {
      ...INITIAL_UI_STATE.exportData,
      filtered: false
    }
  };

  t.deepEqual(newReducer, expectedState, 'should set the filtered to false');

  t.end();
});

test('#uiStateReducer -> ADD_NOTIFICATION', t => {
  const sharedNotificationId = 'test-notification-id';

  const notification1 = {
    type: DEFAULT_NOTIFICATION_TYPES.error,
    message: 'TEST',
    topic: DEFAULT_NOTIFICATION_TOPICS.global,
    id: 'test-1'
  };
  const state0 = reducer(INITIAL_UI_STATE, addNotification(notification1));
  t.equal(state0.notifications.length, 1, 'AddNotification should add one new notification');
  t.deepEqual(
    state0.notifications[0],
    notification1,
    'AddNotification should have propagated data correctly'
  );

  const notification2 = {
    type: DEFAULT_NOTIFICATION_TYPES.info,
    message: 'TEST',
    topic: DEFAULT_NOTIFICATION_TOPICS.file,
    id: sharedNotificationId
  };
  const state1 = reducer(state0, addNotification(notification2));
  t.equal(state1.notifications.length, 2, 'AddNotification should add second notification');
  t.deepEqual(
    state1.notifications[1],
    notification2,
    'AddNotification should have propagated data correctly '
  );

  const updatedNotification = {
    type: DEFAULT_NOTIFICATION_TYPES.error,
    message: 'TEST-updated-message',
    topic: DEFAULT_NOTIFICATION_TOPICS.global,
    id: sharedNotificationId
  };
  const state2 = reducer(state1, addNotification(updatedNotification));
  t.equal(
    state2.notifications.length,
    2,
    "addNotification shouldn't add new notification with same id"
  );
  t.deepEqual(
    state2.notifications[1],
    updatedNotification,
    'AddNotification should have propagated data correctly '
  );

  t.end();
});

test('#uiStateReducer -> REMOVE_NOTIFICATION', t => {
  const newState = reducer(
    INITIAL_UI_STATE,
    addNotification({
      type: DEFAULT_NOTIFICATION_TYPES.error,
      message: 'TEST',
      topic: DEFAULT_NOTIFICATION_TOPICS.global,
      id: 'test-1'
    })
  );

  t.equal(newState.notifications.length, 1, 'AddNotification should add one new notification');
  t.deepEqual(
    newState.notifications[0],
    {
      type: DEFAULT_NOTIFICATION_TYPES.error,
      message: 'TEST',
      topic: DEFAULT_NOTIFICATION_TOPICS.global,
      id: 'test-1'
    },
    'AddNotification should have propagated data correctly '
  );

  const nextState = reducer(newState, removeNotification('test-1'));

  t.equal(nextState.notifications.length, 0, 'RemoveNotification removed one notification');

  t.end();
});

test('#uiStateReducer -> LOAD_FILES_ERR', t => {
  const newState = reducer(INITIAL_UI_STATE, loadFiles());
  t.equal(newState.loadFiles.fileLoading, true, 'should set fileLoading to true');

  const newState1 = reducer(newState, loadFilesErr('file.csv', new Error('this is an error')));
  const expectedId = newState1.notifications.length ? newState1.notifications[0].id : 'error';
  t.equal(
    newState1.loadFiles.fileLoading,
    false,
    'should set fileLoading to false when loadFilesErr'
  );
  t.deepEqual(
    newState1.notifications,
    [
      {
        type: 'error',
        topic: 'global',
        message: 'this is an error',
        id: expectedId
      }
    ],
    'should add an error notification'
  );

  t.end();
});
