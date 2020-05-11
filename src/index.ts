import dotenv from "dotenv";
import CoinSystem from "./coinsystem/CoinSystem";
import Bot from "./discord/Bot";
import PingCommand from "./discord/commands/Ping";
import { UserConfig, CoinAmountState, LevelState, UserConfigInitializer } from "./coinsystem/CoinConfig";
import Serializer from "./filesystem/Serializer";
import CoinUser from "./coinsystem/CoinUser";
import { UserSave } from "./coinsystem/components/UserSave";

dotenv.config();

const bot = new Bot(process.env.BOT_TOKEN, process.env.BOT_PREFIX);

(async () => {
    await bot.login();
    bot.registerCommand("ping", PingCommand);
    bot.eventHandler.addEventListener("message", (message) => {
        message.channel.send("Test");
    });
})();
