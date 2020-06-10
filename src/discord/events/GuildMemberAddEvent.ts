import { GuildMember, PartialGuildMember, TextChannel, Guild } from "discord.js";
import { VarLink } from "../Types";
import moment from 'moment';

export default async function GuildMemberAdd(member: GuildMember | PartialGuildMember) {

  let memberJoins = 0;

  const memberCreatedAt = moment().diff(member.user.createdAt, "days");
  const AUTOROLE = process.env.AUTOROLE;
  const MUTED_ROLE = process.env.MUTED_ROLE;
  let muted = "❌";
  let color = "#ccbb00";
  let reason = "Normaler User";

  memberJoins += 1;

  if (memberJoins >= 5) {
    reason = "gefährdet (Massjoin)";
    color = "#FFA500"
    muted = `✅\n\n*(Use: !!unmute ${member.user.id})*`;
    await member.roles.add(MUTED_ROLE);
    await member
      .send({
        embed: {
          title: "Sicherheitshinweis:",
          color: 0xccbb00,
          description: `Du wurdest auf **${member.guild.name}** in die Sicherheitszone hinzugefügt`,
          fields: [
            {
              name: "Warum?",
              value:
                "Weil du bei einem **Massen Join** von 5 Membern in 15 Sekunden dabei warst"
            },
            {
              name: "Wie komme ich aus der Sicherheitszone?",
              value: "Nicht festgelegt"
            }
          ]
        }
      })
      .catch(err => console.log(err));
  } else if (memberCreatedAt <= 31) {
    reason = "gefährdet (AltAccount)";
    color = "#FFA500"
    muted = `✅\n\n*(Use: !!unmute ${member.user.id})*`;
    await member.roles.add(MUTED_ROLE);
    await member
      .send({
        embed: {
          title: "Sicherheitshinweis:",
          color: 0xccbb00,
          description: `Du wurdest auf **${member.guild.name}** in die Sicherheitszone hinzugefügt`,
          fields: [
            {
              name: "Warum?",
              value: "Weil dein Account jünger als 31 Tage alt ist"
            },
            {
              name: "Wie komme ich aus der Sicherheitszone?",
              value: "Nicht festgelegt!"
            }
          ]
        }
      })
      .catch(err => console.log(err));
  } else member.roles.add(AUTOROLE);

  const channel = new TextChannel(member.guild, {
    id: process.env.LOGCHANNEL_ID
  });

  await channel.send({
    embed: {
      title: "Joined | User",
      color: color,
      description: `Name: \`${member.user.tag}\`\nErstellt am: \`${moment(
        member.user.createdAt
      ).format("LLL")} (${moment
        .utc(member.user.createdAt)
        .fromNow(
          true
        )})\`\nUserStatus: \`${reason}\`\nSicherheitszone: ${muted}`
    }
  });
}
