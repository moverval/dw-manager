import { ClientEvents } from "discord.js";
import ClientEvent from "../abstract/ClientEvent";
import EventHandler from "./EventHandler";

export default class EventServiceHandler {
    eventHandler: EventHandler;

    constructor(eventHandler: EventHandler) {
        this.eventHandler = eventHandler;
    }

    register<K extends keyof ClientEvents>(eventService: ClientEvent<K>) {
        return this.eventHandler.addEventListener(eventService.Type as K, (...args: ClientEvents[K]) =>
            eventService.call("main", ...args)
        );
    }

    remove<K extends keyof ClientEvents>(eventService: ClientEvent<K>, id: number) {
        return this.eventHandler.removeEventListener(eventService.Type as K, id);
    }
}
