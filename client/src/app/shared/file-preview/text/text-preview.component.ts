import {Component, ViewChild, ElementRef, ViewEncapsulation} from '@angular/core';
import {UploadsService} from "../../uploads.service";
import {Upload} from "../../models/Upload";
import prismjs from 'prismjs';
import 'prismjs/components/prism-php';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-markup';

@Component({
    selector: 'text-preview',
    template: '<pre><code [class]="languageType" #textContainer>{{contents}}</code></pre>',
    styleUrls: ['./text-preview.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class TextPreviewComponent {
    @ViewChild('textContainer') textContainer: ElementRef;

    /**
     * Text to preview.
     */
    public contents: string;

    /**
     * Language type of text that is being previewed.
     */
    public languageType: string;

    /**
     * TextPreviewComponent constructor.
     */
    constructor(private uploads: UploadsService) {}

    /**
     * Preview specified (text) upload.
     */
    public showPreview(file: Upload): Promise<any> {
        return new Promise((resolve, reject) => {
            this.uploads.getFileContents(file).subscribe(response => {
                this.languageType = 'language-'+this.getTextLanguage(file);
                this.contents = response as string;
                setTimeout(() => prismjs.highlightElement(this.textContainer.nativeElement));
                resolve();
            }, () => reject());
        });
    }

    /**
     * Determine programming language type (if any) for current file model.
     */
    private getTextLanguage(file: Upload) {
        let subtype = file.mime.split('/')[1];
        let langType = subtype.replace('x-', '');

        switch (langType) {
            case 'plain':
            case 'txt':
                return file.name.substr(file.name.lastIndexOf('.') + 1);
            case 'js':
                return 'javascript';
            case 'html':
            case 'xml':
                return 'markup';
            default:
                return langType;
        }
    }
}
