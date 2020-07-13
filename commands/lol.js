const fetch = require('node-fetch');
const utf8 = require('utf8');

async function lol(discord, msg, mongo, commands, content, config) {
    if (content[1]) {
        var url = utf8.encode(`https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${content[1]}?api_key=${config['riotkey']}`)
        //console.log(url)
        var result = await fetch(url).then(res => res.json())
        if (!result.status) {
            console.log(result.id)
            var rankedstats = await fetch(`https://na1.api.riotgames.com/lol/league/v4/entries/by-summoner/${result.id}?api_key=${config['riotkey']}`).then(res => res.json())
            var version = await fetch(`https://ddragon.leagueoflegends.com/api/versions.json`).then(res => res.json())
            var embed = new discord.MessageEmbed()
            embed.setFooter('Echelon v1.0')
            embed.setTitle(`\`${result.name || `[n/a]`}\` league stats`)
            embed.setColor(`0x${config['colors'][Math.floor(Math.random() * config['colors'].length)]}`)
            embed.setDescription('Provided by [riot games api](https://developer.riotgames.com/)')
            embed.addField(`Summoner level:`, `\`${result.summonerLevel || `[n/a]`}\``, true)
            if (rankedstats.length) {
                embed.addField(`Ranked stats:`, `\`${rankedstats[0].tier} ${rankedstats[0].rank}\`\n**${rankedstats[0].wins}** wins / **${rankedstats[0].losses}** losses`)
            } else {
                embed.addField(`Ranked stats:`, `\`[n/a]\``)
            }
            embed.setThumbnail(`http://ddragon.leagueoflegends.com/cdn/${version[0]}/img/profileicon/${result.profileIconId}.png`)
            msg.channel.send(embed)
        } else {
            if (result.status['status_code'] == 404) {
                msg.channel.send('Username does not exist! Please check username before retrying.')
            } else {
                msg.channel.send('Something went wrong... try again!')
            }
        }
    } else {
        msg.channel.send('A username must be specified!')
    }
}

module.exports = lol;