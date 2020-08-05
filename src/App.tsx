import React from 'react';
import TestView from 'views/TestView/TestView';

function App() {
  // const obs$: Observable<any> = Observable.create((observer: Observer<any>) => {
  //   axios.get( 'https://jsonplaceholder.typicode.com/users' )
  //   .then( ( response ) => {
  //       observer.next( response.data );
  //       observer.complete();
  //   } )
  //   .catch( ( error ) => {
  //       observer.error( error );
  //   } );
  // });

  // useEffect(() => {
  //   const observer1: Observer<any> = {
  //     next: (data: any) => console.log(`data`, data),
  //     error: undefined,
  //     complete: () => {console.log(`complete`)}
  //   }
  //   let subscription2;
  //   const subscription1: Subscription = obs$.subscribe(observer1);
  //   setTimeout(() => {
  //     subscription2 = obs$.subscribe(new AxiosSubscriber(observer1));
  //   }, 2000);

  //   return () => {
  //     subscription1.unsubscribe();
  //     subscription2.unsubscribe();
  //   }
  // }, [obs$])

  return (
    <div className="App">
      <TestView />
    </div>
  );
}


/**
 * hooks for crud Notification
 * 
 */ 
// function useNotification(){

// }


export default App;
