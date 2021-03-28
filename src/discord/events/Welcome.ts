import { GuildMember, MessageEmbed, TextChannel, PartialGuildMember, Guild } from "discord.js";
import JsonLinker from "../loaders/JsonLinker";
import { ChannelInformation } from "./AdUpvote";
import { StringMap } from "../../Types";
import CoinSystem from "../../coinsystem/CoinSystem";
import { createRandomLightColor } from "../util/RandomColor";
import Bot from "../Bot";
import EventModule, { ClientEvent } from "../abstract/EventModule";

export default class Welcome extends EventModule {
    coinSystem: CoinSystem;
    channelLinker: JsonLinker<StringMap<ChannelInformation>>;
    messageLinker: JsonLinker<WelcomeData>;
    guild: Guild;

    welcomeChannelArray: string[] = [];

    constructor(
        bot: Bot,
        coinSystem: CoinSystem,
        channelLinker: JsonLinker<StringMap<ChannelInformation>>,
        messageLinker: JsonLinker<WelcomeData>
    ) {
        super("WelcomeMessages", bot);

        this.coinSystem = coinSystem;
        this.channelLinker = channelLinker;
        this.messageLinker = messageLinker;

        this.initChannels();
    }

    initChannels() {
        Object.keys(this.channelLinker.value).forEach((key) => {
            if (typeof this.channelLinker.value[key] !== "undefined") {
                const value = this.channelLinker.value[key] as ChannelInformation;

                if (value.welcome) {
                    this.welcomeChannelArray.push(key);
                }
            }
        });
    }

    @ClientEvent("ready")
    async GetChannels() {
        const guild = this.bot.client.guilds.resolve(process.env["MAIN_GUILD"]);
        
        this.guild = await guild.fetch();
    }

    @ClientEvent("guildMemberAdd")
    MemberJoined(member: GuildMember | PartialGuildMember) {
        console.log("Member joined event called");
        const isAccount = this.coinSystem.isAccount(member.id);

        if (this.guild == null) {
            console.log("Welcome component has no guild access");
            return;
        }

        const welcomeChannels = this.welcomeChannelArray
            .map((channelId) => this.guild.channels.resolve(channelId))
            .filter((value) => value !== null);

        if (welcomeChannels.length > 0) {
            const welcomeChannel = welcomeChannels[0] as TextChannel;
            let boxes: WelcomeBox[];

            if (isAccount) {
                // User joined before
                boxes = this.messageLinker.value.Rejoin.Boxes;
            } else {
                // User is here the first time
                boxes = this.messageLinker.value.Newcomer.Boxes;
            }

            const randomBox = boxes[Math.floor(Math.random() * boxes.length)];
            const randomBoxMessage = randomBox.message[Math.floor(Math.random() * randomBox.message.length)];

            const localVars = {
                username: member.user.username,
            };

            const embed = makeWelcomeEmbed(
                this.bot.util.sp.merge(randomBox.title, this.bot.util.sp.getGlobalVariables(), localVars),
                this.bot.util.sp.merge(randomBoxMessage, this.bot.util.sp.getGlobalVariables(), localVars),
                this.messageLinker.value.Details.Information
            );

            welcomeChannel.send(`<@${member.id}>`).then((mMsg) => {
                mMsg.delete();
            });

            welcomeChannel.send(embed);
        } else {
            console.log("No Welcome channels found");
        }
    }
}

export function makeWelcomeEmbed(title: string, description: string, information: FieldInformation) {
    const embed = new MessageEmbed();
    embed.setTitle(title).setDescription(description);
    const randomColor = "#" + createRandomLightColor();
    embed.setColor(randomColor);
    embed.addField(information.title, information.description);
    return embed;
}

export interface WelcomeData {
    Rejoin: {
        Boxes: WelcomeBox[];
    };
    Newcomer: {
        Boxes: WelcomeBox[];
    };
    Details: {
        Information: FieldInformation,
    }
}

export interface WelcomeBox {
    title: string;
    message: string[];
}

export interface FieldInformation {
    title: string;
    description: string;
}
