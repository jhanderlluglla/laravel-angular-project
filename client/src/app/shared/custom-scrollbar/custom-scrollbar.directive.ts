import {Directive, ElementRef, AfterViewInit, OnDestroy, Input, OnInit} from '@angular/core';

declare let Ps: any;

@Directive({
    selector: '[customScrollbar]',
})
export class CustomScrollbarDirective implements AfterViewInit, OnDestroy {

    /**
     * Theme that should be used for the scrollbar.
     */
    @Input('customScrollbar') theme: string;

    /**
     * Minimum length for scrollbar drag handle.
     */
    @Input('customScrollbarMinLength') minLength: number = 100;

    /**
     * Scrolltop value set via custom setScrollTop() method.
     * Perfect Scrollbar doesn't preserve scrollTop value on DOM
     * element for some reason, so we need to keep it here.
     */
    private scrollTop = 0;

    /**
     * CustomScrollbarDirective Constructor.
     */
    constructor(private el: ElementRef) {}

    ngAfterViewInit() {
        if ( ! this.theme) this.theme = 'default';

        Ps.initialize(this.el.nativeElement, {
            minScrollbarLength: this.minLength,
            suppressScrollX: true,
            theme: this.theme,
        });
    }

    public update() {
        Ps.update(this.el.nativeElement);
    }

    /**
     * Scroll container top to given value.
     */
    public setScrollTop(value = 0) {
        this.el.nativeElement.scrollTop = value;
        this.scrollTop = this.el.nativeElement.scrollTop;
        this.update();
    }

    ngOnDestroy() {
        Ps.destroy(this.el.nativeElement);
    }
}
