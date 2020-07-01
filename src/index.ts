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
import CoinSystem from "./coinsystem/CoinSystem";
import fs from "fs";
import { exit } from "process";
import AccountEarnConfig from "./coinsystem/AccountEarnConfig";
import Account from "./coinsystem/Account";
import CoinCommand from "./discord/commands/CoinCommand";
import WordManager from "./discord/events/WordManager";
import CheckCommand from "./discord/commands/admin/CheckCommand";

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

    await bot.login();

    bot.commandHandler.registerCommand(new PingCommand(bot, "ping"));
    bot.commandHandler.registerCommand(new HelpCommand(bot, "help"));
    bot.commandHandler.registerCommand(new CoinCommand(bot, "coins", coinSystem));
    bot.commandHandler.registerCommand(new CheckCommand(bot, "check", coinSystem));

    bot.commandHandler.assignDocumentations(documentations);

    bot.eventHandler.addEventListener("ready", ReadyEvent);
    bot.eventHandler.addEventListener("message", WordManager(coinSystem));
})();
