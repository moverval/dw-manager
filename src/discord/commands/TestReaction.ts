import Command, { ReturnValue } from "../abstract/Command";
import { Message } from "discord.js";
import CoinSystem from "../../coinsystem/CoinSystem";
import Bot from "../Bot";
import { makeWelcomeEmbed, WelcomeData, WelcomeBox } from "../events/Welcome";
import JsonLinker from "../loaders/JsonLinker";

export default class TestReaction extends Command {
    coinSystem: CoinSystem;
    linker: JsonLinker<WelcomeData>;

    constructor(bot: Bot, invoke: string, coinSystem: CoinSystem, linker: JsonLinker<WelcomeData>) {
        super(bot, invoke);
        this.linker = linker;
        this.linker.load();
        this.coinSystem = coinSystem;
    }

    run(message: Message, args: string[]): ReturnValue {
        let boxes: WelcomeBox[];

        if (args.length > 0) {
            if (args[0] === "new") {
                // Test New User Joined
                boxes = this.linker.value.Newcomer.Boxes;
            } else if (args[0] === "rejoined") {
                // Test User Rejoined
                boxes = this.linker.value.Rejoin.Boxes;
            }

            const randomBox = boxes[Math.floor(Math.random() * boxes.length)];
            const randomBoxMessage = randomBox.message[Math.floor(Math.random() * randomBox.message.length)];

            const localVars = {
                username: message.author.username,
            };

            const embed = makeWelcomeEmbed(
                this.bot.util.sp.merge(randomBox.title, this.bot.util.sp.getGlobalVariables(), localVars),
                this.bot.util.sp.merge(randomBoxMessage, this.bot.util.sp.getGlobalVariables(), localVars)
            );

            message.channel.send(`<@${message.member.id}>`).then((mMsg) => {
                mMsg.delete();
            });

            message.channel.send(embed);
        }
        return ReturnValue.SUCCESS;
    }
}
