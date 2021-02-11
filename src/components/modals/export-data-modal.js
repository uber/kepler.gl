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

import React, {Component} from 'react';
import PropTypes from 'prop-types';

import {EXPORT_DATA_TYPE_OPTIONS} from 'constants/default-settings';
import {FileType} from 'components/common/icons';
import {
  StyledExportSection,
  StyledFilteredOption,
  StyledModalContent,
  StyledType,
  CheckMark
} from 'components/common/styled-components';
import {injectIntl} from 'react-intl';
import {FormattedMessage} from 'localization';

const propTypes = {
  datasets: PropTypes.object.isRequired,
  selectedDataset: PropTypes.string,
  dataType: PropTypes.string.isRequired,
  filtered: PropTypes.bool.isRequired,
  // callbacks
  applyCPUFilter: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onChangeExportSelectedDataset: PropTypes.func.isRequired,
  onChangeExportDataType: PropTypes.func.isRequired,
  onChangeExportFiltered: PropTypes.func.isRequired
};

const getDataRowCount = (datasets, selectedDataset, filtered, intl) => {
  const selectedData = datasets[selectedDataset];
  if (!selectedData) {
    return intl.formatMessage(
      {id: 'modal.exportData.fileCount'},
      {fileCount: Object.keys(datasets).length}
    );
  }
  const {dataContainer, filteredIdxCPU} = selectedData;

  if (filtered && !filteredIdxCPU) {
    return '-';
  }

  const rowCount = filtered ? filteredIdxCPU.length : dataContainer.numRows();

  return intl.formatMessage(
    {id: 'modal.exportData.rowCount'},
    {rowCount: rowCount.toLocaleString()}
  );
};

const ExportDataModalFactory = () => {
  class ExportDataModal extends Component {
    componentDidMount() {
      const toCPUFilter = this.props.selectedDataset || Object.keys(this.props.datasets);
      this.props.applyCPUFilter(toCPUFilter);
    }

    _onSelectDataset = ({target: {value}}) => {
      this.props.applyCPUFilter(value);
      this.props.onChangeExportSelectedDataset(value);
    };

    render() {
      const {
        supportedDataTypes,
        datasets,
        selectedDataset,
        dataType,
        filtered,
        onChangeExportDataType,
        onChangeExportFiltered,
        intl
      } = this.props;

      return (
        <StyledModalContent className="export-data-modal">
          <div>
            <StyledExportSection>
              <div className="description">
                <div className="title">
                  <FormattedMessage id={'modal.exportData.datasetTitle'} />
                </div>
                <div className="subtitle">
                  <FormattedMessage id={'modal.exportData.datasetSubtitle'} />
                </div>
              </div>
              <div className="selection">
                <select value={selectedDataset} onChange={this._onSelectDataset}>
                  {[intl.formatMessage({id: 'modal.exportData.allDatasets'})]
                    .concat(Object.keys(datasets))
                    .map(d => (
                      <option key={d} value={d}>
                        {(datasets[d] && datasets[d].label) || d}
                      </option>
                    ))}
                </select>
              </div>
            </StyledExportSection>
            <StyledExportSection>
              <div className="description">
                <div className="title">
                  <FormattedMessage id={'modal.exportData.dataTypeTitle'} />
                </div>
                <div className="subtitle">
                  <FormattedMessage id={'modal.exportData.dataTypeSubtitle'} />
                </div>
              </div>
              <div className="selection">
                {supportedDataTypes.map(op => (
                  <StyledType
                    key={op.id}
                    selected={dataType === op.id}
                    available={op.available}
                    onClick={() => op.available && onChangeExportDataType(op.id)}
                  >
                    <FileType ext={op.label} height="80px" fontSize="11px" />
                    {dataType === op.id && <CheckMark />}
                  </StyledType>
                ))}
              </div>
            </StyledExportSection>
            <StyledExportSection>
              <div className="description">
                <div className="title">
                  <FormattedMessage id={'modal.exportData.dataTypeTitle'} />
                </div>
                <div className="subtitle">
                  <FormattedMessage id={'modal.exportData.filterDataSubtitle'} />
                </div>
              </div>
              <div className="selection">
                <StyledFilteredOption
                  className="unfiltered-option"
                  selected={!filtered}
                  onClick={() => onChangeExportFiltered(false)}
                >
                  <div className="filter-option-title">
                    <FormattedMessage id={'modal.exportData.unfilteredData'} />
                  </div>
                  <div className="filter-option-subtitle">
                    {getDataRowCount(datasets, selectedDataset, false, intl)}
                  </div>
                  {!filtered && <CheckMark />}
                </StyledFilteredOption>
                <StyledFilteredOption
                  className="filtered-option"
                  selected={filtered}
                  onClick={() => onChangeExportFiltered(true)}
                >
                  <div className="filter-option-title">
                    <FormattedMessage id={'modal.exportData.filteredData'} />
                  </div>
                  <div className="filter-option-subtitle">
                    {getDataRowCount(datasets, selectedDataset, true, intl)}
                  </div>
                  {filtered && <CheckMark />}
                </StyledFilteredOption>
              </div>
            </StyledExportSection>
          </div>
        </StyledModalContent>
      );
    }
  }
  ExportDataModal.propTypes = propTypes;
  ExportDataModal.defaultProps = {
    supportedDataTypes: EXPORT_DATA_TYPE_OPTIONS
  };

  return injectIntl(ExportDataModal);
};

export default ExportDataModalFactory;
