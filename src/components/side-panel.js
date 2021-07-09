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

import React, {useCallback, useMemo} from 'react';
import {FormattedMessage} from 'localization';

import {
  EXPORT_DATA_ID,
  EXPORT_MAP_ID,
  SHARE_MAP_ID,
  SIDEBAR_PANELS,
  OVERWRITE_MAP_ID,
  SAVE_MAP_ID,
  EXPORT_IMAGE_ID,
  ADD_DATA_ID,
  ADD_MAP_STYLE_ID
} from 'constants/default-settings';

import SidebarFactory from './side-panel/side-bar';
import PanelHeaderFactory from './side-panel/panel-header';
import PanelToggleFactory from './side-panel/panel-toggle';
import LayerManagerFactory from './side-panel/layer-manager';
import FilterManagerFactory from './side-panel/filter-manager';
import InteractionManagerFactory from './side-panel/interaction-manager';
import MapManagerFactory from './side-panel/map-manager';
import CustomPanelsFactory from './side-panel/custom-panel';
import PanelTitleFactory from './side-panel/panel-title';

import styled from 'styled-components';
import get from 'lodash.get';

export const StyledSidePanelContent = styled.div`
  ${props => props.theme.sidePanelScrollBar};
  flex-grow: 1;
  padding: ${props => props.theme.sidePanelInnerPadding}px;
  overflow-y: scroll;
  overflow-x: hidden;

  .side-panel__content__inner {
    display: flex;
    height: 100%;
    flex-direction: column;
  }
`;

SidePanelFactory.deps = [
  SidebarFactory,
  PanelHeaderFactory,
  PanelToggleFactory,
  PanelTitleFactory,
  LayerManagerFactory,
  FilterManagerFactory,
  InteractionManagerFactory,
  MapManagerFactory,
  CustomPanelsFactory
];

/**
 * Vertical sidebar containing input components for the rendering layers
 */
