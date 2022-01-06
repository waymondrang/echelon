const discord = require("discord.js");

module.exports = class {
    constructor() {
        this.alias = "admin";
        this.description = "check global admin status";
        this.category = "info"
    }

    /**
     * @param {Object} data
     * @param {Object} data.config 
     * @param {discord.Message} data.message
     */
    main(data) {
        var embed = new discord.MessageEmbed()
        embed.setColor(`0x${data.config['colors'][Math.floor(Math.random() * data.config['colors'].length)]}`);
        embed.setDescription(data.config["global_admin_ids"].includes(data.message.author.id) ? `<@${data.message.author.id}> you are a global admin!` : `<@${data.message.author.id}> you are not a global admin.`);
        data.message.channel.send(embed);
    }
}