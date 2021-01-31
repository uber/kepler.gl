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

import React, {useMemo} from 'react';
import MapPopoverFactory from './map/map-popover';
import {getLayerHoverProp} from 'utils/layer-utils';
import WebMercatorViewport from 'viewport-mercator-project';

const getHoverXY = (viewport, lngLat) => {
  const screenCoord = !viewport || !lngLat ? null : viewport.project(lngLat);
  return screenCoord && {x: screenCoord[0], y: screenCoord[1]};
};

CombinedPopoversFactory.deps = [MapPopoverFactory];

function CombinedPopoversFactory(MapPopover) {
  const CombinedPopovers = ({
    mapState,
    hoverInfo,
    clicked,
    datasets,
    interactionConfig,
    layers,
    mousePosition,
    coordinate,
    pinned,
    layersToRender,
    onClosePopover,
    hasTooltip,
    hasComparisonTooltip,
    compareMode,
    onHoverXY = getHoverXY
  }) => {
    // if clicked something, ignore hover behavior
    const position = useMemo(
      () => ({
        x: mousePosition[0],
        y: mousePosition[1]
      }),
      [mousePosition]
    );

    const {pinnedPosition, layerPinnedProp, layerHoverProp} = useMemo(() => {
      const hoverProps = getLayerHoverProp({
        interactionConfig,
        hoverInfo,
        layers,
        layersToRender,
        datasets
      });

      // project lnglat to screen so that tooltip follows the object on zoom
      if (hasTooltip) {
        const viewport = new WebMercatorViewport(mapState);
        const lngLat = clicked ? clicked.lngLat : pinned.coordinate;
        const pinnedPos = onHoverXY(viewport, lngLat);
        const pinnedProp = getLayerHoverProp({
          interactionConfig,
          hoverInfo: clicked,
          layers,
          layersToRender,
          datasets
        });

        if (hoverProps && layerPinnedProp && pinnedProp) {
          hoverProps.primaryData = pinnedProp.data;
          hoverProps.compareType = interactionConfig.tooltip.config.compareType;
        }

        return {
          pinnedPosition: pinnedPos,
          layerPinnedProp: pinnedProp,
          layerHoverProp: hoverProps
        };
      }

      return {
        pinnedPosition: {},
        layerPinnedProp: null,
        layerHoverProp: hoverProps
      };
    }, [
      hasTooltip,
      mapState,
      clicked,
      pinned,
      interactionConfig,
      layers,
      layersToRender,
      datasets,
      hoverInfo
    ]);

    const {width, height, zoom} = mapState;

    const commonProp = useMemo(
      () => ({
        onClose: onClosePopover,
        mapW: width,
        mapH: height,
        zoom
      }),
      [width, height, zoom, onClosePopover]
    );

    return (
      <>
        {hasTooltip && (
          <MapPopover
            {...pinnedPosition}
            {...commonProp}
            layerHoverProp={layerPinnedProp}
            coordinate={interactionConfig.coordinate.enabled && (pinned || {}).coordinate}
            frozen={hasTooltip}
            isBase={compareMode}
          />
        )}
        {hasComparisonTooltip && (
          <MapPopover
            {...position}
            {...commonProp}
            layerHoverProp={layerHoverProp}
            coordinate={interactionConfig.coordinate.enabled && coordinate}
          />
        )}
      </>
    );
  };

  return React.memo(CombinedPopovers);
}

export default CombinedPopoversFactory;
