import { PaginationProps } from "antd/lib/pagination";
import { RowSelectionType, SortOrder } from "antd/lib/table/interface";
import { DEFAULT_TAKE } from "core/config/consts";
import Model from "core/models/Model";
import {
  ActionFilterEnum,
  AdvanceFilterAction,
} from "core/services/advance-filter-service";
import listService from "core/services/ListService";
import { Dispatch, useCallback, useMemo, useState } from "react";
import { ModelFilter } from "react3l/core";

/* services to CRUD, import, export data in table */
export class TableService {
  /**
   *
   * return selectedRowKeys from table select
   * @param: selectionType: RowSelectionType (default is checkbox)
   * @return: { handleFetchInit,handleFetchEnd }
   *
   * */
  useRowSelection(selectionType: RowSelectionType = "checkbox") {
    const [selectedRowKeys, setSelectedRowKeys] = useState<string[] | number[]>(
      [],
    );
    return {
      rowSelection: useMemo(
        () => ({
          onChange(selectedRowKeys: string[] | number[]) {
            setSelectedRowKeys(selectedRowKeys);
          },
          type: selectionType,
        }),
        [selectionType],
      ),
      selectedRowKeys,
    };
  }
  /**
   *
   * expose data and event handler for localtable service
   * @param: source: T[]
   * @param: setSource: (source: T[]) => void
   * @return: { handleFetchInit,handleFetchEnd }
   *
   * */
  useLocalTable<T extends Model, TFilter extends ModelFilter>(
    filter: TFilter,
    dispatchFilter: Dispatch<AdvanceFilterAction<TFilter, TFilter>>, // from TFilter to TFilter
    source: T[],
    setSource: (source: T[]) => void,
  ) {
    // from filter and source we calculate dataSource, total and loadingList
    const { list, total, loadingList } = listService.useLocalList(
      filter,
      source,
    );

    // selectedRowKeys
    const { rowSelection, selectedRowKeys } = this.useRowSelection();

    // calculate pagination
    const pagination: PaginationProps = useMemo(() => {
      return {
        current: Math.ceil(filter.skip / filter.take) + 1,
        pageSize: filter.take,
        total,
      };
    }, [filter.skip, filter.take, total]);

    // handleTableChange page or sort, actually update filter -> new Filter
    const handleChange = useCallback(
      (...[newPagination, , sorter]) => {
        // check pagination change or not
        if (
          pagination.current !== newPagination.current ||
          pagination.pageSize !== newPagination.pageSize
        ) {
          const skip: number = Math.ceil(
            ((newPagination?.current ?? 0) - 1) *
              (newPagination?.pageSize ?? DEFAULT_TAKE),
          );
          const take: number = newPagination.pageSize;
          dispatchFilter({ type: ActionFilterEnum.ChangeSkipTake, skip, take });
        }
        // check sortOrder and sortDirection
        if (
          sorter.field !== filter.orderBy ||
          sorter.order !== this.getAntOrderType(filter, sorter.field)
        ) {
          dispatchFilter({
            type: ActionFilterEnum.ChangeOrderType,
            orderBy: sorter.field,
            orderType: this.getOrderType(sorter.order),
          });
        }
      },
      [dispatchFilter, filter, pagination],
    );

    // handleDelete, filter one item by its key and update source
    const handleDelete = useCallback(
      (key: number | string) => {
        if (source?.length > 0) {
          setSource(source.filter((item) => item.key !== key)); // remove one item in source by key and update source
          dispatchFilter({
            type: ActionFilterEnum.ChangeAllField,
            data: { ...filter, skip: 0, take: DEFAULT_TAKE },
          }); // reset to default skip, take
        }
      },
      [source, setSource, dispatchFilter, filter],
    );

    // delete local by key
    const handleBulkDelete = useCallback(() => {
      if (source?.length > 0) {
        setSource(
          source.filter(
            (item) => !(selectedRowKeys as string[]).includes(item.key), // rowSelection serve either server table or local table, so we should cast selectedRowKeys as string[]
          ),
        ); // remove many items in source by key and update source
        dispatchFilter({
          type: ActionFilterEnum.ChangeAllField,
          data: { ...filter, skip: 0, take: DEFAULT_TAKE },
        }); // reset to default skip, take
      }
    }, [source, setSource, dispatchFilter, filter, selectedRowKeys]);

    return {
      list,
      total,
      loadingList,
      pagination,
      handleChange,
      handleDelete,
      handleBulkDelete,
      rowSelection,
    };
  }

  getAntOrderType<T extends Model, TFilter extends ModelFilter>(
    tFilter: TFilter,
    columnName: keyof T,
  ): SortOrder {
    if (tFilter.orderBy === columnName) {
      switch (tFilter.orderType) {
        case "asc":
          return "ascend";

        case "desc":
          return "descend";

        default:
          return null;
      }
    }
    return null;
  }

  getOrderType(sortOrder?: SortOrder) {
    switch (sortOrder) {
      case "ascend":
        return "asc";

      case "descend":
        return "desc";

      default:
        return null;
    }
  }
}

export default new TableService();
