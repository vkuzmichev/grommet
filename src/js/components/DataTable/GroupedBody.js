import React, { forwardRef, useMemo } from 'react';

import { Cell } from './Cell';
import { ExpanderCell } from './ExpanderCell';
import { StyledDataTableBody, StyledDataTableRow } from './StyledDataTable';
import { CheckBox } from '../CheckBox/CheckBox';
import { InfiniteScroll } from '../InfiniteScroll';
import { TableRow } from '../TableRow';
import { TableCell } from '../TableCell';
import { datumValue, normalizeRowCellProps } from './buildState';

export const GroupedBody = forwardRef(
  (
    {
      cellProps: cellPropsProp,
      columns,
      data,
      groupBy,
      groups,
      groupState,
      pinnedOffset,
      primaryProperty,
      onMore,
      onSelect,
      onToggle,
      onUpdate,
      replace,
      rowProps,
      selected,
      size,
      step,
      ...rest
    },
    ref,
  ) => {
    const items = useMemo(() => {
      const nextItems = [];
      groups.forEach((group) => {
        const { expanded } = groupState[group.key] || { expanded: true };
        const memberCount = group.data.length;
        let groupSelected = [];
        let isGroupSelected = false;

        if (memberCount > 1 || (onUpdate && group.key)) {
          // need a header
          const primaryKeys = group.data.map((datum) => datum[primaryProperty]);

          groupSelected =
            primaryKeys && selected
              ? primaryKeys.filter((val) => selected.includes(val))
              : [];
          
          isGroupSelected = groupBy.select ?
            groupBy.select[group.key] === 'all' :
              (groupSelected.length === group.data.length &&
              groupSelected.length > 0);
       
          const indeterminate = groupBy.select ?
            groupBy.select[group.key] === 'some' :
              groupSelected.length > 0 &&
              groupSelected.length < group.data.length;

          nextItems.push({
            expanded,
            key: group.key,
            datum: group.datum,
            context: 'groupHeader',
            isSelected: isGroupSelected,
            indeterminate,
            onChange: () => {
              const nextSelected = (isGroupSelected || indeterminate) ?
                selected.filter((s) => !groupSelected.includes(s)) :
                [...selected, ...primaryKeys];
              if (groupBy.onSelect) {
                groupBy.onSelect(nextSelected, group.datum, groupBy.select);
              }
              else {
                onSelect(nextSelected, group.datum);
              }
            },
          });
        }
        if ((!onUpdate && memberCount === 1) || expanded) {
          // add the group members
          group.data.forEach((datum, index) => {
            const primaryValue = primaryProperty
              ? datumValue(datum, primaryProperty)
              : undefined;
            const isSelected = selected?.includes(primaryValue);
            nextItems.push({
              key: datum[primaryProperty],
              primaryValue: primaryProperty
                ? datumValue(datum, primaryProperty)
                : undefined,
              datum,
              context:
                memberCount > 1 && index === memberCount - 1
                  ? 'groupEnd'
                  : 'body',
              isSelected,
              onChange: () => {
                const nextSelected = isSelected ?
                  selected.filter((s) => s !== primaryValue) :
                  [...selected, primaryValue];
                onSelect(nextSelected, datum);
              },
            });
          });
        }
      });
      return nextItems;
    }, [
      groups,
      groupBy,
      groupState,
      primaryProperty,
      selected,
      onSelect,
      onUpdate,
    ]);

    return (
      <StyledDataTableBody ref={ref} size={size} {...rest}>
        <InfiniteScroll
          items={items}
          onMore={onMore}
          replace={replace}
          renderMarker={(marker) => (
            <TableRow>
              <TableCell>{marker}</TableCell>
            </TableRow>
          )}
          step={step}
        >
          {(row, index, rowRef) => {
            const {
              context,
              datum,
              expanded,
              indeterminate,
              isSelected,
              key,
              onChange,
              primaryValue,
            } = row;
            const cellProps = normalizeRowCellProps(
              rowProps,
              cellPropsProp,
              primaryValue,
              index,
            );

            return (
              <StyledDataTableRow ref={rowRef} key={key} size={size}>
                <ExpanderCell
                  background={cellProps.background}
                  border={cellProps.border}
                  context={context}
                  pad={cellProps.pad}
                  onToggle={
                    context === 'groupHeader' ? onToggle(key) : undefined
                  }
                  expanded={expanded}
                />
                {(selected || onSelect) && (
                  <TableCell
                    background={cellProps.background}
                    plain="noPad"
                    size="auto"
                  >
                    <CheckBox
                      a11yTitle={`${isSelected ? 'unselect' : 'select'} ${
                        context === 'groupHeader' ? key : primaryValue
                      }`}
                      checked={isSelected}
                      indeterminate={indeterminate}
                      disabled={!onSelect}
                      onChange={onChange}
                      pad={cellProps.pad}
                    />
                  </TableCell>
                )}
                {columns.map((column) => {
                  let scope;
                  if (context === 'groupHeader') {
                    scope = column.property === groupBy.property ?
                      'row' : undefined;
                  } else {
                    scope = column.primary ? 'row' : undefined;
                  }
                  return (
                    <Cell
                      key={column.property}
                      background={cellProps.background}
                      border={cellProps.border}
                      context={context}
                      column={column}
                      datum={datum}
                      pad={cellProps.pad}
                      scope={scope}
                      pinnedOffset={
                        context === 'groupHeader' &&
                        pinnedOffset &&
                        pinnedOffset[column.property]
                      }
                    />
                  );
                })}
              </StyledDataTableRow>
            );
          }}
        </InfiniteScroll>
      </StyledDataTableBody>
    );
  },
);
