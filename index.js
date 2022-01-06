const discord = require("discord.js");
const commands = require('./commands.json');
const config = require("./config.json");
const client = new discord.Client();
const MongoClient = require('mongodb').MongoClient;
const { banned, special } = require('./banned-words.json')
const bad_word_regex = !banned.length && !special.length ? null : new RegExp((banned.map(word => word.split('').map(letter => letter + '+').join('\\s*'))).concat(special).join("|"));

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
                    response.setFooter(`${config["bot_name"]}${config["display_version_number"] ? ` ${config["version_number"]}` : ""}`);
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
                    response.setFooter(`${config["bot_name"]}${config["display_version_number"] ? ` ${config["version_number"]}` : ""}`);
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
});

// * REQUIRED V2 VARIABLES
var categories;
var v2_commands;
var command_folder_path = require("path").join(__dirname, "commands");

function load_v2_commands() {
    // * v2 COMMAND PROTOCOL
    categories = [];
    v2_commands = {};

    require("fs").readdirSync(command_folder_path).forEach(function (file) {
        if (file.includes("prototype")) {
            var V2_COMMAND = new (require("./commands/" + file))();
            v2_commands[V2_COMMAND.alias] = V2_COMMAND;
            if (!categories.includes(V2_COMMAND.category)) categories.push(V2_COMMAND.category);
        }
    });
};

load_v2_commands();

// * REQUIRED HELP MESSAGE VARIABLES
var help_message;

function create_help_message() {
    help_message = null;
    help_message = new discord.MessageEmbed()
    help_message.setTitle('`available commands:`');
    help_message.setDescription(`${config["use_new_help_message"] ? `\n*\`use_new_help_message\` is enabled. only commands using \`protocol v2\` support this feature.` : ""}`)
    help_message.setFooter(`${config["bot_name"]}${config["display_version_number"] ? ` ${config["version_number"]}` : ""}`);
    if (config["use_new_help_message"]) {
        for (category of categories) {
            help_message.addField(`${category}`, Object.entries(v2_commands).filter(function ([command, command_class]) { return command_class.category === category }).map(function (e) { return `\`${e[0]}\`` }), true)
        }
        help_message.addField(`general`, Object.keys(commands).map(function (e) { return `\`${e}\`` }), true)
    } else {
        for (command in commands) {
            help_message.addField(`${command}`, `\`${config['prefix']}${commands[command]['usage']}\``, true)
        }
        for (command in v2_commands) {
            help_message.addField(`${command}`, `\`${config['prefix']}${v2_commands[command].description}\``, true)
        }
    }
    console.log('help message generated!');
};

create_help_message();

