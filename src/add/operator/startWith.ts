import {Observable} from '../../Observable';
import {startWith} from '../../operator/startWith';
Observable.prototype.startWith = startWith;
