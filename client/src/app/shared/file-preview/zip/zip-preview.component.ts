import {Component, ViewEncapsulation} from "@angular/core";
import {UploadsService} from "../../uploads.service";
import {utils} from "../../utils";
import {Upload} from "../../models/Upload";

declare let JSZip: any;

@Component({
    selector: 'zip-preview',
    templateUrl: './zip-preview.component.html',
    styleUrls: ['./zip-preview.component.scss'],
    encapsulation: ViewEncapsulation.None,
})

export class ZipPreviewComponent {

    /**
     * Formatted zip object for use in view.
     */
    public zip: any = {folderKeys: []};

    /**
     * File model instance.
     */
    private fileModel: Upload;

    /**
     * ZipPreviewComponent constructor.
     */
    constructor(private uploads: UploadsService, private utils: utils) {}

    /**
     * Show preview for given archive file.
     */
    public showPreview(file: Upload): Promise<any> {
        this.fileModel = file;
        return new Promise((resolve, reject) => {
            this.utils.loadScript('assets/js/jszip.min.js').then(() => {
                this.uploads.getFileContents(file, true).subscribe(response => {
                    this.initFileTree(response, resolve, reject);
                }, err => reject(err));
            });
        });
    }

    public initFileTree(data, resolve, reject) {
        let zip =  new JSZip();

        zip.loadAsync(data).then((zip) => {
            let tree = {};

            for(let key in zip.files) {
                if (zip.files.hasOwnProperty(key)) {
                    this.buildTree(tree, key);
                }
            }

            this.zip.tree = tree;
            this.zip.folder = tree;
            this.zip.name = this.fileModel.name;
            this.zip.folderLength = this.getNumberOfItemsInFolder(this.zip.folder);

            for(let name in this.zip.folder) {
                if (this.zip.folder.hasOwnProperty(name)) {
                    this.zip.folderKeys.push(name);
                }
            }

            this.zip.oneFolderUp  = () => {
                if (this.zip.folder._parent && this.zip.folder._parent !== 'root') {
                    let response  = this.getDescendantProp(this.zip.tree, this.zip.folder._parent);
                    this.zip.folder = response.obj;
                    this.zip.name   = response.name;
                } else {
                    this.zip.folder = tree;
                    this.zip.name   = this.fileModel.name;
                }

                this.zip.olderLength = this.getNumberOfItemsInFolder(this.zip.folder);
            };

            this.zip.changeFolder = (name, folder) => {
                this.zip.folder = folder;
                this.zip.name = name;
                this.zip.folderLength = this.getNumberOfItemsInFolder(this.zip.folder);
                for(let name in this.zip.folder) {
                    if (this.zip.folder.hasOwnProperty(name)) {
                        this.zip.folderKeys.push(name);
                    }
                }
            };

            resolve();
        }, (err) => {
            reject(err);
        });
    }

    /**
     * Return given objects child object and it's key
     * from given string (child1.child2.child3)
     *
     * @param {object} obj
     * @param {string} desc child objects "path"
     *
     * @returns {object}
     */
    public getDescendantProp(obj, desc) {
        let arr = desc.split('.'), name;

        while(arr.length) {
            name = arr.shift();
            obj = obj[name];
        }

        return {
            name: name,
            obj: obj
        }
    }

    /**
     * Builder a tree object from given file path strings for easy looping
     *
     * @param {object} tree
     * @param {string} path 'path/to/folder/or/file.txt'
     */
    public buildTree(tree, path) {
        let lastDir,
            parts = path.split('/'),
            parent = '';

        parts.forEach(function(part) {
            let name = part.trim();

            if ( ! name) return;

            //it's a folder
            if (name.indexOf('.') === -1) {

                //first part of path, create folder
                if (! lastDir && ! tree[name]) {
                    lastDir = tree[name] = {
                        _files: [],
                        _parent: 'root'
                    };

                    parent += name+'.';

                    //folder already created, bail
                } else if ( ! lastDir) {
                    lastDir = tree[name];
                    parent += name+'.';
                    return;

                    //subsequent parts of path, create folder
                } else if (lastDir && ! lastDir[name]) {
                    lastDir = lastDir[name] = {
                        _files: [],
                        _parent: parent.replace(/\.\s*$/, '')
                    };

                    //subsequent parts of path, folder already created, bail
                } else {
                    parent += name+'.';
                    lastDir = lastDir[name];
                }

                //it's a file
            } else {
                if ( ! lastDir) {
                    if ( ! tree._files) tree._files = [];
                    tree._files.push(name);
                } else {
                    lastDir._files.push(name);
                }
            }
        });
    }

    public getNumberOfItemsInFolder(obj) {
        let length = 0, key;

        for (key in obj) {
            if (obj.hasOwnProperty(key) && key.charAt(0) !== '_') length++;
        }

        if (obj._files) {
            length += obj._files.length;
        }

        return length;
    }

}
