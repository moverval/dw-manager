import DataPoint from "../../filesystem/DataPoint";
import { StringMap } from "../../Types";
import Bot from "../Bot";

export default class BotTools {
    dp: DataPoint;
    private bot: Bot;

    constructor(bot: Bot) {
        this.bot = bot;
    }

    convertStringVariables(text: string, values: StringMap<string>) {
        return text.replace(
            /\$([\w\d]+);/g,
            (match: string, g1: string): string => {
                return values[g1];
            }
        );
    }

    getGlobalVariables() {
        const random = Math.floor(Math.random() * this.bot.client.users.cache.size);
        const randomUsername = this.bot.client.users.cache.array()[random].username;

        return {
            prefix: this.bot.commandHandler.getPrefix(),
            ping: "" + this.bot.client.ws.ping,
            randomUsername,
            randomMention: "@" + randomUsername
        };
    }
}
