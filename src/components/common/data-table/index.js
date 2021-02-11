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

import React, {Component, createRef} from 'react';
import {ScrollSync, AutoSizer} from 'react-virtualized';
import styled, {withTheme} from 'styled-components';
import classnames from 'classnames';
import {createSelector} from 'reselect';
import get from 'lodash.get';
import debounce from 'lodash.debounce';

import OptionDropdown from './option-dropdown';

import Grid from './grid';
import Button from './button';
import {ArrowUp, ArrowDown} from 'components/common/icons';
import {VertThreeDots} from 'components/common/icons';
import {parseFieldValue} from 'utils/data-utils';
import {adjustCellsToContainer} from './cell-size';

import {ALL_FIELD_TYPES, SORT_ORDER} from 'constants/default-settings';
import FieldTokenFactory from 'components/common/field-token';

const defaultHeaderRowHeight = 55;
const defaultRowHeight = 32;
const overscanColumnCount = 10;
const overscanRowCount = 10;
const fieldToAlignRight = {
  [ALL_FIELD_TYPES.integer]: true,
  [ALL_FIELD_TYPES.real]: true
};

export const Container = styled.div`
  display: flex;
  font-size: 11px;
  flex-grow: 1;
  color: ${props => props.theme.dataTableTextColor};
  width: 100%;

  .ReactVirtualized__Grid:focus,
  .ReactVirtualized__Grid:active {
    outline: 0;
  }

  .cell {
    &::-webkit-scrollbar {
      display: none;
    }
  }

  *:focus {
    outline: 0;
  }

  .results-table-wrapper {
    position: relative;
    min-height: 100%;
    max-height: 100%;
    display: flex;
    flex-direction: row;
    flex-grow: 1;
    overflow: hidden;
    border-top: none;

    .scroll-in-ui-thread::after {
      content: '';
      height: 100%;
      left: 0;
      position: absolute;
      pointer-events: none;
      top: 0;
      width: 100%;
    }

    .grid-row {
      position: relative;
      display: flex;
      flex-direction: row;
    }
    .grid-column {
      display: flex;
      flex-direction: column;
      flex: 1 1 auto;
    }
    .pinned-grid-container {
      flex: 0 0 75px;
      z-index: 10;
      position: absolute;
      left: 0;
      top: 0;
      border-right: 2px solid ${props => props.theme.pinnedGridBorderColor};
    }

    .header-grid {
      overflow: hidden !important;
    }

    .even-row {
      background-color: ${props => props.theme.evenRowBackground};
    }
    .odd-row {
      background-color: ${props => props.theme.oddRowBackground};
    }
    .cell,
    .header-cell {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
      text-align: center;
      overflow: hidden;

      .n-sort-idx {
        font-size: 9px;
      }
    }
    .cell {
      border-bottom: 1px solid ${props => props.theme.cellBorderColor};
      border-right: 1px solid ${props => props.theme.cellBorderColor};
      white-space: nowrap;
      overflow: auto;
      padding: 0 ${props => props.theme.cellPaddingSide}px;
      font-size: ${props => props.theme.cellFontSize}px;

      .result-link {
        text-decoration: none;
      }
    }
    .cell.end-cell,
    .header-cell.end-cell {
      border-right: none;
      padding-right: ${props => props.theme.cellPaddingSide + props.theme.edgeCellPaddingSide}px;
    }
    .cell.first-cell,
    .header-cell.first-cell {
      padding-left: ${props => props.theme.cellPaddingSide + props.theme.edgeCellPaddingSide}px;
    }
    .cell.bottom-cell {
      border-bottom: none;
    }
    .cell.align-right {
      align-items: flex-end;
    }
    .header-cell {
      border-bottom: 1px solid ${props => props.theme.headerCellBorderColor};
      border-top: 1px solid ${props => props.theme.headerCellBorderColor};
      padding-top: ${props => props.theme.headerPaddingTop}px;
      padding-right: 0;
      padding-bottom: ${props => props.theme.headerPaddingBottom}px;
      padding-left: ${props => props.theme.cellPaddingSide}px;
      align-items: center;
      justify-content: space-between;
      display: flex;
      flex-direction: row;
      background-color: ${props => props.theme.headerCellBackground};

      &:hover {
        .more {
          color: ${props => props.theme.headerCellIconColor};
        }
      }
      .n-sort-idx {
        font-size: 9px;
      }
      .details {
        font-weight: 500;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        height: 100%;
        overflow: hidden;
        flex-grow: 1;

        .col-name {
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;

          .col-name__left {
            display: flex;
            align-items: center;
            overflow: hidden;
            svg {
              margin-left: 6px;
            }
          }
          .col-name__name {
            overflow: hidden;
            white-space: nowrap;
          }
        }
      }

      .more {
        color: transparent;
        margin-left: 5px;
      }
    }
  }

  :focus {
    outline: none;
  }
`;

