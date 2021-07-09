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

import React, {Component, createRef} from 'react';
import {console as Console} from 'global/window';
import {bindActionCreators} from 'redux';
import styled, {ThemeProvider, withTheme} from 'styled-components';
import {createSelector} from 'reselect';
import {connect as keplerGlConnect} from 'connect/keplergl-connect';
import {IntlProvider} from 'react-intl';
import {messages} from '../localization';
import {RootContext} from 'components/context';

import * as VisStateActions from 'actions/vis-state-actions';
import * as MapStateActions from 'actions/map-state-actions';
import * as MapStyleActions from 'actions/map-style-actions';
import * as UIStateActions from 'actions/ui-state-actions';
import * as ProviderActions from 'actions/provider-actions';

import {
  DIMENSIONS,
  KEPLER_GL_NAME,
  KEPLER_GL_VERSION,
  THEME,
  DEFAULT_MAPBOX_API_URL
} from 'constants/default-settings';
import {MISSING_MAPBOX_TOKEN} from 'constants/user-feedbacks';

import SidePanelFactory from './side-panel';
import MapContainerFactory from './map-container';
import BottomWidgetFactory from './bottom-widget';
import ModalContainerFactory from './modal-container';
import PlotContainerFactory from './plot-container';
import NotificationPanelFactory from './notification-panel';
import GeoCoderPanelFactory from './geocoder-panel';

import {generateHashId} from 'utils/utils';
import {validateToken} from 'utils/mapbox-utils';
import {mergeMessages} from 'utils/locale-utils';

import {theme as basicTheme, themeLT, themeBS} from 'styles/base';

// Maybe we should think about exporting this or creating a variable
// as part of the base.js theme
const GlobalStyle = styled.div`
  font-family: ${props => props.theme.fontFamily};
  font-weight: ${props => props.theme.fontWeight};
  font-size: ${props => props.theme.fontSize};
  line-height: ${props => props.theme.lineHeight};

  *,
  *:before,
  *:after {
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
  }

  ul {
    margin: 0;
    padding: 0;
  }

  li {
    margin: 0;
  }

  a {
    text-decoration: none;
    color: ${props => props.theme.labelColor};
  }

  .mapboxgl-ctrl .mapboxgl-ctrl-logo {
    display: none;
  }
`;

export const mapFieldsSelector = props => ({
  getMapboxRef: props.getMapboxRef,
  mapboxApiAccessToken: props.mapboxApiAccessToken,
  mapboxApiUrl: props.mapboxApiUrl,
  mapState: props.mapState,
  mapStyle: props.mapStyle,
  onDeckInitialized: props.onDeckInitialized,
  onViewStateChange: props.onViewStateChange,
  deckGlProps: props.deckGlProps,
  uiStateActions: props.uiStateActions,
  visStateActions: props.visStateActions,
  mapStateActions: props.mapStateActions,

  // visState
  editor: props.visState.editor,
  datasets: props.visState.datasets,
  layers: props.visState.layers,
  layerOrder: props.visState.layerOrder,
  layerData: props.visState.layerData,
  layerBlending: props.visState.layerBlending,
  filters: props.visState.filters,
  interactionConfig: props.visState.interactionConfig,
  hoverInfo: props.visState.hoverInfo,
  clicked: props.visState.clicked,
  mousePos: props.visState.mousePos,
  animationConfig: props.visState.animationConfig,

  // uiState
  activeSidePanel: props.uiState.activeSidePanel,
  mapControls: props.uiState.mapControls,
  readOnly: props.uiState.readOnly,
  locale: props.uiState.locale
});

export const sidePanelSelector = (props, availableProviders) => ({
  appName: props.appName,
  version: props.version,
  appWebsite: props.appWebsite,
  mapStyle: props.mapStyle,
  onSaveMap: props.onSaveMap,
  uiState: props.uiState,
  mapStyleActions: props.mapStyleActions,
  visStateActions: props.visStateActions,
  uiStateActions: props.uiStateActions,

  datasets: props.visState.datasets,
  filters: props.visState.filters,
  layers: props.visState.layers,
  layerOrder: props.visState.layerOrder,
  layerClasses: props.visState.layerClasses,
  interactionConfig: props.visState.interactionConfig,
  mapInfo: props.visState.mapInfo,
  layerBlending: props.visState.layerBlending,

  width: props.sidePanelWidth,
  availableProviders,
  mapSaved: props.providerState.mapSaved
});

export const plotContainerSelector = props => ({
  width: props.width,
  height: props.height,
  exportImageSetting: props.uiState.exportImage,
  mapFields: mapFieldsSelector(props),
  addNotification: props.uiStateActions.addNotification,
  setExportImageSetting: props.uiStateActions.setExportImageSetting,
  setExportImageDataUri: props.uiStateActions.setExportImageDataUri,
  setExportImageError: props.uiStateActions.setExportImageError,
  splitMaps: props.visState.splitMaps
});

export const isSplitSelector = props =>
  props.visState.splitMaps && props.visState.splitMaps.length > 1;
export const containerWSelector = props =>
  props.mapState.width * (Number(isSplitSelector(props)) + 1);

