async function about(discord, msg, mongo, commands, content, config) {
    var embed = new discord.MessageEmbed()
    embed.setColor(`0x${config['colors'][Math.floor(Math.random() * config['colors'].length)]}`)
    embed.setDescription(`Read more about \`Echelon\`!`)
    embed.setFooter(`Echelon v1.1`)
    embed.addField(`What is it?`, `\`Echelon\` is a Discord bot powered by [discord.js](https://discord.js.org/#/) and [MongoDB](https://www.mongodb.com/). View its source code [here!](https://github.com/waymondrang/echelon)`)
    embed.addField(`What language is it written in?`, `\`Echelon\` is written in the **Node.js javascript runtime**.\nRead more on Node.js [here](https://nodejs.org/en/)`)
    embed.addField(`What features does it have?`, `\`Echelon\` features:\n—An *intelligent* profanity filter\n—Fetching of statistics for various games and information\n—Independent server and user data storage via MongoDB\n—Moderation commands.`)
    msg.channel.send(embed)
}

module.exports = about;