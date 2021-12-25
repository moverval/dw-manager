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
            if (this.timeoutMap[message.author.id + message.channel.id]) {
                this.clearInputFunction(message.author.id, message.channel.id);
            }

            func(message);
        }
    }

    getUserInput(userId: string, channelId: string, fn: InputFunction, timeout: number = 60000, onTimeout?: () => any) {
        fn.prototype.once = true;
        if (this.setInputFunction(userId, channelId, fn)) {
            this.timeoutMap[userId + channelId] = setTimeout(() => {
                this.clearInputFunction(userId, channelId);

                if (onTimeout) {
                    onTimeout();
                }
            }, timeout);

            return false;
        } else {
            return false;
        }
    }

    setInputFunction(userId: string, channelId: string, fn: InputFunction): boolean {
        if (this.inputMap[userId + channelId]) {
            return false;
        }

        this.inputMap[userId + channelId] = fn;

        return true;
    }

    clearInputFunction(userId: string, channelId: string) {
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
