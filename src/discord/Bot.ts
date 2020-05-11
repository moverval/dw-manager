import { Client, Message } from "discord.js";
import { Command, CommandMap } from "./Types";
import EventHandler from "./components/EventHandler";

export default class Bot {
    client: Client;
    commands: CommandMap = {};
    prefix: string;
    token: string;
    eventHandler: EventHandler;

    constructor(token: string, prefix: string) {
        this.client = new Client();
        this.token = token;
        this.prefix = prefix;
        this.registerEvents();
        this.eventHandler = new EventHandler(this.client);
    }

    private registerEvents() {
        this.client.on("message", Bot.makeMessageListener(this.prefix, this.commands));
    }

    static makeMessageListener(prefix: string, commands: CommandMap) {
        return (message: Message) => {
            if(message.content.startsWith(prefix) &&
                !message.member.user.bot) {
                const args = message.content.split(" ");
                const invoke = args.shift().slice(prefix.length);
                if(commands[invoke]) {
                    commands[invoke]({ client: message.client }, message, args, invoke);
                }
            }
        };
    }

    async login() {
        await this.client.login(this.token);
    }

    isCommand(invoke: string) {
        return this.commands[invoke];
    }

    registerCommand(invoke: string, command: Command): boolean {
        if(!this.isCommand(invoke)) {
            this.commands[invoke] = command;
            return true;
        } else {
            return false;
        }
    }
}