export const bottomWidgetSelector = (props, theme) => ({
  filters: props.visState.filters,
  datasets: props.visState.datasets,
  uiState: props.uiState,
  layers: props.visState.layers,
  animationConfig: props.visState.animationConfig,
  visStateActions: props.visStateActions,
  sidePanelWidth: props.uiState.readOnly ? 0 : props.sidePanelWidth + theme.sidePanel.margin.left,
  containerW: containerWSelector(props)
});

export const modalContainerSelector = (props, rootNode) => ({
  appName: props.appName,
  mapStyle: props.mapStyle,
  visState: props.visState,
  mapState: props.mapState,
  uiState: props.uiState,
  providerState: props.providerState,

  mapboxApiAccessToken: props.mapboxApiAccessToken,
  mapboxApiUrl: props.mapboxApiUrl,
  visStateActions: props.visStateActions,
  uiStateActions: props.uiStateActions,
  mapStyleActions: props.mapStyleActions,
  providerActions: props.providerActions,

  rootNode,
  containerW: containerWSelector(props),
  containerH: props.mapState.height,
  // User defined cloud provider props
  cloudProviders: props.cloudProviders,
  onExportToCloudSuccess: props.onExportToCloudSuccess,
  onLoadCloudMapSuccess: props.onLoadCloudMapSuccess,
  onLoadCloudMapError: props.onLoadCloudMapError,
  onExportToCloudError: props.onExportToCloudError
});

export const geoCoderPanelSelector = props => ({
  isGeocoderEnabled: props.visState.interactionConfig.geocoder.enabled,
  mapboxApiAccessToken: props.mapboxApiAccessToken,
  mapState: props.mapState,
  updateVisData: props.visStateActions.updateVisData,
  removeDataset: props.visStateActions.removeDataset,
  updateMap: props.mapStateActions.updateMap
});

export const notificationPanelSelector = props => ({
  removeNotification: props.uiStateActions.removeNotification,
  notifications: props.uiState.notifications
});

export const DEFAULT_KEPLER_GL_PROPS = {
  mapStyles: [],
  mapStylesReplaceDefault: false,
  mapboxApiUrl: DEFAULT_MAPBOX_API_URL,
  width: 800,
  height: 800,
  appName: KEPLER_GL_NAME,
  version: KEPLER_GL_VERSION,
  sidePanelWidth: DIMENSIONS.sidePanel.width,
  theme: {},
  cloudProviders: [],
  readOnly: false
};

KeplerGlFactory.deps = [
  BottomWidgetFactory,
  GeoCoderPanelFactory,
  MapContainerFactory,
  ModalContainerFactory,
  SidePanelFactory,
  PlotContainerFactory,
  NotificationPanelFactory
];

