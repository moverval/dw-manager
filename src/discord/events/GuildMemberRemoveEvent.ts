import { GuildMember, PartialGuildMember, TextChannel } from "discord.js";

export default async function GuildMemberRemove(member: GuildMember | PartialGuildMember) {

    const channel = new TextChannel(member.guild, {
        id: "704435138494332998"
    });
    await channel.send({embed: {
            title: "Leave | User",
            color: 0xff0000,
            description: `Name: \`${member.user.tag}\``
    }});
}
