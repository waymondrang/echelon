const fetch = require('node-fetch');

async function covid(discord, msg, mongo, commands, content, config) {
    console.log(`${msg.author.username} requested covid stats in ${msg.guild.name}`)
    if (content[1]) {
        var covid = await fetch('https://covidtracking.com/api/v1/states/current.json').then(response => response.json())
        index = covid.findIndex(x => x.state === content[1].toUpperCase());
        if (index !== -1) {
            var covid = covid[index]
            var embed = new discord.MessageEmbed()
            embed.setFooter('Echelon v1.1')
            embed.setTitle(`\`${covid.state.toLowerCase() || `[n/a]`}\` COVID-19 statistics`)
            embed.setColor(`0x${config['colors'][Math.floor(Math.random() * config['colors'].length)]}`)
            embed.setDescription('Data provided by the [Covid Tracking Project](https://covidtracking.com/)')
            embed.addField(`Statewide:`, `\`${covid.positive || `[n/a]`}\` cases\n\`${covid.recovered || `[n/a]`}\` recovered`, true)
            embed.addField(`Data quality grade:`, `\`${covid['dataQualityGrade'] || `[n/a]`}\``)
            msg.channel.send(embed)
        } else {
            msg.channel.send('Must be a valid state abbreviation! \`(eg. CA, NY, FL)\`')
        }
    } else {
        var covid = await fetch('https://covidtracking.com/api/v1/us/current.json').then(async response => (await response.json())[0])
        var embed = new discord.MessageEmbed()
        embed.setFooter('Echelon v1.1')
        embed.setTitle(`COVID-19 Statistics`)
        embed.setColor(`0x${config['colors'][Math.floor(Math.random() * config['colors'].length)]}`)
        embed.setDescription('Data provided by the [Covid Tracking Project](https://covidtracking.com/)')
        embed.addField(`Nationwide:`, `\`${covid.positive || `[n/a]`}\` cases across \`${covid.states || `[n/a]`}\` states\n\`${covid.recovered || `[n/a]`}\` recovered`, true)
        msg.channel.send(embed)
    }
}

module.exports = covid;