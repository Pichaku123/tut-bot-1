const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

module.exports = {
    //data = command definition, execute = when it runs
    data: new SlashCommandBuilder()
        .setName("stats")
        .setDescription("Show voice channel activity stats")
        .addUserOption((option) =>
            option
                .setName("user")    //command something like => /stats user:@abc
                .setDescription("Whose stats to check (defaults to you)")
                .setRequired(false),
        ),

    async execute(interaction) {
        await interaction.deferReply();

        const targetUser = interaction.options.getUser("user") || interaction.user; 
        const guildId = interaction.guildId;

        const sessions = await prisma.session.findMany({
            where: {
                userId: targetUser.id,
                guildId: guildId,
            },
        });

        if (sessions.length === 0) {
            await interaction.editReply(
                `No voice activity tracked yet for ${targetUser.username}.`,
            );
            return;
        }

        //stats for session
        const totalSeconds = sessions.reduce(
            (sum, s) => sum + s.durationSeconds,
            0,
        );
        const sessionCount = sessions.length;
        const avgSeconds = Math.round(totalSeconds / sessionCount);
        const longestSeconds = Math.max(
            ...sessions.map((s) => s.durationSeconds),
        );

        const formatDuration = (seconds) => {
            const hrs = Math.floor(seconds / 3600);
            const mins = Math.floor((seconds % 3600) / 60);
            if (hrs > 0) return `${hrs}h ${mins}m`;
            return `${mins}m`;
        };

        const embed = new EmbedBuilder()
            .setTitle(`Voice Stats for- ${targetUser.username}`)
            .setThumbnail(targetUser.displayAvatarURL())
            .addFields(
                {
                    name: "Total Time",
                    value: formatDuration(totalSeconds),
                    inline: true,
                },
                { name: "Sessions", value: `${sessionCount}`, inline: true },
                {
                    name: "Avg Session",
                    value: formatDuration(avgSeconds),
                    inline: true,
                },
                {
                    name: "Longest Session",
                    value: formatDuration(longestSeconds),
                    inline: true,
                },
            )
            .setColor(0xf5fc2b)
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    },
};
