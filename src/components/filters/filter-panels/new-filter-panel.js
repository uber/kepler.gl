// Copyright (c) 2020 Uber Technologies, Inc.
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
import FilterPanelHeaderFactory from 'components/side-panel/filter-panel/filter-panel-header';
import FilterPanelHeaderActionsFactory from './filter-panel-header-actions';
import SourcePairSelectorFactory from './source-pair-selector';

NewFilterPanelFactory.deps = [
  FilterPanelHeaderFactory,
  SourcePairSelectorFactory,
  FilterPanelHeaderActionsFactory
];

function NewFilterPanelFactory(FilterPanelHeader, SourcePairSelector, FilterPanelHeaderActions) {
  const NewFilterPanel = ({
    idx,
    filter,
    datasets,
    allAvailableFields,
    setFilter,
    removeFilter,
    actions = []
  }) => (
    <>
      <FilterPanelHeader datasets={[datasets[filter.dataId[0]]]}>
        <SourcePairSelector
          idx={idx}
          filter={filter}
          datasets={datasets}
          allAvailableFields={allAvailableFields}
          setFilter={setFilter}
        />
        <FilterPanelHeaderActions actions={actions} filter={filter} removeFilter={removeFilter} />
      </FilterPanelHeader>
    </>
  );

  NewFilterPanel.displayName = 'NewFilterPanel';

  return React.memo(NewFilterPanel);
}

export default NewFilterPanelFactory;
