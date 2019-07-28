// Copyright (c) 2019 Uber Technologies, Inc.
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

import React, {PureComponent} from 'react';
import styled from 'styled-components';
import {MultiGrid} from 'react-virtualized';

import {ALL_FIELD_TYPES} from 'constants/default-settings';
import FieldToken from 'components/common/field-token';
import DatasetLabel from 'components/common/dataset-label';
import {Clock} from 'components/common/icons/index';

const COLUMN_WIDTH = 200;
const CELL_HEADER_HEIGHT = 72;
const CELL_HEIGHT = 48;
const DEFAULT_WIDTH = 800;
const DEFAULT_HEIGHT = 600;

const dgSettings = {
  sidePadding: '36px',
  verticalPadding: '16px',
  height: '36px'
};

const StyledModal = styled.div`
  min-height: 70vh;
  overflow: hidden;
`;

const DataGridWrapper = styled.div`
  .ReactVirtualized__Grid__innerScrollContainer {
    ${props => props.theme.modalScrollBar};
  }
`;

const StyledFieldHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  border-right: 0;
  border-bottom: 0;
  background: ${props => props.theme.panelBackgroundLT};
  color: ${props => props.theme.titleColorLT};
  height: 100%;
  
  .label-wrapper {
    display: flex;
    align-items: center;
  }
  
  .icon-wrapper {
    marginRight: ${props => props.type === 'timestamp' ? '2px' : '0'};
    height: 16px;
  }
`;

const FieldHeader = ({name, type}) => (
  <StyledFieldHeader type={type}>
    <div className="label-wrapper">
      <div className="icon-wrapper">
        {type === 'timestamp' ? <Clock height="16px" /> : null}
      </div>
      <span>{name}</span>
    </div>
    <div className="field-wrapper">
      <FieldToken type={type} />
    </div>
  </StyledFieldHeader>
);

const StyledCell = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  border-right: 0;
  border-bottom: ${props => props.theme.panelBorderLT};
  color: ${props => props.theme.labelColorLT};
  text-overflow: ellipsis;
  white-space: pre-wrap;
  word-wrap: break-spaces;
  height: 100%;
`;

const Cell = ({name, type}) => {
  const value = type === ALL_FIELD_TYPES.boolean ? String(name) : name;
  return (<StyledCell title={value}><span>{value}</span></StyledCell>);
};

export class DataGrid extends PureComponent {
  _cellRenderer = ({columnIndex, key, rowIndex, style}) => {
    const {columns, rows} = this.props;

    // rowIndex -1 because data rows start rendering at index 1 and we normalize back using the -1 param
    const className = `${rowIndex === 0 
      ? `header-${columnIndex}` 
      : `row-${rowIndex-1}`} column-${columnIndex}`;

    const type = columns[columnIndex].type;

    return (
      <div key={key} style={style} className={className}>
        {rowIndex === 0
          ? (<FieldHeader className={`header-cell ${type}`} name={columns[columnIndex].name} type={type} />)
          : (<Cell className={`cell ${type}`} name={rows[rowIndex - 1][columnIndex]} type={type} />)
        }
      </div>
    );
  };

  _rowHeight = ({index}) => index === 0 ? CELL_HEADER_HEIGHT : CELL_HEIGHT;

  render() {
    const {columns, height, rows, width} = this.props;

    return (
      <DataGridWrapper>
        <MultiGrid
          cellRenderer={this._cellRenderer}
          columnWidth={COLUMN_WIDTH}
          columnCount={columns.length}
          fixedRowCount={1}
          enableFixedRowScroll={true}
          width={width || DEFAULT_WIDTH}
          height={height || DEFAULT_HEIGHT}
          rowHeight={this._rowHeight}
          rowCount={rows.length + 1}
          hideTopRightGridScrollbar={true}
          hideBottomLeftGridScrollbar={true}
        />
      </DataGridWrapper>
    );
  }
}

export class DataTableModal extends PureComponent {
  render() {
    const {showDatasetTable, width, height} = this.props;
    const datasets = this.props.datasets;
    const dataId = this.props.dataId;

    if (!datasets || !dataId) {
      return null;
    }

    const activeDataset = datasets[dataId];
    const rows = activeDataset.data;

    const columns = activeDataset.fields
      .filter(({name}) => name !== '_geojson');

    return (
      <StyledModal className="dataset-modal" >
        <DatasetTabs
          activeDataset={activeDataset}
          datasets={datasets}
          showDatasetTable={showDatasetTable}
        />
        <DataGrid
          width={width}
          height={height}
          rows={rows}
          columns={columns}
        />
      </StyledModal>
    );
  }
}

const DatasetCatalog = styled.div`
  display: flex;
  padding: ${dgSettings.verticalPadding} ${dgSettings.sidePadding} 0;
`;

export const DatasetModalTab = styled.div`
  align-items: center;
  border-bottom: 3px solid ${props => (props.active ? 'black' : 'transparent')};
  cursor: pointer;
  display: flex;
  height: 35px;
  margin: 0 3px;
  padding: 0 5px;

  :first-child {
    margin-left: 0;
    padding-left: 0;
  }
`;

export const DatasetTabs = React.memo(({activeDataset, datasets, showDatasetTable}) => (
  <DatasetCatalog className="dataset-modal-catalog">
    {Object.values(datasets).map(dataset => (
      <DatasetModalTab
        className="dataset-modal-tab"
        active={dataset === activeDataset}
        key={dataset.id}
        onClick={() => showDatasetTable(dataset.id)}
      >
        <DatasetLabel dataset={dataset}/>
      </DatasetModalTab>
    ))}
  </DatasetCatalog>
));

DatasetTabs.displayName = 'DatasetTabs';

const DataTableModalFactory = () => DataTableModal;
export default DataTableModalFactory;
