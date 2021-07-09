export type ActionType = {
  // identity action
  REGISTER_ENTRY: string;
  DELETE_ENTRY: string;
  RENAME_ENTRY: string;

  // visState
  ADD_DATA: string;
  ADD_FILTER: string;
  ADD_LAYER: string;
  INTERACTION_CONFIG_CHANGE: string;
  LAYER_CONFIG_CHANGE: string;
  LAYER_VISUAL_CHANNEL_CHANGE: string;
  LAYER_TYPE_CHANGE: string;
  LAYER_VIS_CONFIG_CHANGE: string;
  LAYER_TEXT_LABEL_CHANGE: string;
  LAYER_HOVER: string;
  LAYER_CLICK: string;
  MAP_CLICK: string;
  MOUSE_MOVE: string;
  REMOVE_FILTER: string;
  REMOVE_LAYER: string;
  DUPLICATE_LAYER: string;
  REMOVE_DATASET: string;
  REORDER_LAYER: string;
  SET_FILTER: string;
  SET_FILTER_ANIMATION_TIME: string;
  SET_FILTER_ANIMATION_TIME_CONFIG:  string;
  SET_FILTER_ANIMATION_WINDOW: string;
  SHOW_DATASET_TABLE: string;
  UPDATE_LAYER_BLENDING: string;
  UPDATE_VIS_DATA: string;
  RENAME_DATASET: string;
  TOGGLE_FILTER_ANIMATION: string;
  UPDATE_FILTER_ANIMATION_SPEED: string;
  PLAY_ANIMATION: string;
  SET_LAYER_ANIMATION_TIME: string;
  SET_LAYER_ANIMATION_TIME_CONFIG: string;
  UPDATE_ANIMATION_SPEED: string;
  UPDATE_LAYER_ANIMATION_SPEED: string;
  TOGGLE_LAYER_CONFIG_ACTIVE: string;
  TOGGLE_LAYER_ANIMATION: string;
  TOGGLE_LAYER_ANIMATION_CONTROL: string;
  ENLARGE_FILTER: string;
  TOGGLE_FILTER_FEATURE: string;
  SET_VISIBLE_LAYERS_FOR_MAP: string;
  TOGGLE_LAYER_FOR_MAP: string;
  SET_FILTER_PLOT: string;
  LOAD_FILES: string;
  LOAD_NEXT_FILE: string;
  LOAD_FILES_ERR: string;
  LOAD_FILES_SUCCESS: string;
  LOAD_FILE_STEP_SUCCESS: string;
  LAYER_COLOR_UI_CHANGE: string;
  TOGGLE_FEATURE_LAYER: string;
  APPLY_CPU_FILTER: string;
  SET_MAP_INFO: string;
  SORT_TABLE_COLUMN: string;
  PIN_TABLE_COLUMN: string;
  COPY_TABLE_COLUMN: string;
  NEXT_FILE_BATCH: string;
  PROCESS_FILE_CONTENT: string;

  // mapState
  UPDATE_MAP: string;
  FIT_BOUNDS: string;
  TOGGLE_PERSPECTIVE: string;
  TOGGLE_SPLIT_MAP: string;
  TOGGLE_FULLSCREEN: string;

  // mapStyle
  MAP_CONFIG_CHANGE: string;
  SET_DEFAULT_MAP_STYLE: string;
  MAP_STYLE_CHANGE: string;
  LOAD_MAP_STYLES: string;
  LOAD_MAP_STYLE_ERR: string;
  INPUT_MAP_STYLE: string;
  LOAD_CUSTOM_MAP_STYLE: string;
  ADD_CUSTOM_MAP_STYLE: string;
  REQUEST_MAP_STYLES: string;
  SET_3D_BUILDING_COLOR: string;

  // uiState
  TOGGLE_SIDE_PANEL: string;
  TOGGLE_MODAL: string;
  SHOW_EXPORT_DROPDOWN: string;
  HIDE_EXPORT_DROPDOWN: string;
  OPEN_DELETE_MODAL: string;
  TOGGLE_MAP_CONTROL: string;
  ADD_NOTIFICATION: string;
  REMOVE_NOTIFICATION: string;
  SET_LOCALE: string;

  // uiState > export image
  SET_EXPORT_IMAGE_SETTING: string;
  START_EXPORTING_IMAGE: string;
  SET_EXPORT_IMAGE_DATA_URI: string;
  SET_EXPORT_IMAGE_ERROR: string;
  CLEANUP_EXPORT_IMAGE: string;

  // uiState > export data
  SET_EXPORT_SELECTED_DATASET: string;
  SET_EXPORT_DATA_TYPE: string;
  SET_EXPORT_FILTERED: string;
  SET_EXPORT_DATA: string;

  // uiState > export map
  SET_EXPORT_MAP_FORMAT: string;
  SET_USER_MAPBOX_ACCESS_TOKEN: string;
  SET_EXPORT_MAP_HTML_MODE: string;

  // uiState > editor
  SET_EDITOR_MODE: string;
  SET_SELECTED_FEATURE: string;

  // all
  INIT: string;
  ADD_DATA_TO_MAP: string;
  RECEIVE_MAP_CONFIG: string;
  RESET_MAP_CONFIG: string;

  // geo-operations
  SET_FEATURES: string;
  SET_POLYGON_FILTER_LAYER: string;
  DELETE_FEATURE: string;
  TOGGLE_EDITOR_VISIBILITY: string;

  // storage
  START_SAVE_STORAGE: string;
};

export const ActionTypes: ActionType;
export const ACTION_PREFIX: string;
export default ActionTypes;
