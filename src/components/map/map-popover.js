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

import React, {useState} from 'react';
import styled from 'styled-components';
import LayerHoverInfoFactory from './layer-hover-info';
import CoordinateInfoFactory from './coordinate-info';
import {ArrowLeft, ArrowRight, Pin} from 'components/common/icons';
import {injectIntl} from 'react-intl';
import {FormattedMessage} from 'localization';
import Tippy from '@tippyjs/react/headless';

const MAX_WIDTH = 500;
const MAX_HEIGHT = 600;

const StyledMapPopover = styled.div`
  display: flex;
  flex-direction: column;
  max-width: ${MAX_WIDTH}px;
  max-height: ${MAX_HEIGHT}px;
  padding: 14px;
  & > * + * {
    margin-top: 6px;
  }
  ${props => props.theme.scrollBar};
  font-family: ${props => props.theme.fontFamily};
  font-size: 11px;
  font-weight: 500;
  background-color: ${props => props.theme.panelBackground};
  color: ${props => props.theme.textColor};
  z-index: 1000;
  overflow-x: auto;
  box-shadow: ${props => props.theme.panelBoxShadow};

  :hover {
    background-color: ${props => `${props.theme.panelBackground}dd`};
  }

  .primary-label {
    color: ${props => props.theme.notificationColors.success};
    font-size: 10px;
  }

  .map-popover__layer-info,
  .coordingate-hover-info {
    & > * + * {
      margin-top: 7px;
    }
  }

  table {
    width: auto;
    display: grid;
    border-collapse: collapse;
    row-gap: 5px;
    column-gap: 5px;
  }

  .coordingate-hover-info > table {
    grid-template-columns: auto auto auto;
  }
  .map-popover__layer-info > table {
    grid-template-columns: auto auto;
  }

  tbody,
  tr {
    display: contents;
  }

  td {
    border-color: transparent;
    color: ${props => props.theme.textColor};
  }

  td.row__value {
    text-align: right;
    font-weight: 500;
    color: ${props => props.theme.textColorHl};
  }
`;

const PinnedButtons = styled.div`
  display: flex;
  align-self: center;
  align-items: center;
  justify-items: center;
  & > * + * {
    margin-left: 10px;
  }
`;

const PopoverContent = styled.div`
  display: flex;
  flex-direction: column;
  & > * + * {
    margin-top: 12px;
  }
`;

const StyledIcon = styled.div`
  color: ${props => props.theme.activeColor};

  &.popover-pin {
    transform: rotate(30deg);
  }

  :hover {
    cursor: pointer;
    color: ${props => props.theme.linkBtnColor};
  }
`;

MapPopoverFactory.deps = [LayerHoverInfoFactory, CoordinateInfoFactory];

function createVirtualReference(container, x, y, size = 0) {
  const bounds =
    container && container.getBoundingClientRect ? container.getBoundingClientRect() : {};
  const left = (bounds.left || 0) + x - size / 2;
  const top = (bounds.top || 0) + y - size / 2;
  return {
    left,
    top,
    right: left + size,
    bottom: top + size,
    width: size,
    height: size
  };
}

function getOffsetForPlacement({placement, reference, popper}, gap = 20) {
  switch (placement) {
    case 'top-start':
    case 'bottom-start':
      return [gap, gap];
    case 'top-end':
    case 'bottom-end':
      return [-gap, gap];
    default:
      return [0, 0];
  }
}

function getPopperOptions(container) {
  return {
    modifiers: [
      {
        name: 'preventOverflow',
        options: {
          boundary: container
        }
      }
    ]
  };
}

export default function MapPopoverFactory(LayerHoverInfo, CoordinateInfo) {
  /** @type {typeof import('./map-popover').MapPopover} */
  const MapPopover = ({
    x,
    y,
    mapW,
    mapH,
    frozen,
    coordinate,
    layerHoverProp,
    isBase,
    zoom,
    container,
    onClose
  }) => {
    const [horizontalPlacement, setHorizontalPlacement] = useState('start');
    const moveLeft = () => setHorizontalPlacement('end');
    const moveRight = () => setHorizontalPlacement('start');
    return (
      <Tippy
        popperOptions={getPopperOptions(container)}
        zIndex={999} /* should be below Modal which has zIndex=1000 */
        visible={true}
        interactive={true}
        getReferenceClientRect={() => createVirtualReference(container, x, y)}
        // @ts-ignore
        placement={`bottom-${horizontalPlacement}`}
        // @ts-ignore
        offset={getOffsetForPlacement}
        appendTo={document.body}
        render={attrs => (
          <StyledMapPopover {...attrs} className="map-popover">
            {frozen ? (
              <PinnedButtons>
                {horizontalPlacement === 'start' && (
                  <StyledIcon className="popover-arrow-left" onClick={moveLeft}>
                    <ArrowLeft />
                  </StyledIcon>
                )}
                <StyledIcon className="popover-pin" onClick={onClose}>
                  <Pin height="16px" />
                </StyledIcon>
                {horizontalPlacement === 'end' && (
                  <StyledIcon className="popover-arrow-right" onClick={moveRight}>
                    <ArrowRight />
                  </StyledIcon>
                )}
                {isBase && (
                  <div className="primary-label">
                    <FormattedMessage id="mapPopover.primary" />
                  </div>
                )}
              </PinnedButtons>
            ) : null}
            <PopoverContent>
              {Array.isArray(coordinate) && <CoordinateInfo coordinate={coordinate} zoom={zoom} />}
              {layerHoverProp && <LayerHoverInfo {...layerHoverProp} />}
            </PopoverContent>
          </StyledMapPopover>
        )}
      />
    );
  };
  return injectIntl(MapPopover);
}
