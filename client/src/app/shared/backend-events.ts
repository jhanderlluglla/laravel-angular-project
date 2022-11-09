import {EventEmitter, Injectable} from '@angular/core';
import "pusher-js";
import Echo from "laravel-echo";
import {SettingsService} from "./settings.service";
import {Ticket} from "./models/Ticket";
import {Group} from "./models/Group";
import {HttpClient} from "./http-client";
import {Reply} from "./models/Reply";
import {CurrentUser} from "../auth/current-user";

@Injectable()
export class BackendEvents {

    /**
     * Fired when new ticket is created.
     */
    public ticketCreated: EventEmitter<Ticket> = new EventEmitter();

    /**
     * Fired when new ticket reply is created.
     */
    public ticketReplyCreated: EventEmitter<Reply> = new EventEmitter();

    /**
     * Fired when new ticket reply is created.
     */
    public groupAssigned: EventEmitter<string> = new EventEmitter();

    /**
     * laravel echo instance.
     */
    private echo: any;

    /**
     * Echo channel current user is subscribed to.
     */
    private channel: any;

    /**
     * Whether BackendEvents service has already been bootstrapped.
     */
    private bootstrapped = false;

    /**
     * BackendEvents Constructor.
     */
    constructor(
        private settings: SettingsService,
        private httpClient: HttpClient,
        private currentUser: CurrentUser
    ) {}

    /**
     * Create observables for document events.
     */
    public init() {
        if (this.bootstrapped || ! this.shouldInitPusher()) return;
        this.echo = new Echo({
            broadcaster: 'pusher',
            key: this.settings.get('realtime.pusher_key'),
            authEndpoint: 'secure/broadcasting/auth',
            csrfToken: this.settings.csrfToken
        });

        this.subscribeToChannel();

        if (this.channel) {
            this.setSocketIdHeader();
            this.listenForTicketReplyCreatedEvent();
            this.listenForTicketCreatedEvent();
            this.listenForGroupAssignedEvent();
        }

        this.bootstrapped = true;
    }

    /**
     * Subscribe to echo channel current user has access to.
     */
    private subscribeToChannel() {
        let channel = this.getChannelName();
        if (!channel) return;
        this.channel = this.echo.private(channel);
    }

    /**
     * set "X-Socket-ID" header to enable laravel
     * "toOthers" broadcasting functionality
     */
    private setSocketIdHeader() {
        this.channel.on('pusher:subscription_succeeded', () => {
            this.httpClient.setDefaultHeader('X-Socket-ID', this.echo.socketId());
        });
    }

    /**
     * Listen for new ticket reply created event from backend.
     */
    private listenForTicketReplyCreatedEvent() {
        this.channel.listen('TicketReplyCreated', (e: { reply: Reply }) => {
            this.httpClient.get('replies/' + e.reply.id).subscribe(reply => {
                this.ticketReplyCreated.emit(reply);
            });
        });
    }


    /**
     * Listen for new ticket created event from backend.
     */
    private listenForTicketCreatedEvent() {
        this.channel.listen('TicketCreated', (e) => {
            this.httpClient.get('tickets/' + e.ticket.id).subscribe(ticket => {
                this.ticketCreated.emit(ticket);
            });
        });
    }

    /**
     * Listen for new Group created event from backend.
     */
    private listenForGroupAssignedEvent() {
        this.channel.listen('GroupAssigned', (e) => {
            this.groupAssigned.emit('Assigned');
        });
    }

    /**
     * Get tickets channel user should listen on based on their permissions.
     */
    private getChannelName(): string {
        if ( ! this.currentUser.isLoggedIn()) return;

        let name = 'App.User.' + this.currentUser.get('id');

        if (this.currentUser.hasPermissions(['replies.view', 'tickets.view'])) {
            name = 'tickets.global';
        }

        return name;
    }

    /**
     * Check if realtime is enabled and pusher key is set.
     */
    private shouldInitPusher() {
         return this.settings.get('realtime.pusher_key') && this.settings.get('realtime.enable');
    }
}