function KeplerGlFactory(
  BottomWidget,
  GeoCoderPanel,
  MapContainer,
  ModalContainer,
  SidePanel,
  PlotContainer,
  NotificationPanel
) {
  /** @typedef {import('./kepler-gl').UnconnectedKeplerGlProps} KeplerGlProps */
  /** @augments React.Component<KeplerGlProps> */
  class KeplerGL extends Component {
    static defaultProps = DEFAULT_KEPLER_GL_PROPS;

    componentDidMount() {
      this._validateMapboxToken();
      this._loadMapStyle();
      this._handleResize(this.props);
      if (typeof this.props.onKeplerGlInitialized === 'function') {
        this.props.onKeplerGlInitialized();
      }
    }

    componentDidUpdate(prevProps) {
      if (
        // if dimension props has changed
        this.props.height !== prevProps.height ||
        this.props.width !== prevProps.width ||
        // react-map-gl will dispatch updateViewport after this._handleResize is called
        // here we check if this.props.mapState.height is sync with props.height
        this.props.height !== this.props.mapState.height
      ) {
        this._handleResize(this.props);
      }
    }
    static contextType = RootContext;

    root = createRef();

    /* selectors */
    themeSelector = props => props.theme;
    availableThemeSelector = createSelector(this.themeSelector, theme =>
      typeof theme === 'object'
        ? {
            ...basicTheme,
            ...theme
          }
        : theme === THEME.light
        ? themeLT
        : theme === THEME.base
        ? themeBS
        : theme
    );

    availableProviders = createSelector(
      props => props.cloudProviders,
      providers =>
        Array.isArray(providers) && providers.length
          ? {
              hasStorage: providers.some(p => p.hasPrivateStorage()),
              hasShare: providers.some(p => p.hasSharingUrl())
            }
          : {}
    );

    localeMessagesSelector = createSelector(
      props => props.localeMessages,
      customMessages => (customMessages ? mergeMessages(messages, customMessages) : messages)
    );

    /* private methods */
    _validateMapboxToken() {
      const {mapboxApiAccessToken} = this.props;
      if (!validateToken(mapboxApiAccessToken)) {
        Console.warn(MISSING_MAPBOX_TOKEN);
      }
    }

    _handleResize({width, height}) {
      if (!Number.isFinite(width) || !Number.isFinite(height)) {
        Console.warn('width and height is required');
        return;
      }
      this.props.mapStateActions.updateMap({
        width: width / (1 + Number(this.props.mapState.isSplit)),
        height
      });
    }

    _loadMapStyle = () => {
      const defaultStyles = Object.values(this.props.mapStyle.mapStyles);
      // add id to custom map styles if not given
      const customStyles = (this.props.mapStyles || []).map(ms => ({
        ...ms,
        id: ms.id || generateHashId()
      }));

      const allStyles = [...customStyles, ...defaultStyles].reduce(
        (accu, style) => {
          const hasStyleObject = style.style && typeof style.style === 'object';
          accu[hasStyleObject ? 'toLoad' : 'toRequest'][style.id] = style;

          return accu;
        },
        {toLoad: {}, toRequest: {}}
      );

      this.props.mapStyleActions.loadMapStyles(allStyles.toLoad);
      this.props.mapStyleActions.requestMapStyles(allStyles.toRequest);
    };

    render() {
      const {
        id,
        width,
        height,
        uiState,
        visState,
        // readOnly override
        readOnly
      } = this.props;

      const {
        splitMaps, // this will store support for split map view is necessary
        interactionConfig
      } = visState;

      const isSplit = isSplitSelector(this.props);
      const theme = this.availableThemeSelector(this.props);
      const localeMessages = this.localeMessagesSelector(this.props);
      const isExportingImage = uiState.exportImage.exporting;
      const availableProviders = this.availableProviders(this.props);

      const mapFields = mapFieldsSelector(this.props);
      const sideFields = sidePanelSelector(this.props, availableProviders);
      const plotContainerFields = plotContainerSelector(this.props);
      const bottomWidgetFields = bottomWidgetSelector(this.props, theme);
      const modalContainerFields = modalContainerSelector(this.props, this.root.current);
      const geoCoderPanelFields = geoCoderPanelSelector(this.props);
      const notificationPanelFields = notificationPanelSelector(this.props);

      const mapContainers = !isSplit
        ? [<MapContainer key={0} index={0} {...mapFields} mapLayers={null} />]
        : splitMaps.map((settings, index) => (
            <MapContainer
              key={index}
              index={index}
              {...mapFields}
              mapLayers={splitMaps[index].layers}
            />
          ));

      return (
        <RootContext.Provider value={this.root}>
          <IntlProvider locale={uiState.locale} messages={localeMessages[uiState.locale]}>
            <ThemeProvider theme={theme}>
              <GlobalStyle
                className="kepler-gl"
                id={`kepler-gl__${id}`}
                style={{
                  position: 'relative',
                  width: `${width}px`,
                  height: `${height}px`
                }}
                ref={this.root}
              >
                <NotificationPanel {...notificationPanelFields} />
                {!uiState.readOnly && !readOnly && <SidePanel {...sideFields} />}
                <div className="maps" style={{display: 'flex'}}>
                  {mapContainers}
                </div>
                {isExportingImage && <PlotContainer {...plotContainerFields} />}
                {interactionConfig.geocoder.enabled && <GeoCoderPanel {...geoCoderPanelFields} />}
                <BottomWidget {...bottomWidgetFields} />
                <ModalContainer {...modalContainerFields} />
              </GlobalStyle>
            </ThemeProvider>
          </IntlProvider>
        </RootContext.Provider>
      );
    }
  }

  return keplerGlConnect(mapStateToProps, makeMapDispatchToProps)(withTheme(KeplerGL));
}

export function mapStateToProps(state = {}, props) {
  return {
    ...props,
    visState: state.visState,
    mapStyle: state.mapStyle,
    mapState: state.mapState,
    uiState: state.uiState,
    providerState: state.providerState
  };
}

const defaultUserActions = {};

const getDispatch = (dispatch, props) => dispatch;
const getUserActions = (dispatch, props) => props.actions || defaultUserActions;

/** @type {() => import('reselect').OutputParametricSelector<any, any, any, any>} */
function makeGetActionCreators() {
  return createSelector([getDispatch, getUserActions], (dispatch, userActions) => {
    const [visStateActions, mapStateActions, mapStyleActions, uiStateActions, providerActions] = [
      VisStateActions,
      MapStateActions,
      MapStyleActions,
      UIStateActions,
      ProviderActions
    ].map(actions => bindActionCreators(mergeActions(actions, userActions), dispatch));

    return {
      visStateActions,
      mapStateActions,
      mapStyleActions,
      uiStateActions,
      providerActions,
      dispatch
    };
  });
}

function makeMapDispatchToProps() {
  const getActionCreators = makeGetActionCreators();
  const mapDispatchToProps = (dispatch, ownProps) => {
    const groupedActionCreators = getActionCreators(dispatch, ownProps);

    return {
      ...groupedActionCreators,
      dispatch
    };
  };

  return mapDispatchToProps;
}

/**
 * Override default kepler.gl actions with user defined actions using the same key
 */
function mergeActions(actions, userActions) {
  const overrides = {};
  for (const key in userActions) {
    if (userActions.hasOwnProperty(key) && actions.hasOwnProperty(key)) {
      overrides[key] = userActions[key];
    }
  }

  return {...actions, ...overrides};
}

export default KeplerGlFactory;
