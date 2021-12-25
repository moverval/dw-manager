import { GuildMember, Invite, PartialGuildMember, Collection, TextChannel, MessageEmbed, Guild } from "discord.js";

import CoinSystem from "../../coinsystem/CoinSystem";
import { AccountEarnType } from "../../coinsystem/AccountEarnConfig";
import Bot from "../Bot";
import EventModule, { ClientEvent } from "../abstract/EventModule";

export default class InviteTracker extends EventModule {
    coinSystem: CoinSystem;
    guildInvites: Map<string, Collection<string, Invite>> = new Map();
    guild: Guild;

    constructor(bot: Bot, coinSystem: CoinSystem) {
        super("InviteReward", bot);
        this.coinSystem = coinSystem;
    }

    @ClientEvent("inviteCreate")
    async InviteRegisterUpdate(invite: Invite) {
        const guild = await invite.guild.fetch();
        const invites = await guild.invites.fetch();
        this.guildInvites.set(invite.guild.id, invites);
    }

    @ClientEvent("ready")
    async ReadyInvite() {
        const guild = this.bot.client.guilds.resolve(process.env["MAIN_GUILD"]);


        if (guild != undefined) {
            this.guild = await guild.fetch();
            this.guildInvites.set(this.guild.id, await this.guild.invites.fetch());
        }
    }

    @ClientEvent("guildMemberAdd")
    async MemberJoined(member: GuildMember | PartialGuildMember) {
        const cachedInvites = this.guildInvites.get(member.guild.id);
        if (member.guild.id != process.env["MAIN_GUILD"]) {
            return;
        }

        const newInvites = await this.guild.invites.fetch();
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
                if (this.guild) {
                    const channel = this.guild.channels.cache.get(process.env.CONFIRMATION_CHANNEL);
                    if (channel && channel.type === "GUILD_TEXT") {
                        if (this.coinSystem.isAccount(member.id)) {
                            console.log("User already has account");
                            return;
                        }

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
                        const message = await (channel as TextChannel).send({
                          embeds: [
                              embed
                          ]
                        });
                        const reactionMessage = this.bot.reactionManager.createMessage(message, "✅", "❎");
                        reactionMessage.setReactionListener(0, (user) => {
                            if (this.guild.members.cache.get(user.id).permissions.has("ADMINISTRATOR")) {
                                account.add(AccountEarnType.INVITED_PERSON, 1);
                                reactionMessage.remove();
                                message.delete();
                            }
                        });

                        reactionMessage.setReactionListener(1, (user) => {
                            if (this.guild.members.cache.get(user.id).permissions.has("ADMINISTRATOR")) {
                                reactionMessage.remove();
                                message.delete();
                            }
                        });
                    } else {
                        console.log(
                            "Confirmation channel missing. Make sure that a channel id is given in the .env file"
                        );
                    }
                } else {
                    console.log("[INVITE_TRACKER] Thats bad. No main guild found");
                }
            }
        } catch (error) {
            console.error(error);
        }
    }
}
