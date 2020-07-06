import CoinSystem from "../../coinsystem/CoinSystem";
import { Message } from "discord.js";

export default function BumpEvent(coinSystem: CoinSystem) {
    return (message: Message) => {
        if (message.content === "!d bump" || message.content === ".bump") {
            // Test
        }
    };
}
