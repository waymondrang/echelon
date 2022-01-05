const fetch = require('node-fetch');
const discord = require("discord.js");

async function apex(msg, mongo, commands, content, config) {
    if (config['apextoken']) {
        console.log(`${msg.author.username} requested apex stats in ${msg.guild.name}`)
        var embed = new discord.MessageEmbed()
        embed.setFooter(`${config["bot_name"]}${config["display_version_number"] ? ` ${config["version_number"]}` : ""}`);
        if (content[1]) {
            if (commands.apex['more-info']['platforms'].indexOf(content[1].toLowerCase()) !== -1) {
                var response = await fetch(`https://api.mozambiquehe.re/bridge?version=4&platform=${content[1].toUpperCase()}&player=${content[2]}&auth=${config['apextoken']}`).then(res => res.json())
                if (typeof response.global == 'undefined') {
                    embed.setTitle('Player not found!')
                    embed.setDescription(`Please verify the \`platform\` and \`username\` before retrying!`)
                    embed.setColor(16711680)
                    msg.channel.send(embed)
                } else {
                    //console.log(response)
                    embed.setTitle(`\`${response.global.name}\` Apex Legends Stats`)
                    embed.setThumbnail(response.legends.selected['ImgAssets'].icon)
                    embed.addField('`Level`', response.global.level, true)
                    embed.addField('`Rank`', `${response.global.rank.rankName} ${response.global.rank.rankDiv}`, true)
                    for (item in response.total) {
                        embed.addField(`\`${response.total[item].name}\``, response.total[item].value, true)
                    }
                    embed.setColor(`0x${config['colors'][Math.floor(Math.random() * config['colors'].length)]}`)
                    msg.channel.send(embed)
                }
            } else {
                embed.setTitle('Unknown platform!')
                embed.setDescription(`Acceptable platforms include: \`${commands.apex['more-info'].platforms}\``)
                embed.setColor(16711680)
                msg.channel.send(embed)
            }
        } else {
            embed.setTitle('Missing parameters!')
            embed.setDescription(`The proper use of this command is \`${config['prefix']}${commands.apex.usage}\``)
            embed.setColor(16711680)
            msg.channel.send(embed)
        }
    } else {
        var embed = new discord.MessageEmbed()
        embed.setTitle('No Apex Legends API key found!')
        embed.setDescription(`This command requires a Apex Legends API key to work!\nGet one [here](https://apexlegendsapi.com/)`)
        embed.setColor(16711680)
        embed.setFooter(`${config["bot_name"]}${config["display_version_number"] ? ` ${config["version_number"]}` : ""}`);
        msg.channel.send(embed)
    }
}

module.exports = apex;