import {Observable} from '../../Observable';
import {FromEventObservable} from '../../observable/fromEvent';
Observable.fromEvent = FromEventObservable.create;
