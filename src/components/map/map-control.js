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

import React, {Component, useCallback} from 'react';
import PropTypes from 'prop-types';
import {createSelector} from 'reselect';
import styled from 'styled-components';
import {FormattedMessage} from 'localization';
import classnames from 'classnames';

import {IconRoundSmall, MapControlButton, Tooltip} from 'components/common/styled-components';
import MapLayerSelector from 'components/common/map-layer-selector';
import KeplerGlLogo from 'components/common/logo';
import MapLegend from './map-legend';
import {
  Close,
  Cube3d,
  CursorClick,
  Delete,
  DrawPolygon,
  EyeSeen,
  EyeUnseen,
  Layers,
  Legend,
  Polygon,
  Rectangle,
  Split
} from 'components/common/icons';
import VerticalToolbar from 'components/common/vertical-toolbar';
import ToolbarItem from 'components/common/toolbar-item';
import {EDITOR_MODES} from 'constants/default-settings';
import {LOCALE_CODES} from 'localization/locales';

const StyledMapControl = styled.div`
  right: 0;
  padding: ${props => props.theme.mapControl.padding}px;
  z-index: 10;
  margin-top: ${props => props.top || 0}px;
  position: absolute;
`;

const StyledMapControlAction = styled.div`
  padding: 4px 0;
  display: flex;
  justify-content: flex-end;
`;

const StyledMapControlPanel = styled.div`
  background-color: ${props => props.theme.mapPanelBackgroundColor};
  flex-grow: 1;
  z-index: 1;
  p {
    margin-bottom: 0;
  }
`;

const StyledMapControlPanelContent = styled.div.attrs({
  className: 'map-control__panel-content'
})`
  ${props => props.theme.dropdownScrollBar};
  max-height: 500px;
  min-height: 100px;
  min-width: ${props => props.theme.mapControl.width}px;
  overflow: auto;
`;

const StyledMapControlPanelHeader = styled.div.attrs({
  className: 'map-control__panel-header'
})`
  display: flex;
  justify-content: space-between;
  background-color: ${props => props.theme.mapPanelHeaderBackgroundColor};
  height: 32px;
  padding: 6px 12px;
  font-size: 11px;
  color: ${props => props.theme.titleTextColor};
  position: relative;

  button {
    width: 18px;
    height: 18px;
  }
`;

const ActionPanel = ({className = '', children}) => (
  <StyledMapControlAction className={className}>{children}</StyledMapControlAction>
);

ActionPanel.displayName = 'ActionPanel';

/** @type {import('./map-control').MapControlTooltipComponent} */
const MapControlTooltip = React.memo(({id, message}) => (
  <Tooltip id={id} place="left" effect="solid">
    <span>
      <FormattedMessage id={message} />
    </span>
  </Tooltip>
));

MapControlTooltip.displayName = 'MapControlTooltip';

const MapLegendTooltip = ({id, message}) => (
  <Tooltip id={id} place="left" effect="solid">
    <span>
      <FormattedMessage id={message} />
    </span>
  </Tooltip>
);

/** @type {import('./map-control').LayerSelectorPanelComponent} */
const LayerSelectorPanel = React.memo(
  ({items, onMapToggleLayer, isActive, toggleMenuPanel, disableClose}) =>
    !isActive ? (
      (<MapControlButton
        key={1}
        onClick={e => {
          e.preventDefault();
          toggleMenuPanel();
        }}
        className="map-control-button toggle-layer"
        data-tip
        data-for="toggle-layer"
      >
        <Layers height="22px" />
        <MapControlTooltip
          id="toggle-layer"
          message={isActive ? 'tooltip.hideLayerPanel' : 'tooltip.showLayerPanel'}
        />
      </MapControlButton>)
    ) : (
      (<MapControlPanel
        header="header.visibleLayers"
        onClick={toggleMenuPanel}
        disableClose={disableClose}
      >
        <MapLayerSelector layers={items} onMapToggleLayer={onMapToggleLayer} />
      </MapControlPanel>)
    )
);

LayerSelectorPanel.displayName = 'LayerSelectorPanel';

