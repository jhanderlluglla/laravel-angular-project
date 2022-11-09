import {Injectable} from '@angular/core';
import {SettingsService} from "./settings.service";

declare let Symbol: any;

@Injectable()
export class utils {

    private loadedScripts = {};

    constructor(private settings: SettingsService) {}

    static isIterable(item) {
        return typeof item[Symbol.iterator] === 'function' || this.isFileList(item);
    }

    static isFileList(item) {
        return item instanceof FileList;
    }

    static strContains(haystack, needle) {
        return haystack.toLowerCase().indexOf(needle.toLowerCase()) > -1;
    }

    /**
     * Convert specified string to snake_case
     */
    static toSnakeCase(string: string) {
        return string
            .replace(/\s/g, '_')
            .replace(/\.?([A-Z]+)/g, function (x,y){return "_" + y})
            .replace(/^_/, '')
            .toLowerCase();
    }

    /**
     * Uppercase first letter of specified string.
     */
    static ucFirst(string: string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    /**
     * Flatten specified array of arrays.
     */
    static flattenArray(arrays: any[][]): any[] {
        return [].concat.apply([], arrays);
    }

    /**
     * Slugify given string for use in urls.
     */
    static slugifyString(text): string {
        if ( ! text) return text;

        const slug = text.trim()
            .replace(/["']/g, '')
            .replace(/[^a-z0-9-]/gi, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '')
            .toLowerCase();

        //sometimes above regex might not work properly on
        //accented characters, turn original string in that case.
        return slug ? slug : text.trim();
    }

    static randomString() {
        return (Math.random() + 1).toString(36).substring(7);
    }

    /**
     * Load js script and return promise resolved on script load event.
     */
    public loadScript(url): Promise<any> {

        //script is already loaded, return resolved promise
        if(this.loadedScripts[url] === 'loaded') {
            return new Promise((resolve) => resolve());

            //script has never been loaded before, load it, return promise and resolve on script load event
        } else if ( ! this.loadedScripts[url]) {
            this.loadedScripts[url] = new Promise((resolve, reject) => {
                let s: HTMLScriptElement = document.createElement('script');
                s.async = true;
                s.src = this.settings.getBaseUrl()+url;

                s.onload = () => {
                    this.loadedScripts[url] = 'loaded';
                    resolve();
                };

                document.body.appendChild(s);
            });

            return this.loadedScripts[url];

            //script is still loading, return existing promise
        } else {
            return this.loadedScripts[url];
        }
    }
}