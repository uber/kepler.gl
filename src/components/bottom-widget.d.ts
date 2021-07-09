import React from 'react';
import {Datasets, Filter, AnimationConfig} from 'reducers/vis-state-updaters';
import {UiState} from 'reducers/ui-state-updaters';
import * as UIStateActions from 'actions/ui-state-actions';
import * as VisStateActions from 'actions/vis-state-actions';
import {Layer} from 'layers';

export type BottomWidgetProps = {
  datasets: Datasets;
  filters: Filter[];
  layers: Layer[];
  animationConfig: AnimationConfig;
  uiStateActions: typeof UIStateActions;
  visStateActions: typeof VisStateActions;
  rootRef: React.ForwardedRef<HTMLDivElement>;
  containerW: number;
  uiState: UiState;
  sidePanelWidth: number;
  toggleModal: typeof UIStateActions.toggleModal;
  children?: React.ReactNode;
};

export function BottomWidgetFactory(
  TimeWidget: typeof React.Component,
  AnimationControl: typeof React.Component,
  FilterAnimationController: typeof React.Component,
  LayerAnimationController: typeof React.Component
): any;

export default BottomWidgetFactory;

export function LayerAnimationControllerFactory(): React.Component;
export function FilterAnimationControllerFactory(): React.Component;
