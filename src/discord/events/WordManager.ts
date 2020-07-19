import { Message } from "discord.js";

import CoinSystem from "../../coinsystem/CoinSystem";
import { AccountEarnType } from "../../coinsystem/AccountEarnConfig";
import JsonLinker from "../loaders/JsonLinker";
import { ChannelInformation } from "./AdUpvote";
import { StringMap } from "../../Types";

export default function WordManager(
    cs: CoinSystem,
    channelInformationLinker: JsonLinker<StringMap<ChannelInformation>>
) {
    return (message: Message) => {
        if(message.channel.type === "dm" || message.guild.id !== process.env.MAIN_GUILD) {
            return;
        }
        const channelInformation = channelInformationLinker.value[message.channel.id];

        if (channelInformation && channelInformation.community) {
            const account = cs.getAccount(message.author.id);
            const splits = message.content.split(" ");
            const real = splits.filter((split) => split.length > 3);
            account.add(AccountEarnType.WORD_SENT, real.length > 7 ? 7 : real.length);
        }
    };
}
