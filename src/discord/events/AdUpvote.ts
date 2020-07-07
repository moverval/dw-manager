import { Message } from "discord.js";
import JsonLinker from "../loaders/JsonLinker";
import { StringMap } from "../../Types";

export default function AdUpvote(channelInformationLinker: JsonLinker<StringMap<AdChannelInformation>>) {
    return (message: Message) => {
        const channelInformation = channelInformationLinker.value[message.channel.id];

        if (channelInformation) {
            if (channelInformation.ad) {
                message.react("⬆️");
            }
        }
    };
}

export interface AdChannelInformation {
    ad: boolean;
    community: boolean;
}
