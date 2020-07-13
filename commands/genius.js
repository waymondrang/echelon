const fetch = require('node-fetch');
const utf8 = require('utf8');

async function genius(discord, msg, mongo, commands, content, config) {
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
        embed.setFooter('Echelon v1.0')
        embed.setColor(`0x${config['colors'][Math.floor(Math.random() * config['colors'].length)]}`)
        for (var i = 0; i < 5; i++) {
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
        msg.channel.send('No results were found for that query!')
    }
}

module.exports = genius;