/** @type {import('./map-control').MapControlPanelComponent} */
const MapControlPanel = React.memo(
  ({children, header, onClick, scale = 1, isExport, disableClose = false, logoComponent}) => (
    <StyledMapControlPanel
      style={{
        transform: `scale(${scale})`,
        marginBottom: '8px'
      }}
    >
      <StyledMapControlPanelHeader>
        {isExport && logoComponent ? (
          logoComponent
        ) : header ? (
          <span style={{verticalAlign: 'middle'}}>
            <FormattedMessage id={header} />
          </span>
        ) : null}
        {isExport ? null : (
          <IconRoundSmall className="close-map-control-item" onClick={onClick}>
            <Close height="16px" />
          </IconRoundSmall>
        )}
      </StyledMapControlPanelHeader>
      <StyledMapControlPanelContent>{children}</StyledMapControlPanelContent>
    </StyledMapControlPanel>
  )
);

MapControlPanel.displayName = 'MapControlPanel';

MapLegendPanelFactory.deps = [];
export function MapLegendPanelFactory() {
  const defaultActionIcons = {
    legend: Legend
  };
  /** @type {import('./map-control').MapLegendPanelComponent} */
  const MapLegendPanel = ({
    layers,
    isActive,
    scale,
    onToggleMenuPanel,
    isExport,
    disableClose,
    logoComponent,
    actionIcons = defaultActionIcons
  }) =>
    !isActive ? (
      (<MapControlButton
        key={2}
        data-tip
        data-for="show-legend"
        className="map-control-button show-legend"
        onClick={e => {
          e.preventDefault();
          onToggleMenuPanel();
        }}
      >
        <actionIcons.legend height="22px" />
        <MapLegendTooltip id="show-legend" message={'tooltip.showLegend'} />
      </MapControlButton>)
    ) : (
      (<MapControlPanel
        scale={scale}
        header={'header.layerLegend'}
        onClick={onToggleMenuPanel}
        isExport={isExport}
        disableClose={disableClose}
        logoComponent={logoComponent}
      >
        <MapLegend layers={layers} />
      </MapControlPanel>)
    );

  MapLegendPanel.displayName = 'MapControlPanel';
  return MapLegendPanel;
}

SplitMapButtonFactory.deps = [];
export function SplitMapButtonFactory() {
  const defaultActionIcons = {
    delete: Delete,
    split: Split
  };
  /** @type {import('./map-control').SplitMapButtonComponent} */
  const SplitMapButton = React.memo(
    ({isSplit, mapIndex, onToggleSplitMap, actionIcons = defaultActionIcons}) => (
      <MapControlButton
        active={isSplit}
        onClick={e => {
          e.preventDefault();
          onToggleSplitMap(isSplit ? mapIndex : undefined);
        }}
        key={`split-${isSplit}`}
        className={classnames('map-control-button', 'split-map', {'close-map': isSplit})}
        data-tip
        data-for="action-toggle"
      >
        {isSplit ? <actionIcons.delete height="18px" /> : <actionIcons.split height="18px" />}
        <MapControlTooltip
          id="action-toggle"
          message={isSplit ? 'tooltip.closePanel' : 'tooltip.switchToDualView'}
        />
      </MapControlButton>
    )
  );

  SplitMapButton.displayName = 'SplitMapButton';
  return SplitMapButton;
}

Toggle3dButtonFactory.deps = [];
export function Toggle3dButtonFactory() {
  const defaultActionIcons = {
    cube: Cube3d
  };
  /** @type {import('./map-control').Toggle3dButtonComponent} */
  const Toggle3dButton = React.memo(
    ({dragRotate, onTogglePerspective, actionIcons = defaultActionIcons}) => (
      <MapControlButton
        onClick={e => {
          e.preventDefault();
          onTogglePerspective();
        }}
        active={dragRotate}
        data-tip
        data-for="action-3d"
      >
        <actionIcons.cube height="22px" />
        <MapControlTooltip
          id="action-3d"
          message={dragRotate ? 'tooltip.disable3DMap' : 'tooltip.3DMap'}
        />
      </MapControlButton>
    )
  );

  Toggle3dButton.displayName = 'Toggle3dButton';
  return Toggle3dButton;
}
const StyledToolbar = styled(VerticalToolbar)`
  position: absolute;
  right: 32px;
`;

