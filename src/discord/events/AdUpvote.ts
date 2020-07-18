import { Message } from "discord.js";
import JsonLinker from "../loaders/JsonLinker";
import { StringMap } from "../../Types";
import ReactionManager, { ReactionHandle } from "../components/ReactionManager";
import Bot from "../Bot";
import { ReactionType } from "../components/ReactionMessage";
import CoinSystem from "../../coinsystem/CoinSystem";
import { AccountEarnType } from "../../coinsystem/AccountEarnConfig";
import schedule from "node-schedule";

export default function AdUpvote(
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

                        if(voteMap[user.id] && voteMap[user.id] > 9) {
                            const reaction = message.reactions.cache.find(
                                (subReaction) => subReaction.emoji.name === "⬆️"
                            );
                            reaction.users.remove(user);
                            voteMap[user.id] += 1;
                            return;
                        }

                        if(!voteMap[user.id]) {
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

                        if(voteMap[user.id] > 9) {
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
}
