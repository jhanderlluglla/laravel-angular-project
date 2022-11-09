import {Directive, OnDestroy, Input, Renderer2, ElementRef} from '@angular/core';
import {Translations} from "../translations/translations.service";

@Directive({
    selector: '[tooltip]',
    host: {
        '(mouseenter)': 'show($event)',
        '(mouseleave)': 'hide($event)',
        '(focusout)': 'hide($event)',
        '(click)': 'hide($event)',
    },
})
export class TooltipDirective implements OnDestroy {
    @Input('tooltip') tooltipText: string;
    @Input('tooltip-direction') tooltipDirection: string;

    public showTimeout: any;

    /**
     * TooltipDirective Constructor.
     */
    constructor(
        private renderer: Renderer2,
        private el: ElementRef,
        private i18n: Translations
    ) {}

    public ngOnDestroy() {
        this.hide();
    }

    /**
     * Show the tooltip.
     */
    public show(e) {
        //only show tooltip if actual tooltip element is hovered and not its children
        if (document.elementFromPoint(e.clientX, e.clientY) !== this.el.nativeElement) return;

        this.showTimeout = setTimeout(() => {
            let text = this.i18n.t(this.tooltipText);
            this.createAndShowTooltipElement(text, e);
        }, 100);
    }

    /**
     * Hide the tooltip.
     */
    public hide() {
        clearTimeout(this.showTimeout);

        let tooltip = document.getElementById('tooltip-unique');
        tooltip && tooltip.parentNode.removeChild(tooltip);
    }

    private createAndShowTooltipElement(text, e) {
        if (document.getElementById('tooltip-unique')) return;

        let el: any = document.createElement('div');
        this.renderer.setStyle(el, 'transitionDuration', '0');
        el.classList.add('tooltip');
        el.classList.add(this.tooltipDirection ? this.tooltipDirection : 'bottom');
        this.renderer.setStyle(el, 'opacity', '0');
        el.id = 'tooltip-unique';
        el.textContent = text;
        document.body.appendChild(el);

        let tipRect    = el.getBoundingClientRect(),
            parentRect = e.target.getBoundingClientRect();

        if (this.tooltipDirection === 'top') {
            this.renderer.setStyle(el, 'top', (window.scrollY + parentRect.top - tipRect.height - 6)+'px');
        } else {
            this.renderer.setStyle(el, 'top', (window.scrollY + parentRect.top + parentRect.height + 6)+'px');
        }

        this.renderer.setStyle(el, 'left', (parentRect.left + parentRect.width / 2 - tipRect.width / 2)+'px');
        this.renderer.setStyle(el, 'transform', 'scale(0)');
        this.renderer.setStyle(el, 'transitionDuration', '0.2');

        setTimeout(() => {
            this.renderer.setStyle(el, 'opacity', '0.8');
            this.renderer.setStyle(el, 'transform', 'scale(1)');
        }, 30);

        return el;
    }
}
