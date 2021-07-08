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

import React from 'react';
import sinon from 'sinon';
import test from 'tape';

import {Pin} from 'components/common/icons';
import {IntlWrapper, mountWithTheme} from 'test/helpers/component-utils';
import MapPopoverFactory from 'components/map/map-popover';
import {appInjector} from 'components';

const MapPopover = appInjector.get(MapPopoverFactory);

test('Map Popover - render', t => {
  let wrapper;
  const onClose = sinon.spy();
  t.doesNotThrow(() => {
    wrapper = mountWithTheme(
      <IntlWrapper>
        <MapPopover
          mapW={400}
          mapH={300}
          onClose={onClose}
          coordinate={[0, 0]}
          layerHoverProp={{}}
          isBase={true}
          frozen={true}
        />
      </IntlWrapper>
    );
  }, 'Should render');

  t.equal(wrapper.find(MapPopover).length, 1, 'Should display 1 MapPopover');
  t.equal(wrapper.find('.coordingate-hover-info').length, 1, 'Should display 1 coordinates');
  t.equal(wrapper.find('.map-popover__layer-info').length, 0, 'Should display 0 layer info');
  t.equal(wrapper.find(Pin).length, 1, 'Should display 1 pin');
  t.equal(wrapper.find('.primary-label').length, 1, 'Should display 1 primary label');

  t.end();
});
