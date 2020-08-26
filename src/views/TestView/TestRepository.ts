import axios from "axios";
import { Model, ModelFilter } from "react3l/core";
import { defer, Observable } from "rxjs";
import { map } from "rxjs/operators";

const axiosInstance = axios.create({
  baseURL: "/rpc/portal/app-user",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export class TestRepository<T extends Model, TFilter extends ModelFilter> {
  public getUser = (filter: TFilter): Observable<T[]> => {
    return defer(() => axiosInstance.post("/list", filter)).pipe(
      map((result) => result.data),
    );
  };
  public getTotalUser = (filter: TFilter): Observable<number> => {
    return defer(() => axiosInstance.post("/count", filter)).pipe(
      map((result) => result.data),
    );
  };

  public deleteUser = (appUser: T): Observable<T> => {
    return defer(() => axiosInstance.post<T>("delete", appUser)).pipe(
      map((result) => result.data),
    );
  };

  public bulkDeleteUser = (ids: string[] | number[]): Observable<void> => {
    return defer(() => axiosInstance.post<void>("bulk-delete", ids)).pipe(
      map((result) => result.data),
    );
  };
}

export const repository = new TestRepository();
