import {Injectable} from "@angular/core";

@Injectable()
export class LocalStorage {

    /**
     * JS LocalStorage instance.
     */
    private storage = localStorage;

    /**
     * Retrieve specified item from local storage.
     */
    public get(key: string, defaultValue?): any {
        let value;
        try { value = JSON.parse(this.storage.getItem(key)) } catch(e) {}

        return value || defaultValue;
    }

    /**
     * Store specified item in local storage.
     */
    public set(key: string, value: any) {
        this.storage.setItem(key, JSON.stringify(value));
    }

    /**
     * Remove specified item from local storage.
     */
    public remove(key: string) {
        this.storage.removeItem(key);
    }
}