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

import {Button, Icons, TextArea, withState} from 'kepler.gl/components';
import {KeplerGlSchema} from 'kepler.gl/schemas';
import {visStateLens, mapStateLens, mapStyleLens} from 'kepler.gl/reducers';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import styled from 'styled-components';

const Params = {
  true: 'True',
  false: 'False',
  null: 'None'
};

export const StyleCopyConfig = styled.div.attrs({
  className: 'copy-config'
})`
  width: 100%;
  display: flex;
  flex-direction: column;
  height: 100%;
  .copy-button {
    position: absolute;
    margin-top: -45px;
    right: 28px;
  }
  textarea {
    overflow-y: scroll;
    white-space: pre-wrap;
    width: 100%;
    height: 100%;
    resize: none;
  }
`;

// convert config from string to pything dictionary
function configStringify(config) {
  // replace true => True; false => False; null => None
  const configStr = JSON.stringify(config, null, 2);
  return configStr.replace(/: ([a-z]+)/g, function(_, key) {
    return ': ' + Params[key] || ': ' + key;
  });
}

export const CopyConfig = ({config, visState}) => {
  const [copied, setCopy] = useState(false);
  const value = configStringify(config);
  return (
    <StyleCopyConfig>
      <CopyToClipboard text={value} onCopy={() => setCopy(true)} className="copy-button">
        <Button width="100px">
          <Icons.Clipboard height="16px" />
          {copied ? 'Copied!' : 'Copy'}
        </Button>
      </CopyToClipboard>
      {/* <Button width="100px" onClick={() => {
        console.log(utils)

        exportJson({visState})
        }}>
        <Icons.Clipboard height="16px" />
        Save
      </Button> */}
      <TextArea value={value} readOnly selected />
    </StyleCopyConfig>
  );
};

function CustomSidePanelsFactory() {
  const CustomPanels = ({activeSidePanel, visState, mapState, mapStyle}) => {
    const config = KeplerGlSchema.getConfigToSave({visState, mapState, mapStyle});
    if (activeSidePanel === 'config') {
      return <CopyConfig config={config} visState={visState}/>;
    }

    return null;
  };

  CustomPanels.defaultProps = {
    panels: [
      {
        id: 'config',
        label: 'Config',
        iconComponent: Icons.CodeAlt
      }
    ]
  };

  const ConnectedCustomPanels = withState(
    [visStateLens, mapStateLens, mapStyleLens],
    state => state
  )(CustomPanels);

  ConnectedCustomPanels.defaultProps = {
    panels: [
      {
        id: 'config',
        label: 'modal.exportMap.json.configTitle',
        iconComponent: Icons.CodeAlt
      }
    ]
  };

  return ConnectedCustomPanels;
}

export default CustomSidePanelsFactory;
