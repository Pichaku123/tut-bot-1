const { SlashCommandBuilder } = require("discord.js");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const MIN_MINUTES = 1;
const MAX_MINUTES = 180;

module.exports = {
    data: new SlashCommandBuilder()
        .setName("set-reminder")
        .setDescription(
            "Set how often you get break reminders while in voice channels",
        )
        .addIntegerOption((option) =>
            option
                .setName("minutes")
                .setDescription(
                    `How often to remind you, in minutes (${MIN_MINUTES}-${MAX_MINUTES})`,
                )
                .setRequired(true)
                .setMinValue(MIN_MINUTES)
                .setMaxValue(MAX_MINUTES),
        ),

    async execute(interaction) {
        await interaction.deferReply();

        const minutes = interaction.options.getInteger("minutes");
        const userId = interaction.user.id;
        const username = interaction.user.username;

        await prisma.user.upsert({
            where: { id: userId },
            update: { reminderIntervalSeconds: minutes * 60 },
            create: {
                id: userId,
                username,
                reminderIntervalSeconds: minutes * 60,
            },
        });

        await interaction.editReply(
            `Done, break reminders set to every ${minutes} minute${minutes === 1 ? "" : "s"} while in voice channels, starting from the next voice session.`,
        );
    },
};
