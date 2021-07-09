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
import styled from 'styled-components';
import PropTypes from 'prop-types';
import TimeWidgetFactory from './filters/time-widget';
import AnimationControlFactory from './common/animation-control/animation-control';
import AnimationControllerFactory from './common/animation-control/animation-controller';
import {ANIMATION_WINDOW, FILTER_TYPES} from 'constants/default-settings';
import {getIntervalBins} from 'utils/filter-utils';

const propTypes = {
  filters: PropTypes.arrayOf(PropTypes.object),
  datasets: PropTypes.object,
  uiState: PropTypes.object,
  layers: PropTypes.arrayOf(PropTypes.object),
  animationConfig: PropTypes.object,
  visStateActions: PropTypes.object,
  sidePanelWidth: PropTypes.number,
  containerW: PropTypes.number
};

const maxWidth = 1080;

const BottomWidgetContainer = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  padding-top: ${props => (props.hasPadding ? props.theme.bottomWidgetPaddingTop : 0)}px;
  padding-right: ${props => (props.hasPadding ? props.theme.bottomWidgetPaddingRight : 0)}px;
  padding-bottom: ${props => (props.hasPadding ? props.theme.bottomWidgetPaddingBottom : 0)}px;
  padding-left: ${props => (props.hasPadding ? props.theme.bottomWidgetPaddingLeft : 0)}px;
  width: ${props => props.width}px;
  bottom: 0;
  right: 0;
  z-index: 1;