const defaultColumnWidth = 200;

const columnWidthFunction = (columns, cellSizeCache, ghost) => ({index}) => {
  return (columns[index] || {}).ghost ? ghost : cellSizeCache[columns[index]] || defaultColumnWidth;
};

/*
 * This is an accessor method used to generalize getting a cell from a data row
 */
const getRowCell = ({dataContainer, columns, column, colMeta, rowIndex, sortOrder}) => {
  const rowIdx = sortOrder && sortOrder.length ? get(sortOrder, rowIndex) : rowIndex;
  const {type} = colMeta[column];

  let value = dataContainer.valueAt(rowIdx, columns.indexOf(column));
  if (value === undefined) value = 'Err'; // default value
  return parseFieldValue(value, type);
};

export const TableSection = ({
  classList,
  isPinned,
  columns,
  headerGridProps,
  fixedWidth,
  fixedHeight = undefined,
  onScroll,
  scrollTop,
  dataGridProps,
  columnWidth,
  setGridRef,
  headerCellRender,
  dataCellRender,
  scrollLeft = undefined
}) => (
  <AutoSizer>
    {({width, height}) => {
      const gridDimension = {
        columnCount: columns.length,
        columnWidth,
        width: fixedWidth || width
      };
      const dataGridHeight = fixedHeight || height;
      return (
        <>
          <div className={classnames('scroll-in-ui-thread', classList.header)}>
            <Grid
              cellRenderer={headerCellRender}
              {...headerGridProps}
              {...gridDimension}
              scrollLeft={scrollLeft}
            />
          </div>
          <div
            className={classnames('scroll-in-ui-thread', classList.rows)}
            style={{
              top: headerGridProps.height
            }}
          >
            <Grid
              cellRenderer={dataCellRender}
              {...dataGridProps}
              {...gridDimension}
              className={isPinned ? 'pinned-grid' : 'body-grid'}
              height={dataGridHeight - headerGridProps.height}
              onScroll={onScroll}
              scrollTop={scrollTop}
              setGridRef={setGridRef}
            />
          </div>
        </>
      );
    }}
  </AutoSizer>
);

