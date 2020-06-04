import { GuildMember, PartialGuildMember, TextChannel, Guild } from "discord.js";
import { VarLink } from "../Types";
import moment from 'moment';

export default async function GuildMemberAdd(member: GuildMember | PartialGuildMember) {

    const memberCreatedAt = moment().diff(member.user.createdAt, "days");
    const AUTOROLE = "701736273697833010";
    const MUTED_ROLE = "715125087749013545";

    if (memberCreatedAt <= 7) {
        await member.roles.add(MUTED_ROLE);
        await member.send({
            embed: {
                title: "Sicherheitshinweis!",
                color: 0xccbb00,
                description: `Du wurdest auf **${member.guild.name}** in die Sicherheitszone hinzugefügt, weil du entweder:\n\`- In einem Massenjoin von Mitgliern dabei warst\`\n\`- Dein Account unter zwei Wochen alt ist\``
            }
        });
    }
    else await member.roles.add(AUTOROLE);

        const channel = new TextChannel(member.guild, {
            id: "704435138494332998"
        });

        await channel.send({
            embed: {
                title: "Joined | User",
                color: 0x66ff66,
                description: `Name: \`${
                    member.user.tag
                }\`\nErstellt am: \`${moment(
                    member.user.createdAt
                ).format("LLL")} (${moment.utc(member.user.createdAt).fromNow(true)})\``
            }
        });
}
