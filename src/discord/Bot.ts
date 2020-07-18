import { Client } from "discord.js";
import { CommandMap } from "./Types";
import EventHandler from "./components/EventHandler";
import CommandHandler from "./components/CommandHandler";
import BotTools from "./components/BotTools";
import ReactionManager from "./components/ReactionManager";
import UserInputManager from "./components/UserInputManager";

export interface BotInitializerList {
    token: string;
    prefix?: string;
    noEventHandler?: boolean;
    noCommandHandler?: boolean;
    noReactionManager?: boolean;
    noUserInputManager?: boolean;
    noUtil?: boolean;
}

export default class Bot {
    client: Client;
    commands: CommandMap = {};
    prefix: string;
    token: string;
    eventHandler: EventHandler;
    commandHandler: CommandHandler;
    reactionManager: ReactionManager;
    userInputManager: UserInputManager;
    util: BotTools;

    constructor(options: BotInitializerList) {
        this.client = new Client({
            partials: ["MESSAGE", "CHANNEL", "REACTION"],
        });
        this.token = options.token;
        this.prefix = options.prefix;
        if (!options.noEventHandler) {
            this.eventHandler = new EventHandler(this.client);

            if (!options.noCommandHandler) {
                this.commandHandler = new CommandHandler(this.eventHandler, this.prefix);
            }

            if(!options.noReactionManager) {
                this.reactionManager = new ReactionManager(this.eventHandler);
            }

            if(!options.noUserInputManager) {
                this.userInputManager = new UserInputManager(this);
            }
        }

        if (!options.noUtil) {
            this.util = new BotTools(this);
        }
    }

    async login() {
        await this.client.login(this.token);
    }
}