MapDrawPanelFactory.deps = [];
export function MapDrawPanelFactory() {
  const defaultActionIcons = {
    visible: EyeSeen,
    hidden: EyeUnseen,
    polygon: DrawPolygon,
    cursor: CursorClick,
    innerPolygon: Polygon,
    rectangle: Rectangle
  };
  /** @type {import('./map-control').MapDrawPanelComponent} */
  const MapDrawPanel = React.memo(
    ({
      editor,
      isActive,
      onToggleMenuPanel,
      onSetEditorMode,
      onToggleEditorVisibility,
      actionIcons = defaultActionIcons
    }) => {
      return (
        <div className="map-draw-controls" style={{position: 'relative'}}>
          {isActive ? (
            <StyledToolbar show={isActive}>
              <ToolbarItem
                className="edit-feature"
                onClick={() => onSetEditorMode(EDITOR_MODES.EDIT)}
                label="toolbar.select"
                icon={actionIcons.cursor}
                active={editor.mode === EDITOR_MODES.EDIT}
              />
              <ToolbarItem
                className="draw-feature"
                onClick={() => onSetEditorMode(EDITOR_MODES.DRAW_POLYGON)}
                label="toolbar.polygon"
                icon={actionIcons.innerPolygon}
                active={editor.mode === EDITOR_MODES.DRAW_POLYGON}
              />
              <ToolbarItem
                className="draw-rectangle"
                onClick={() => onSetEditorMode(EDITOR_MODES.DRAW_RECTANGLE)}
                label="toolbar.rectangle"
                icon={actionIcons.rectangle}
                active={editor.mode === EDITOR_MODES.DRAW_RECTANGLE}
              />
              <ToolbarItem
                className="toggle-features"
                onClick={onToggleEditorVisibility}
                label={editor.visible ? 'toolbar.hide' : 'toolbar.show'}
                icon={editor.visible ? actionIcons.visible : actionIcons.hidden}
              />
            </StyledToolbar>
          ) : null}
          <MapControlButton
            onClick={e => {
              e.preventDefault();
              onToggleMenuPanel();
            }}
            active={isActive}
            data-tip
            data-for="map-draw"
          >
            <actionIcons.polygon height="22px" />
            <MapControlTooltip id="map-draw" message="tooltip.DrawOnMap" />
          </MapControlButton>
        </div>
      );
    }
  );

  MapDrawPanel.displayName = 'MapDrawPanel';
  return MapDrawPanel;
}

/** @type {import('./map-control').LocalePanelComponent} */
const LocalePanel = React.memo(
  ({availableLocales, isActive, onToggleMenuPanel, onSetLocale, activeLocale, disableClose}) => {
    const onClickItem = useCallback(
      locale => {
        onSetLocale(locale);
      },
      [onSetLocale]
    );

    const onClickButton = useCallback(
      e => {
        e.preventDefault();
        onToggleMenuPanel();
      },
      [onToggleMenuPanel]
    );
    const getLabel = useCallback(locale => `toolbar.${locale}`, []);

    return (
      <div style={{position: 'relative'}}>
        {isActive ? (
          <StyledToolbar show={isActive}>
            {availableLocales.map(locale => (
              <ToolbarItem
                key={locale}
                onClick={() => onClickItem(locale)}
                label={getLabel(locale)}
                active={activeLocale === locale}
              />
            ))}
          </StyledToolbar>
        ) : null}
        <MapControlButton
          onClick={onClickButton}
          active={isActive}
          data-tip
          data-for="locale"
          disableClose={disableClose}
        >
          {activeLocale.toUpperCase()}
          <MapControlTooltip id="locale" message="tooltip.selectLocale" />
        </MapControlButton>
      </div>
    );
  }
);

LocalePanel.displayName = 'LocalePanel';

