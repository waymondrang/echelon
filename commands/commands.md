# Echelon at your Command

Echelon has many useful and fun commands! Here's what they do and how to use them. All of the commands will be in `this` syntax. Remember to type the bot's prefix before the command in Discord!

# `About`

The `about` command is the simplist of them all. Simply type `about` and Echelon will reply with some information about the bot.

# `Apex`

The `apex` command will allow users to fetch basic Apex Legends player data, including their level, rank, and other banner stats.

## Requirements

A [apexlegendsapi.com](https://apexlegendsapi.com/) API key is required to use this command.

## Usage

`apex [platform] [playername]`

Example: `apex pc drdisrespect`

#### Platform

Valid platforms include `pc, ps4, and x1`.

#### Playername

The playername field is not cap-sensitive!

# `Covid`

The `covid` command uses data from the [Covid Tracking Project](https://covidtracking.com/), which offers a public API, to fetch Covid-19 statistics for the United States and each state.

## Usage

`covid [state code]`

Example: `covid`, `covid ny`

The `state code` field is an optional field, leaving it blank will retrieve statistics for the United States.

#### State Code

State codes are used to retrieve Covid-19 data. For example, to retrieve statistics for California, use its state code, CA.

# `Genius`

The `genius` command is an unfinished command that would've allowed users to search for songs and view it's lyrics via the Genius API. At its current state, the `genius` command will show the first 5 results for a query.

## Requirements

A [Genius API](https://docs.genius.com/#/songs-h2) key is required to use this command.

## Usage

`genius [query]`

Example: `genius [bon iver]`, `genius zedd`

#### Query

If the query contains spaces, for example `Travis Scott`, then brackets will need to surround it. The query can be anything from a song to an album to an artist.

# `LoL`

The `lol`, or League of Legends command, requires a Riot API Key to fetch data about a League of Legends player. Statistics such as their summoner level and their ranked stats.

## Requirements

A [Riot Games API](https://developer.riotgames.com/) key is required to use this command.

## Usage

`lol [playername]`

Example: `lol yassuo`

#### Playername

Similar to the `apex` command, the player name field is not cap-sensitive!

# `MyStats`

The `mystats` command will retrieve statistics collected by Echelon that is stored in a MongoDB database. Echelon will reply with the user's total message count, bad words typed, and Echelon commands used for the guild the message was sent in.

## Requirements

A MongoDB database is required to use this command.

## Usage

`mystats`

There are no parameters for this command.

# `Remind`

The `remind` command is a utility command, allowing users to be reminded at certain times with custom reminder messages. There are multiple ways to use the command as well, giving users a shell-like command experience.

## Requirements
  
A MongoDB database is required to use this command.

## Usage

`remind [mentions] -t [time] -m [message] [flags]`

The `remind` command has 4 parameters. Users to remind, a time for the reminder, the reminder message, and an optional flag. The 4 parameters can be typed in any order, shown by the examples.

Examples: `remind @justin @andrew -t 4:20pm -m "skrim with rival team" --pm`  `remind --list`  `remind @ryan @jason -t 3am -m "go to sleep"`

#### Mentions

You may mention as many people as you can fit in a message! @everyone, @here and @[role] are not supported.

#### Time

The time must follow the `-t` tag. Use HH:MM or just HH + AM or PM. If the time contains spaces, for example `12:00 PM`, make sure to surround it in either [brackets], "double quotes", or 'single quotes'.

For example: `-t "11:34 PM"`  `-t 3am`  `-t 4:44pm`

#### Message

The message must follow the -m tag. If the message contains spaces, make sure to surround it in either [brackets], "double quotes", or 'single quotes'.

For example: `-m 'stop playing valorant!'`  `-m GAMERTIME`  `-m "second period starts in 5 minutes!"`

#### Optional Flags

There are 2 optional flags for the remind command: `--list` and `--pm`.

Instead of typing `remind list`, you need to type `remind --list` in order to see all of the active reminders. The `--pm` flag will send the reminders via private message instead of mentioning the users in the server channel.

# `ServerStats`

The `serverstats` command is similar to the `mystats` command, only that it displays stats for the server instead of a user. Stats collected and shown include vanilla stats including a server member count, the owner, the server region, and verification status. Bot-generated statistics include the total bad words typed, the user who said the most bad words, the total commands used, and the user who used the most commands.

## Requirements

A MongoDB database is required to use this command.

## Usage

`serverstats`

# `Stock`

The `stock` command is the most complex and newest command in Echelon. Using real time stock data and MongoDB, users can trade stocks and watch their investments grow (hopefully).

## Requirements

A [Finnhub API](https://finnhub.io/) key and MongoDB database is required for this command.

## Usage

`stock [action] [symbol] [quantity] [flags]`

Examples: `stock buy AAPL 5`  `stock sell BABA 1`  `stock portfolio --list`  `stock balance --pm`

#### Actions

Valid actions include `buy`  `sell`  `quote`  `portfolio`  `balance`  `leaderboard`.

Usage for each action:

`stock buy [symbol] [quantity] [flags]`

`stock sell [symbol] [quantity] [flags]`

`stock quote [symbol] [flags]`

`stock portfolio [flags]`

`stock balance [flags]`

`stock leaderboard`

#### Symbol

The ticker symbol goes here, if the action is either `buy`  `sell` or `quote`.

Examples: `AAPL`  `TSLA`

#### Quantity

The quantity must be a valid number! If you are selling, the quantity must be less or equal than the number of shares that you own. If you are buying, make sure you have enough money in your balance to purchase that amount of shares.

#### Optional Flags

The `pm` option can be used with `buy`  `sell`  `quote`  `portfolio`  `balance`, allowing users to interact with the bot privately through direct messages. The actual command must be first sent in a public channel, however. If the `pm` option is used on either the `buy`  `sell`  `portfolio`  `quote` actions, the user's message will be deleted after being sent into a public channel.

The `list` option can only be used on the portfolio command, which generates a list of all the companies that you own a share in. It can be used in conjunction with the `pm` command.

# `VoteKick`

The `votekick` command allows users to start a votekick. The votekick will have 2 reaction emojis, one for yes and another for no. If a user votes for both, their vote will not be counted. If, at the end of the vote, there are more yes votes than no votes, the user will be kicked. Currently, there are no restrictions on which roles can use this command, so it may easily be abused. More functionality may be added to this command in the future.

If you do not wish for Echelon to kick users but still want the votekick command, simply remove the manage users permission for the bot in your server.

## Usage

`votekick @user`

Only one user can be targeted for a votekick.

Examples: `votekick @alvins`