DataTableFactory.deps = [FieldTokenFactory];
function DataTableFactory(FieldToken) {
  class DataTable extends Component {
    static defaultProps = {
      dataContainer: null,
      pinnedColumns: [],
      colMeta: {},
      cellSizeCache: {},
      sortColumn: {},
      fixedWidth: null,
      fixedHeight: null,
      theme: {}
    };

    state = {
      cellSizeCache: {},
      moreOptionsColumn: null
    };

    componentDidMount() {
      window.addEventListener('resize', this.scaleCellsToWidth);
      this.scaleCellsToWidth();
    }

    componentDidUpdate(prevProps) {
      if (
        this.props.cellSizeCache !== prevProps.cellSizeCache ||
        this.props.pinnedColumns !== prevProps.pinnedColumns
      ) {
        this.scaleCellsToWidth();
      }
    }

    componentWillUnmount() {
      window.removeEventListener('resize', this.scaleCellsToWidth);
      // fix Warning: Can't perform a React state update on an unmounted component
      this.setState = () => {
        return;
      };
    }

    root = createRef();
    columns = props => props.columns;
    pinnedColumns = props => props.pinnedColumns;
    unpinnedColumns = createSelector(this.columns, this.pinnedColumns, (columns, pinnedColumns) =>
      !Array.isArray(pinnedColumns) ? columns : columns.filter(c => !pinnedColumns.includes(c))
    );

    toggleMoreOptions = moreOptionsColumn =>
      this.setState({
        moreOptionsColumn:
          this.state.moreOptionsColumn === moreOptionsColumn ? null : moreOptionsColumn
      });

    getCellSizeCache = () => {
      const {cellSizeCache: propsCache, fixedWidth, pinnedColumns} = this.props;
      const unpinnedColumns = this.unpinnedColumns(this.props);

      const width = fixedWidth ? fixedWidth : this.root.current ? this.root.current.clientWidth : 0;

      // pin column border is 2 pixel vs 1 pixel
      const adjustWidth = pinnedColumns.length ? width - 1 : width;
      const {cellSizeCache, ghost} = adjustCellsToContainer(
        adjustWidth,
        propsCache,
        pinnedColumns,
        unpinnedColumns
      );

      return {
        cellSizeCache,
        ghost
      };
    };

    doScaleCellsToWidth = () => {
      this.setState(this.getCellSizeCache());
    };

    scaleCellsToWidth = debounce(this.doScaleCellsToWidth, 300);

    renderHeaderCell = (
      columns,
      isPinned,
      props,
      toggleMoreOptions,
      moreOptionsColumn,
      TokenComponent
    ) => {
      // eslint-disable-next-line react/display-name
      return cellInfo => {
        const {columnIndex, key, style} = cellInfo;
        const {colMeta, sortColumn, sortTableColumn, pinTableColumn, copyTableColumn} = props;

        const column = columns[columnIndex];
        const isGhost = column.ghost;
        const isSorted = sortColumn[column];
        const firstCell = columnIndex === 0;

        return (
          <div
            className={classnames('header-cell', {
              [`column-${columnIndex}`]: true,
              'pinned-header-cell': isPinned,
              'first-cell': firstCell
            })}
            key={key}
            style={style}
            onClick={e => {
              e.shiftKey ? sortTableColumn(column) : null;
            }}
            onDoubleClick={() => sortTableColumn(column)}
            title={column}
          >
            {isGhost ? (
              <div />
            ) : (
              <>
                <section className="details">
                  <div className="col-name">
                    <div className="col-name__left">
                      <div className="col-name__name">{colMeta[column].name}</div>
                      <Button className="col-name__sort" onClick={() => sortTableColumn(column)}>
                        {isSorted ? (
                          isSorted === SORT_ORDER.ASCENDING ? (
                            <ArrowUp height="14px" />
                          ) : (
                            <ArrowDown height="14px" />
                          )
                        ) : null}
                      </Button>
                    </div>
                    <Button className="more" onClick={() => toggleMoreOptions(column)}>
                      <VertThreeDots height="14px" />
                    </Button>
                  </div>

                  <FieldToken type={colMeta[column].type} />
                </section>

                <section className="options">
                  <OptionDropdown
                    isOpened={moreOptionsColumn === column}
                    type={colMeta[column].type}
                    column={column}
                    toggleMoreOptions={toggleMoreOptions}
                    sortTableColumn={mode => sortTableColumn(column, mode)}
                    sortMode={sortColumn && sortColumn[column]}
                    pinTableColumn={() => pinTableColumn(column)}
                    copyTableColumn={() => copyTableColumn(column)}
                    isSorted={isSorted}
                    isPinned={isPinned}
                  />
                </section>
              </>
            )}
          </div>
        );
      };
    };

    renderDataCell = (columns, isPinned, props) => {
      return cellInfo => {
        const {columnIndex, key, style, rowIndex} = cellInfo;
        const {dataContainer, colMeta} = props;
        const column = columns[columnIndex];
        const isGhost = column.ghost;

        const rowCell = isGhost ? '' : getRowCell({...props, column, rowIndex});
        const type = isGhost ? null : colMeta[column].type;

        const endCell = columnIndex === columns.length - 1;
        const firstCell = columnIndex === 0;
        const bottomCell = rowIndex === dataContainer.numRows() - 1;
        const alignRight = fieldToAlignRight[type];

        const cell = (
          <div
            className={classnames('cell', {
              [rowIndex % 2 === 0 ? 'even-row' : 'odd-row']: true,
              [`row-${rowIndex}`]: true,
              'pinned-cell': isPinned,
              'first-cell': firstCell,
              'end-cell': endCell,
              'bottom-cell': bottomCell,
              'align-right': alignRight
            })}
            key={key}
            style={style}
            title={isGhost ? undefined : rowCell}
          >
            {`${rowCell}${endCell ? '\n' : '\t'}`}
          </div>
        );

        return cell;
      };
    };

    render() {
      const {dataContainer, pinnedColumns, theme = {}, fixedWidth, fixedHeight} = this.props;
      const unpinnedColumns = this.unpinnedColumns(this.props);

      const {cellSizeCache, moreOptionsColumn, ghost} = this.state;
      const unpinnedColumnsGhost = ghost ? [...unpinnedColumns, {ghost: true}] : unpinnedColumns;
      const pinnedColumnsWidth = pinnedColumns.reduce(
        (acc, val) => acc + get(cellSizeCache, val, 0),
        0
      );

      const hasPinnedColumns = Boolean(pinnedColumns.length);
      const {headerRowHeight = defaultHeaderRowHeight, rowHeight = defaultRowHeight} = theme;

      const headerGridProps = {
        cellSizeCache,
        className: 'header-grid',
        height: headerRowHeight,
        rowCount: 1,
        rowHeight: headerRowHeight
      };

      const dataGridProps = {
        cellSizeCache,
        overscanColumnCount,
        overscanRowCount,
        rowCount: dataContainer ? dataContainer.numRows() : 0,
        rowHeight
      };

      return (
        <Container className="data-table-container" ref={this.root}>
          {Object.keys(cellSizeCache).length && (
            <ScrollSync>
              {({onScroll, scrollLeft, scrollTop}) => {
                return (
                  <div className="results-table-wrapper">
                    {hasPinnedColumns && (
                      <div key="pinned-columns" className="pinned-columns grid-row">
                        <TableSection
                          classList={{
                            header: 'pinned-columns--header pinned-grid-container',
                            rows: 'pinned-columns--rows pinned-grid-container'
                          }}
                          isPinned
                          columns={pinnedColumns}
                          headerGridProps={headerGridProps}
                          fixedWidth={pinnedColumnsWidth}
                          onScroll={args => onScroll({...args, scrollLeft})}
                          scrollTop={scrollTop}
                          dataGridProps={dataGridProps}
                          setGridRef={pinnedGrid => (this.pinnedGrid = pinnedGrid)}
                          columnWidth={columnWidthFunction(pinnedColumns, cellSizeCache)}
                          headerCellRender={this.renderHeaderCell(
                            pinnedColumns,
                            true,
                            this.props,
                            this.toggleMoreOptions,
                            moreOptionsColumn
                          )}
                          dataCellRender={this.renderDataCell(pinnedColumns, true, this.props)}
                        />
                      </div>
                    )}
                    <div
                      key="unpinned-columns"
                      style={{
                        marginLeft: `${hasPinnedColumns ? `${pinnedColumnsWidth}px` : '0'}`
                      }}
                      className="unpinned-columns grid-column"
                    >
                      <TableSection
                        classList={{
                          header: 'unpinned-columns--header unpinned-grid-container',
                          rows: 'unpinned-columns--rows unpinned-grid-container'
                        }}
                        isPinned={false}
                        columns={unpinnedColumnsGhost}
                        headerGridProps={headerGridProps}
                        fixedWidth={fixedWidth}
                        fixedHeight={fixedHeight}
                        onScroll={onScroll}
                        scrollTop={scrollTop}
                        scrollLeft={scrollLeft}
                        dataGridProps={dataGridProps}
                        setGridRef={unpinnedGrid => (this.unpinnedGrid = unpinnedGrid)}
                        columnWidth={columnWidthFunction(
                          unpinnedColumnsGhost,
                          cellSizeCache,
                          ghost
                        )}
                        headerCellRender={this.renderHeaderCell(
                          unpinnedColumnsGhost,
                          false,
                          this.props,
                          this.toggleMoreOptions,
                          moreOptionsColumn
                        )}
                        dataCellRender={this.renderDataCell(
                          unpinnedColumnsGhost,
                          false,
                          this.props
                        )}
                      />
                    </div>
                  </div>
                );
              }}
            </ScrollSync>
          )}
        </Container>
      );
    }
  }

  return withTheme(DataTable);
}

export default DataTableFactory;
