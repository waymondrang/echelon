const discord = require("discord.js");

module.exports = class {
    constructor() {
        this.alias = "about";
        this.description = "read more about the bot!";
        this.category = "info";
    }

    /**
     * @param {Object} data
     * @param {Object} data.config 
     * @param {discord.Message} data.message
     */
    main(data) {
        var embed = new discord.MessageEmbed();
        embed.setColor(`0x${data.config['colors'][Math.floor(Math.random() * data.config['colors'].length)]}`);
        embed.setTitle(`more about \`${data.config["bot_name"]}\``);
        embed.setFooter(`${data.config["bot_name"]}${data.config["display_version_number"] ? ` ${data.config["version_number"]}` : null}`);
        embed.setDescription(` a discord bot powered by discord.js and mongodb. it is written in the node.js javascript runtime. view its original source code [here](https://github.com/waymondrang/echelon).`);
        data.message.channel.send(embed);
    }
}