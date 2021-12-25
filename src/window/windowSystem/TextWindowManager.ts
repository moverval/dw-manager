import InputContext from "./InputContext";
import ReactionMessage from "../../discord/components/ReactionMessage";
import { Unloadable } from "../../Types";
import TextWindow from "./abstract/TextWindow";
import Bot from "../../discord/Bot";

export default class TextWindowManager implements Unloadable {
    window: TextWindow;
    inputContext: InputContext;
    reactionMessage: ReactionMessage;

    constructor(
        bot: Bot,
        window: TextWindow,
        userId: string,
    ) {
        this.reactionMessage = bot.reactionManager.createMessage(window.message, "⬆️", "⬇️", "☑️", "🔴");
        this.inputContext = new InputContext(this.reactionMessage, bot.userInputManager, userId);
        this.setWindow(window);
        this.window.onLoad(bot, this);
    }

    activate() {
        this.inputContext.load();
        this.window.render();
    }

    setCloseWindow() {}

    setLoadWindow() {}

    setWindow(window: TextWindow) {
        this.window = window;
        this.window.windowManager = this;
        this.inputContext.setWindow(this.window);
    }

    unload() {
        this.inputContext.unload();
        this.reactionMessage.remove();
    }
}
