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
        const channelInformation = channelInformationLinker.value[message.channel.id];

        if (channelInformation && channelInformation.community) {
            const account = cs.getAccount(message.author.id);
            const splits = message.content.split(" ");
            const real = splits.filter((split) => split.length > 3);
            account.add(AccountEarnType.WORD_SENT, real.length);
        }
    };
}
