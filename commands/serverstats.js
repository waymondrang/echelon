async function serverstats(discord, msg, mongo, commands, content, config) {
    console.log(`${msg.author.username} requested server stats in ${msg.guild.name}`)
    var response = new discord.MessageEmbed()
    response.setTitle(`\`${msg.guild.name}\` server stats`)
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
    //response.setDescription(`as of ${(new Date(serverdata.joined)).toLocaleDateString()}`)
    response.addField('Vanilla stats:', `Member count: \`${msg.guild.memberCount || 0}\`\nOwner: <@!${msg.guild.owner.id}>\nRegion: \`${msg.guild.region || '[n/a]'}\`\nIs verified: \`${msg.guild.verified || '[n/a]'}\``)
    response.addField('Bot-generated stats:', `Total bad words typed: \`${totals['bad-words-total'] || `[n/a]`}\`\nDirtiest mouth: ${infractor ? `<@!${infractor._id}>` : '`[n/a]`'} \`${infractor ? infractor['bad-words'] : '[n/a]'}\`\n\nCommands used: \`${totals['invoked-bot-total'] || '[n/a]'}\`\nThe Commander: <@!${commander._id}>\`${commander['invoked-bot']}\``)
    response.setColor(`0x${config['colors'][Math.floor(Math.random() * config['colors'].length)]}`)
    response.setFooter('Echelon v1.0')
    msg.channel.send(response)
}

module.exports = serverstats;