import dotenv from "dotenv";
import CoinSystem from "./coinsystem/CoinSystem";
import Bot from "./discord/Bot";
import PingCommand from "./discord/commands/Ping";

dotenv.config();

const cs: CoinSystem = new CoinSystem();
if(process.env.BOT_TOKEN) {
    const bot: Bot = new Bot(process.env.BOT_TOKEN as string, process.env.BOT_PREFIX as string);
    bot.login();
    bot.registerCommand("ping", PingCommand);
}
