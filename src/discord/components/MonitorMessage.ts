import ReactionMessage from "./ReactionMessage";
import { Message, User } from "discord.js";
import Bot from "../Bot";
import MonitorWindow from "../abstract/MonitorWindow";
import { StringMap } from "../../Types";

export class MonitorMessage {
    loadingMessage: "Loading...";
    interactiveMessage: Message;

    reactionMessage: ReactionMessage;
    reactions: string[];
    windows: StringMap<MonitorWindow>;

    currentWindow: MonitorWindow;
    user: User;

    bot: Bot;

    constructor(bot: Bot, interactiveMessage: Message, user: User, monitorWindow: MonitorWindow) {
        this.reactionMessage = bot.reactionManager.createMessage(interactiveMessage, ...monitorWindow.reactions);
        this.interactiveMessage = interactiveMessage;
        this.reactions = monitorWindow.reactions;
        this.user = user;
        this.bot = bot;

        this.windows = {};
        this.addWindow("_first", monitorWindow);
        this.currentWindow = monitorWindow;
    }

    addWindow(name: string, window: MonitorWindow) {
        this.windows[name] = window;
    }

    changeWindow(name: string) {
        const lastWindow = this.currentWindow;
        this.reactionMessage.clearListeners();

        this.currentWindow = this.windows[name];
        if(lastWindow.reactions !== this.currentWindow.reactions) {
            this.reactionMessage.removeReactions();
            this.reactionMessage.remove();
            this.reactionMessage = this.bot.reactionManager.createMessage(this.interactiveMessage, ...this.currentWindow.reactions);
        }
        this.makeRender();
    }

    makeRender(cbFailed?: () => any): void {
        if (this.currentWindow) {
            this.reactionMessage.message.edit(this.currentWindow.renderFunction(this.currentWindow)).catch(cbFailed);
        } else if(cbFailed) {
            cbFailed();
        }
    }
}
