import { ClientEvents } from "discord.js";
import ClientEvent from "../abstract/EventModule";
import EventHandler from "./EventHandler";

export default class EventServiceHandler {
    eventHandler: EventHandler;

    constructor(eventHandler: EventHandler) {
        this.eventHandler = eventHandler;
    }

    register(eventService: ClientEvent) {
        const proto = Object.getPrototypeOf(eventService);

        for (const func in proto) {
            if (typeof proto[func] === "function") {
                const funcProto = proto[func].prototype;
                if (funcProto.isEvent) {
                    console.log("Registering " + funcProto.eventType + " Event in " + eventService.Name);
                    this.eventHandler.addEventListener(funcProto.eventType, proto[func]);
                }
            }
        }
    }
}
