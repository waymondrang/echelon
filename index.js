const discord = require("discord.js");
const commands = require('./commands.json')
const config = require("./config.json");
const client = new discord.Client({ partials: ['MESSAGE', 'REACTION'] })
const dotenv = require('dotenv')
dotenv.config();
const MongoClient = require('mongodb').MongoClient;
const uri = process.env.MONGO_URI;
const {
    banned,
    special
} = require('./banned-words.json')
const mastereg = new RegExp((banned.map(word => word.split('').map(letter => letter + '+').join('\\s*'))).concat(special).join("|"));

if (config['mongo-uri']) {
    var mongo = new MongoClient(config['mongo-uri'], {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
}

async function notify(mongo, client) {
    var time = new Date().getTime()
    //console.log(time)
    var result = await mongo.db('remind').collection('index').find({
        notified: false,
        time: {
            $lt: time
        }
    })
    if (result) {
        var reminders = await result.toArray()
        reminders.forEach(async reminder => {
            if (!reminder.notified) {
                if (reminder.privateMessage) {
                    console.log('sending notification via private message...');
                    var response = new discord.MessageEmbed();
                    response.setTitle(`You have a reminder!`);
                    response.setDescription(`${reminder.message}\n\nCreate your own reminder using the \`${config['prefix']}remind\` command!`);
                    response.addField(`Created By`, `<@!${reminder.author}>`);
                    response.addField(`Time`, `${new Date(reminder.time).toLocaleTimeString()}`);
                    response.setColor(`0x${config['colors'][Math.floor(Math.random() * config['colors'].length)]}`)
                    response.setFooter('Echelon v1.1')
                    reminder.mentions.forEach(mention => {
                        client.users.cache.get(mention).send(response);
                    })
                } else {
                    console.log('sending notification via channel mentions...');
                    var response = new discord.MessageEmbed();
                    response.setTitle(`You have a reminder!`);
                    response.setDescription(`${reminder.message}\n\nCreate your own reminder using the \`${config['prefix']}remind\` command!`);
                    response.addField(`Created By`, `<@!${reminder.author}>`);
                    response.addField(`Time`, `${new Date(reminder.time).toLocaleTimeString()}`);
                    response.setColor(`0x${config['colors'][Math.floor(Math.random() * config['colors'].length)]}`)
                    response.setFooter('Echelon v1.1')
                    client.channels.cache.get(reminder.channel).send(`${reminder.mentions.map(mention => `<@!${mention}>`).join(' ')}`, response)
                }
                await mongo.db('remind').collection('index').updateOne({
                    _id: reminder._id
                }, {
                    $set: {
                        notified: true
                    }
                })
            }
        })
    }
}


client.once('ready', async () => {
    console.log('echelon initializing!')
    try {
        client.user.setActivity(`${config['prefix']}help`, {
            type: `CUSTOM_STATUS`
        })
        if (mongo) {
            try {
                await mongo.connect();
                console.log('connected to mongo database!')
            } catch (err) {
                console.log(err)
            }
        } else {
            console.log('no mongo database specified!')
        }
    } catch (err) {
        console.log(err)
    } finally {
        console.log('echelon done loading!')
        if (mongo) {
            notify(mongo, client)
            setInterval(() => {
                notify(mongo, client)
            }, 30000)
        }
    }
})

var helpmessage = new discord.MessageEmbed()
helpmessage.setTitle('`available commands:`');
helpmessage.setDescription(`\`[brackets]\` can be used to surround a parameter that contains more than one word\neg. \`${config['prefix']}example [echelon bot] [is the best]\``)
helpmessage.setFooter('Echelon v1.1');
for (command in commands) {
    helpmessage.addField(`${command}`, `\`${config['prefix']}${commands[command]['usage']}\``, true)
}
console.log('help message generated!')

client.on('message', async msg => {
    if (msg.author.id !== client.user.id) {
        if (msg.channel.type == 'text') {
            if (config['mongo-uri']) {
                await mongo.db(msg.guild.id).collection('user-data').updateOne({
                    _id: msg.author.id
                }, {
                    $inc: {
                        "messages-sent": 1
                    },
                    $set: {
                        displayName: msg.member.displayName,
                        username: msg.member.user.username
                    }
                }, {
                    upsert: true
                })
                if (mastereg.test(msg.content.toLowerCase())) {
                    console.log(`${msg.author.username} said a bad word in ${msg.guild.name}!`)
                    msg.react('⚠️');
                    await mongo.db(msg.guild.id).collection('user-data').updateOne({
                        _id: msg.member.id
                    }, {
                        $inc: {
                            "bad-words": 1
                        }
                    })
                }
            }
            if (msg.content.toString().startsWith(config['prefix'])) {
                if (config['mongo-uri']) {
                    await mongo.db(msg.guild.id).collection('user-data').updateOne({
                        _id: msg.member.id
                    }, {
                        $inc: {
                            "invoked-bot": 1
                        }
                    })
                }
                var content = msg.content.toString().toLowerCase().replace(/  +/g, ' ').match(/\".*?\"|\'.*?\'|\[.*?\]|\S+/gm).map(each => each.replace(/[\[\]\"\']/gm, '').trim())
                content[0] = content[0].replace(config['prefix'], '')
                console.log(content)
                if (content[0] == `help`) {
                    console.log(`${msg.author.username} requested for help in ${msg.guild.name}`)
                    if (content[1]) {
                        if (commands[content[1]]) {
                            var help = new discord.MessageEmbed()
                            help.setFooter('Echelon v1.1')
                            help.setTitle(`\`${config['prefix']}${content[1]}\``)
                            help.setColor(`0x${config['colors'][Math.floor(Math.random() * config['colors'].length)]}`)
                            help.setDescription(commands[content[1]]['description'])
                            help.addField(`usage`, `\`${config['prefix']}${commands[content[1]]['usage']}\``)
                            for (field in commands[content[1]]['more-info']) {
                                help.addField(`${field}`, `${commands[content[1]]['more-info'][field]}`)
                            }
                            msg.channel.send(help)
                        } else {
                            msg.channel.send(`that command does not exist! use \`${config['prefix']}help\` to be enlightened`)
                        }
                    } else {
                        helpmessage.setColor(`0x${config['colors'][Math.floor(Math.random() * config['colors'].length)]}`)
                        msg.channel.send(helpmessage)
                    }
                } else if (commands[content[0]]) {
                    try {
                        if (commands[content[0]].filename) {
                            require(`${config['commandspath']}/${commands[content[0]].filename}`)(msg, mongo, commands, content, config, client);
                        } else {
                            console.log(`command exists in commands.json but the .js file could not be located!`)
                        }
                    } catch (err) {
                        console.error('something went wrong! (most likey command does not path property in json file)')
                        console.log(err)
                    }
                } else {
                    msg.channel.send(`that command does not exist! use \`${config['prefix']}help\` to be enlightened`)
                }
            }
        } else if (msg.channel.type == 'dm') {
            console.log(msg.author.id)
            client.users.cache.get(msg.author.id).send('hi thanks for messaging me!');
        }
    }
})

if (config['token']) {
    client.login(config['token']);
} else {
    console.log('no discord token found! please add one in the config.json file.')
}