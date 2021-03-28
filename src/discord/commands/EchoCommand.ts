import Command, { ReturnValue } from "../abstract/Command";
import { Message, MessageEmbed } from "discord.js";
import Bot from "../Bot";
import { createRandomLightColor } from "../util/RandomColor";

export default class EchoCommand extends Command {
    run(message: Message, args: string[]): ReturnValue {
        const embed = new MessageEmbed();

        const vars = {
            ping: (text: string, bot: Bot) => {
                return "" + bot.client.ws.ping;
            },
            username: message.author.username,
            uptime: (text: string, bot: Bot) => {
                let uptimeSeconds = bot.client.uptime / 1000;
                const days = Math.floor(uptimeSeconds / 86400);
                uptimeSeconds %= 86400;
                const hours = Math.floor(uptimeSeconds / 3600);
                uptimeSeconds %= 3600;
                const minutes = Math.floor(uptimeSeconds / 60);
                const seconds = Math.round(uptimeSeconds % 60);

                let output = "";

                if (days > 0) {
                    output += `${days} Tage`;
                }

                if (hours > 0) {
                    if (output !== "") {
                        output += ", ";
                    }

                    output += `${hours} Stunden`;
                }

                if (minutes > 0) {
                    if (output !== "") {
                        output += ", ";
                    }

                    output += `${minutes} Minuten`;
                }

                if (seconds > 0) {
                    if (output !== "") {
                        output += ", ";
                    }

                    output += `${seconds} Sekunden`;
                }

                return output;
            },
        };

        let echoOutput = this.bot.util.sp.merge(args.join(" "), this.bot.util.sp.getGlobalVariables(), vars);

        let echoSplits = echoOutput.split("\n");
        let echoTitle = "Ausgabe";
        let echoDescription = echoOutput;
        if (echoSplits.length > 1) {
            echoTitle = echoSplits.shift();
            echoDescription = echoSplits.join("\n");
        }

        if(echoOutput === "") {
            echoOutput = "<KEINE-AUSGABE>";
        }

        embed
            .setTitle(echoTitle)
            .setDescription(echoDescription)
            .setColor("#" + createRandomLightColor());

        message.channel.send(embed);

        return ReturnValue.SUCCESS;
    }
}
