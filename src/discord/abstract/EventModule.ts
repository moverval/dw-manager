import { ClientEvents } from "discord.js";
import Bot from "../Bot";
import Service from "../components/Service";

export default abstract class EventModule extends Service {
    protected bot: Bot;

    constructor(name: string, bot: Bot) {
        super(name);
        this.bot = bot;
    }
}

type EventFunction<K extends keyof ClientEvents> = (...args: ClientEvents[K]) => any;

export function ClientEvent<K extends keyof ClientEvents>(type: K) {
    return (target: object, key: string | symbol, descriptor: PropertyDescriptor) => {
        const desc = Object.getOwnPropertyDescriptor(target, key);
        const funcProto = desc.value.prototype;
        funcProto.isEvent = true;
        funcProto.eventType = type;
    };
}
