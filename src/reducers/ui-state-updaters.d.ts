import * as UiStateActions from 'actions/ui-state-actions';
import {ToggleSplitMapUpdaterAction} from 'actions/map-state-actions';
import {LoadFilesUpdaterAction, LoadFilesErrUpdaterAction} from ' actions/vis-state-actions';

export type ExportImage = {
  ratio: string;
  resolution: string;
  legend: boolean;
  mapH: number;
  mapW: number;
  imageSize: {
    zoomOffset: number;
    scale: number;
    imageW: number;
    imageH: number;
  };
  // exporting state
  imageDataUri: string;
  exporting: boolean;
  processing: boolean;
  error: Error;
};

export type ExportData = {
  selectedDataset: string;
  dataType: string;
  filtered: boolean;
};

export type ExportHtml = {
  exportMapboxAccessToken: null | string;
  userMapboxToken: string;
  mode: string;
};
export type ExportJson = {
  hasData: boolean;
};
export type ExportMap = {
  HTML: ExportHtml;
  JSON: ExportJson;
  format: 'HTML' | 'JSON';
};

export type MapControl = {
  show: boolean;
  active: boolean;
  disableClose?: boolean;
  activeMapIndex?: number;
};
export type MapControls = {
  visibleLayers: MapControl;
  mapLegend: MapControl;
  toggle3d: MapControl;
  splitMap: MapControl;
  mapDraw: MapControl;
  mapLocale: MapControl;
};

export type LoadFiles = {
  fileLoading: boolean;
};

export type Notifications = {
  message: string;
  type: string;
  topic: string;
  id: string;
};

export type Locale = string;

export type UiState = {
  readOnly: boolean;
  activeSidePanel: string;
  currentModal: string | null;
  datasetKeyToRemove: string | null;
  visibleDropdown: string | null;
  // export image modal ui
  exportImage: ExportImage;
  // export data modal ui
  exportData: ExportData;
  // html export
  exportMap: ExportMap;
  // map control panels
  mapControls: MapControls;
  // ui notifications
  notifications: Notifications[];
  // load files
  loadFiles: LoadFiles;
  // Locale of the UI
  locale: Locale;
};

export const DEFAULT_MAP_CONTROLS: MapControls;
export const DEFAULT_EXPORT_IMAGE: ExportImage;
export const INITIAL_UI_STATE: UiState;

export function toggleSidePanelUpdater(
  state: UiState,
  action: UiStateActions.ToggleSidePanelUpdaterAction
): UiState;
export function toggleModalUpdater(
  state: UiState,
  action: UiStateActions.ToggleModalUpdaterAction
): UiState;
export function showExportDropdownUpdater(
  state: UiState,
  action: UiStateActions.ShowExportDropdownUpdaterAction
): UiState;
export function hideExportDropdownUpdater(
  state: UiState,
  action: UiStateActions.HideExportDropdownUpdaterAction
): UiState;
export function toggleMapControlUpdater(
  state: UiState,
  action: UiStateActions.ToggleMapControlUpdaterAction
): UiState;
export function openDeleteModalUpdater(
  state: UiState,
  action: UiStateActions.OpenDeleteModalUpdaterAction
): UiState;
export function addNotificationUpdater(
  state: UiState,
  action: UiStateActions.AddNotificationUpdaterAction
): UiState;
export function removeNotificationUpdater(
  state: UiState,
  action: UiStateActions.RemoveNotificationUpdaterAction
): UiState;
export function setExportImageSettingUpdater(
  state: UiState,
  action: UiStateActions.SetExportImageSettingUpdaterAction
): UiState;
export function setExportImageDataUriUpdater(
  state: UiState,
  action: UiStateActions.SetExportImageDataUriUpdaterAction
): UiState;
export function setExportImageErrorUpdater(
  state: UiState,
  action: UiStateActions.SetExportImageErrorUpdaterAction
): UiState;
export function cleanupExportImageUpdater(
  state: UiState,
  action: UiStateActions.CleanupExportImageUpdaterAction
): UiState;
export function startExportingImageUpdater(
  state: UiState,
  action: UiStateActions.startExportingImage
): UiState;
export function setExportSelectedDatasetUpdater(
  state: UiState,
  action: UiStateActions.SetExportSelectedDatasetUpdaterAction
): UiState;
export function setExportDataTypeUpdater(
  state: UiState,
  action: UiStateActions.SetExportDataTypeUpdaterAction
): UiState;
export function setExportFilteredUpdater(
  state: UiState,
  action: UiStateActions.SetExportFilteredUpdaterAction
): UiState;
export function setExportDataUpdater(
  state: UiState,
  action: UiStateActions.SetExportDataUpdaterAction
): UiState;
export function setUserMapboxAccessTokenUpdater(
  state: UiState,
  action: UiStateActions.SetUserMapboxAccessTokenUpdaterAction
): UiState;
export function setExportMapFormatUpdater(
  state: UiState,
  action: UiStateActions.SetExportMapFormatUpdaterAction
): UiState;
export function setExportMapHTMLModeUpdater(
  state: UiState,
  action: UiStateActions.SetExportHTMLMapModeUpdaterAction
): UiState;
export function showDatasetTableUpdater(state: UiState);
export function setLocaleUpdater(
  state: UiState,
  action: UiStateActions.SetLocaleUpdaterAction
): UiState;

export function loadFilesUpdater(state: UiState, action: LoadFilesUpdaterAction): UiState;
export function loadFilesErrUpdater(state: UiState, action: LoadFilesErrUpdaterAction): UiState;
export function loadFilesSuccessUpdater(state: UiState): UiState;
export function toggleSplitMapUpdater(state: UiState, action: ToggleSplitMapUpdaterAction): UiState;
export function initUiStateUpdater(
  state: UiState,
  action: {
    type?: ActionTypes.INIT;
    payload: KeplerGlInitPayload;
  }
): UiState;
