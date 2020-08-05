import { Observable, defer } from "rxjs";
import { map } from 'rxjs/operators';
import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: '/rpc/dms/app-user',
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true,
});

export class TestRepository<T> {
    public getUser = (): Observable<T[]> => {
        return defer(()=> axiosInstance.post('/list', { skip: 0, take: 10 }))
            .pipe(map(result => result.data));
    };
}

export const repository = new TestRepository<any>();