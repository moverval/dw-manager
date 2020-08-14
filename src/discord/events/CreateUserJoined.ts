import { GuildMember, PartialGuildMember } from "discord.js";
import CoinSystem from "../../coinsystem/CoinSystem";

export default function (coinSystem: CoinSystem) {
    return (member: GuildMember | PartialGuildMember) => {
        if (!coinSystem.isAccount(member.id)) {
            coinSystem.createAccount(member.id);
        }
    };
}
