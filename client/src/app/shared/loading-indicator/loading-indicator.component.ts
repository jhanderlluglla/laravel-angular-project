import {Component, Input, OnChanges, ElementRef, ViewEncapsulation} from '@angular/core';

@Component({
    selector: 'loading-indicator',
    styleUrls: ['./loading-indicator.component.scss'],
    template:
`<div class="spinner" *ngIf="isVisible">
  <div class="rect1"></div>
  <div class="rect2"></div>
  <div class="rect3"></div>
  <div class="rect4"></div>
  <div class="rect5"></div>
</div>`,
    encapsulation: ViewEncapsulation.None,
})

export class LoadingIndicatorComponent implements OnChanges {
    @Input() isVisible = false;

    constructor(private el: ElementRef) {}

    public ngOnChanges(changes) {
        if (changes.isVisible.currentValue) {
            this.el.nativeElement.classList.remove('hidden');
        } else {
            this.el.nativeElement.classList.add('hidden');
        }

    }

    public show() {
        this.isVisible = true;
    }

    public hide() {
        this.isVisible = false;
    }

    public toggle() {
        this.isVisible = !this.isVisible;
    }
}
