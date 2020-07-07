import { GuildMember, Invite, PartialGuildMember, Collection, TextChannel, MessageEmbed } from "discord.js";

import CoinSystem from "../../coinsystem/CoinSystem";
import { AccountEarnType } from "../../coinsystem/AccountEarnConfig";
import Bot from "../Bot";

export default async function InviteTracker(coinSystem: CoinSystem, bot: Bot) {
    const guildInvites: Map<string, Collection<string, Invite>> = new Map();

    bot.client.guilds.cache.forEach((guild) => {
        guild
            .fetchInvites()
            .then((invites) => guildInvites.set(guild.id, invites))
            .catch(console.error);
    });

    bot.eventHandler.addEventListener("inviteCreate", async (invite) => {
        guildInvites.set(invite.guild.id, await invite.guild.fetchInvites());
    });

    bot.eventHandler.addEventListener("guildMemberAdd", async (member: GuildMember | PartialGuildMember) => {
        const cachedInvites = guildInvites.get(member.guild.id);
        const newInvites = await member.guild.fetchInvites();
        guildInvites.set(member.guild.id, newInvites);

        if(coinSystem.isAccount(member.id)) {
            return;
        }
        coinSystem.createAccount(member.id);

        try {
            const inviteUsed = newInvites.find((invite) => cachedInvites.get(invite.code).uses < invite.uses);

            if (inviteUsed) {
                const account = coinSystem.getAccount(inviteUsed.inviter.id);
                const mainGuild = bot.client.guilds.cache.find((guild) => guild.id === process.env.MAIN_GUILD);
                if (mainGuild) {
                    const channel = mainGuild.channels.cache.get(process.env.CONFIRMATION_CHANNEL);
                    if (channel && channel.type === "text") {
                        const embed = new MessageEmbed();
                        embed
                            .setTitle("Bestätigung erforderlich")
                            .setDescription(
                                `${inviteUsed.inviter.username} hat ein Mitglied zu diesem Server eingeladen (Coins: ${
                                    account.coins
                                })\nGeld überweisen? ${account.coinSystem.earnConfig.get(
                                    AccountEarnType.INVITED_PERSON
                                )}C`
                            );
                        const message = await (channel as TextChannel).send(embed);
                        const reactionMessage = bot.reactionManager.createMessage(message, "✅", "❎");
                        reactionMessage.setReactionListener(0, (user) => {
                            if (mainGuild.members.cache.get(user.id).permissions.has("ADMINISTRATOR")) {
                                account.add(AccountEarnType.INVITED_PERSON, 1);
                                reactionMessage.remove();
                                message.delete();
                            }
                        });

                        reactionMessage.setReactionListener(1, (user) => {
                            if (mainGuild.members.cache.get(user.id).permissions.has("ADMINISTRATOR")) {
                                reactionMessage.remove();
                                message.delete();
                            }
                        });
                    } else {
                        console.log(
                            "Confirmation channel missing. Make sure that a channel id is given in the .env file"
                        );
                    }
                }
            }
        } catch (error) {
            console.error(error);
        }
    });
}