const LegendLogo = <KeplerGlLogo version={false} appName="kepler.gl" />;
MapControlFactory.deps = [
  MapDrawPanelFactory,
  Toggle3dButtonFactory,
  SplitMapButtonFactory,
  MapLegendPanelFactory
];
function MapControlFactory(MapDrawPanel, Toggle3dButton, SplitMapButton, MapLegendPanel) {
  class MapControl extends Component {
    static propTypes = {
      datasets: PropTypes.object.isRequired,
      dragRotate: PropTypes.bool.isRequired,
      isSplit: PropTypes.bool.isRequired,
      layers: PropTypes.arrayOf(PropTypes.object),
      layersToRender: PropTypes.object.isRequired,
      mapIndex: PropTypes.number.isRequired,
      mapControls: PropTypes.object.isRequired,
      onTogglePerspective: PropTypes.func.isRequired,
      onToggleSplitMap: PropTypes.func.isRequired,
      onToggleMapControl: PropTypes.func.isRequired,
      onSetEditorMode: PropTypes.func.isRequired,
      onToggleEditorVisibility: PropTypes.func.isRequired,
      top: PropTypes.number.isRequired,
      onSetLocale: PropTypes.func.isRequired,
      locale: PropTypes.string.isRequired,
      logoComponent: PropTypes.oneOfType([PropTypes.element, PropTypes.func]),

      // optional
      readOnly: PropTypes.bool,
      scale: PropTypes.number,
      mapLayers: PropTypes.object,
      editor: PropTypes.object
    };

    static defaultProps = {
      isSplit: false,
      top: 0,
      mapIndex: 0,
      logoComponent: LegendLogo
    };

    layerSelector = props => props.layers;
    layersToRenderSelector = props => props.layersToRender;
    layerPanelItemsSelector = createSelector(
      this.layerSelector,
      this.layersToRenderSelector,
      (layers, layersToRender) =>
        layers
          .filter(l => l.config.isVisible)
          .map(layer => ({
            id: layer.id,
            name: layer.config.label,
            // layer
            isVisible: layersToRender[layer.id]
          }))
    );

    render() {
      const {
        dragRotate,
        layers,
        layersToRender,
        isSplit,
        isExport,
        mapIndex,
        mapControls,
        onTogglePerspective,
        onToggleSplitMap,
        onMapToggleLayer,
        onToggleMapControl,
        editor,
        scale,
        readOnly,
        locale,
        top,
        logoComponent
      } = this.props;

      const {
        visibleLayers = {},
        mapLegend = {},
        toggle3d = {},
        splitMap = {},
        mapDraw = {},
        mapLocale = {}
      } = mapControls;

      return (
        <StyledMapControl className="map-control" top={top}>
          {/* Split Map */}
          {splitMap.show && readOnly !== true ? (
            <ActionPanel className="split-map" key={0}>
              <SplitMapButton
                isSplit={isSplit}
                mapIndex={mapIndex}
                onToggleSplitMap={onToggleSplitMap}
              />
            </ActionPanel>
          ) : null}

          {/* Map Layers */}
          {isSplit && visibleLayers.show && readOnly !== true ? (
            <ActionPanel className="map-layers" key={1}>
              <LayerSelectorPanel
                items={this.layerPanelItemsSelector(this.props)}
                onMapToggleLayer={onMapToggleLayer}
                isActive={visibleLayers.active}
                toggleMenuPanel={() => onToggleMapControl('visibleLayers')}
                disableClose={visibleLayers.disableClose}
              />
            </ActionPanel>
          ) : null}

          {/* 3D Map */}
          {toggle3d.show ? (
            <ActionPanel className="toggle-3d" key={2}>
              <Toggle3dButton dragRotate={dragRotate} onTogglePerspective={onTogglePerspective} />
            </ActionPanel>
          ) : null}

          {/* Map Legend */}
          {mapLegend.show ? (
            <ActionPanel className="show-legend" key={3}>
              <MapLegendPanel
                layers={layers.filter(l => layersToRender[l.id])}
                scale={scale}
                isExport={isExport}
                onMapToggleLayer={onMapToggleLayer}
                isActive={mapLegend.active}
                onToggleMenuPanel={() => onToggleMapControl('mapLegend')}
                disableClose={mapLegend.disableClose}
                logoComponent={logoComponent}
              />
            </ActionPanel>
          ) : null}

          {mapDraw.show ? (
            <ActionPanel key={4}>
              <MapDrawPanel
                isActive={mapDraw.active && mapDraw.activeMapIndex === mapIndex}
                editor={editor}
                onToggleMenuPanel={() => onToggleMapControl('mapDraw')}
                onSetEditorMode={this.props.onSetEditorMode}
                onToggleEditorVisibility={this.props.onToggleEditorVisibility}
              />
            </ActionPanel>
          ) : null}

          {mapLocale.show ? (
            <ActionPanel key={5}>
              <LocalePanel
                isActive={mapLocale.active}
                activeLocale={locale}
                availableLocales={Object.keys(LOCALE_CODES)}
                onSetLocale={this.props.onSetLocale}
                onToggleMenuPanel={() => onToggleMapControl('mapLocale')}
                disableClose={mapLocale.disableClose}
              />
            </ActionPanel>
          ) : null}
        </StyledMapControl>
      );
    }
  }

  MapControl.displayName = 'MapControl';

  return MapControl;
}

export default MapControlFactory;
