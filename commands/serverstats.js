const discord = require("discord.js");

async function serverstats(msg, mongo, commands, content, config) {
    console.log(`${msg.author.username} requested server stats in ${msg.guild.name}`)
    var response = new discord.MessageEmbed()
    response.setTitle(`\`${msg.guild.name}\` server stats`)
    response.addField('Vanilla stats:', `Member count: \`${msg.guild.memberCount || 0}\`\nOwner: <@!${msg.guild.owner.id}>\nRegion: \`${msg.guild.region || '[n/a]'}\`\nIs verified: \`${msg.guild.verified || '[n/a]'}\``)
    if (mongo) {
        var agg = mongo.db(msg.guild.id).collection('user-data').aggregate([{
            $group: {
                _id: null,
                "invoked-bot-total": {
                    $sum: "$invoked-bot"
                },
                "bad-words-total": {
                    $sum: "$bad-words"
                }
            }
        }]);
        var totals = (await agg.toArray())[0]
        console.log(totals)
        var commander = (await (mongo.db(msg.guild.id).collection('user-data').find().sort({
            "invoked-bot": -1
        }).limit(1)).toArray())[0];
        var infractor = (await (mongo.db(msg.guild.id).collection('user-data').find().sort({
            "bad-words": -1
        }).limit(1)).toArray())[0];
        response.addField('Bot-generated stats:', `Total bad words typed: \`${totals['bad-words-total'] || `[n/a]`}\`\nDirtiest mouth: ${infractor ? `<@!${infractor._id}>` : '`[n/a]`'} \`${infractor ? infractor['bad-words'] : '[n/a]'}\`\n\nCommands used: \`${totals['invoked-bot-total'] || '[n/a]'}\`\nThe Commander: <@!${commander._id}>\`${commander['invoked-bot']}\``)
    } else {
        var reminder = new discord.MessageEmbed()
        reminder.setTitle(`No MongoDB Linked!`)
        reminder.setDescription(`Link a MongoDB to unlock the full potential of this command!`)
        reminder.setColor(16711680)
        reminder.setFooter(`${config["bot_name"]}${config["display_version_number"] ? ` ${config["version_number"]}` : ""}`);
        msg.channel.send(reminder)
    }
    //response.setDescription(`as of ${(new Date(serverdata.joined)).toLocaleDateString()}`)
    response.setColor(`0x${config['colors'][Math.floor(Math.random() * config['colors'].length)]}`)
    response.setFooter(`${config["bot_name"]}${config["display_version_number"] ? ` ${config["version_number"]}` : ""}`);
    msg.channel.send(response)

}

module.exports = serverstats;