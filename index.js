const ffmpeg = require('ffmpeg-static');
process.env.FFMPEG_PATH = ffmpeg;

const {
    Client,
    GatewayIntentBits
} = require('discord.js');

const {
    Player,
    QueueRepeatMode
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

    console.log('Extractor loaded');

})();

// ================= READY =================
client.once('clientReady', () => {

    console.log(`Bot online: ${client.user.tag}`);
});

// ================= EVENTS =================
player.events.on('playerStart', (queue, track) => {

    queue.metadata.channel.send(
        `🎶 Sedang diputar: **${track.title}**`
    );
});

player.events.on('audioTrackAdd', (queue, track) => {

    queue.metadata.channel.send(
        `➕ Lagu ditambahkan: **${track.title}**`
    );
});

player.events.on('error', (queue, error) => {

    console.log('PLAYER ERROR:', error);
});

player.events.on('playerError', (queue, error) => {

    console.log('TRACK ERROR:', error);
});

// ================= COMMAND =================
client.on('messageCreate', async (message) => {

    if (message.author.bot) return;

    const args = message.content.split(' ');
    const command = args.shift().toLowerCase();

    // ================= PLAY =================
    if (command === '!play') {

        const query = args.join(' ');

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
                    leaveOnEmpty: false,
                    leaveOnEnd: false,
                    leaveOnStop: false
                }
            });

            message.reply(`🔍 Mencari: ${query}`);

        } catch (err) {

            console.log(err);

            message.reply('❌ Gagal memutar lagu');
        }
    }

    // ================= SKIP =================
    if (command === '!skip') {

        const queue = player.nodes.get(message.guild.id);

        if (!queue || !queue.currentTrack) {
            return message.reply('Tidak ada lagu');
        }

        queue.node.skip();

        message.reply('⏭️ Lagu diskip');
    }

    // ================= STOP =================
    if (command === '!stop') {

        const queue = player.nodes.get(message.guild.id);

        if (!queue) {
            return message.reply('Tidak ada lagu');
        }

        queue.delete();

        message.reply('⏹️ Musik dihentikan');
    }

    // ================= PAUSE =================
    if (command === '!pause') {

        const queue = player.nodes.get(message.guild.id);

        if (!queue) {
            return message.reply('Tidak ada lagu');
        }

        queue.node.pause();

        message.reply('⏸️ Lagu dipause');
    }

    // ================= RESUME =================
    if (command === '!resume') {

        const queue = player.nodes.get(message.guild.id);

        if (!queue) {
            return message.reply('Tidak ada lagu');
        }

        queue.node.resume();

        message.reply('▶️ Lagu dilanjutkan');
    }

    // ================= AUTOPLAY ON =================
    if (command === '!autoplay') {

        const queue = player.nodes.get(message.guild.id);

        if (!queue) {
            return message.reply('Tidak ada lagu');
        }

        queue.setRepeatMode(QueueRepeatMode.AUTOPLAY);

        message.reply('🔁 Autoplay aktif');
    }

    // ================= AUTOPLAY OFF =================
    if (command === '!autoplayoff') {

        const queue = player.nodes.get(message.guild.id);

        if (!queue) {
            return message.reply('Tidak ada lagu');
        }

        queue.setRepeatMode(QueueRepeatMode.OFF);

        message.reply('❌ Autoplay dimatikan');
    }
});

// ================= LOGIN =================
client.login(TOKEN);