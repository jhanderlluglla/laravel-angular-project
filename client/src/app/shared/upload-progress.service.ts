import {Injectable} from '@angular/core';
import {Subject} from "rxjs";

@Injectable()
export class UploadProgressService {

    /**
     * Fired while file uploading is in progress.
     */
    public onProgress$: Subject<number> = new Subject();

    /**
     * Fired when file uploaded started.
     */
    public onStart$ = new Subject();

    /**
     * Fired when file upload completed.
     */
    public onEnd$ = new Subject();
}