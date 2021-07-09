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

import React, {useCallback} from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import PanelTabFactory from './panel-tab';

const propTypes = {
  panels: PropTypes.arrayOf(PropTypes.object),
  activePanel: PropTypes.string,
  togglePanel: PropTypes.func
};

const PanelHeaderBottom = styled.div.attrs({
  className: 'side-side-panel__header__bottom'
})`
  background-color: ${props => props.theme.sidePanelHeaderBg};
  border-bottom: 1px solid ${props => props.theme.sidePanelHeaderBorder};
  padding: 0 16px;
  display: flex;
  min-height: 30px;
`;

PanelToggleFactory.deps = [PanelTabFactory];
function PanelToggleFactory(PanelTab) {
  const PanelToggle = ({activePanel, panels, togglePanel}) => {
    const onClick = useCallback(
      panel => {
        const callback = panel.onClick || togglePanel;
        callback(panel.id);
      },
      [togglePanel]
    );
    return (
      <PanelHeaderBottom>
        {panels.map(panel => (
          <PanelTab
            key={panel.id}
            panel={panel}
            isActive={activePanel === panel.id}
            onClick={() => onClick(panel)}
          />
        ))}
      </PanelHeaderBottom>
    );
  };

  PanelToggle.propTypes = propTypes;
  return PanelToggle;
}

export default PanelToggleFactory;
