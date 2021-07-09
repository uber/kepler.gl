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
import PropTypes from 'prop-types';
import {FormattedMessage} from 'localization';
import {Button, SidePanelDivider, SidePanelSection} from 'components/common/styled-components';
import {Add} from 'components/common/icons';
import SourceDataCatalogFactory from './common/source-data-catalog';
import FilterPanelFactory from './filter-panel/filter-panel';

FilterManagerFactory.deps = [SourceDataCatalogFactory, FilterPanelFactory];

function FilterManagerFactory(SourceDataCatalog, FilterPanel) {
  const FilterManager = ({filters = [], datasets, layers, showDatasetTable, visStateActions}) => {
    const {
      addFilter,
      enlargeFilter,
      removeFilter,
      setFilter,
      toggleAnimation,
      toggleFilterFeature
    } = visStateActions;
    const isAnyFilterAnimating = filters.some(f => f.isAnimating);
    const hadEmptyFilter = filters.some(f => !f.name);
    const hadDataset = Object.keys(datasets).length;
    const onClickAddFilter = useCallback(() => {
      const defaultDataset = (Object.keys(datasets).length && Object.keys(datasets)[0]) || null;
      addFilter(defaultDataset);
    }, [datasets, addFilter]);
    // render last added filter first
    const reversedIndex = useMemo(() => {
      return new Array(filters.length)
        .fill(0)
        .map((d, i) => i)
        .reverse();
    }, [filters.length]);

    return (
      <div className="filter-manager">
        <SourceDataCatalog datasets={datasets} showDatasetTable={showDatasetTable} />
        <SidePanelDivider />
        <SidePanelSection>
          {reversedIndex.map(idx => (
            <FilterPanel
              key={`${filters[idx].id}-${idx}`}
              idx={idx}
              filters={filters}
              filter={filters[idx]}
              datasets={datasets}
              layers={layers}
              isAnyFilterAnimating={isAnyFilterAnimating}
              removeFilter={() => removeFilter(idx)}
              enlargeFilter={() => enlargeFilter(idx)}
              toggleAnimation={() => toggleAnimation(idx)}
              toggleFilterFeature={() => toggleFilterFeature(idx)}
              setFilter={setFilter}
            />
          ))}
        </SidePanelSection>
        <Button
          className="add-filter-button"
          inactive={hadEmptyFilter || !hadDataset}
          width="105px"
          onClick={onClickAddFilter}
        >
          <Add height="12px" />
          <FormattedMessage id={'filterManager.addFilter'} />
        </Button>
      </div>
    );
  };

  FilterManager.propTypes = {
    datasets: PropTypes.object,
    layers: PropTypes.arrayOf(PropTypes.any).isRequired,
    filters: PropTypes.arrayOf(PropTypes.any).isRequired,
    showDatasetTable: PropTypes.func.isRequired,
    visStateActions: PropTypes.object.isRequired,

    // fields can be undefined when dataset is not selected
    fields: PropTypes.arrayOf(PropTypes.any)
  };

  return FilterManager;
}

export default FilterManagerFactory;
