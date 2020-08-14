import DataPoint from "../../filesystem/DataPoint";
import Bot from "../Bot";
import StringParser from "./util/StringParser";

export default class BotTools {
    sp: StringParser;

    dp: DataPoint;
    private bot: Bot;

    constructor(bot: Bot) {
        this.bot = bot;
        this.sp = new StringParser(bot);
    }
}

export type TextFunctionVariable = (text: string, bot: Bot) => string;
