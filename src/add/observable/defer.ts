import {Observable} from '../../Observable';
import {DeferObservable} from '../../observable/defer';
Observable.defer = DeferObservable.create;
