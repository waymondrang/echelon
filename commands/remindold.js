const {
    MongoClient
} = require("mongodb");

const discord = require("discord.js");

/**
 * 
 * @param {discord.Message} msg 
 * @param {MongoClient} mongo 
 * @param {*} commands 
 * @param {*} content 
 * @param {*} config 
 * @param {discord.Client} client 
 */

async function remind(msg, mongo, commands, content, config, client) {
    if (mongo) {
        var optionsreg = new RegExp(`${config['option-prefix']}\\S*`, "gm")
        var command = content.filter(value => optionsreg.test(value));
        if (command.length) {
            var cleanedcommands = command.map(command => command.replace(/-/gm, ''))
            if (cleanedcommands.includes('list')) {
                var results = await mongo.db('remind').collection('index').find({ notified: false }).limit(5)
                var reminders = await results.toArray()
                var response = new discord.MessageEmbed()
                response.setTitle("Pending Reminders")
                response.setFooter('Echelon v2.5')
                response.setColor(`0x${config['colors'][Math.floor(Math.random() * config['colors'].length)]}`)
                reminders.forEach(reminder => {
                    response.addField(`ID: \`${reminder._id.toString().substr(0, 10)}...\``, `**By:** <@!${reminder.author}>\n**Message:** ${reminder.message}\n**Time:** ${new Date(reminder.time).toLocaleTimeString()}`)
                })
                msg.channel.send(response)
            } else {
                var response = new discord.MessageEmbed();
                response.setTitle('Invalid Option!')
                response.setDescription(`Valid options include ${commands[content[0]].options.map(option => `\`${config['option-prefix']}${option}\``).join(' ')}`)
                response.setFooter('Echelon v2.5')
                response.setColor(16711680)
                msg.channel.send(response)
            }
        } else {
            var mentions = await msg.mentions.members.toJSON()
            if (mentions.length) {
                var match = content.find(value => /^([1-9]|1[0-2]):[0-5][0-9]:[0-5][0-9]\s(pm|am)$/gm.test(value));
                if (match) {
                    const dateindex = content.findIndex(value => /^([1-9]|1[0-2]):[0-5][0-9]:[0-5][0-9]\s(pm|am)$/gm.test(value));
                    var date = new Date()
                    var remindtime = new Date(date.toLocaleDateString() + `, ${match.toString().toUpperCase()}`)
                    mentions = mentions.map(mention => `<@!${mention.userID}>`)
                    var message = content[dateindex + 1] || '(Untitled Reminder)'
                    try {
                        await mongo.db('remind').collection('index').insertOne({
                            mentions: mentions,
                            channel: msg.channel.id,
                            guild: msg.guild.id,
                            message: message,
                            time: remindtime.getTime(),
                            author: msg.author.id,
                            notified: false
                        })
                        var response = new discord.MessageEmbed();
                        response.setTitle(`Reminder succesfully set!`);
                        response.addField(`For`, `${mentions}`);
                        response.addField(`Message`, `${message}`);
                        response.addField(`Time`, `${remindtime.toLocaleTimeString()}`)
                        response.setDescription(`Users will be automagically mentioned in this channel at the specified time.`)
                        response.setFooter('Echelon v2.5')
                        response.setColor(`0x${config['colors'][Math.floor(Math.random() * config['colors'].length)]}`)
                        msg.channel.send(response)
                    } catch (err) {
                        console.log(err)
                    }
                } else {
                    var response = new discord.MessageEmbed();
                    response.setTitle('Invalid time!')
                    response.setDescription(`Acceptable time inputs include \`12:00:00 PM\``)
                    response.setFooter('Echelon v2.5')
                    response.setColor(16711680)
                    msg.channel.send(response)
                }
            } else {
                var response = new discord.MessageEmbed();
                response.setTitle('Missing parameters!')
                response.setDescription(`The proper use of this command is \`${config['prefix']}${commands[content[0]].usage}\``)
                response.setFooter('Echelon v2.5')
                response.setColor(16711680)
                msg.channel.send(response)
            }
        }
    } else {
        var response = new discord.MessageEmbed();
        response.setTitle(`No MongoDB Linked!`)
        response.setDescription(`This command requires MongoDB to work!`)
        response.setColor(16711680)
        response.setFooter('Echelon v2.5')
        msg.channel.send(response)
    }
}

module.exports = remind;