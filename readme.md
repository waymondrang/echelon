# Echelon

A modular Node.js Discord bot powered by [Discord.js](https://discord.js.org/) and [MongoDB](https://www.mongodb.com/).

With a focus on expandability, Echelon was engineered to streamline the process of adding new commands and information.

## Features

Echelon comes equipped with some helpful features out-of-the-box.

#### Custom Profanity Filter

Within the `banned-words.json` file, there are two arrays—one named `banned` and the other `special`. The `banned` array will contain a list of plaintext words that are to be blocked. The `special` array will contain premade regex expressions.

Here is an example:
```
{
    "banned": ["apple", "banana", "orange"],
    "special": ["\\by+\\s*o+\\b", "\\bh+\\s*i+\\b"]
}
```

The following words *will* trigger this configuration:
`bapple` `app pple` `bannnana` `b a n a n a` `oorangege` `yoo` `hhi`
The following words *will not* trigger the configuration:
`b a n n n a n a` `byoo` `hiya` `yoop`

#### Practical Commands
Echelon comes with 8 prebuilt commands:

|   Requirements   |         Command         |
|:----------------:|:-----------------------:|
|       None       |     `about` `covid`     |
|     API Keys     |  `apex` `genius` `lol`  |
|      MongoDB     | `mystats` `serverstats` |
| Work-in-Progress |        `votekick`       |

##### Command Prefix

The default command prefix for Echelon is `!`, but can be easily changed in the `config.json` file.

##### API Keys

The `apex`, `genius`, and `lol` commands fetches data from services that require API keys. `covid` is does not require an API key because it relies on a public API. Read more about the COVID-19 API [here](https://covidtracking.com/data/api).

|  Command |            Service            |              Website             |
|:--------:|:-----------------------------:|:--------------------------------:|
|  `apex`  | Apex Legends API (*unofficial*) |    https://apexlegendsapi.com    |
| `genius` |           Genius API          |      https://docs.genius.com     |
|   `lol`  |         Riot Games API        | https://developer.riotgames.com/ |

#### MongoDB Support

By linking Echelon to a MongoDB database, Echelon will collect information about the users in the server(s), including the number of commands used and the amount of bad words typed. A different database is used for each server, making user data independent.

If no MongoDB database is linked, the bot and all of the commands will still work!


