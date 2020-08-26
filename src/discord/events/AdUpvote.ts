import { Message } from "discord.js";
import JsonLinker from "../loaders/JsonLinker";
import { StringMap } from "../../Types";
import ReactionManager, { ReactionHandle } from "../components/ReactionManager";
import Bot from "../Bot";
import { ReactionType } from "../components/ReactionMessage";
import CoinSystem from "../../coinsystem/CoinSystem";
import { AccountEarnType } from "../../coinsystem/AccountEarnConfig";
import schedule from "node-schedule";
import EventModule, { ClientEvent } from "../abstract/EventModule";

export default class AdUpvote extends EventModule {
    coinSystem: CoinSystem;
    reactionManager: ReactionManager;
    voteMap: StringMap<number>;
    voteReversedMap: StringMap<number>;

    channelInformationLinker: JsonLinker<StringMap<ChannelInformation>>;

    constructor(bot: Bot, coinSystem: CoinSystem, channelInformationLinker: JsonLinker<StringMap<ChannelInformation>>) {
        super("AdUpvote", bot);

        this.coinSystem = coinSystem;
        this.channelInformationLinker = channelInformationLinker;

        this.initAdUpvote();
    }

    initAdUpvote() {
        this.reactionManager = new ReactionManager(this.bot.eventHandler, ReactionHandle.COUNTER);
        this.voteMap = {};
        this.voteReversedMap = {};

        schedule.scheduleJob({ hour: 0, minute: 0 }, () => {
            this.voteMap = {};
            this.voteReversedMap = {};
            this.reactionManager.clearMessages();
        });
    }

    @ClientEvent("message")
    AdMessageRegister(message: Message) {
        if (message.channel.type === "dm") {
            return;
        }

        const channelInformation = this.channelInformationLinker.value[message.channel.id];

        if (channelInformation) {
            if (channelInformation.ad) {
                const reactionMessage = this.reactionManager.createMessage(message, "⬆️");
                reactionMessage.setReactionListener(0, (user, reactionType) => {
                    if (user.bot) {
                        return;
                    }
                    if (reactionType === ReactionType.CALL) {
                        if (user.id === message.author.id) {
                            const reaction = message.reactions.cache.find(
                                (subReaction) => subReaction.emoji.name === "⬆️"
                            );
                            reaction.users.remove(user);
                            return;
                        }

                        if (this.voteMap[user.id] && this.voteMap[user.id] > 9) {
                            const reaction = message.reactions.cache.find(
                                (subReaction) => subReaction.emoji.name === "⬆️"
                            );
                            reaction.users.remove(user);
                            this.voteMap[user.id] += 1;
                            return;
                        }

                        if (!this.voteMap[user.id]) {
                            this.voteMap[user.id] = 0;
                        }

                        this.voteMap[user.id] += 1;
                        if (this.voteReversedMap[user.id] && this.voteReversedMap[user.id] > 0) {
                            this.voteReversedMap[user.id] -= 1;
                        } else {
                            const voteUserAccount = this.coinSystem.getAccount(user.id);
                            voteUserAccount.add(AccountEarnType.AD_GOOD_UPVOTE, 1);
                        }
                    } else if (reactionType === ReactionType.CANCEL) {
                        this.voteMap[user.id] -= 1;

                        if (this.voteMap[user.id] > 9) {
                            return;
                        }

                        this.voteReversedMap[user.id] += 1;
                    }
                });
            }
        }
    }
}

function AdUpvote2(
    channelInformationLinker: JsonLinker<StringMap<ChannelInformation>>,
    bot: Bot,
    coinSystem: CoinSystem
) {
    const reactionManager = new ReactionManager(bot.eventHandler, ReactionHandle.COUNTER);

    let voteMap: StringMap<number> = {};
    let voteReversedMap: StringMap<number> = {};

    schedule.scheduleJob({ hour: 0, minute: 0 }, () => {
        voteMap = {};
        voteReversedMap = {};
        reactionManager.clearMessages();
    });

    bot.eventHandler.addEventListener("message", (message: Message) => {
        if (message.channel.type === "dm") {
            return;
        }

        const channelInformation = channelInformationLinker.value[message.channel.id];

        if (channelInformation) {
            if (channelInformation.ad) {
                const reactionMessage = reactionManager.createMessage(message, "⬆️");
                reactionMessage.setReactionListener(0, (user, reactionType) => {
                    if (user.bot) {
                        return;
                    }
                    if (reactionType === ReactionType.CALL) {
                        if (user.id === message.author.id) {
                            const reaction = message.reactions.cache.find(
                                (subReaction) => subReaction.emoji.name === "⬆️"
                            );
                            reaction.users.remove(user);
                            return;
                        }

                        if (voteMap[user.id] && voteMap[user.id] > 9) {
                            const reaction = message.reactions.cache.find(
                                (subReaction) => subReaction.emoji.name === "⬆️"
                            );
                            reaction.users.remove(user);
                            voteMap[user.id] += 1;
                            return;
                        }

                        if (!voteMap[user.id]) {
                            voteMap[user.id] = 0;
                        }

                        voteMap[user.id] += 1;
                        if (voteReversedMap[user.id] && voteReversedMap[user.id] > 0) {
                            voteReversedMap[user.id] -= 1;
                        } else {
                            const voteUserAccount = coinSystem.getAccount(user.id);
                            voteUserAccount.add(AccountEarnType.AD_GOOD_UPVOTE, 1);
                        }
                    } else if (reactionType === ReactionType.CANCEL) {
                        voteMap[user.id] -= 1;

                        if (voteMap[user.id] > 9) {
                            return;
                        }

                        voteReversedMap[user.id] += 1;
                    }
                });
            }
        }
    });
}

export interface ChannelInformation {
    ad: boolean;
    community: boolean;
    welcome?: boolean;
}
