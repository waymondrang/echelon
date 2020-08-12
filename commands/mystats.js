const discord = require("discord.js");

async function mystats(msg, mongo, commands, content, config) {
    console.log(`${msg.author.username} requested their stats in ${msg.guild.name}`)
    var response = new discord.MessageEmbed()
    if (mongo) {
        var result = await mongo.db(msg.guild.id).collection('user-data').findOne({
            _id: msg.member.id
        })
    }
    //console.log(result)
    if (result) {
        response.setTitle(`\`${msg.member.displayName}'s\` server stats`)
        response.addField('Messages sent:', `\`${result['messages-sent'] || 0} message(s)\``)
        response.addField('Bad words typed:', `\`${result['bad-words'] || 0} word(s)\``)
        response.addField('Commands used:', `\`${result['invoked-bot'] || 0} command(s)\``)
        response.setColor(`0x${config['colors'][Math.floor(Math.random() * config['colors'].length)]}`)
        response.setFooter('Echelon v2.6')
        msg.channel.send(response)
    } else if (!mongo) {
        response.setTitle(`No MongoDB Linked!`)
        response.setDescription(`This command requires MongoDB to work!`)
        response.setColor(16711680)
        response.setFooter('Echelon v2.6')
        msg.channel.send(response)
    } else {
        msg.channel.send('something went wrong... try again!')
    }
}

module.exports = mystats;