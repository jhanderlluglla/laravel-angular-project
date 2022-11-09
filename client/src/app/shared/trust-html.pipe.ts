import { Pipe, PipeTransform } from '@angular/core';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser'

@Pipe({name: 'trustHTML'})
export class TrushHtmlPipe implements PipeTransform {

    constructor(private sanitizer: DomSanitizer) {}

    transform(value: string): SafeHtml {
        return this.sanitizer.bypassSecurityTrustHtml(value);
    }
}