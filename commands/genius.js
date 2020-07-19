const fetch = require('node-fetch');
const utf8 = require('utf8');
const discord = require("discord.js");

async function genius(msg, mongo, commands, content, config) {
    if (config['geniustoken']) {
        if (content[1]) {
            var utf8query = utf8.encode(content[1])
            var lyrics = await fetch(`https://api.genius.com/search?q=${utf8query}`, {
                headers: new fetch.Headers({
                    'Authorization': `Bearer ${config['geniustoken']}`
                })
            }).then(response => response.json())
            if (lyrics.response.hits.length) {
                var embed = new discord.MessageEmbed()
                embed.setTitle(`Search results for \`${utf8query}\``)
                embed.setDescription('Provided by [Genius](https://genius.com/) API')
                embed.setFooter('Echelon v2.5')
                embed.setColor(`0x${config['colors'][Math.floor(Math.random() * config['colors'].length)]}`)
                var resultcount = lyrics.response.hits.length < 5 ? lyrics.response.hits.length : 5
                for (var i = 0; i < resultcount; i++) {
                    embed.addField(`\`[${i + 1}]\` ${lyrics.response.hits[i]['result']['title'] || '[n/a]'}`, `Type: \`${lyrics.response.hits[i].type || '[n/a]'}\`\nID: \`${lyrics.response.hits[i]['result']['id'] || '[n/a]'}\`\nPrimary artist: \`${lyrics.response.hits[i]['result']['primary_artist']['name'] || '[n/a]'}\``, true)
                }
                msg.channel.send(embed).then(async message => {
                    // work in progress genius query list selector
                    var reactions = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'];
                    try {
                        for (emoji of reactions) {
                            message.react(emoji);
                        }
                    } catch (err) {
                        console.log(err)
                    }
                    var filter = (reaction, user) => {
                        return reactions.indexOf(reaction.emoji.name) !== -1 && user.id === msg.author.id
                    };
                    const collector = message.createReactionCollector(filter, {
                        time: 6000
                    });
                    collector.on('end', async collected => {
                        console.log('poll closed!')
                    })
                })

            } else {
                var response = new discord.MessageEmbed()
                response.setTitle('No results found!')
                response.setDescription(`Please check your query and try again.`)
                response.setColor(16711680)
                response.setFooter('Echelon v2.5')
                msg.channel.send(response)
            }
        } else {
            var response = new discord.MessageEmbed()
            response.setTitle('Missing parameters!')
            response.setDescription(`The proper use of this command is \`${config['prefix']}${commands[content[0]].usage || '[n/a]'}\``)
            response.setColor(16711680)
            response.setFooter('Echelon v2.5')
            msg.channel.send(response)
        }
    } else {
        var response = new discord.MessageEmbed()
        response.setTitle(`No Genius API token found!`)
        response.setDescription(`This command requires a Genius API token to work!\nGet one [here](https://docs.genius.com/#/songs-h2)`)
        response.setColor(16711680)
        response.setFooter('Echelon v2.5')
        msg.channel.send(response)
    }
}

module.exports = genius;