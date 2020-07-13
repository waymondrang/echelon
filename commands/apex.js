const fetch = require('node-fetch')

async function apex(discord, msg, mongo, commands, content, config) {
    console.log(`${msg.author.username} requested apex stats in ${msg.guild.name}`)
    var embed = new discord.MessageEmbed()
    embed.setFooter('Echelon v1.0')
    if (content[1]) {
        if (commands.apex['more-info']['platforms'].indexOf(content[1].toLowerCase()) !== -1) {
            var response = await fetch(`https://api.mozambiquehe.re/bridge?version=4&platform=${content[1].toUpperCase()}&player=${content[2]}&auth=w8wMWKuEQgcX0DdN5L5s`).then(res => res.json())
            if (typeof response.global == 'undefined') {
                embed.setTitle('Player not found!')
                embed.setDescription(`Please verify the \`platform\` and \`username\` before retrying!`)
                embed.setColor(16711680)
                msg.channel.send(embed)
            } else {
                //console.log(response)
                embed.setTitle(`\`${response.global.name}'s stats\``)
                embed.addField('`Level`', response.global.level, true)
                embed.addField('`Rank`', `${response.global.rank.rankName.toLowerCase()} ${response.global.rank.rankDiv}`, true)
                for (item in response.total) {
                    embed.addField(`\`${response.total[item].name.toLowerCase()}\``, response.total[item].value, true)
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
}

module.exports = apex;