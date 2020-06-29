import { Client, Message } from "discord.js";
import { CommandMap } from "./Types";
import EventHandler from "./components/EventHandler";
import CommandHandler from "./components/CommandHandler";

export interface BotInitializerList {
    token: string;
    prefix?: string;
    noEventHandler?: boolean;
    noCommandHandler?: boolean;
};

export default class Bot {
    client: Client;
    commands: CommandMap = {};
    prefix: string;
    token: string;
    eventHandler: EventHandler;
    commandHandler: CommandHandler;

    constructor(options: BotInitializerList) {
        this.client = new Client();
        this.token = options.token;
        this.prefix = options.prefix;
        if(!options.noEventHandler) {
            this.eventHandler = new EventHandler(this.client);

            if(!options.noCommandHandler) {
                this.commandHandler = new CommandHandler(this.eventHandler, this.prefix);
            }
        }
    }

    async login() {
        await this.client.login(this.token);
    }
}
