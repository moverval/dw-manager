import { GuildMember, Invite, PartialGuildMember, Collection, TextChannel, MessageEmbed } from "discord.js";

import CoinSystem from "../../coinsystem/CoinSystem";
import { AccountEarnType } from "../../coinsystem/AccountEarnConfig";
import Bot from "../Bot";
import EventModule, { ClientEvent } from "../abstract/EventModule";

export default class InviteTracker extends EventModule {
    coinSystem: CoinSystem;
    guildInvites: Map<string, Collection<string, Invite>> = new Map();

    constructor(bot: Bot, coinSystem: CoinSystem) {
        super("InviteReward", bot);
        this.coinSystem = coinSystem;
    }

    @ClientEvent("inviteCreate")
    async InviteRegisterUpdate(invite: Invite) {
        this.guildInvites.set(invite.guild.id, await invite.guild.fetchInvites());
    }

    @ClientEvent("ready")
    async ReadyInvite() {
        const guild = this.bot.client.guilds.cache.find((guild, _key, _collection) => guild.id == process.env["MAIN_GUILD"]);

        if (guild != undefined) {
            this.guildInvites.set(guild.id, await guild.fetchInvites());
        }
    }

    @ClientEvent("guildMemberAdd")
    async MemberJoined(member: GuildMember | PartialGuildMember) {
        const cachedInvites = this.guildInvites.get(member.guild.id);
        const newInvites = await member.guild.fetchInvites();
        this.guildInvites.set(member.guild.id, newInvites);

        // if (coinSystem.isAccount(member.id)) {
        //     return;
        // }
        // coinSystem.createAccount(member.id);

        try {
            const inviteUsed = newInvites.find((invite) => {
                const cachedInvite = cachedInvites.get(invite.code);

                if (cachedInvite == undefined) {
                    return false;
                }

                return cachedInvite.uses < invite.uses;
            });

            if (inviteUsed) {
                const account = this.coinSystem.getAccount(inviteUsed.inviter.id);
                const mainGuild = this.bot.client.guilds.cache.find((guild) => guild.id === process.env.MAIN_GUILD);
                if (mainGuild) {
                    await mainGuild.fetch();
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
                        const reactionMessage = this.bot.reactionManager.createMessage(message, "✅", "❎");
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
    }
}
