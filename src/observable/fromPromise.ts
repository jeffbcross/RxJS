/// <reference path="../../typings/es6-promise/es6-promise.d.ts"/>
import Observable from '../Observable';
import Observer from '../Observer';

class PromiseObservable extends Observable {
  promise:Promise<any>;

  constructor(promise:Promise<any>) {
    super(null);
    this.promise = promise;
  }

  subscriber(observer:Observer) {
    var promise = this.promise;
    if(promise) {
      promise.then(x => {
        if(!observer.unsubscribed) {
          observer.next(x);
          observer.return(x);
        }
      }, e => {
        if(!observer.unsubscribed) {
          observer.throw(e);
        }
      });
    }
  }
}

export default function fromPromise(promise:Promise<any>) : Observable {
  return new PromiseObservable(promise);
}
