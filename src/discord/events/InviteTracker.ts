import { GuildMember, Invite, Client, PartialGuildMember } from "discord.js";

import { Collection } from "discord.js";
import CoinSystem from "../../coinsystem/CoinSystem";
import { AccountEarnType } from "../../coinsystem/AccountEarnConfig";

export default function InviteTracker(client: Client, coinSystem: CoinSystem) {
    InviteTracker.prototype.invites = {};
    client.guilds.cache.array().forEach((guild) => {
        guild.fetchInvites().then((guildInvites) => {
            InviteTracker.prototype.invites[guild.id] = guildInvites;
        });
    });

    return (member: GuildMember | PartialGuildMember) => {
        member.guild.fetchInvites().then((guildInvites) => {
            const ei: Collection<string, Invite> = InviteTracker.prototype.invites[member.guild.id];
            InviteTracker.prototype.invites[member.guild.id] = guildInvites;

            const invite = guildInvites.find((i) => ei.get(i.code).uses < i.uses);
            const inviter = client.users.cache.get(invite.inviter.id);

            if (inviter) {
                const account = coinSystem.getAccount(inviter.id);
                account.add(AccountEarnType.INVITED_PERSON, 1);
            }
        });
    };
}
