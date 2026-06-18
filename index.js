require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});

client.once("clientReady", () => {
    console.log(`Logged in as ${client.user.tag}`);
});

const timers = new Map();   //stores timers/intervals for all users based on their id

client.on('voiceStateUpdate', (oldState, newState) => {
    const userId = newState.id;
    if (!oldState.channelId && newState.channelId) {    //just joined
        console.log(`${newState.member.user.username} joined a voice channel`);

        const timer = setInterval(() => {
            newState.channel.send(`Hey ${newState.member.user.username}, time to stretch and hydrate a bit!`)
        },  60*60*1000);
        timers.set(userId, timer);
    }
    
    if (oldState.channelId && !newState.channelId) {    //just left
        console.log(`${oldState.member.user.username} left a voice channel`);
        clearInterval(timers.get(userId));
        timers.delete(userId);
    }
});

client.login(process.env.DISCORD_TOKEN);