`;

FilterAnimationControllerFactory.deps = [AnimationControllerFactory];
export function FilterAnimationControllerFactory(AnimationController) {
  const FilterAnimationController = ({filter, filterIdx, setFilterAnimationTime, children}) => {
    const intervalBins = useMemo(() => getIntervalBins(filter), [filter]);

    const steps = useMemo(() => (intervalBins ? intervalBins.map(x => x.x0) : null), [
      intervalBins
    ]);

    const updateAnimation = useCallback(
      value => {
        switch (filter.animationWindow) {
          case ANIMATION_WINDOW.interval:
            const idx = value[1];
            setFilterAnimationTime(filterIdx, 'value', [
              intervalBins[idx].x0,
              intervalBins[idx].x1 - 1
            ]);
            break;
          default:
            setFilterAnimationTime(filterIdx, 'value', value);
            break;
        }
      },
      [filterIdx, intervalBins, filter.animationWindow, setFilterAnimationTime]
    );

    return (
      <AnimationController
        key="filter-control"
        value={filter.value}
        domain={filter.domain}
        speed={filter.speed}
        isAnimating={filter.isAnimating}
        animationWindow={filter.animationWindow}
        steps={steps}
        updateAnimation={updateAnimation}
        children={children}
      />
    );
  };
  return FilterAnimationController;
}

LayerAnimationControllerFactory.deps = [AnimationControllerFactory];
export function LayerAnimationControllerFactory(AnimationController) {
  const LayerAnimationController = ({animationConfig, setLayerAnimationTime, children}) => (
    <AnimationController
      key="layer-control"
      value={animationConfig.currentTime}
      domain={animationConfig.domain}
      speed={animationConfig.speed}
      isAnimating={animationConfig.isAnimating}
      updateAnimation={setLayerAnimationTime}
      steps={animationConfig.timeSteps}
      animationWindow={
        animationConfig.timeSteps ? ANIMATION_WINDOW.interval : ANIMATION_WINDOW.point
      }
      children={children}
    />
  );
  return LayerAnimationController;
}

BottomWidgetFactory.deps = [
  TimeWidgetFactory,
  AnimationControlFactory,
  FilterAnimationControllerFactory,
  LayerAnimationControllerFactory
];

/* eslint-disable complexity */
export default function BottomWidgetFactory(
  TimeWidget,
  AnimationControl,
  FilterAnimationController,
  LayerAnimationController
) {
  const BottomWidget = props => {
    const {
      datasets,
      filters,
      animationConfig,
      visStateActions,
      containerW,
      uiState,
      sidePanelWidth,
      layers
    } = props;

    const {activeSidePanel, readOnly} = uiState;
    const isOpen = Boolean(activeSidePanel);

    const enlargedFilterIdx = useMemo(
      () => filters.findIndex(f => f.enlarged && f.type === FILTER_TYPES.timeRange),
      [filters]
    );
    const animatedFilterIdx = useMemo(() => filters.findIndex(f => f.isAnimating), [filters]);
    const animatedFilter = animatedFilterIdx > -1 ? filters[animatedFilterIdx] : null;

    const enlargedFilterWidth = isOpen ? containerW - sidePanelWidth : containerW;

    // show playback control if layers contain trip layer & at least one trip layer is visible
    const animatableLayer = useMemo(
      () =>
        layers.filter(l => l.config.animation && l.config.animation.enabled && l.config.isVisible),
      [layers]
    );

    const readyToAnimation =
      Array.isArray(animationConfig.domain) && Number.isFinite(animationConfig.currentTime);
    // if animation control is showing, hide time display in time slider
    const showFloatingTimeDisplay = !animatableLayer.length;
    const showAnimationControl =
      animatableLayer.length && readyToAnimation && !animationConfig.hideControl;
    const showTimeWidget = enlargedFilterIdx > -1 && Object.keys(datasets).length > 0;

    // if filter is not animating, pass in enlarged filter here because
    // animation controller needs to call reset on it
    const filter = animatedFilter || filters[enlargedFilterIdx];

    return (
      <BottomWidgetContainer
        width={Math.min(maxWidth, enlargedFilterWidth)}
        className="bottom-widget--container"
        hasPadding={showAnimationControl || showTimeWidget}
      >
        <LayerAnimationController
          animationConfig={animationConfig}
          setLayerAnimationTime={visStateActions.setLayerAnimationTime}
        >
          {(isAnimating, start, pause, reset) =>
            showAnimationControl ? (
              <AnimationControl
                animationConfig={animationConfig}
                setLayerAnimationTime={visStateActions.setLayerAnimationTime}
                updateAnimationSpeed={visStateActions.updateLayerAnimationSpeed}
                toggleAnimation={visStateActions.toggleLayerAnimation}
                isAnimatable={!animatedFilter}
                isAnimating={isAnimating}
                resetAnimation={reset}
              />
            ) : null
          }
        </LayerAnimationController>
        {filter && (
          <FilterAnimationController
            filter={filter}
            filterIdx={animatedFilterIdx > -1 ? animatedFilterIdx : enlargedFilterIdx}
            setFilterAnimationTime={visStateActions.setFilterAnimationTime}
          >
            {(isAnimating, start, pause, resetAnimation) =>
              showTimeWidget ? (
                <TimeWidget
                  // TimeWidget uses React.memo, here we pass width
                  // even though it doesnt use it, to force rerender
                  width={enlargedFilterWidth}
                  filter={filters[enlargedFilterIdx]}
                  index={enlargedFilterIdx}
                  isAnyFilterAnimating={Boolean(animatedFilter)}
                  datasets={datasets}
                  readOnly={readOnly}
                  showTimeDisplay={showFloatingTimeDisplay}
                  setFilterPlot={visStateActions.setFilterPlot}
                  setFilter={visStateActions.setFilter}
                  setFilterAnimationTime={visStateActions.setFilterAnimationTime}
                  setFilterAnimationWindow={visStateActions.setFilterAnimationWindow}
                  toggleAnimation={visStateActions.toggleFilterAnimation}
                  updateAnimationSpeed={visStateActions.updateFilterAnimationSpeed}
                  enlargeFilter={visStateActions.enlargeFilter}
                  resetAnimation={resetAnimation}
                  isAnimatable={!animationConfig || !animationConfig.isAnimating}
                />
              ) : null
            }
          </FilterAnimationController>
        )}
      </BottomWidgetContainer>
    );
  };

  BottomWidget.propTypes = propTypes;

  return BottomWidget;
}
/* eslint-enable complexity */
