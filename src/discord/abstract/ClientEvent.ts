import { ClientEvents } from "discord.js";
import Bot from "../Bot";
import Service from "../components/Service";

export default abstract class ClientEvent<K extends keyof ClientEvents> extends Service {
    private type: string;
    protected bot: Bot;

    get Type() {
        return this.type;
    }

    constructor(name: string, type: K, bot: Bot) {
        super(name);
        this.type = type;
        this.bot = bot;

        this.init();
    }

    private init() {
        this.set("main", this.run);
        this.set("type", () => this.type);
    }

    callMain(...args: ClientEvents[K]) {
        this.call("main", ...args);
    }

    abstract run(...args: ClientEvents[K]): any;
}

type EventFunction<K extends keyof ClientEvents> = (...args: ClientEvents[K]) => any;
