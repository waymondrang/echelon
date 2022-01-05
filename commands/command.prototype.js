const discord = require("discord.js");

var embed = new discord.MessageEmbed()
embed.setDescription(`word of the day`);
embed.addField(`ok`, `ok`);

module.exports = class Command {
    constructor() {
        this.alias = "protocol";
        this.help = embed;
        this.description = "command built using protocol v2";
    }

    main(data) {
        data.message.channel.send(embed);
    }
}