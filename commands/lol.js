const fetch = require('node-fetch');
const utf8 = require('utf8');
const discord = require("discord.js");

async function lol(msg, mongo, commands, content, config) {
    if (config['riotkey']) {
        if (content[1]) {
            var url = utf8.encode(`https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${content[1]}?api_key=${config['riotkey']}`)
            //console.log(url)
            var result = await fetch(url).then(res => res.json())
            if (!result.status) {
                //console.log(result.id)
                var rankedstats = await fetch(`https://na1.api.riotgames.com/lol/league/v4/entries/by-summoner/${result.id}?api_key=${config['riotkey']}`).then(res => res.json())
                var version = await fetch(`https://ddragon.leagueoflegends.com/api/versions.json`).then(res => res.json())
                var embed = new discord.MessageEmbed()
                embed.setFooter('Echelon v2.5')
                embed.setTitle(`\`${result.name || `[n/a]`}\` League of Legends Stats`)
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
                    var embed = new discord.MessageEmbed()
                    embed.setTitle('Player not found!')
                    embed.setDescription(`Please verify the \`username\` before retrying!`)
                    embed.setColor(16711680)
                    msg.channel.send(embed)
                } else {
                    msg.channel.send('Something went wrong... try again!')
                }
            }
        } else {
            var embed = new discord.MessageEmbed()
            embed.setTitle('Missing parameters!')
            embed.setDescription(`The proper use of this command is \`${config['prefix']}${commands[content[0]].usage || '[n/a]'}\``)
            embed.setColor(16711680)
            embed.setFooter('Echelon v2.5')
            msg.channel.send(embed)
        }
    } else {
        var embed = new discord.MessageEmbed()
        embed.setTitle('No Riot API key found!')
        embed.setDescription(`This command requires a Riot API key to work!\nGet one [here](https://developer.riotgames.com/)`)
        embed.setColor(16711680)
        embed.setFooter('Echelon v2.5')
        msg.channel.send(embed)
    }
}

module.exports = lol;