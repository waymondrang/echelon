const {
    MongoClient
} = require("mongodb");
const discord = require("discord.js");
const fetch = require('node-fetch')

function isInt(value) {
    var x;
    if (isNaN(value)) {
        return false;
    }
    x = parseFloat(value);
    return (x | 0) === x;
}

var actions = ["buy", "sell", "portfolio", "balance", "quote", "leaderboard"]
var deleteactions = ["buy", "sell", "balance", "portfolio", "quote"]

/**
 * 
 * @param {discord.Message} msg 
 * @param {MongoClient} mongo 
 * @param {JSON} commands 
 * @param {Array} content 
 * @param {JSON} config 
 * @param {discord.Client} client 
 */


async function stock(msg, mongo, commands, content, config, client) {
    if (mongo) {
        if (config['finnhubtoken']) {
            if (content[1]) {
                if (msg.content.includes('--pm') && deleteactions.indexOf(content[1]) !== -1) {
                    if (msg.guild.me.hasPermission('MANAGE_MESSAGES')) {
                        msg.delete({ timeout: 100 });
                    } else {
                        var response = new discord.MessageEmbed();
                        response.setTitle('Missing Permissions!');
                        response.setDescription(`Echelon does not have the \`manage messages\` permission, and therefore cannot delete messsages. If you would like to use this feature, please grant Echelon these permissions.`)
                        response.setFooter('Echelon v2.6');
                        response.setColor(16763432)
                        msg.channel.send(response)
                    }
                }
                if (content[1] === 'register') {
                    var user = await mongo.db('stock').collection('index').findOne({
                        _id: msg.author.id
                    })
                    if (!user) {
                        try {
                            var addresult = await mongo.db('stock').collection('index').insertOne({
                                _id: msg.author.id, balance: 1000
                            })
                            var response = new discord.MessageEmbed();
                            response.setTitle('You have been successfully registered!')
                            response.setDescription(`Welcome to Echelon Brokerage®!\n\nAn initial \`$1000\` balance has been deposited into your account. You can check your balance at any time using the command \`${config['prefix']}${content[0]} balance\`.\n\nHappy Trading!`)
                            response.addField('Tips', `Here are some tips that will give you a head start on your trading journey.\n\n**Usage**\nThere are 2 ways to use the stock command. You can type \`${config['prefix']}stock\` or \`${config['prefix']}s\`.\n\n**Options**\nThere are also several options that will make your trading experience more private. You can append the \`${config['option-prefix']}pm\` to the end of the \`buy\` \`sell\` or \`portfolio\` commands to complete the action through private messages. If the \`${config['option-prefix']}pm\` option is used, the user's message will be deleted to keep trading history private. Of course, if you wish to trade openly and let everyone know you're rich enough to afford one Tesla stock, go ahead and exclude the option.`)
                            response.setFooter('Echelon v2.6')
                            response.setColor(`0x${config['colors'][Math.floor(Math.random() * config['colors'].length)]}`)
                            msg.channel.send(response)
                            return
                        } catch (error) {
                            console.log(`[ERROR][STOCK] Error with user registration!`)
                            console.error(error)
                        }
                    } else {
                        var response = new discord.MessageEmbed();
                        response.setTitle('You are already registered!')
                        response.setDescription(`You seem to be already registered with Echelon Brokerage®.\n\nIf you believe this is incorrect, contact a server admin or refer to the Github Documentation.`)
                        response.setFooter('Echelon v2.6')
                        response.setColor(16711680)
                        msg.channel.send(response)
                        return
                    }
                } else if (content[1] === 'leaderboard' || content[1] === 'lb') {
                    var leaderboard = (await (mongo.db('stock').collection('index').find().sort({
                        "balance": -1
                    }).limit(10)).toArray());
                    var response = new discord.MessageEmbed();
                    response.setFooter('Echelon v2.6')
                    response.setTitle(`Wealthiest Traders`)
                    response.setDescription(`Trader anonymity is observed, and only their balances are shown.`)
                    for (var i = 0; i < leaderboard.length; i++) {
                        response.addField(`[${i + 1}] ${leaderboard[i]._id.replace(/./g, '\\*')}`, `\`$${leaderboard[i].balance}\``)
                    }
                    response.setColor(`0x${config['colors'][Math.floor(Math.random() * config['colors'].length)]}`)
                    msg.channel.send(response)
                } else if (content[1] === 'buy' || content[1] === 'b') {
                    var user = await mongo.db('stock').collection('index').findOne({
                        _id: msg.author.id
                    })
                    if (user) {
                        if (content[2]) {
                            if (content[3]) {
                                if (isInt(content[3])) {
                                    var quantity = parseInt(content[3])
                                    var symbol = content[2].replace(/[^a-z0-9]+/gm, '').toUpperCase()
                                    var result = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${config['finnhubtoken']}`).then(response => response.json()).catch(error => console.log(error))
                                    if (!result.error) {
                                        var cost = Math.ceil((parseFloat(result.c) * quantity) * 100) / 100
                                        console.log(cost)
                                        if (user.balance < cost) {
                                            var response = new discord.MessageEmbed();
                                            response.setTitle('Insufficient Balance!')
                                            response.setDescription(`You do not have enough money!\n\n**Cost**\n\`${content[3]}\` share(s) of \`${symbol}\` would cost \`$${cost}\`\n\nIf you would like to check your balance, use the \`${config['prefix']}${content[0]} balance\` command.`)
                                            response.setFooter('Echelon v2.6')
                                            response.setColor(16711680)
                                            if (msg.content.includes('--pm')) {
                                                client.users.cache.get(msg.author.id).send(`Sent via private message, as per request.`, response);
                                            } else {
                                                msg.channel.send(response)
                                            }
                                            return
                                        } else {
                                            var response = new discord.MessageEmbed();
                                            response.setTitle('Purchase Confirmation')
                                            response.setDescription(`You are about to purchase \`${content[3]}\` share(s) of \`${symbol}\` for \`$${cost}\`\n\nPlease respond \`yes\` or \`no\` within the next **30 seconds** to confirm this purchase.`)
                                            response.setFooter('Echelon v2.6')
                                            response.setColor(16763432)
                                            if (msg.content.includes('--pm')) {
                                                var message = await client.users.cache.get(msg.author.id).send(`Sent via private message, as per request.`, response);
                                            } else {
                                                var message = await msg.channel.send(response)
                                            }
                                            var filter = m => ['y', 'n', 'yes', 'no'].indexOf(m.content.toLowerCase()) !== -1 && m.author.id === msg.author.id;
                                            var collector = new discord.MessageCollector(message.channel, filter, { time: 30000 });
                                            collector.on('collect', async m => {
                                                collector.stop()
                                                if (['yes', 'y'].indexOf(m.content.toLowerCase()) !== -1) {
                                                    var response = new discord.MessageEmbed();
                                                    response.setTitle('Processing Transaction')
                                                    response.setDescription(`Please do not close the tab or pour the milk before the cereal.`)
                                                    response.setFooter('Echelon v2.6')
                                                    response.setColor(16763432)
                                                    var pendingmessage = await message.channel.send(response)
                                                    try {
                                                        var symbolprofile = await mongo.db('stock').collection(symbol).findOne({
                                                            _id: msg.author.id
                                                        })
                                                        var profileaverage = symbolprofile ? symbolprofile.averagecost : 0
                                                        var profilecurrent = symbolprofile ? symbolprofile.current : 0
                                                        var averagecost = Math.ceil((((profileaverage * profilecurrent) + cost) / (profilecurrent + quantity)) * 100) / 100
                                                        var newbalance = Math.ceil((user.balance - cost) * 100) / 100
                                                        await mongo.db('stock').collection('index').updateOne({
                                                            _id: msg.author.id
                                                        }, {
                                                            $inc: {
                                                                current: quantity,
                                                                bought: quantity,
                                                            },
                                                            $set: {
                                                                balance: newbalance
                                                            }
                                                        }, {
                                                            upsert: true
                                                        })
                                                        await mongo.db('stock').collection(symbol).updateOne({
                                                            _id: msg.author.id
                                                        }, {
                                                            $inc: {
                                                                current: quantity,
                                                                bought: quantity,
                                                                totalspent: cost,
                                                            },
                                                            $set: {
                                                                averagecost: averagecost
                                                            }
                                                        }, {
                                                            upsert: true
                                                        })
                                                        var response = new discord.MessageEmbed();
                                                        response.setTitle('Purchase Successful!')
                                                        response.setDescription(`You have successfully purchased \`${quantity}\` share(s) of \`${symbol}\` for \`$${cost}\`.\n\nNext time, if you wish to purchase privately, you may append the \`${config['option-prefix']}pm\` to the end of the command.\n\nYou can check the price of \`${symbol}\` at anytime using the \`${config['prefix']}${content[0]} quote ${symbol}\` command.\n\nThank you for trading with Echelon Brokerage®!`)
                                                        response.setFooter('Echelon v2.6')
                                                        response.setColor(9159498)
                                                        message.channel.send(response)
                                                        pendingmessage.delete()
                                                    } catch (error) {
                                                        console.log(error)
                                                        var response = new discord.MessageEmbed();
                                                        response.setTitle('Purchase Error')
                                                        response.setDescription(`Something went wrong with your transaction, please try again.\n\nIf this problem persists, contact a server admin or refer to the Github Documentation.`)
                                                        response.setFooter('Echelon v2.6')
                                                        response.setColor(16711680)
                                                        message.channel.send(response)
                                                        pendingmessage.delete()
                                                        return
                                                    }
                                                } else {
                                                    var response = new discord.MessageEmbed();
                                                    response.setTitle('Purchase Cancelled')
                                                    response.setDescription(`No money was charged from your account.`)
                                                    response.setFooter('Echelon v2.6')
                                                    response.setColor(16711680)
                                                    message.channel.send(response)
                                                    return
                                                }
                                            })
                                            collector.on('end', collected => {
                                                var result = collected.toJSON()
                                                if (!result.length) {
                                                    var response = new discord.MessageEmbed();
                                                    response.setTitle('Confirmation Timed-Out!')
                                                    response.setDescription(`You did not confirm your purchase for \`${content[3]}\` share(s) of \`${symbol}\`!\n\nNo money was charged from your account.`)
                                                    response.setFooter('Echelon v2.6')
                                                    response.setColor(16711680)
                                                    message.channel.send(response)
                                                    return
                                                }
                                            })
                                        }
                                    } else {
                                        var response = new discord.MessageEmbed();
                                        response.setTitle('Symbol Does Not Exist!')
                                        response.setDescription(`That ticker symbol could not be found!\nPlease check and try again.`)
                                        response.setFooter('Echelon v2.6')
                                        response.setColor(16711680)
                                        if (msg.content.includes('--pm')) {
                                            client.users.cache.get(msg.author.id).send(`Sent via private message, as per request.`, response);
                                        } else {
                                            msg.channel.send(response)
                                        }
                                        return
                                    }
                                } else {
                                    var response = new discord.MessageEmbed();
                                    response.setTitle('Quantity must be a number!')
                                    response.setDescription(`Please refer to the command usage: \`${config['prefix']}${content[0]} buy [ticker symbol] [quantity]\``)
                                    response.setFooter('Echelon v2.6')
                                    response.setColor(16711680)
                                    if (msg.content.includes('--pm')) {
                                        client.users.cache.get(msg.author.id).send(`Sent via private message, as per request.`, response);
                                    } else {
                                        msg.channel.send(response)
                                    }
                                    return
                                }
                            } else {
                                var response = new discord.MessageEmbed();
                                response.setTitle('Missing Parameters!')
                                response.setDescription(`A quantity must be specified!\n\nThe proper use of the quote action is \`${config['prefix']}${content[0]} buy [ticker symbol] [quantity]\``)
                                response.setFooter('Echelon v2.6')
                                response.setColor(16711680)
                                if (msg.content.includes('--pm')) {
                                    client.users.cache.get(msg.author.id).send(`Sent via private message, as per request.`, response);
                                } else {
                                    msg.channel.send(response)
                                }
                                return
                            }
                        } else {
                            var response = new discord.MessageEmbed();
                            response.setTitle('Missing Parameters!')
                            response.setDescription(`A ticker symbol is required!\n\nThe proper use of the quote action is \`${config['prefix']}${content[0]} buy [ticker symbol] [quantity]\``)
                            response.setFooter('Echelon v2.6')
                            response.setColor(16711680)
                            if (msg.content.includes('--pm')) {
                                client.users.cache.get(msg.author.id).send(`Sent via private message, as per request.`, response);
                            } else {
                                msg.channel.send(response)
                            }
                            return
                        }
                    } else {
                        var response = new discord.MessageEmbed();
                        response.setTitle('User not registered!')
                        response.setDescription(`To use this command, you must be registered with Echelon Brokerage®.\n\n**Registration**\nTo register, simply type \`${config['prefix']}${content[0]} register\`. Upon successful registration, you will recieve a \`$1000\` balance.\n\nSo, what are you waiting for?`)
                        response.setFooter('Echelon v2.6')
                        response.setColor(16711680)
                        msg.channel.send(response)
                        return
                    }
                } else if (content[1] === 'portfolio' || content[1] === 'p') {
                    var user = await mongo.db('stock').collection('index').findOne({
                        _id: msg.author.id
                    })
                    if (user) {
                        var response = new discord.MessageEmbed();
                        if (msg.content.includes('--list')) {
                            var shares = [];
                            var collections = await (mongo.db('stock').listCollections()).toArray();
                            for (collection of collections) {
                                if (collection.name !== 'index') {
                                    var result = await mongo.db('stock').collection(collection.name).findOne({
                                        _id: msg.author.id, current: { $gte: 1 }
                                    }).catch(error => console.log(error))
                                    if (result) {
                                        result.name = collection.name
                                        shares.push(result)
                                    }
                                }
                            }
                            for (share of shares) {
                                response.addField(`${share.name}`, `\`${share.current || 0} shares\`\n\`${share.averagecost ? `$${share.averagecost}` : '[n/a]'} avg\``, true)
                            }
                            response.setDescription(`Below is a list of all of the companies that you currently own shares for.\n\nIf you wish to view this list through private messages, append the \`${config['option-prefix']}pm\` option to your command.`)
                        } else {
                            response.setDescription(`If you wish to see all of the stocks that you own, apphend the \`${config['option-prefix']}list\` option in your command.`)
                            response.addField(`Total Shares Currently Owned`, `\`${user.current || 0}\``, true)
                            response.addField(`Total Shares Sold`, `\`${user.sold || 0}\``, true)
                            response.addField(`Total Shares Bought`, `\`${user.bought || 0}\``, true)
                        }
                        response.setFooter('Echelon v2.6')
                        response.setColor(`0x${config['colors'][Math.floor(Math.random() * config['colors'].length)]}`)
                        if (msg.content.includes(`${config['option-prefix']}pm`)) {
                            response.setTitle(`Your Trading Portfolio`)
                            client.users.cache.get(msg.author.id).send(`Sent via private message, as per request.`, response);
                        } else {
                            response.setTitle(`${msg.author.username}'s Trading Portfolio`)
                            msg.channel.send(response)
                        }
                        return
                    } else {
                        var response = new discord.MessageEmbed();
                        response.setTitle('User not registered!')
                        response.setDescription(`To use this command, you must be registered with Echelon Brokerage®.\n\n**Registration**\nTo register, simply type \`${config['prefix']}${content[0]} register\`. Upon successful registration, you will recieve a \`$1000\` balance.\n\nSo, what are you waiting for?`)
                        response.setFooter('Echelon v2.6')
                        response.setColor(16711680)
                        msg.channel.send(response)
                        return
                    }
                } else if (content[1] === 'sell' || content[1] === 's') {
                    var user = await mongo.db('stock').collection('index').findOne({
                        _id: msg.author.id
                    })
                    if (user) {
                        if (content[2]) {
                            if (content[3]) {
                                if (isInt(content[3])) {
                                    var quantity = parseInt(content[3])
                                    var symbol = content[2].replace(/[^a-z0-9]+/gm, '').toUpperCase()
                                    var result = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${config['finnhubtoken']}`).then(response => response.json()).catch(error => console.log(error))
                                    if (!result.error) {
                                        var owned = await mongo.db('stock').collection(symbol).findOne({
                                            _id: msg.author.id
                                        })
                                        if (owned) {
                                            if (owned.current >= quantity) {
                                                var salevalue = Math.ceil((parseFloat(result.c) * quantity) * 100) / 100
                                                console.log(salevalue)
                                                var response = new discord.MessageEmbed();
                                                response.setTitle('Sale Confirmation')
                                                response.setDescription(`You are about to sell \`${content[3]}\` share(s) of \`${symbol}\` for \`$${salevalue}\`\n\nPlease respond \`yes\` or \`no\` within the next **30 seconds** to confirm this sale.`)
                                                response.setFooter('Echelon v2.6')
                                                response.setColor(16763432)
                                                if (msg.content.includes('--pm')) {
                                                    var message = await client.users.cache.get(msg.author.id).send(`Sent via private message, as per request.`, response);
                                                } else {
                                                    var message = await msg.channel.send(response)
                                                }
                                                var filter = m => ['y', 'n', 'yes', 'no'].indexOf(m.content.toLowerCase()) !== -1 && m.author.id === msg.author.id;
                                                var collector = new discord.MessageCollector(message.channel, filter, { time: 30000 });
                                                collector.on('collect', async m => {
                                                    collector.stop()
                                                    if (['yes', 'y'].indexOf(m.content.toLowerCase()) !== -1) {
                                                        var response = new discord.MessageEmbed();
                                                        response.setTitle('Processing Transaction')
                                                        response.setDescription(`Please do not close the tab or pour the milk before the cereal.`)
                                                        response.setFooter('Echelon v2.6')
                                                        response.setColor(16763432)
                                                        var pendingmessage = await message.channel.send(response)
                                                        try {
                                                            var newbalance = Math.ceil((user.balance + salevalue) * 100) / 100
                                                            await mongo.db('stock').collection('index').updateOne({
                                                                _id: msg.author.id
                                                            }, {
                                                                $inc: {
                                                                    current: -quantity,
                                                                    sold: quantity,
                                                                },
                                                                $set: {
                                                                    balance: newbalance
                                                                }
                                                            }, {
                                                                upsert: true
                                                            })
                                                            await mongo.db('stock').collection(symbol).updateOne({
                                                                _id: msg.author.id
                                                            }, {
                                                                $inc: {
                                                                    current: -quantity,
                                                                    sold: quantity
                                                                }
                                                            }, {
                                                                upsert: true
                                                            })
                                                            var response = new discord.MessageEmbed();
                                                            response.setTitle('Sale Successful!')
                                                            response.setDescription(`You have successfully sold \`${content[3]}\` share(s) of \`${symbol}\` for \`$${salevalue}\`.\n\nNext time, if you would like to sell and buy in private, you can append the \`${config['option-prefix']}pm\` option to you command, and Echelon will respond via private channel.\n\nYou may check your balance at anytime using the \`${config['prefix']}${content[0]} balance\` command.\n\nThank you for trading with Echelon Brokerage®!`)
                                                            response.setFooter('Echelon v2.6')
                                                            response.setColor(9159498)
                                                            message.channel.send(response)
                                                            pendingmessage.delete()
                                                        } catch (error) {
                                                            console.log(error)
                                                            var response = new discord.MessageEmbed();
                                                            response.setTitle('Sale Error')
                                                            response.setDescription(`Something went wrong with your transaction, please try again.\n\nIf this problem persists, contact a server admin or refer to the Github Documentation.`)
                                                            response.setFooter('Echelon v2.6')
                                                            response.setColor(16711680)
                                                            message.channel.send(response)
                                                            pendingmessage.delete()
                                                            return
                                                        }
                                                    } else {
                                                        var response = new discord.MessageEmbed();
                                                        response.setTitle('Sale Cancelled')
                                                        response.setDescription(`Don't worry, I'll act like this never happened.`)
                                                        response.setFooter('Echelon v2.6')
                                                        response.setColor(16711680)
                                                        var cancelled = await message.channel.send(response)
                                                        return
                                                    }
                                                })
                                                collector.on('end', collected => {
                                                    var result = collected.toJSON()
                                                    if (!result.length) {
                                                        var response = new discord.MessageEmbed();
                                                        response.setTitle('Confirmation Timed-Out!')
                                                        response.setDescription(`You did not confirm your purchase for \`${content[3]}\` share(s) of \`${symbol}\`!\n\nNo money was charged from your account.`)
                                                        response.setFooter('Echelon v2.6')
                                                        response.setColor(16711680)
                                                        message.channel.send(response)
                                                        return
                                                    }
                                                })
                                            } else {
                                                var response = new discord.MessageEmbed();
                                                response.setTitle('Not Allowed!')
                                                response.setDescription(`You cannot sell more shares than you own! Please adjust the quantity and try again.`)
                                                response.setFooter('Echelon v2.6')
                                                response.setColor(16711680)
                                                if (msg.content.includes('--pm')) {
                                                    client.users.cache.get(msg.author.id).send(`Sent via private message, as per request.`, response);
                                                } else {
                                                    msg.channel.send(response)
                                                }
                                                return
                                            }
                                        } else {
                                            var response = new discord.MessageEmbed();
                                            response.setTitle('Not Allowed!')
                                            response.setDescription(`You do not own any shares for \`${symbol}\`\n\nIf you wish to purchase \`${symbol}\` shares, use \`${config['prefix']}${content[0]} buy ${symbol} [quantity]\``)
                                            response.setFooter('Echelon v2.6')
                                            response.setColor(16711680)
                                            if (msg.content.includes('--pm')) {
                                                client.users.cache.get(msg.author.id).send(`Sent via private message, as per request.`, response);
                                            } else {
                                                msg.channel.send(response)
                                            }
                                            return
                                        }
                                    } else {
                                        var response = new discord.MessageEmbed();
                                        response.setTitle('Symbol Does Not Exist!')
                                        response.setDescription(`That ticker symbol could not be found!\nPlease check and try again.`)
                                        response.setFooter('Echelon v2.6')
                                        response.setColor(16711680)
                                        if (msg.content.includes('--pm')) {
                                            client.users.cache.get(msg.author.id).send(`Sent via private message, as per request.`, response);
                                        } else {
                                            msg.channel.send(response)
                                        }
                                        return
                                    }
                                } else {
                                    var response = new discord.MessageEmbed();
                                    response.setTitle('Quantity must be a number!')
                                    response.setDescription(`Please refer to the command usage: \`${config['prefix']}${content[0]} buy [ticker symbol] [quantity]\``)
                                    response.setFooter('Echelon v2.6')
                                    response.setColor(16711680)
                                    if (msg.content.includes('--pm')) {
                                        client.users.cache.get(msg.author.id).send(`Sent via private message, as per request.`, response);
                                    } else {
                                        msg.channel.send(response)
                                    }
                                    return
                                }
                            } else {
                                var response = new discord.MessageEmbed();
                                response.setTitle('Missing Parameters!')
                                response.setDescription(`A quantity must be specified!\n\nThe proper use of the quote action is \`${config['prefix']}${content[0]} buy [ticker symbol] [quantity]\``)
                                response.setFooter('Echelon v2.6')
                                response.setColor(16711680)
                                if (msg.content.includes('--pm')) {
                                    client.users.cache.get(msg.author.id).send(`Sent via private message, as per request.`, response);
                                } else {
                                    msg.channel.send(response)
                                }
                                return
                            }
                        } else {
                            var response = new discord.MessageEmbed();
                            response.setTitle('Missing Parameters!')
                            response.setDescription(`A ticker symbol is required!\n\nThe proper use of the quote action is \`${config['prefix']}${content[0]} buy [ticker symbol] [quantity]\``)
                            response.setFooter('Echelon v2.6')
                            response.setColor(16711680)
                            if (msg.content.includes('--pm')) {
                                client.users.cache.get(msg.author.id).send(`Sent via private message, as per request.`, response);
                            } else {
                                msg.channel.send(response)
                            }
                            return
                        }
                    } else {
                        var response = new discord.MessageEmbed();
                        response.setTitle('User not registered!')
                        response.setDescription(`To use this command, you must be registered with Echelon Brokerage®.\n\n**Registration**\nTo register, simply type \`${config['prefix']}${content[0]} register\`. Upon successful registration, you will recieve a \`$1000\` balance.\n\nSo, what are you waiting for?`)
                        response.setFooter('Echelon v2.6')
                        response.setColor(16711680)
                        msg.channel.send(response)
                        return
                    }
                } else if (content[1] === 'balance' || content[1] === 'bl') {
                    var user = await mongo.db('stock').collection('index').findOne({
                        _id: msg.author.id
                    })
                    if (user) {
                        var response = new discord.MessageEmbed();
                        response.addField(`Balance`, `${user.balance ? `\`$${user.balance}\`` : '[n/a]'}`)
                        response.setFooter('Echelon v2.6')
                        response.setColor(`0x${config['colors'][Math.floor(Math.random() * config['colors'].length)]}`)
                        if (msg.content.includes(`${config['option-prefix']}`)) {
                            response.setTitle('Your Balance')
                            response.setDescription(`The \`${config['option-prefix']}pm\` option can also be used for the \`buy\` \`sell\` and \`portfolio\` commands. Happy Trading!`)
                            client.users.cache.get(msg.author.id).send(`Sent via private message, as per request.`, response);
                        } else {
                            response.setTitle(`${msg.author.username}'s Balance`)
                            response.setDescription(`If you wish to check your balance through private message, include the \`${config['option-prefix']}pm\` option in your message.`)
                            msg.channel.send(response)
                        }
                        return
                    } else {
                        var response = new discord.MessageEmbed();
                        response.setTitle('User not registered!')
                        response.setDescription(`To use this command, you must be registered with Echelon Brokerage®.\n\n**Registration**\nTo register, simply type \`${config['prefix']}${content[0]} register\`. Upon successful registration, you will recieve a \`$1000\` balance.\n\nSo, what are you waiting for?`)
                        response.setFooter('Echelon v2.6')
                        response.setColor(16711680)
                        msg.channel.send(response)
                        return
                    }
                } else if (content[1] === 'quote' || content[1] === 'q') {
                    if (content[2]) {
                        var symbol = content[2].replace(/[^a-z0-9]+/gm, '').toUpperCase()
                        var result = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${config['finnhubtoken']}`).then(response => response.json()).catch(error => console.log(error))
                        if (result) {
                            if (!result.error) {
                                var stockowned = await mongo.db('stock').collection(symbol).findOne({
                                    _id: msg.author.id, current: { $gte: 1 }
                                })
                                var response = new discord.MessageEmbed();
                                response.setTitle(`Latest Quote for \`${symbol}\``)
                                response.setDescription(`Real-time stock market data provided by [finnhub.io](https://finnhub.io/).`)
                                response.addField(`Current Price`, `${result.c ? `\`$${result.c}\`` : '[n/a]'}`, true)
                                response.addField(`Day High`, `${result.h ? `\`$${result.h}\`` : '[n/a]'}`, true)
                                response.addField(`Day Low`, `${result.l ? `\`$${result.l}\`` : '[n/a]'}`, true)
                                response.addField(`Day Open`, `${result.o ? `\`$${result.o}\`` : '[n/a]'}`, true)
                                response.addField(`Previous Close`, `${result.pc ? `\`$${result.pc}\`` : '[n/a]'}`, true)
                                if (stockowned) {
                                    var additionalmessage = new discord.MessageEmbed()
                                    additionalmessage.setTitle(`You have shares in this stock!`)
                                    additionalmessage.setDescription(`Remember, to view your portfolio, use the \`stock portfolio\` or \`s p\` command! There, you will be able to view all of your stocks and view prices.`)
                                    additionalmessage.setFooter('Echelon v2.6')
                                    additionalmessage.setColor(`0x${config['colors'][Math.floor(Math.random() * config['colors'].length)]}`)
                                }
                                response.setFooter('Echelon v2.6')
                                response.setColor(`0x${config['colors'][Math.floor(Math.random() * config['colors'].length)]}`)
                                if (msg.content.includes('--pm')) {
                                    client.users.cache.get(msg.author.id).send(`Sent via private message, as per request.`, response);
                                } else {
                                    msg.channel.send(response)
                                    additionalmessage ? msg.channel.send(additionalmessage) : false;
                                }
                                return
                            } else {
                                var response = new discord.MessageEmbed();
                                response.setTitle('Symbol Does Not Exist!')
                                response.setDescription(`That ticker symbol could not be found!\nPlease check and try again.`)
                                response.setFooter('Echelon v2.6')
                                response.setColor(16711680)
                                if (msg.content.includes('--pm')) {
                                    client.users.cache.get(msg.author.id).send(`Sent via private message, as per request.`, response);
                                } else {
                                    msg.channel.send(response)
                                }
                                return
                            }
                        }
                    } else {
                        var response = new discord.MessageEmbed();
                        response.setTitle('Missing Parameters!')
                        response.setDescription(`A ticker symbol is required!\n\nThe proper use of the quote action is \`${config['prefix']}${content[0]} quote [ticker symbol]\``)
                        response.setFooter('Echelon v2.6')
                        response.setColor(16711680)
                        if (msg.content.includes('--pm')) {
                            client.users.cache.get(msg.author.id).send(`Sent via private message, as per request.`, response);
                        } else {
                            msg.channel.send(response)
                        }
                        return
                    }
                } else {
                    var response = new discord.MessageEmbed();
                    response.setTitle('Invalid Action!')
                    response.setDescription(`Valid actions include \`${actions.join('\` \`')}\``)
                    response.setFooter('Echelon v2.6')
                    response.setColor(16711680)
                    msg.channel.send(response)
                    return;
                }

            } else {
                var response = new discord.MessageEmbed();
                response.setTitle('Missing Parameters!')
                response.setDescription(`The proper use of this command is \`${config['prefix']}${commands[content[0]].usage}\``)
                response.setFooter('Echelon v2.6')
                response.setColor(16711680)
                msg.channel.send(response)
                return
            }
        } else {
            var embed = new discord.MessageEmbed()
            embed.setTitle('No Finnhub API key found!')
            embed.setDescription(`This command requires a Finnhub API key to work!\nGet one [here](https://finnhub.io/)`)
            embed.setColor(16711680)
            embed.setFooter('Echelon v2.6')
            msg.channel.send(embed)
        }
    } else {
        var reminder = new discord.MessageEmbed()
        reminder.setTitle(`No MongoDB Linked!`)
        reminder.setDescription(`This command requres a MongoDB database to work!`)
        reminder.setColor(16711680)
        reminder.setFooter('Echelon v2.6')
        msg.channel.send(reminder)
    }
}

module.exports = stock;