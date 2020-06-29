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
    const documentations = new JsonLinker<StringMap<DocumentationObject>>(
        dpConfig,
        "help_information.json"
    );
    documentations.addLoadingComponent(
        new DocumentationObjectParser(dpConfig, documentations)
    );
    documentations.load();

    await bot.login();
    bot.commandHandler.registerCommand("ping", new PingCommand(bot));
    bot.commandHandler.registerCommand("help", new HelpCommand(bot));
    bot.commandHandler.assignDocumentations(documentations);
    bot.eventHandler.addEventListener("ready", ReadyEvent);
})();
