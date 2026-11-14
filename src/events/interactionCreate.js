
import { getLeaderboard } from "../xp/xpStorage";
import { calculateLevel } from "../xp/xpManager";

const event = {
    name: "interactionCreate",

    async execute(interaction) {
        if (!interaction.isChatInputCommand()) {
            return;
        }

        if (interaction.commandName === "leaderboard") {
            const serverId = interaction.guildId;

            if (!serverId) {
                await interaction.reply({
                    content: "This command can only be used in a server.",
                    ephemeral: true
                });
                return;
            }

            const leaderboard = getLeaderboard(serverId, 10);

            if (leaderboard.length === 0) {
                await interaction.reply("The leaderboard is currently empty!");
                return;
            }

            const lines = await Promise.all(
                leaderboard.map(async (entry, index) => {
                    const member = await interaction.guild.members
                        .fetch(entry.userId)
                        .catch(() => null);

                    const username = member
                        ? member.displayName
                        : `Unknown User (${entry.userId})`;

                    const level = calculateLevel(entry.xp);

                    return `${index + 1}. **${username}** — Level ${level} (${entry.xp} XP)`;
                })
            );

            await interaction.reply(
                "**🏆 Server Leaderboard**\n\n" + lines.join("\n")
            );
        }
    },
};

export default event;
