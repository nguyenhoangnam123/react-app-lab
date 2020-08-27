import { Modal } from "antd";
import { PaginationProps } from "antd/lib/pagination";
import { RowSelectionType, SortOrder } from "antd/lib/table/interface";
import { DEFAULT_TAKE } from "core/config/consts";
import Model from "core/models/Model";
import listService from "core/services/ListService";
import { useCallback, useMemo, useState } from "react";
import { ModelFilter } from "react3l/core";
import { Observable } from "rxjs";

/* services to CRUD, import, export data in table */
export class TableService {
  /**
   *
   * return selectedRowKeys from table select
   * @param: selectionType: RowSelectionType (default is checkbox)
   * @return: { rowSelection,selectedRowKeys, setSelectedRowKeys }
   *
   * */
  useRowSelection(
    selectionType: RowSelectionType = "checkbox",
    derivedRowKeys?: string[] | number[], // default rowKeys
  ) {
    const [selectedRowKeys, setSelectedRowKeys] = useState<string[] | number[]>(
      derivedRowKeys,
    );

    return {
      rowSelection: useMemo(
        () => ({
          onChange(selectedRowKeys: string[] | number[]) {
            // selectedRowKeys data type based on table rowKey props
            setSelectedRowKeys(selectedRowKeys);
          },
          type: selectionType,
        }),
        [selectionType],
      ),
      selectedRowKeys,
      setSelectedRowKeys,
    };
  }
  /**
   *
   * return pagination
   * @param: selectionType: RowSelectionType (default is checkbox)
   * @return: pagination: PaginationProps
   *
   * */
  usePagination<TFilter extends ModelFilter>(
    filter: TFilter,
    total: number,
  ): PaginationProps {
    return useMemo(
      () => ({
        current: Math.ceil(filter.skip / filter.take) + 1,
        pageSize: filter.take,
        total,
      }),
      [filter.skip, filter.take, total],
    );
  }
  /**
   *
   * return handleTableChange
   * @param: filter: RowSelectionType (default is checkbox)
   * @return: handleChange(newPagination: TablePaginationConfig,filters: Record<string, Key[] | null>,sorter: SorterResult<T>,) => void
   *
   * */
  useTableChange<TFilter extends ModelFilter>(
    filter: TFilter,
    setFilter: (filter: TFilter) => void,
    pagination: PaginationProps,
  ) {
    return useCallback((...[newPagination, , sorter]) => {
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
        setFilter({ ...filter, skip, take });
      }
      // check sortOrder and sortDirection
      if (
        sorter.field !== filter.orderBy ||
        sorter.order !== this.getAntOrderType(filter, sorter.field)
      ) {
        setFilter({
          ...filter,
          orderBy: sorter.field,
          orderType: this.getOrderType(sorter.order),
        });
      }
    }, []);
  }
  /**
   *
   * expose data and event handler for localtable service
   * @param: source: T[]
   * @param: setSource: (source: T[]) => void
   * @return: { handleFetchInit,handleFetchEnd }
   *
   * */
  useTable<T extends Model, TFilter extends ModelFilter>(
    filter: TFilter,
    setFilter: (filter: TFilter) => void, // from TFilter to TFilter
    getList: (filter: TFilter) => Observable<T[]>,
    getTotal: (filter: TFilter) => Observable<number>,
    deleteItem?: (t: T) => Observable<T>,
    bulkDeleteItems?: (t: number[] | string[]) => Observable<void>,
    onUpdateListSuccess?: (item?: T) => void,
    checkBoxType?: RowSelectionType,
    isLoadControl?: boolean, // optional control for modal preLoading
    derivedRowKeys?: string[] | number[],
  ) {
    // selectedRowKeys
    const {
      rowSelection,
      selectedRowKeys,
      setSelectedRowKeys,
    } = this.useRowSelection(checkBoxType, derivedRowKeys);

    // from filter and source we calculate dataSource, total and loadingList
    const {
      list,
      total,
      loadingList,
      handleDelete,
      handleBulkDelete,
    } = listService.useList(
      filter,
      setFilter,
      getList,
      getTotal,
      deleteItem,
      bulkDeleteItems,
      selectedRowKeys,
      setSelectedRowKeys,
      onUpdateListSuccess,
      isLoadControl,
    );

    // calculate pagination
    const pagination: PaginationProps = this.usePagination<TFilter>(
      filter,
      total,
    );

    // handleChange page or sorter
    const handleChange = this.useTableChange<TFilter>(
      filter,
      setFilter,
      pagination,
    );

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
    // dispatchFilter: Dispatch<AdvanceFilterAction<TFilter, TFilter>>, // from TFilter to TFilter
    setFilter: (filter: TFilter) => void,
    source: T[],
    setSource: (source: T[]) => void,
  ) {
    // from filter and source we calculate dataSource, total and loadingList
    const { list, total, loadingList } = listService.useLocalList(
      filter,
      source,
    );

    // selectedRowKeys
    const {
      rowSelection,
      selectedRowKeys,
      setSelectedRowKeys,
    } = this.useRowSelection();

    // calculate pagination
    const pagination: PaginationProps = this.usePagination<TFilter>(
      filter,
      total,
    );

    // handleChange page or sorter
    const handleChange = this.useTableChange<TFilter>(
      filter,
      setFilter,
      pagination,
    );

    // handleDelete, filter one item by its key and update source
    const handleDelete = useCallback(
      (key: number | string) => {
        if (source?.length > 0) {
          setSource(source.filter((item) => item.key !== key)); // remove one item in source by key and update source
          setSelectedRowKeys(
            (selectedRowKeys as string[]).filter((item) => item !== key), // filter selectedRowKeys
          );
          //   dispatchFilter({
          //     type: ActionFilterEnum.ChangeAllField,
          //     data: { ...filter, skip: 0, take: DEFAULT_TAKE },
          //   }); // reset to default skip, take
          setFilter({ ...filter, skip: 0, take: DEFAULT_TAKE });
        }
      },
      [
        source,
        setSource,
        setSelectedRowKeys,
        selectedRowKeys,
        setFilter,
        filter,
      ],
    );

    // delete local by key
    const handleBulkDelete = useCallback(() => {
      if (source?.length > 0) {
        Modal.confirm({
          title: "ban co chac muon xoa thao tac",
          content: "thao tac khong the khoi phuc",
          okType: "danger",
          onOk() {
            setSource(
              source.filter(
                (item) => !(selectedRowKeys as string[]).includes(item.key), // rowSelection serve either server table or local table, so we should cast selectedRowKeys as string[]
              ),
            ); // remove many items in source by key and update source
            setSelectedRowKeys([]); // empty selectedRowKeys for disabling button
            // dispatchFilter({
            //   type: ActionFilterEnum.ChangeAllField,
            //   data: { ...filter, skip: 0, take: DEFAULT_TAKE },
            // }); // reset to default skip, take
            setFilter({ ...filter, skip: 0, take: DEFAULT_TAKE });
          },
        });
      }
    }, [
      source,
      setFilter,
      filter,
      setSource,
      setSelectedRowKeys,
      selectedRowKeys,
    ]);

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
