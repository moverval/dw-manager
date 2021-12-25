import Bot from "../../Bot";
import { StringMap } from "../../../Types";
import { TextFunctionVariable } from "../BotTools";

export default class StringParser {
    bot: Bot;

    constructor(bot: Bot) {
        this.bot = bot;
    }

    merge(text: string, ...key: StringMap<string | TextFunctionVariable>[]) {
        const merged = Object.assign({}, ...key);
        return this.convertStringVariables(text, merged);
    }

    convertStringVariables(text: string, values: StringMap<string | TextFunctionVariable>) {
        return text.replace(/\$([\w\d]+);/g, (match: string, g1: string): string => {
            const value = values[g1];

            if (value) {
                if (typeof value === "function") {
                    const funcVal = value as TextFunctionVariable;
                    return funcVal(text, this.bot);
                } else {
                    return value;
                }
            } else {
                return "";
            }
        });
    }

    getGlobalVariables() {
        const random = Math.floor(Math.random() * this.bot.client.users.cache.size);
        const randomUsername = this.bot.client.users.cache.at(random).username;
        const date = new Date();

        return {
            prefix: this.bot.commandHandler.getPrefix(),
            ping: "" + this.bot.client.ws.ping,
            randomUsername,
            randomMention: "@" + randomUsername,
            time: `${date.getMinutes()}:${date.getHours()}`,
            memberCount: this.bot.client.guilds.cache.find((guild, _key, _collection) => guild.id == process.env["MAIN_GUILD"]).memberCount + ""
        };
    }
}
