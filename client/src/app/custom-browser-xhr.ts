import {Injectable} from "@angular/core";
import {BrowserXhr} from "@angular/http";
import {UploadProgressService} from "./shared/upload-progress.service";

@Injectable()
export class CustomBrowserXhr extends BrowserXhr {

    constructor(private uploadProgress: UploadProgressService) {
        super();
    }

    build() {
        let xhr = super.build();

        //xhr.upload.onloadstart = (e) => {};

        xhr.upload.onloadend = () => {
            this.uploadProgress.onEnd$.next();
        };

        xhr.upload.onprogress = (event) => {
            this.uploadProgress.onStart$.next();

            let percentage = Math.ceil((event.loaded / event.total) * 100);
            this.uploadProgress.onProgress$.next(percentage);
        };
        
        // xhr.withCredentials = true;
        return xhr;
    }
}