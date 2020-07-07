import dotenv from "dotenv";
import Bot from "./discord/Bot";
import PingCommand from "./discord/commands/PingCommand";
import ReadyEvent from "./discord/events/ReadyEvent";
import HelpCommand from "./discord/commands/HelpCommand";
import DataPoint from "./filesystem/DataPoint";
import JsonLinker from "./discord/loaders/JsonLinker";
import { StringMap } from "./Types";
import DocumentationObject from "./discord/abstract/DocumentationObject";
import DocumentationObjectParser from "./discord/components/DocumentationObjectParser";
import CoinSystem, { CoinSystemSerialized } from "./coinsystem/CoinSystem";
import AccountEarnConfig from "./coinsystem/AccountEarnConfig";
import CoinCommand from "./discord/commands/CoinCommand";
import WordManager from "./discord/events/WordManager";
import CheckCommand from "./discord/commands/admin/CheckCommand";
import InviteTracker from "./discord/events/InviteTracker";
import TestReaction from "./discord/commands/TestReaction";
import TransferCommand from "./discord/commands/TransferCommand";
import Serializer from "./filesystem/Serializer";

dotenv.config();

const bot = new Bot({
    token: process.env.BOT_TOKEN,
    prefix: process.env.BOT_PREFIX,
});

(async () => {
    const rawNavData = new JsonLinker<{
        configDirectory: string;
        dataDirectory: string;
    }>(new DataPoint("./"), "navigation.json");
    rawNavData.load();
    const dpConfig = new DataPoint(rawNavData.value.configDirectory);
    const dpData = new DataPoint(rawNavData.value.dataDirectory);
    bot.util.dp = dpData;
    const documentations = new JsonLinker<StringMap<DocumentationObject>>(dpConfig, "help_information.json");
    documentations.addLoadingComponent(new DocumentationObjectParser(dpConfig, documentations));
    documentations.load();

    const coinSystem = new CoinSystem();
    const accountEarnConfig = new JsonLinker<number[]>(dpConfig, "earn_information.json");

    if (accountEarnConfig.sourceVisible()) {
        accountEarnConfig.load();

        const earnConfig = new AccountEarnConfig(accountEarnConfig.value);
        coinSystem.earnConfig = earnConfig;
    } else {
        console.error("File earn_information.json is missing");
        return;
    }

    const coinSystemLinker = new JsonLinker<{ "*": CoinSystemSerialized }>(dpData, "coinSystem.json");

    if (coinSystemLinker.sourceVisible()) {
        coinSystemLinker.load();
        coinSystem.deserialize(coinSystemLinker.value["*"]);
    }

    await bot.login();

    bot.commandHandler.registerCommand(new PingCommand(bot, "ping"));
    bot.commandHandler.registerCommand(new HelpCommand(bot, "help"));
    bot.commandHandler.registerCommand(new CoinCommand(bot, "coins", coinSystem));
    bot.commandHandler.registerCommand(new CheckCommand(bot, "check", coinSystem));
    bot.commandHandler.registerCommand(new TestReaction(bot, "reaction", coinSystem));
    bot.commandHandler.registerCommand(new TransferCommand(bot, "transfer", coinSystem));

    bot.commandHandler.assignDocumentations(documentations);

    bot.eventHandler.addEventListener("ready", ReadyEvent);
    bot.eventHandler.addEventListener("message", WordManager(coinSystem));

    InviteTracker(coinSystem, bot);

    process.stdin.resume();
    const closeHandler = () => {
        Serializer.writeObject(dpData.parse("coinSystem.json"), coinSystem);
        process.exit(0);
    };

    process.on("exit", closeHandler);
    process.on("SIGINT", closeHandler);
    process.on("SIGUSR1", closeHandler);
    process.on("SIGUSR2", closeHandler);
    process.on("uncaughtException", closeHandler);
})();