export default function SidePanelFactory(
  Sidebar,
  PanelHeader,
  PanelToggle,
  PanelTitle,
  LayerManager,
  FilterManager,
  InteractionManager,
  MapManager,
  CustomPanels
) {
  // inject components
  const SIDEBAR_COMPONENTS = {
    layer: LayerManager,
    filter: FilterManager,
    interaction: InteractionManager,
    map: MapManager
  };

  // We should defined sidebar panels here but keeping them for backward compatible
  const fullPanels = SIDEBAR_PANELS.map(component => ({
    ...component,
    component: SIDEBAR_COMPONENTS[component.id]
  }));

  const getCustomPanelProps = get(CustomPanels, ['defaultProps', 'getProps']) || (() => ({}));

  /** @type {typeof import('./side-panel').SidePanel} */
  // eslint-disable-next-line max-statements
  const SidePanel = props => {
    const {
      appName,
      appWebsite,
      availableProviders,
      datasets,
      filters,
      layers,
      layerBlending,
      layerClasses,
      layerOrder,
      interactionConfig,
      panels,
      mapInfo,
      mapSaved,
      mapStateActions,
      mapStyle,
      mapStyleActions,
      onSaveMap,
      uiState,
      uiStateActions,
      visStateActions,
      version,
      width
    } = props;
    const {openDeleteModal, toggleModal, toggleSidePanel} = uiStateActions;
    const {activeSidePanel} = uiState;
    const {setMapInfo, showDatasetTable} = visStateActions;
    const {hasShare, hasStorage} = availableProviders;

    const {title} = mapInfo;

    const isOpen = Boolean(activeSidePanel);

    const _onOpenOrClose = useCallback(() => toggleSidePanel(activeSidePanel ? null : 'layer'), [
      activeSidePanel,
      toggleSidePanel
    ]);

    const onClickExportImage = useCallback(() => toggleModal(EXPORT_IMAGE_ID), [toggleModal]);
    const onClickExportData = useCallback(() => toggleModal(EXPORT_DATA_ID), [toggleModal]);
    const onClickExportMap = useCallback(() => toggleModal(EXPORT_MAP_ID), [toggleModal]);
    const onClickSaveToStorage = useCallback(
      () => toggleModal(mapSaved ? OVERWRITE_MAP_ID : SAVE_MAP_ID),
      [mapSaved, toggleModal]
    );
    const onClickSaveAsToStorage = useCallback(() => {
      setMapInfo({
        title: `${title || 'Kepler.gl'} (Copy)`
      });

      toggleModal(SAVE_MAP_ID);
    }, [title, setMapInfo, toggleModal]);
    const onClickShareMap = useCallback(() => toggleModal(SHARE_MAP_ID), [toggleModal]);
    const onShowDatasetTable = useCallback(dataId => showDatasetTable(dataId), [showDatasetTable]);
    const onShowAddDataModal = useCallback(() => toggleModal(ADD_DATA_ID), [toggleModal]);
    const onShowAddMapStyleModal = useCallback(() => toggleModal(ADD_MAP_STYLE_ID), [toggleModal]);
    const onRemoveDataset = useCallback(dataId => openDeleteModal(dataId), [openDeleteModal]);
    const onSaveToStorage = useMemo(() => ((hasStorage ? onClickSaveToStorage : null)), [
      hasStorage,
      onClickSaveToStorage
    ]);
    const onSaveAsToStorage = useMemo(
      () => ((hasStorage && mapSaved ? onClickSaveAsToStorage : null)),
      [hasStorage, mapSaved, onClickSaveAsToStorage]
    );
    const currentPanel = useMemo(() => panels.find(({id}) => id === activeSidePanel) || {}, [
      activeSidePanel,
      panels
    ]);
    const onShareMap = useMemo(() => ((hasShare ? onClickShareMap : null)), [
      hasShare,
      onClickShareMap
    ]);
    const customPanelProps = useMemo(() => getCustomPanelProps(props), [props]);

    const PanelComponent = currentPanel.component;

    return (
      <Sidebar width={width} isOpen={isOpen} minifiedWidth={0} onOpenOrClose={_onOpenOrClose}>
        <PanelHeader
          appName={appName}
          version={version}
          appWebsite={appWebsite}
          visibleDropdown={uiState.visibleDropdown}
          showExportDropdown={uiStateActions.showExportDropdown}
          hideExportDropdown={uiStateActions.hideExportDropdown}
          onExportImage={onClickExportImage}
          onExportData={onClickExportData}
          onExportMap={onClickExportMap}
          onSaveMap={onSaveMap}
          onSaveToStorage={onSaveToStorage}
          onSaveAsToStorage={onSaveAsToStorage}
          onShareMap={onShareMap}
        />
        {/* the next two components should be moved into one */}
        {/* but i am keeping them because of backward compatibility */}
        <PanelToggle
          panels={panels}
          activePanel={activeSidePanel}
          togglePanel={uiStateActions.toggleSidePanel}
        />
        <StyledSidePanelContent className="side-panel__content">
          <div className="side-panel__content__inner">
            <PanelTitle className="side-panel__content__title">
              <FormattedMessage id={currentPanel.label} />
            </PanelTitle>
            {PanelComponent ? (
              <PanelComponent
                datasets={datasets}
                filters={filters}
                layers={layers}
                layerClasses={layerClasses}
                layerOrder={layerOrder}
                layerBlending={layerBlending}
                mapStyle={mapStyle}
                mapStyleActions={mapStyleActions}
                mapStateActions={mapStateActions}
                interactionConfig={interactionConfig}
                removeDataset={onRemoveDataset}
                showDatasetTable={onShowDatasetTable}
                showAddDataModal={onShowAddDataModal}
                showAddMapStyleModal={onShowAddMapStyleModal}
                uiStateActions={uiStateActions}
                visStateActions={visStateActions}
              />
            ) : null}
            <CustomPanels {...customPanelProps} activeSidePanel={activeSidePanel} />
          </div>
        </StyledSidePanelContent>
      </Sidebar>
    );
  };

  SidePanel.defaultProps = {
    panels: fullPanels,
    sidebarComponents: SIDEBAR_COMPONENTS,
    uiState: {},
    visStateActions: {},
    mapStyleActions: {},
    uiStateActions: {},
    availableProviders: {},
    mapInfo: {}
  };

  return SidePanel;
}
