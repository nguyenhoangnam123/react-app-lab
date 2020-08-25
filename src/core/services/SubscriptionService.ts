import { Observable, Subject } from "rxjs";

export default function subcriptionCancellation(): {
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
