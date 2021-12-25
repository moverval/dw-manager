import InputContext from "./InputContext";
import ReactionMessage from "../../discord/components/ReactionMessage";
import { Unloadable } from "../../Types";
import TextWindow from "./abstract/TextWindow";
import Bot from "../../discord/Bot";
import { Message } from "discord.js";

export default class TextWindowManager implements Unloadable {
    window: TextWindow;
    inputContext: InputContext;
    reactionMessage: ReactionMessage;
    bot: Bot;
    message: Message;
    userId: string;

    constructor(
        bot: Bot,
        message: Message,
        window: TextWindow,
        userId: string,
    ) {
        this.bot = bot;
        this.message = message;
        this.window = window;
        this.userId = userId;
    }

    activate() {
        this.reactionMessage = this.bot.reactionManager.createMessage(this.message, "⬆️", "⬇️", "☑️", "🔴");
        this.reactionMessage.onReactionsAdded = () => {
          this.setWindow(this.window);
          this.window.render();
        };

        this.inputContext = new InputContext(this.reactionMessage, this.bot.userInputManager, this.userId);
        this.inputContext.load();
    }

    setCloseWindow() {}

    setLoadWindow() {}

    setWindow(window: TextWindow) {
        this.window = window;
        this.window.windowManager = this;
        this.window.bot = this.bot;
        this.window.onLoad();
        this.inputContext.setWindow(this.window);
    }

    unload() {
        this.window.unload();
        this.inputContext.unload();
        this.reactionMessage.remove();
        // TODO Set close window
    }
}
