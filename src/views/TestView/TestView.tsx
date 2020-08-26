import { LoadingOutlined } from "@ant-design/icons";
import { Spin } from "antd";
import listService from "core/services/ListService";
import React, { useCallback } from "react";
import { repository } from "./TestRepository";

const antIcon = (
  <LoadingOutlined style={{ fontSize: 24, color: "blue" }} spin />
);

export default function TestView() {
  // const { list, total, loading } = useMasterReducer(
  //   repository.getUser(),
  //   repository.getTotalUser(),
  // );

  const {
    list,
    total,
    loadingList: loading,
    handleDelete,
    handleBulkDelete,
  } = listService.useList(
    { skip: 0, take: 10 },
    undefined,
    repository.getUser,
    repository.getTotalUser,
    repository.deleteUser,
    repository.bulkDeleteUser,
  );

  const handleDeleteOne = useCallback(
    (id: number) => {
      return () => {
        handleDelete({ id });
      };
    },
    [handleDelete],
  );

  const handleDeleteMany = useCallback(
    (ids: number[]) => {
      return () => {
        handleBulkDelete(ids);
      };
    },
    [handleBulkDelete],
  );

  return (
    <>
      {loading ? (
        <div
          style={{
            display: "flex",
            width: "100vw",
            height: "100vh",
            alignContent: "center",
            justifyItems: "center",
          }}
        >
          <Spin
            spinning={loading}
            style={{ margin: "auto" }}
            size={"large"}
            indicator={antIcon}
          />
        </div>
      ) : (
        <>
          <h1>
            total: <span>{total}</span>
          </h1>
          <ul>
            {list &&
              list.length > 0 &&
              list.map((user: any) => (
                <li key={user.id}>{user.displayName}</li>
              ))}
          </ul>
          <div className='btn-group'>
            <button onClick={handleDeleteOne(2857)}>Delete One</button>
            <button onClick={handleDeleteMany([2659])}>Delete Many</button>
          </div>
        </>
      )}
    </>
  );
}

export const LOAD_LIST: string = "LOAD_LIST";
export const LOADING: string = "LOADING";
export const FINISH_LOADLIST: string = "FINISH_LOADLIST";

export interface MasterState<T> {
  list?: T[];
  total?: number;
  loading?: boolean;
  isLoadList?: boolean;
}

export interface MasterAction<T> {
  type?: string;
  nextAction?: string;
  state?: MasterState<T>;
}

// function masterReducer<T>(state: MasterState<T>, action: any): MasterState<T> {
//   switch (action.type) {
//     case LOAD_LIST: {
//       const { list, total } = action.state;
//       return {
//         ...state,
//         list: list,
//         total: total,
//       };
//     }
//     case LOADING: {
//       return {
//         ...state,
//         loading: true,
//         isLoadList: false,
//       };
//     }
//     case FINISH_LOADLIST: {
//       return {
//         ...state,
//         loading: false,
//         isLoadList: false,
//       };
//     }
//   }
// }

// function useMasterReducer<T>(
//   getList: Observable<T[]>,
//   getTotal: Observable<number>,
// ) {
//   const { isCancelled, cancelSubcription } = subcriptionCancellation();
//   const [{ list, total, loading, isLoadList }, dispatch] = useReducer<
//     Reducer<MasterState<T>, MasterAction<T>>
//   >(masterReducer, {
//     list: [],
//     total: 0,
//     loading: false,
//     isLoadList: true,
//   });

//   const handleLoadList = useCallback(() => {
//     forkJoin([getList, getTotal])
//       .pipe(
//         tap(() => {
//           dispatch({ type: "LOADING" });
//         }),
//         takeUntil(isCancelled),
//         take(1),
//         finalize(() => {
//           dispatch({
//             type: "FINISH_LOADLIST",
//           });
//         }),
//       )
//       .subscribe((results: [T[], number]) => {
//         dispatch({
//           type: "LOAD_LIST",
//           state: {
//             list: results[0],
//             total: results[1],
//           },
//         });
//       });
//   }, [getList, getTotal, isCancelled]);

//   useEffect(() => {
//     if (isLoadList) {
//       handleLoadList();
//     }
//     return () => {
//       cancelSubcription();
//     };
//   }, [cancelSubcription, handleLoadList, isLoadList]);

//   return { list, total, loading };
// }

// function useMaster<T>(getList: Observable<T[]>, getTotal: Observable<number>) {
//   const [list, setList] = useState<T[]>([]);
//   const [total, setTotal] = useState<number>(0);
//   const [loadList, setLoadList] = useState<boolean>(true);
//   const [loading, setLoading] = useState<boolean>(false);
//   const { isCancelled, cancelSubcription } = subcriptionCancellation();

//   useEffect(() => {
//     if (loadList) {
//       setLoading(true);
//       forkJoin([getList, getTotal])
//         .pipe(
//           takeUntil(isCancelled),
//           take(1),
//           finalize(() => {
//             setLoading(false);
//           }),
//         )
//         .subscribe((results: [T[], number]) => {
//           setLoadList(false);
//           setLoading(false);
//           setList([...results[0]]);
//           setTotal(results[1]);
//         });
//     }

//     return () => {
//       cancelSubcription();
//     };
//   }, [cancelSubcription, getList, getTotal, isCancelled, loadList]);

//   useEffect(() => {
//     console.log(`loading: `, loading);
//   }, [loading]);

//   return { list, total, loading };
// }

/* expose stop subject as Observable and next method to init stop */

// function subcriptionCancellation(): {
//   isCancelled: Observable<void>;
//   cancelSubcription: () => void;
// } {
//   // define subject to cancel all subscriptions
//   const stop$ = new Subject<void>();
//   const cancelSubcription = (): void => {
//     stop$.next();
//     stop$.complete();
//   };
//   return {
//     isCancelled: stop$.asObservable(),
//     cancelSubcription,
//   };
// }
