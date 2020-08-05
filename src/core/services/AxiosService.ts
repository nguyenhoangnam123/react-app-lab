import { Subscriber, Observer } from "rxjs";

export class AxiosSubscriber extends Subscriber<any> {
    constructor( observer: Observer<any> ) {
        super( observer );
        observer.next( 'HELLO' );
        observer.complete();
    }
   unsubscribe() {
        console.log( 'unsubscribed' );
        super.unsubscribe();
    }
}