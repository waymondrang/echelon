# Echelon

A modular Node.js Discord bot powered by [Discord.js](https://discord.js.org/) and [MongoDB](https://www.mongodb.com/).

With a focus on expandability, Echelon was engineered to streamline the process of adding new commands and information.

# Features

Echelon comes equipped with some helpful features out-of-the-box.

## Custom Profanity Filter

Within the `banned-words.json` file, there are two arrays—one named `banned` and the other `special`. The `banned` array will contain a list of plaintext words that are to be blocked. Any premade regex expressions will go into the `special` array.

Here is an example:
```
{
    "banned": ["apple", "banana", "orange"],
    "special": ["\\by+\\s*o+\\b", "\\bh+\\s*i+\\b"]
}
```

##### The following words *will* trigger this configuration:

`bapple` `app pple` `bannnana` `b a n a n a` `oorangege` `yoo` `hhi`

##### The following words *will not* trigger the configuration:

`b a n n n a n a` `byoo` `hiya` `yoop`

## Fun and Handy Commands

[Find out more about the commands!](https://github.com/waymondrang/echelon/blob/master/commands/readme.md)

### Command Prefix

The default command prefix for Echelon is `!`, but can be easily changed in the `config.json` file.

## MongoDB Support

By linking Echelon to a MongoDB database, Echelon will collect simple information about the users in each server, including the number of commands used and the amount of bad words typed. A different database is used for each server, making user data independent.

If no MongoDB database is linked, the bot will still work, but some commands will be disabled, as they rely on the database.


