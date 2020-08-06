import React, { useEffect, useState } from "react";
import { forkJoin, Observable, Subject } from "rxjs";
import { take, takeUntil, tap } from "rxjs/operators";
import { repository } from "./TestRepository";

export default function TestView() {
  const { list, total } = useMaster(
    repository.getUser(),
    repository.getTotalUser(),
  );

  return (
    <>
      <h1>
        total: <span>{total}</span>
      </h1>
      <ul>
        {list &&
          list.length > 0 &&
          list.map((user: any) => <li key={user.id}>{user.displayName}</li>)}
      </ul>
    </>
  );
}

function useMaster<T>(getList: Observable<T[]>, getTotal: Observable<number>) {
  const [list, setList] = useState<T[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loadList, setLoadList] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const { isCancelled, cancelSubcription } = subcriptionCancellation();

  useEffect(() => {
    if (loadList) {
      forkJoin([getList, getTotal])
        .pipe(
          tap(() => setLoading(true)),
          takeUntil(isCancelled),
          take(1),
        )
        .subscribe((results: [T[], number]) => {
          setLoadList(false);
          setLoading(false);
          setList([...results[0]]);
          setTotal(results[1]);
        });
    }
    return () => {
      cancelSubcription();
    };
  }, [cancelSubcription, getList, getTotal, isCancelled, loadList]);

  return { list, total, loading };
}

// function useFetch<T>(): {
//   users: T[];
// } {
//   const [users, setUsers] = useState<T[]>([]);
//   const { isCancelled, cancelSubcription } = subcriptionCancellation();

//   useEffect(() => {
//     // subcribe it, create subject to init notification when get success,
//     repository
//       .getUser()
//       .pipe(
//         takeUntil(isCancelled), // complete when isCancelled emit a value
//         take(1), // emit only the first count value from source
//       )
//       .subscribe((data: T[]) => {
//         setUsers(data);
//       });
//     return () => {
//       cancelSubcription();
//     };
//   }, [cancelSubcription, isCancelled]);

//   return {
//     users,
//   };
// }

/* expose stop subject as Observable and next method to init stop */

function subcriptionCancellation(): {
  isCancelled: Observable<void>;
  cancelSubcription: () => void;
} {
  // define subject to cancel all subscriptions
  const stop$ = new Subject<void>();
  const cancelSubcription = (): void => {
    stop$.next();
    stop$.complete();
  };
  return {
    isCancelled: stop$.asObservable(),
    cancelSubcription,
  };
}
