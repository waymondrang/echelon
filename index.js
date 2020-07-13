const discord = require("discord.js");
const commands = require('./commands.json')
const config = require("./config.json");
const client = new discord.Client()
const MongoClient = require('mongodb').MongoClient;
const {
    banned,
    special
} = require('./banned-words.json')
const mastereg = new RegExp((banned.map(word => word.split('').map(letter => letter + '+').join('\\s*'))).concat(special).join("|"));

var mongo = new MongoClient(client['mongo-uri'], {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

client.once('ready', async () => {
    console.log('podiumbot initializing!')
    try {
        client.user.setActivity(`${config['prefix']}help`, {
            type: `CUSTOM_STATUS`
        })
        await mongo.connect();
    } catch (err) {
        console.log(err)
    } finally {
        console.log('podiumbot done loading!')
    }
})

var helpmessage = new discord.MessageEmbed()
helpmessage.setTitle('`available commands:`');
helpmessage.setDescription(`\`[brackets]\` can be used to surround a parameter that contains more than one word\neg. \`${config['prefix']}example [echelon bot] [is the best]\``)
helpmessage.setFooter('Echelon v1.0');
for (command in commands) {
    helpmessage.addField(`${command}`, `\`${config['prefix']}${commands[command]['usage']}\``, true)
}
console.log('help message generated!')

client.on('message', async msg => {
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
    if (msg.content.toString().startsWith(config['prefix'])) {
        await mongo.db(msg.guild.id).collection('user-data').updateOne({
            _id: msg.member.id
        }, {
            $inc: {
                "invoked-bot": 1
            }
        })
        var content = msg.content.toString().toLowerCase().replace(/  +/g, ' ').match(/\[.*?\]|\S+/gm).map(each => each.replace(/[\[\]]/gm, '').replace(/\s+$/gm, ''))
        content[0] = content[0].replace(/;/g, '')
        console.log(content)
        if (content[0] == `help`) {
            console.log(`${msg.author.username} requested for help in ${msg.guild.name}`)
            if (content[1]) {
                if (commands[content[1]]) {
                    var help = new discord.MessageEmbed()
                    help.setFooter('Echelon v1.0')
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
                    require(`${config['commandspath']}/${commands[content[0]].filename}`)(discord, msg, mongo, commands, content, config);
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
})

client.login(config['token']);