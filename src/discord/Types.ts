import { Message, Client } from "discord.js";
import Command from "./abstract/Command";

export interface CommandMap {
    [invoke: string]: Command
};

export interface BotAction {
    client: Client;
}
