import {
    GuildMember,
    Invite,
    Client,
    PartialGuildMember,
    Collection,
    TextChannel,
    MessageEmbed,
} from "discord.js";

import CoinSystem from "../../coinsystem/CoinSystem";
import { StringMap } from "../../Types";
import JsonLinker from "../loaders/JsonLinker";
import EventHandler from "../components/EventHandler";
import ReactionManager from "../components/ReactionManager";
import { AccountEarnType } from "../../coinsystem/AccountEarnConfig";

export default async function InviteTracker(
    client: Client,
    coinSystem: CoinSystem,
    inviteData: JsonLinker<StringMap<string>>,
    eventHandler: EventHandler,
    reactionManager: ReactionManager,
) {
    InviteTracker.prototype.inviteCount = {};

    const guildInvites: Map<string, Collection<string, Invite>> = new Map();

    client.guilds.cache.forEach((guild) => {
        guild
            .fetchInvites()
            .then((invites) => guildInvites.set(guild.id, invites))
            .catch(console.error);
    });

    eventHandler.addEventListener("guildMemberAdd", async (member: GuildMember | PartialGuildMember) => {
        const cachedInvites = guildInvites.get(member.guild.id);
        const newInvites = await member.guild.fetchInvites();
        guildInvites.set(member.guild.id, newInvites);

        try {
            const inviteUsed = newInvites.find((invite) => cachedInvites.get(invite.code).uses < invite.uses);

            if (inviteUsed) {
                const account = coinSystem.getAccount(inviteUsed.inviter.id);
                const mainGuild = client.guilds.cache.find((guild) => guild.id === process.env.MAIN_GUILD);
                if (mainGuild) {
                    const channel = mainGuild.channels.cache.find(
                        (tmpChannel) => tmpChannel.id === process.env.CONFIRMATION_CHANNEL
                    );
                    if (channel.type === "text") {
                        const embed = new MessageEmbed();
                        embed
                            .setTitle("Bestätigung erforderlich")
                            .setDescription(
                                `${inviteUsed.inviter.username} hat ein Mitglied zu diesem Server eingeladen (Coins: ${account.coins})`
                            );
                        const message = await (channel as TextChannel).send(embed);
                        const reactionMessage = reactionManager.createMessage(message, "✅", "✅");
                        reactionMessage.setReactionListener(0, () => {
                            account.add(AccountEarnType.USER_JOINED, 1);
                        });
                    }
                }
            }
        } catch (error) {
            console.error(error);
        }
    });
}
