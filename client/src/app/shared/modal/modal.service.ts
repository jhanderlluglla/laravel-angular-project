import {Injectable, ComponentFactoryResolver, Injector, Type} from '@angular/core';
import {ModalPlaceholderService} from "./modal-placeholder.service";
import {NavigationEnd, Router} from "@angular/router";

@Injectable()
export class ModalService {

    /**
     * All currently active modals.
     */
    private activeModals = [];

    /**
     * ModalService constructor.
     */
    constructor(
        private componentFactoryResolver: ComponentFactoryResolver,
        private modalPlaceholder: ModalPlaceholderService,
        private injector: Injector,
        private router: Router,
    ) {
        this.router.events.subscribe(e => {
            if (e instanceof NavigationEnd) {
                this.closeAll();
            }
        });
    }

    /**
     * Show specified modal.
     */
    public show<T>(component: Type<T>, params?: Object, injector?: Injector): T {
        //get number of modals that are currently open
        let numOfModals = this.modalPlaceholder.vcRef.length;

        //create specified modal component
        let componentFactory = this.componentFactoryResolver.resolveComponentFactory(component),
            componentRef     = this.modalPlaceholder.vcRef.createComponent(componentFactory, 0, injector || this.injector);

        componentRef.instance['destroy'] = () => {
            componentRef.destroy();
        };

        componentRef.instance['beforeCloseAnimation'] = () => {
            this.modalPlaceholder.rootEl.classList.remove('modal-active');
        };

        componentRef.instance['show'](Object.assign({}, params, {numOfModals, placeholder: this.modalPlaceholder}));

        this.activeModals.push(componentRef.instance);

        return componentRef.instance;
    }

    /**
     * Check if any modals are currently open.
     */
    public anyOpen() {
        return this.modalPlaceholder.vcRef.length;
    }

    /**
     * Close all active modals.
     */
    public closeAll() {
        this.activeModals.forEach(modal => {
            modal.close();
            modal.destroy();
        });
        this.activeModals = [];
    }
}