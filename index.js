require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// channels+roles and voice state access
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],    
});

//Command loader, loads commands to be used
const fs = require("fs");
const path = require("path");

client.commands = new Map();

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

client.once("clientReady", () => {
    console.log(`Logged in as ${client.user.tag}`);
});

const sessions = new Map();   // stores intervals + session details

client.on('voiceStateUpdate', async (oldState, newState) => {
    const userId = newState.member.user.id;
    const username = newState.member.user.username;
    const joined = !oldState.channelId && newState.channelId;
    const left = oldState.channelId && !newState.channelId;

    if (joined) {
        console.log(`${newState.member.user.username} joined a voice channel`);

        const user = await prisma.user.upsert({  // create gives conflicts for same userId, so upsert used
            where: { id: userId },
            update: { username },
            create: { id: userId, username },
        });
        console.log("reminderIntervalSeconds:", user.reminderIntervalSeconds);

        const timer = setInterval(
            async () => {
                try {
                    const user = await client.users.fetch(userId);
                    await user.send(
                        `Hey ${newState.member.user.username}, time to stretch and hydrate a bit!`,
                    );
                } catch (err) {
                    console.error(
                        `Could not message ${username}:`,
                        err.message,
                    );
                }
            },
            user.reminderIntervalSeconds * 1000, 
        );
        sessions.set(userId, {
            timer,
            channelId: newState.channelId,
            guildId: newState.guild.id,
            startedAt: new Date(),
        });
    }

    if (left) {
        console.log(`${oldState.member.user.username} left a voice channel`);
        const currSession = sessions.get(userId);
        if (currSession) {
            const endedAt = new Date();
            const durationSeconds = Math.floor((endedAt - currSession.startedAt) / 1000);
            
            // Session updated in DB
            await prisma.session.create({
                data: {
                    userId,
                    guildId: currSession.guildId,
                    channelId: currSession.channelId,
                    startedAt: currSession.startedAt,
                    endedAt,
                    durationSeconds,
                },
            });
            console.log(`Session lasted for ${durationSeconds} seconds, saved into DB.`);
            clearInterval(currSession.timer);
            sessions.delete(userId);
        }
    }
});

//Interaction handler, after slash command is used
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);

        if (interaction.deferred || interaction.replied) {
            await interaction.editReply("Error executing command.");
        } else {
            await interaction.reply("Error executing command.");
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
