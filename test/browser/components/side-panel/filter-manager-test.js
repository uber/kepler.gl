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
import {
  FilterManagerFactory,
  SourceDataCatalogFactory,
  FilterPanelFactory,
  Button
} from 'components';

import {appInjector} from 'components/container';
import {mountWithTheme, IntlWrapper} from 'test/helpers/component-utils';

// components
const FilterManager = appInjector.get(FilterManagerFactory);
const SourceDataCatalog = appInjector.get(SourceDataCatalogFactory);
const FilterPanel = appInjector.get(FilterPanelFactory);

// mock state
import {StateWFilters} from 'test/helpers/mock-state';

const nop = () => {};
// default props from initial state
const defaultProps = {
  filters: [],
  datasets: {},
  layers: [],
  showDatasetTable: nop,
  visStateActions: {
    addFilter: nop,
    setFilter: nop,
    removeFilter: nop,
    enlargeFilter: nop,
    toggleAnimation: nop,
    toggleFilterFeature: nop
  }
};

// components
const filterManagerProps = {
  filters: StateWFilters.visState.filters,
  datasets: StateWFilters.visState.datasets,
  layers: StateWFilters.visState.layers,
  showDatasetTable: nop,
  visStateActions: {
    addFilter: nop,
    setFilter: nop,
    removeFilter: nop,
    enlargeFilter: nop,
    toggleAnimation: nop,
    toggleFilterFeature: nop
  }
};

test('Components -> FilterManager.mount -> no prop', t => {
  // mount
  let wrapper;
  t.doesNotThrow(() => {
    wrapper = mountWithTheme(
      <IntlWrapper>
        <FilterManager {...defaultProps} />
      </IntlWrapper>
    );
  }, 'FilterManager should not fail without props');

  t.ok(wrapper.find('.filter-manager').length === 1, 'should render Filter Manager');
  t.ok(wrapper.find(SourceDataCatalog).length === 1, 'should render SourceDataCatalog');
  t.ok(wrapper.find(Button).length === 1, 'should render add filter button');
  t.equal(
    wrapper
      .find(Button)
      .at(0)
      .props().inactive,
    true,
    'inactive should be true'
  );

  t.end();
});

test('Components -> FilterManager.mount -> with prop', t => {
  // mount
  const addFilter = sinon.spy();
  const newProps = {
    ...filterManagerProps,
    visStateActions: {
      ...filterManagerProps.visStateActions,
      addFilter
    }
  };
  let wrapper;
  t.doesNotThrow(() => {
    wrapper = mountWithTheme(
      <IntlWrapper>
        <FilterManager {...newProps} />
      </IntlWrapper>
    );
  }, 'FilterManager should not fail without props');

  t.ok(wrapper.find('.filter-manager').length === 1, 'should render Filter Manager');
  t.ok(wrapper.find(SourceDataCatalog).length === 1, 'should render SourceDataCatalog');
  t.ok(wrapper.find(Button).length === 1, 'should render add filter button');
  t.ok(wrapper.find(FilterPanel).length === 2, 'should render 2 FilterPanel');

  // stateless component don't have a instance()
  const filter1Props = wrapper
    .find(FilterPanel)
    .at(0)
    .props();

  t.equal(filter1Props.filter, filterManagerProps.filters[1], 'should render last filter first');
  t.equal(filter1Props.isAnyFilterAnimating, false, 'isAnyFilterAnimating is false');
  const addFilterButton = wrapper.find(Button).at(0);
  // .instance();
  addFilterButton.simulate('click');

  t.deepEqual(
    addFilter.args,
    [[Object.keys(StateWFilters.visState.datasets)[0]]],
    'Should call addFilter with 1st dataset'
  );

  t.end();
});
