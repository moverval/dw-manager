import { MonitorMessage } from "../components/MonitorMessage";
import { MessageEmbed } from "discord.js";
import { StringMap } from "../../Types";

export default abstract class MonitorWindow {
    monitorMessage: MonitorMessage;
    reactions: string[];
    state: WindowState;

    initializerFunction: WindowInitializerFunction;
    renderFunction: WindowRenderFunction;

    constructor(monitorMessage: MonitorMessage, reactions: string[], state: StringMap<string | object | number>) {
        this.monitorMessage = monitorMessage;
        this.reactions = reactions;
        this.state = state;
    }

    setListener(reaction: number, wa: WindowActionFunction<WindowState>) {
        this.monitorMessage.reactionMessage.setReactionListener(reaction, () => wa(this.state));
    }

    resetListener() {
        this.monitorMessage.reactionMessage.remove();
    }

    setInitializer(initializerFunction: WindowInitializerFunction) {
        this.initializerFunction = initializerFunction;
    }

    setRender(renderFunction: WindowRenderFunction) {
        this.renderFunction = renderFunction;
    }

}

export type WindowRenderFunction = (monitorWindow: MonitorWindow) => MessageEmbed;
export type WindowInitializerFunction = (monitorWindow: MonitorWindow) => boolean;
export type WindowActionFunction<S extends WindowState> = (state: S) => S;
export type WindowState = StringMap<string | object | number | boolean>;
