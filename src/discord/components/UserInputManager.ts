import Bot from "../Bot";
import { StringMap } from "../../Types";
import { Message } from "discord.js";

export default class UserInputManager {
    bot: Bot;
    inputMap: StringMap<InputFunction>;
    timeoutMap: StringMap<NodeJS.Timeout>;

    constructor(bot: Bot) {
        this.bot = bot;
        this.inputMap = {};
        this.timeoutMap = {};
        this.bot.EventHandler.addEventListener("message", this.eventHandler.bind(this));
    }

    eventHandler(message: Message) {
        if (this.inputMap[message.author.id + message.channel.id]) {
            const func = this.inputMap[message.author.id + message.channel.id];
            this.clearUserInput(message.author.id, message.channel.id);
            func(message);
        }
    }

    getUserInput(userId: string, channelId: string, fn: InputFunction, timeout: number = 60000, onTimeout?: () => any) {
        if (this.inputMap[userId + channelId]) {
            return false;
        }

        this.timeoutMap[userId + channelId] = setTimeout(() => {
            this.clearUserInput(userId, channelId);

            if (onTimeout) {
                onTimeout();
            }
        }, timeout);

        this.inputMap[userId + channelId] = fn;
    }

    clearUserInput(userId: string, channelId: string) {
        if (this.inputMap[userId + channelId]) {
            this.inputMap[userId + channelId] = undefined;

            if (this.timeoutMap[userId + channelId]) {
                clearTimeout(this.timeoutMap[userId + channelId]);
            }

            this.timeoutMap[userId + channelId] = undefined;

            return true;
        }

        return false;
    }
}

export type InputFunction = (message: Message) => any;
