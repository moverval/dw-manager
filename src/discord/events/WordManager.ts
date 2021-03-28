import { Message } from "discord.js";

import CoinSystem from "../../coinsystem/CoinSystem";
import { AccountEarnType } from "../../coinsystem/AccountEarnConfig";
import JsonLinker from "../loaders/JsonLinker";
import { ChannelInformation } from "./AdUpvote";
import { StringMap } from "../../Types";
import EventModule, { ClientEvent } from "../abstract/EventModule";
import Bot from "../Bot";

export default class WordManager extends EventModule {
    coinSystem: CoinSystem;
    channelInformationLinker: JsonLinker<StringMap<ChannelInformation>>;

    constructor(bot: Bot, coinSystem: CoinSystem, channelInformationLinker: JsonLinker<StringMap<ChannelInformation>>) {
        super("WordReward", bot);

        this.coinSystem = coinSystem;
        this.channelInformationLinker = channelInformationLinker;
    }

    @ClientEvent("message")
    WordEvent(message: Message) {
        if (message.channel.type === "dm" || message.guild.id !== process.env.MAIN_GUILD) {
            return;
        }
        const channelInformation = this.channelInformationLinker.value[message.channel.id];

        const transferSpecific = channelInformation ? channelInformation.community : null;

        const transfer =
            transferSpecific === null
                ? this.channelInformationLinker.value["*"] && this.channelInformationLinker.value["*"].community
                    ? true
                    : false
                : transferSpecific;

        if (transfer) {
            if (this.coinSystem.isAccount(message.author.id)) {
                const account = this.coinSystem.getAccount(message.author.id);
                const splits = message.content.split(" ");
                const real = splits.filter((split) => split.length > 3);
                account.add(AccountEarnType.WORD_SENT, real.length > 7 ? 7 : real.length);
            }
        }
    }
}
