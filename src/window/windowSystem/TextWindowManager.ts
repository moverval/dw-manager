import InputContext from "./InputContext";
import ReactionMessage from "../../discord/components/ReactionMessage";
import { Unloadable } from "../../Types";
import TextWindow, { Input } from "./abstract/TextWindow";
import Bot from "../../discord/Bot";
import { Message } from "discord.js";
import TextAddin from "./abstract/TextAddin";

export default class TextWindowManager implements Unloadable {
    window: TextWindow;
    inputContext: InputContext;
    reactionMessage: ReactionMessage;
    bot: Bot;
    message: Message;
    userId: string;
    addins: TextAddin[];

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
        this.addins = [];
    }

    activate() {
        this.reactionMessage = this.bot.reactionManager.createMessage(this.message, "⬆️", "⬇️", "☑️", "🔴");
        this.reactionMessage.onReactionsAdded = () => {
          this.setWindow(this.window);
          this.window.render();
        };

        this.inputContext = new InputContext(this, this.userId);
        this.inputContext.load();
    }

    setCloseWindow() {}

    setLoadWindow() {}

    setWindow(window: TextWindow) {
        this.addins.forEach((addin) => {
            const tmp = addin.onSetWindow(window);
            if (tmp !== null) {
                console.log("This shit didn't prevent it");
                window = tmp;
            }
        });

        this.window = window;
        this.window.windowManager = this;
        this.window.bot = this.bot;
        this.window.onLoad();
    }

    onInput(input: Input) {
        this.addins.forEach((addin) => {
            const tmp = addin.onInput(input);
            if (tmp !== null) {
                input = tmp;
            }
        });

        this.window.onInput(input);
    }

    addin(addin: TextAddin) {
        this.addins.push(addin);
    }

    updateWindow() {
        let creator = this.window.embedCreator;
        this.addins.forEach((addin) => {
            const tmp = addin.onRender(creator);
            if (tmp !== null) {
                creator = tmp;
            }
        });

        this.reactionMessage.message.edit({ content: " ", embeds: [creator.build()] });
    }

    unload() {
        let unload = true;
        this.addins.forEach((addin) => {
            const tmp = addin.onUnload();
            if (tmp !== null) {
                unload = tmp;
            }
        });

        if (unload) {
            this.window.unload();
            this.inputContext.unload();
            this.reactionMessage.remove();
        }
    }
}
