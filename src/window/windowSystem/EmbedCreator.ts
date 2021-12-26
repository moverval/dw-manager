import { MessageEmbed } from "discord.js";

export default class EmbedCreator {
    title: string;
    description: string;
    color: number;
    fields: Map<string, string>;
    statusFields: Map<string, string>;

    constructor() {
        this.color = 0x33b5ff;
        this.description = "";
        this.fields = new Map();
        this.statusFields = new Map();
    }

    setField(title: string, description: string) {
        this.fields.set(title, description);
    }

    removeField(title: string) {
        this.fields.delete(title);
    }

    setDescription(description: string) {
        this.description = description;
    }

    build(): MessageEmbed {
        const embed = new MessageEmbed();
        embed
            .setDescription(this.description)
            .setColor(this.color);

        this.fields.forEach((description, title) => {
            embed.addField(title, description, false);
        });

        this.statusFields.forEach((description, title) => {
            if (title === "footer") {
                embed.setFooter(description);
            } else {
                embed.addField(title, description, false);
            }
        });

        return embed;
    }
}
