import {ComponentType} from 'react';
import {Datasets, Filter, InteractionConfig, MapStyle} from '../reducers';
import {Layer, LayerClassesType} from '../layers';

import * as MapStyleActions from 'actions/map-style-actions';
import * as VisStateActions from 'actions/vis-state-actions';
import * as MapStateActions from 'actions/map-state-actions';

export type SidePanelItem = {
  id: stirng;
  label: string;
  iconComponent: ComponentType<any>;
};

export type SidePanelProps = {
  filters: Filter;
  interactionConfig: InteractionConfig;
  layerBlending: stirng;
  layers: Layer;
  layerClasses: LayerClassesType;
  mapStyle: MapStyle;
  width: number;
  datasets: Datasets;
  visStateActions: typeof VisStateActions;
  mapStateActions: typeof MapStateActions;
  mapStyleActions: typeof MapStyleActions;
  availableProviders: object;
  mapSaved?: string | null;
  panels: SidePanelItem[];
};

export const SidePanel: PureComponent<SidePanelProps>;
export default function SidePanelFactory(): PureComponent<SidePanelProps>;
