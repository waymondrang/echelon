const discord = require("discord.js");

async function about(msg, mongo, commands, content, config) {
    var embed = new discord.MessageEmbed()
    embed.setColor(`0x${config['colors'][Math.floor(Math.random() * config['colors'].length)]}`)
    embed.setDescription(`Read more about \`${config["bot_name"]}\`!`)
    embed.setFooter(`${config["bot_name"]}${config["display_version_number"] ? ` ${config["version_number"]}` : null}`)
    embed.addField(`What is it?`, `${config["bot_name"].toLowerCase() === "echelon" ? `\`Echelon\`` : `\`${config["bot_name"].charAt(0).toUpperCase() + config["bot_name"].slice(1)}\`, originally called \`Echelon\`, `} is a Discord bot powered by [discord.js](https://discord.js.org/#/) and [MongoDB](https://www.mongodb.com/). View its original source code [here](https://github.com/waymondrang/echelon).`)
    embed.addField("What language is it written in?", `This bot is written in the Node.js javascript runtime. Read more on Node.js [here](https://nodejs.org/en/).`)
    msg.channel.send(embed)
}

module.exports = about;