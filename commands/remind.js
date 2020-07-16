const {
    MongoClient
} = require("mongodb");

const discord = require("discord.js");

async function remind(msg = new discord.Message, mongo = new MongoClient, commands, content, config) {
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
                response.setFooter('Echelon v2.0')
                response.setColor(`0x${config['colors'][Math.floor(Math.random() * config['colors'].length)]}`)
                reminders.forEach(reminder => {
                    response.addField(`ID: \`${reminder._id.toString().substr(0, 10)}...\``, `**Created By:** <@!${reminder.author}>\n**Message:** ${reminder.message}\n**Time:** ${new Date(reminder.time).toLocaleTimeString()}`)
                })
                msg.channel.send(response)
            } else {
                var response = new discord.MessageEmbed();
                response.setTitle('Invalid Option!')
                response.setDescription(`Valid options include ${commands[content[0]].options.map(option => `\`${config['option-prefix']}${option}\``).join(' ')}`)
                response.setFooter('Echelon v2.0')
                response.setColor(16711680)
                msg.channel.send(response)
            }
        } else {
            var messagecontents = {}
            var message = /-m\s+([^\"\'\s]+)|-m\s+\"(.*?)\"|-m\s+\'(.*?)\'/gm.exec(msg.content)
            if (message) {
                //console.log(message)
                var matches = message.slice(1, 4)
                messagecontents.message = matches.find(match => match != null) || 'Untitled Reminder'
            } else {
                var response = new discord.MessageEmbed();
                response.setTitle('Missing parameters!')
                response.setDescription(`A message is required!\nThe proper use of this command is \`${config['prefix']}${commands[content[0]].usage}\``)
                response.setFooter('Echelon v2.0')
                response.setColor(16711680)
                msg.channel.send(response)
                return
            }
            var time = /-t\s+([^\"\'\s]+)|-t\s+[\"\'](.*?)[\"\']/gm.exec(msg.content)
            //console.log(time)
            if (time) {
                var matches = time.slice(1, 3)
                time = matches.find(match => match != null) || 'Unknown Time'
                var timematch = /^([1-9]|1[0-2])(:[0-5][0-9])?\s?(pm|am)$/gm.test(time)
                if (timematch) {
                    console.log(timematch)
                    if (!/\s+(pm|am)/gm.test(time)) {
                        time = time.replace(/pm|am/gm, /pm/gm.test(time) ? ' pm' : ' am')
                    }
                    var splittime = time.split(' ');
                    splittime[0] = splittime[0].split(':');
                    while (splittime[0].length < 3) {
                        splittime[0].push('00')
                    }
                    splittime[0] = splittime[0].join(':')
                    splittime = splittime.join(' ')
                    var date = new Date()
                    var remindtime = new Date(date.toLocaleDateString() + `, ${splittime.toString().toUpperCase()}`)
                    if (isNaN(remindtime)) {
                        var response = new discord.MessageEmbed();
                        response.setTitle('Something went wrong!')
                        response.setDescription(`Please try again.\nIf this problem persists please contact a server administrator or refer to the Github Documentation.`)
                        response.setFooter('Echelon v2.0')
                        response.setColor(16711680)
                        msg.channel.send(response)
                        return
                    } else {
                        messagecontents.time = remindtime.getTime()
                    }
                } else {
                    var response = new discord.MessageEmbed();
                    response.setTitle('Invalid time!')
                    response.setDescription(`Acceptable time inputs include \`12:00:00 PM\``)
                    response.setFooter('Echelon v2.0')
                    response.setColor(16711680)
                    msg.channel.send(response)
                    return
                }
            } else {
                var response = new discord.MessageEmbed();
                response.setTitle('Missing parameters!')
                response.setDescription(`A time is required!\nThe proper use of this command is \`${config['prefix']}${commands[content[0]].usage}\``)
                response.setFooter('Echelon v2.0')
                response.setColor(16711680)
                msg.channel.send(response)
                return
            }
            var mentions = await msg.mentions.members.toJSON()
            if (mentions.length) {
                mentions = mentions.map(mention => `<@!${mention.userID}>`)
                try {
                    await mongo.db('remind').collection('index').insertOne({
                        mentions: mentions,
                        channel: msg.channel.id,
                        guild: msg.guild.id,
                        message: messagecontents.message,
                        time: messagecontents.time,
                        author: msg.author.id,
                        notified: false
                    })
                    var response = new discord.MessageEmbed();
                    response.setTitle(`Reminder succesfully set!`);
                    response.addField(`For`, `${mentions}`);
                    response.addField(`Message`, `${messagecontents.message}`);
                    response.addField(`Time`, `${remindtime.toLocaleTimeString()}`)
                    response.setDescription(`Users will be automagically mentioned in this channel at the specified time.`)
                    response.setFooter('Echelon v2.0')
                    response.setColor(`0x${config['colors'][Math.floor(Math.random() * config['colors'].length)]}`)
                    msg.channel.send(response)
                } catch (err) {
                    console.log(err)
                    var response = new discord.MessageEmbed();
                    response.setTitle('Something went wrong!')
                    response.setDescription(`Please try again.\nIf this problem persists please contact a server administrator or refer to the Github Documentation.`)
                    response.setFooter('Echelon v2.0')
                    response.setColor(16711680)
                    msg.channel.send(response)
                    return
                }
            } else {
                var response = new discord.MessageEmbed();
                response.setTitle('Missing parameters!')
                response.setDescription(`The proper use of this command is \`${config['prefix']}${commands[content[0]].usage}\``)
                response.setFooter('Echelon v2.0')
                response.setColor(16711680)
                msg.channel.send(response)
            }
        }
    } else {
        var response = new discord.MessageEmbed();
        response.setTitle(`No MongoDB Linked!`)
        response.setDescription(`This command requires MongoDB to work!`)
        response.setColor(16711680)
        response.setFooter('Echelon v2.0')
        msg.channel.send(response)
    }
}

module.exports = remind