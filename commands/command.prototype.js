const discord = require("discord.js");

module.exports = class {
    constructor() {
        this.alias = "protocol";
        this.description = "command built using protocol v2";
        this.category = "development";
    }

    main(data) {
        data.message.channel.send(embed);
    }
}