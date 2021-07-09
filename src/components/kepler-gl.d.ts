import {ComponentClass} from 'react';
import {OnErrorCallBack, OnSuccessCallBack} from 'actions/provider-actions';
import {MapState} from 'reducers/map-state-updaters';
import {MapStyle} from 'reducers/map-style-updaters';
import {UiState} from 'reducers/ui-state-updaters';
import {VisState} from 'reducers/vis-state-updaters';
import {ProviderState} from 'reducers/provider-state-updaters';
import * as VisStateActions from 'actions/vis-state-actions';
import * as MapStateActions from 'actions/map-state-actions';
import * as MapStyleActions from 'actions/map-style-actions';
import * as UIStateActions from 'actions/ui-state-actions';
import * as ProviderActions from 'actions/provider-actions';

export type KeplerGlProps = {
  id: string;
  appWebsite: any;
  onSaveMap?: () => void;
  onViewStateChange?: () => void;
  onDeckInitialized?: () => void;
  onKeplerGlInitialized?: () => void;
  mapboxApiAccessToken: string;
  mapboxApiUrl: string;
  getMapboxRef: () => React.RefType<any>;
  mapStyles: {id: string; style?: object}[];
  mapStylesReplaceDefault: boolean;
  mapboxApiUrl: string;
  width: number;
  height: number;
  appName: string;
  version: string;
  sidePanelWidth: number;
  theme: object;
  cloudProviders: object[];
  deckGlProps?: object;
  onLoadCloudMapSuccess?: OnSuccessCallBack;
  onLoadCloudMapError?: OnErrorCallBack;
  onExportToCloudSuccess?: OnSuccessCallBack;
  onExportToCloudError?: OnErrorCallBack;
  readOnly?: boolean;
};

export type UnconnectedKeplerGlProps = KeplerGlProps & {
  mapState: MapState;
  mapStyle: MapStyle;
  uiState: UiState;
  visState: VisState;
  providerState: ProviderState;
  visStateActions: typeof VisStateActions;
  uiStateActions: typeof UIStateActions;
  mapStateActions: typeof MapStateActions;
  mapStyleActions: typeof MapStyleActions;
  providerActions: typeof ProviderActions;
};

export type KeplerGlComponent = ComponentClass<UnconnectedKeplerGlProps>;
export const DEFAULT_KEPLER_GL_PROPS: Partial<KeplerGlProps>;

export default function KeplerGlFactory(): ComponentClass<KeplerGlProps>;
