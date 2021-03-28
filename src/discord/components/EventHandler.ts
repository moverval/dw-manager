import { StringMap } from "../../Types";
import { ClientEvents, Client } from "discord.js";

type EventListener = (...args: any) => void;

export default class EventHandler {
    events: StringMap<Array<{ id: number; listener: EventListener }>> = {};
    client: Client;
    count = 1;

    constructor(client: Client) {
        this.client = client;
    }

    addEventListener<K extends keyof ClientEvents>(event: K, listener: (...args: ClientEvents[K]) => void) {
        if (!this.events[event]) {
            this.events[event] = [];
            console.log("Binding distributor for event " + event);
            this.client.on(event, this.distributor.bind(this, event));
        }

        this.events[event].push({ id: this.count, listener });
        return this.count++;
    }

    removeEventListener<K extends keyof ClientEvents>(event: K, id: number): boolean {
        if (this.events[event]) {
            const index = this.events[event].findIndex((obj) => obj.id === id);
            if (index !== -1) {
                this.events[event].slice(index, 1);
                return true;
            }
        }
        return false;
    }

    private call<K extends keyof ClientEvents>(key: K, ...args: ClientEvents[K]) {
        this.events[key].forEach((obj) => {
            try {
                obj.listener(...args);
            } catch (Error) {
                console.error(Error);
            }
        });
    }

    private distributor(eventName: keyof ClientEvents, ...args: any) {
        this.call(eventName, ...args);
    }
}
