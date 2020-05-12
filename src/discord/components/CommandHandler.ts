import EventHandler from "./EventHandler";
import { Command, CommandMap } from "../Types";
import { Message } from "discord.js";

export default class CommandHandler {
    eventHandler: EventHandler;
    commands: CommandMap = {};

    constructor(eventHandler: EventHandler, prefix: string) {
        this.eventHandler = eventHandler;
        this.eventHandler.addEventListener("message", CommandHandler.makeMessageListener(prefix, this.commands));
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

    private static makeMessageListener(prefix: string, commands: CommandMap) {
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
}
