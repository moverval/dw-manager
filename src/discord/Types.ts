import { Message, Client } from "discord.js";

export type Command = ($: VarLink, message: Message, args: string[], invoke?: string) => boolean;

export type CommandMap = {
    [invoke: string]: Command
};

export interface VarLink {
    client: Client;
}
