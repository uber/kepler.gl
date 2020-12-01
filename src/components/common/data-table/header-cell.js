import React from 'react';
import classnames from 'classnames';
import Button from './button';
import {ArrowUp, ArrowDown} from 'components/common/icons';
import {VertThreeDots} from 'components/common/icons';
import OptionDropdown from './option-dropdown';
import {SORT_ORDER} from 'constants/default-settings';
import FieldTokenFactory from '../field-token';

const HeaderCellFactory = FieldToken => {
  return ({
    cellInfo,
    columns,
    isPinned,
    props,
    toggleMoreOptions,
    moreOptionsColumn,
    extraHeader
  }) => {
    const {columnIndex, key, style} = cellInfo;
    const {
      colMeta,
      sortColumn,
      sortTableColumn,
      unsortColumn,
      pinTableColumn,
      copyTableColumn,
      dataId
    } = props;

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
          e.shiftKey ? sortTableColumn(dataId, column) : null;
        }}
        onDoubleClick={() => sortTableColumn(dataId, column)}
        title={column}
      >
        {isGhost ? (
          <div />
        ) : (
          <>
            <section className="details">
              <div className="col-name">
                <div className="col-name__left">
                  <div className="col-name__name">{column}</div>
                  <Button
                    className="col-name__sort"
                    onClick={() => sortTableColumn(dataId, column)}
                  >
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

              <FieldToken type={colMeta[column]} />
              {extraHeader
                ? React.createElement(extraHeader, {type: colMeta[column], width: style.width})
                : null}
            </section>

            <section className="options">
              <OptionDropdown
                isOpened={moreOptionsColumn === column}
                type={colMeta[column]}
                column={column}
                toggleMoreOptions={toggleMoreOptions}
                sortTableColumn={mode => sortTableColumn(dataId, column, mode)}
                sortMode={sortColumn && sortColumn[column]}
                pinTableColumn={() => pinTableColumn(dataId, column)}
                copyTableColumn={() => copyTableColumn(dataId, column)}
                isSorted={isSorted}
                isPinned={isPinned}
                unsortColumn={unsortColumn}
              />
            </section>
          </>
        )}
      </div>
    );
  };
};
HeaderCellFactory.deps = [FieldTokenFactory];
export default HeaderCellFactory;
