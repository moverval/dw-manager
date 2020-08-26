import { GuildMember, PartialGuildMember } from "discord.js";
import CoinSystem from "../../coinsystem/CoinSystem";
import EventModule, { ClientEvent } from "../abstract/EventModule";
import Bot from "../Bot";

export default class CreateUserJoined extends EventModule {
    coinSystem: CoinSystem;

    constructor(bot: Bot, coinSystem: CoinSystem) {
        super("CreateUserAccount", bot);
        this.coinSystem = coinSystem;
    }

    @ClientEvent("guildMemberAdd")
    MemberJoined(member: GuildMember | PartialGuildMember) {
        if (!this.coinSystem.isAccount(member.id)) {
            this.coinSystem.createAccount(member.id);
        }
    }
}
