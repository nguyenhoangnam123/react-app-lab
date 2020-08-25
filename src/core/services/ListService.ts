import { useReducer, Reducer, useCallback, useEffect } from "react";
import { ModelFilter, Model } from "react3l/core";
import { forkJoin, Observable } from "rxjs";
import subcriptionCancellation from "./SubscriptionService";
import { finalize, take, takeUntil, tap } from "rxjs/operators";

export interface StateOfList<T extends Model> {
  list?: T[];
  total?: number;
  loadingList?: boolean;
  isLoadList?: boolean;
}

export interface ActionOfList<T extends Model> {
  type: string;
  payload?: StateOfList<T>;
}

export const SET_LIST: string = "FETCH_LIST";
export const FETCH_INIT: string = "FETCH_INIT";
export const FETCH_END: string = "FETCH_END";

function listReducer<T>(
  state: StateOfList<T>,
  action: ActionOfList<T>,
): StateOfList<T> {
  switch (action.type) {
    case SET_LIST: {
      const { list, total } = action.payload;
      return {
        ...action.payload,
        list,
        total,
      };
    }
    case FETCH_INIT: {
      return {
        ...state,
        loadingList: true,
        isLoadList: false,
      };
    }
    case FETCH_END: {
      return {
        ...state,
        loadingList: false,
        isLoadList: false,
      };
    }
  }
}

class ListService {
  /**
   *
   *
   * CRUD for list
   * @param: filter: TFilter
   * @return: { list, total, loadingList }
   *
   * */
  useList<T extends Model, TFilter extends ModelFilter>(
    filter: TFilter,
    getList: (filter: TFilter) => Observable<T[]>,
    getTotal: (filter: TFilter) => Observable<number>,
  ): {
    list: T[];
    total: number;
    loadingList: boolean;
  } {
    //  auto complete subscription until isCancelled == true (unMounted component)
    const { isCancelled, cancelSubcription } = subcriptionCancellation();
    const [{ list, total, loadingList, isLoadList }, dispatch] = useReducer<
      Reducer<StateOfList<T>, ActionOfList<T>>
    >(listReducer, {
      list: [],
      total: 0,
      loadingList: false,
      isLoadList: true,
    });

    const handleLoadList = useCallback(() => {
      forkJoin([getList(filter), getTotal(filter)])
        .pipe(
          tap(() => {
            dispatch({ type: FETCH_INIT });
          }),
          takeUntil(isCancelled),
          take(1),
          finalize(() => {
            dispatch({
              type: FETCH_END,
            });
          }),
        )
        .subscribe((results: [T[], number]) => {
          dispatch({
            type: SET_LIST,
            payload: {
              list: results[0],
              total: results[1],
            },
          });
        });
    }, [filter, getList, getTotal, isCancelled]);

    useEffect(() => {
      if (isLoadList) {
        // trigger loadList only isLoadList == true
        handleLoadList();
      }
      return () => {
        cancelSubcription();
      };
    }, [cancelSubcription, handleLoadList, isLoadList]);

    return { list, total, loadingList };
  }
}

export default new ListService();
