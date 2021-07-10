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

import {PanelHeaderFactory, Icons, withState} from 'kepler.gl/components';
import {toggleModal} from 'kepler.gl/actions';
import React from 'react';
import {IntlProvider} from 'react-intl';
import {visStateLens} from 'kepler.gl/reducers';
import {exportJson} from 'kepler.gl/dist/utils/export-utils'

const KEPLER_DOC = 'https://docs.kepler.gl/docs/keplergl-jupyter';

export function CustomPanelHeaderFactory() {
  const PanelHeader = PanelHeaderFactory();
  const defaultActionItems = PanelHeader.defaultProps.actionItems;

  const actionItems = props => [
    {
      id: 'docs',
      iconComponent: Icons.Docs,
      href: KEPLER_DOC,
      blank: true,
      tooltip: 'tooltip.documentation',
      onClick: () => {}
    },
    {
      ...defaultActionItems.find(item => item.id === 'save'),
      label: null,
      tooltip: 'Save Map',
      onClick: () => exportJson({visState: props.visState})
    }
  ];

  const JupyterPanelHeader = props => (
    <IntlProvider locale="en" messages={{'tooltip.documentation': 'Documentation'}}>
      <PanelHeader {...props} actionItems={actionItems(props)} />
    </IntlProvider>
  );
  return withState([visStateLens], state => state, {
    toggleModal
  })(JupyterPanelHeader);
}

export default CustomPanelHeaderFactory;
