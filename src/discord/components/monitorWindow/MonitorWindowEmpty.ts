import MonitorWindow from "../../abstract/MonitorWindow";
import { MonitorMessage } from "../MonitorMessage";
import { MessageEmbed } from "discord.js";

export default class MonitorWindowEmpty extends MonitorWindow {
    private static initializer(_monitorWindow: MonitorWindow) {
        return true;
    }

    private static render(_monitorWindow: MonitorWindow) {
        return new MessageEmbed();
    }

    constructor(monitorMessage: MonitorMessage) {
        super(monitorMessage, [], {});

        this.setInitializer(MonitorWindowEmpty.initializer);
        this.setRender(MonitorWindowEmpty.render);
    }
}
