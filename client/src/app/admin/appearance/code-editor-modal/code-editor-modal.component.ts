import {Component, ElementRef, Renderer2, ViewChild, ViewEncapsulation} from '@angular/core';
import {BaseModalClass} from "../../../shared/modal/base-modal";
import * as ace from 'brace';
import 'brace/mode/javascript';
import 'brace/mode/css';
import 'brace/theme/chrome';

@Component({
    selector: 'code-editor-modal',
    templateUrl: './code-editor-modal.component.html',
    styleUrls: ['./code-editor-modal.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class CodeEditorModalComponent extends BaseModalClass {
    @ViewChild('editor') editorEl: ElementRef;

    /**
     * Ace editor instance.
     */
    private editor;

    /**
     * CodeEditorModalComponent Constructor.
     */
    constructor(protected elementRef: ElementRef, protected renderer: Renderer2) {
        super(elementRef, renderer);
    }

    /**
     * Show modal and init code editor.
     */
    public show(params: {contents?: string, language: string}) {
        this.initEditor(params.contents, params.language);
        super.show(params);
    }

    /**
     * Close modal and editor code editor contents.
     */
    public confirm() {
        super.done(this.editor.getValue());
    }

    /**
     * Initiate code editor with specified contents.
     */
    private initEditor(contents: string, language = 'javascript') {
        this.editor = ace.edit(this.editorEl.nativeElement);
        this.editor.getSession().setMode('ace/mode/'+language);
        this.editor.setTheme('ace/theme/chrome');
        this.editor.$blockScrolling = Infinity;
        if (contents) this.editor.setValue(contents, 1);
    }
}