client.on('message', async msg => {
    if (config["global_admin_ids"].includes(msg.author.id)) {
        var content = msg.content.toString().toLowerCase().replace(/  +/g, ' ').match(/\".*?\"|\'.*?\'|\[.*?\]|\S+/gm).map(each => each.replace(/[\[\]\"\']/gm, '').trim());
        var command = content[0].replace(config['prefix'], "");
        if (command === "kill") {
            var embed = new discord.MessageEmbed()
            embed.setColor(`0x${config['colors'][Math.floor(Math.random() * config['colors'].length)]}`);
            embed.setDescription("shutting off. bye bye!");
            await msg.channel.send(embed);
            process.exit();
        } else if (command === "restart") {
            var embed = new discord.MessageEmbed()
            embed.setColor(`0x${config['colors'][Math.floor(Math.random() * config['colors'].length)]}`);
            embed.setDescription("restarting. be right back!");
            await msg.channel.send(embed);
            setTimeout(function () {
                process.on("exit", function () {
                    require("child_process").spawn(process.argv.shift(), process.argv, {
                        cwd: process.cwd(),
                        detached: true,
                        stdio: "inherit"
                    });
                });
                process.exit();
            }, 5000);
            return;
        }
    }
    if (msg.author.id !== client.user.id && !msg.author.bot && !msg.author.system) {
        if (msg.channel.type == 'text') {
            //if connected to mongo, increment messages count
            if (config['mongo-uri']) await mongo.db(msg.guild.id).collection('user-data').updateOne({ _id: msg.author.id }, { $inc: { "messages-sent": 1 }, $set: { displayName: msg.member ? msg.member.displayName : msg.author.username, username: msg.author.username } }, { upsert: true });
            if (bad_word_regex && bad_word_regex.test(msg.content.toLowerCase())) {
                console.log(`${msg.author.username} said a bad word in ${msg.guild.name}!`);
                msg.react('⚠️');
                // if connected to mongo, increment bad word count
                if (config['mongo-uri']) await mongo.db(msg.guild.id).collection('user-data').updateOne({ _id: msg.member.id }, { $inc: { "bad-words": 1 } });
            }
            if (msg.content.toString().startsWith(config['prefix'])) {
                // if connected to mongo, increment bot usage count
                if (config['mongo-uri']) await mongo.db(msg.guild.id).collection('user-data').updateOne({ _id: msg.member.id }, { $inc: { "invoked-bot": 1 } });
                var content = msg.content.toString().toLowerCase().replace(/  +/g, ' ').match(/\".*?\"|\'.*?\'|\[.*?\]|\S+/gm).map(each => each.replace(/[\[\]\"\']/gm, '').trim());
                content[0] = content[0].replace(config['prefix'], "");
                // ! console.log(content)
                if (content[0] === `help`) {
                    console.log(`${msg.author.username} requested for help in ${msg.guild.name}`)
                    if (content[1]) {
                        if (commands[content[1]]) {
                            var help = new discord.MessageEmbed()
                            help.setFooter(`${config["bot_name"]}${config["display_version_number"] ? ` ${config["version_number"]}` : ""}`);
                            help.setTitle(`\`${config['prefix']}${content[1]}\``)
                            help.setColor(`0x${config['colors'][Math.floor(Math.random() * config['colors'].length)]}`)
                            help.setDescription(commands[content[1]]['description'])
                            help.addField(`usage`, `\`${config['prefix']}${commands[content[1]]['usage']}\``)
                            for (field in commands[content[1]]['more-info']) {
                                help.addField(`${field}`, `${commands[content[1]]['more-info'][field]}`)
                            }
                            msg.channel.send(help)
                        } else if (v2_commands[content[1]]) {
                            if (typeof v2_commands[content[1]].description === discord.MessageEmbed) {
                                msg.channel.send(v2_commands[content[1]].description)
                            } else {
                                var help = new discord.MessageEmbed()
                                help.setFooter(`${config["bot_name"]}${config["display_version_number"] ? ` ${config["version_number"]}` : ""}`);
                                help.setTitle(`\`${config['prefix']}${content[1]}\``);
                                help.setColor(`0x${config['colors'][Math.floor(Math.random() * config['colors'].length)]}`);
                                help.setDescription(v2_commands[content[1]].description ? v2_commands[content[1]].description : "\'no description provided\'");
                                msg.channel.send(help);
                            }
                        } else {
                            var embed = new discord.MessageEmbed();
                            embed.setColor(`0x${config['colors'][Math.floor(Math.random() * config['colors'].length)]}`);
                            embed.setDescription(config["messages"]["command_does_not_exist"].replace(/\%/gm, config['prefix']));
                            msg.channel.send(embed);
                        }
                    } else {
                        help_message.setColor(`0x${config['colors'][Math.floor(Math.random() * config['colors'].length)]}`)
                        msg.channel.send(help_message)
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
                } else if (v2_commands[content[0]]) { // IF V2 COMMAND INVOKED
                    v2_commands[content[0]].main({ message: msg, client: client, config: config, content: content });
                } else {
                    var embed = new discord.MessageEmbed();
                    embed.setColor(`0x${config['colors'][Math.floor(Math.random() * config['colors'].length)]}`);
                    embed.setDescription(config["messages"]["command_does_not_exist"].replace(/\%/gm, config['prefix']));
                    msg.channel.send(embed);
                }
            }
        } else if (msg.channel.type == 'dm') {
            // handle dms
        }
    }
})

if (config['token']) {
    client.login(config['token']);
} else {
    console.log('no discord token found! please add one in the config.json file.')
}