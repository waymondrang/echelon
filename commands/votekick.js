const discord = require("discord.js");

async function votekick(msg, mongo, commands, content, config) {
    console.log(`${msg.author.username} requested a votekick in ${msg.guild.name}`)
    var mentions = msg.mentions.members.toJSON()
    //console.log(mentions)
    //console.log(mentions)
    if (mentions.length) {
        if (mentions.length > 1) {
            msg.channel.send('Only one user can be votekicked per command!')
        } else {
            console.log('votekick started!')
            //console.log(mentions[0])
            var voteboard = new discord.MessageEmbed()
            voteboard.setTitle('Uh Oh! A votekick has been invoked!')
            voteboard.setDescription(`A votekick has been started for <@!${mentions[0].userID}> by <@!${msg.author.id}>!\nYou have \`${config['polltime']} minute(s)\` to enter the polls.\n\nIf you vote for both, your vote will not be counted.`)
            voteboard.setColor(`0x${config['colors'][Math.floor(Math.random() * config['colors'].length)]}`)
            voteboard.setFooter('Echelon v2.5')
            msg.channel.send(`<@${mentions[0].userID}> <@!${msg.author.id}>`, voteboard).then(async message => {
                if (mongo) {
                    await mongo.db(msg.guild.id).collection('votekick-polls').insertOne({
                        _id: message.id,
                        "started-by": msg.author.id,
                        for: mentions[0].id,
                        ended: false,
                    })
                }
                Promise.race([
                    message.react('🟢'),
                    message.react('🔴')
                ]).catch(err => console.log(err))
                var filter = (reaction, user) => {
                    return (reaction.emoji.name === '🟢' || reaction.emoji.name === '🔴')
                };
                const collector = message.createReactionCollector(filter, {
                    time: config['polltime'] * 60000
                });
                collector.on('end', async collected => {
                    console.log('Votekick ended!')
                    msg.channel.send('Votekick ended! Gathering results...')
                    if (mongo) {
                        await mongo.db(msg.guild.id).collection('votekick-polls').updateOne({
                            _id: message.id
                        }, {
                            $set: {
                                ended: true
                            }
                        })
                    }
                    var results = collected.array()
                    var votes = {};
                    for (var raw of results) {
                        var reaction = await raw.fetch();
                        var emoji = reaction.emoji.toJSON();
                        var users = (await reaction.users.fetch()).toJSON();
                        emoji.name === '🟢' ? votes['yes'] = users : votes['no'] = users
                    }
                    var kick;
                    var yes = (votes['yes'].map(user => user.id)).filter(val => !(votes['no'].map(user => user.id)).includes(val));
                    var no = (votes['no'].map(user => user.id)).filter(val => !(votes['yes'].map(user => user.id)).includes(val));
                    if (yes.length > no.length) {
                        kick = true
                        msg.mentions.members.first().kick()
                    } else if (yes.length == no.length) {
                        kick = 'draw'
                    } else {
                        kick = false;
                    }
                    var embed = new discord.MessageEmbed()
                    embed.setTitle('The results are in...')
                    embed.setDescription(`A votekick has ended for <@!${mentions[0].userID}> started by <@!${msg.author.id}>\n\nIf you voted for both, your vote was not counted.`)
                    embed.addField(`Voted yes:`, `\`${yes.length}\``, true)
                    embed.addField(`Voted no:`, `\`${no.length}\``, true)
                    embed.addField(`Final verdict:`, `<@${mentions[0].userID}> is ${kick == 'draw' ? "lucky! its a draw!" : kick ? 'getting kicked!' : 'safe! for now...'}`)
                    embed.setColor(`0x${config['colors'][Math.floor(Math.random() * config['colors'].length)]}`)
                    embed.setFooter('Echelon v2.5')
                    msg.channel.send(`<@${mentions[0].userID}> <@!${msg.author.id}>`, embed)
                });
            })
        }
    } else {
        var embed = new discord.MessageEmbed()
        embed.setTitle('Missing parameters!')
        embed.setDescription(`The proper use of this command is \`${config['prefix']}${commands[content[0]].usage || '[n/a]'}\``)
        embed.setColor(16711680)
        embed.setFooter('Echelon v2.5')
        msg.channel.send(embed)
    }
}

module.exports = votekick;