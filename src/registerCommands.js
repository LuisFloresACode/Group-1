
import { REST, Routes, SlashCommandBuilder } from "discord.js";

const token = process.env.TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

if (!token || !clientId || !guildId) {
    throw new Error("Missing TOKEN, CLIENT_ID, or GUILD_ID in .env");
}

const commands = [
    new SlashCommandBuilder()
        .setName("leaderboard")
        .setDescription("Show the server XP leaderboard")
        .toJSON(),
];

const rest = new REST({ version: "10" }).setToken(token);

async function registerCommands() {
    try {
        console.log("Registering slash commands...");

        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands }
        );

        console.log("Successfully registered /leaderboard!");
    } catch (error) {
        console.error("Failed to register slash commands:", error);
    }
}

registerCommands();
