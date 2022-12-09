import { openai } from "../apis.js";
import { createCommand } from "../utils.js";
import fetch from "node-fetch";
import { AttachmentBuilder, EmbedBuilder } from "discord.js";

export default createCommand(
    (builder) =>
        builder
            .setName("variation")
            .setDescription("Generate a variation of an image")
            .addStringOption((option) =>
                option.setName("input").setRequired(true).setDescription("URL of base image")
            ),
    async (interaction) => {
        const input = interaction.options.getString("input")!;
        await interaction.deferReply();
        try {
            const baseImage = await fetch(input);
            const file: any = baseImage.body!;
            file.name = "before.png";
            const response = await openai.createImageVariation(file, 1, "1024x1024");
            const imageResponse = await fetch(response.data.data[0].url!);
            const afterAttachment = new AttachmentBuilder(imageResponse.body!, {
                name: "result.png"
            });
            const embeds = new EmbedBuilder()
                .setImage("attachment://result.png")
                .setTitle(input.substring(0, 256));
            await interaction.editReply({ embeds: [embeds], files: [afterAttachment] });
        } catch (error: any) {
            console.error(error);
            interaction.editReply(error.toString());
        }
    }
);