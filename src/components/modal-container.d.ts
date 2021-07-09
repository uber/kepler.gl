import React from 'react';
import * as VisStateActions from '../actions/vis-state-actions';
import * as UIStateActions from '../actions/ui-state-actions';
import * as MapStyleActions from '../actions/map-style-actions';
import * as ProviderActions from '../actions/provider-actions';
import {OnErrorCallBack, OnSuccessCallBack} from 'actions/provider-actions';

import {MapState} from 'reducers/map-state-updaters';
import {MapStyle} from 'reducers/map-style-updaters';
import {UiState} from 'reducers/ui-state-updaters';
import {VisState} from 'reducers/vis-state-updaters';
import {ProviderState} from 'reducers/provider-state-updaters';

export type ModalContainerProps = {
  rootNode: object;
  containerW: number;
  containerH: number;
  mapboxApiAccessToken: string;
  mapboxApiUrl?: string;
  mapState: MapState;
  mapStyle: MapStyle;
  uiState: UiState;
  visState: VisState;
  providerState: ProviderState;
  visStateActions: typeof VisStateActions;
  uiStateActions: typeof UIStateActions;
  mapStyleActions: typeof MapStyleActions;
  providerActions: typeof ProviderActions;
  onSaveToStorage: () => void,
  cloudProviders: object[],
  onLoadCloudMapSuccess: OnSuccessCallBack,
  onLoadCloudMapError: OnErrorCallBack,
  onExportToCloudSuccess:OnSuccessCallBack,
  onExportToCloudError: OnErrorCallBack
};

export default function ModalContainerFactory(): React.Component<ModelContainerProps>;
