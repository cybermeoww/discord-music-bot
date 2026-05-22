const ffmpeg = require('ffmpeg-static');
process.env.FFMPEG_PATH = ffmpeg;

const {
    Client,
    GatewayIntentBits
} = require('discord.js');

const {
    Player
} = require('discord-player');

const {
    DefaultExtractors
} = require('@discord-player/extractor');

const {
    YoutubeiExtractor
} = require('discord-player-youtubei');

// ================= CLIENT =================
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// ================= TOKEN =================
const TOKEN = process.env.TOKEN;

// ================= PLAYER =================
const player = new Player(client);

// ================= LOAD EXTRACTORS =================
(async () => {

    await player.extractors.loadMulti(DefaultExtractors);

    await player.extractors.register(YoutubeiExtractor, {
        streamOptions: {
            useClient: 'ANDROID'
        }
    });

})();

// ================= READY =================
client.once('clientReady', () => {

    console.log(`Bot online: ${client.user.tag}`);
});

// ================= COMMAND =================
client.on('messageCreate', async (message) => {

    if (message.author.bot) return;

    // ================= PLAY =================
    if (message.content.startsWith('!play')) {

        const args = message.content.split(' ');
        const query = args.slice(1).join(' ');

        if (!query) {
            return message.reply('Masukkan nama lagu atau link!');
        }

        const voiceChannel = message.member.voice.channel;

        if (!voiceChannel) {
            return message.reply('Masuk voice channel dulu!');
        }

        try {

            await player.play(voiceChannel, query, {
                nodeOptions: {
                    metadata: message,
                    volume: 80,
                    leaveOnEnd: false,
                    leaveOnStop: false
                }
            });

            message.reply(`🎵 Memutar: ${query}`);

        } catch (err) {

            console.log(err);

            message.reply('❌ Gagal memutar lagu');
        }
    }

    // ================= STOP =================
    if (message.content === '!stop') {

        const queue = player.nodes.get(message.guild.id);

        if (!queue) {
            return message.reply('Tidak ada lagu yang diputar');
        }

        queue.delete();

        message.reply('⏹️ Musik dihentikan');
    }

    // ================= SKIP =================
    if (message.content === '!skip') {

        const queue = player.nodes.get(message.guild.id);

        if (!queue || !queue.currentTrack) {
            return message.reply('Tidak ada lagu');
        }

        queue.node.skip();

        message.reply('⏭️ Lagu diskip');
    }

    // ================= PAUSE =================
    if (message.content === '!pause') {

        const queue = player.nodes.get(message.guild.id);

        if (!queue) {
            return message.reply('Tidak ada lagu');
        }

        queue.node.pause();

        message.reply('⏸️ Lagu dipause');
    }

    // ================= RESUME =================
    if (message.content === '!resume') {

        const queue = player.nodes.get(message.guild.id);

        if (!queue) {
            return message.reply('Tidak ada lagu');
        }

        queue.node.resume();

        message.reply('▶️ Lagu dilanjutkan');
    }

    // ================= AUTOPLAY ON =================
    if (message.content === '!autoplay on') {

        const queue = player.nodes.get(message.guild.id);

        if (!queue) {
            return message.reply('Tidak ada lagu');
        }

        queue.setRepeatMode(3);

        message.reply('🔁 Autoplay aktif');
    }

    // ================= AUTOPLAY OFF =================
    if (message.content === '!autoplay off') {

        const queue = player.nodes.get(message.guild.id);

        if (!queue) {
            return message.reply('Tidak ada lagu');
        }

        queue.setRepeatMode(0);

        message.reply('❌ Autoplay dimatikan');
    }
});

// ================= PLAYER EVENTS =================
player.events.on('playerStart', (queue, track) => {

    queue.metadata.channel.send(
        `🎶 Sedang diputar: **${track.title}**`
    );
});

// ================= LOGIN =================
client.login(TOKEN);
