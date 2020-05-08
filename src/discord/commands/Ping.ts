import { Message } from "discord.js";
import { Command, VarLink } from "../Types";

export default function(env: VarLink, message: Message, args: string[]): boolean {
    message.channel.send({
        embed: {
            description: env.client.ws.ping,
            title: "Ping"
        }
    });
    return true;
}
