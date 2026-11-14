[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://github.com/codespaces/new?hide_repo_select=true&ref=main&repo=542440024)

# Javascript Discord BrainRush bot with GitHub Codespaces

BrainRush is a Discord leveling bot that rewards community engagement, daily question answering, and participation with XP, levels, and server-based rewards.

BrainRush is currently under active development...
## Sports Daily Challenge

Brain Rush includes 15 predefined sports trivia questions across easy,
medium, and hard difficulty. No AI API key is required.

### Commands

- `!daily sports` — start or resume today's five-question challenge.
- Reply directly to your question with `!answer 1` through `!answer 4`.
- `!level @user` — view a user's XP and level.

Correct answers earn 10 XP. Incorrect answers earn no XP and do not
remove existing XP. Both count toward the five-question daily limit.

Daily challenges reset at midnight UTC. Progress and XP are stored in
`data/xp.sqlite` and survive bot restarts when that database is preserved.
Deployment must retain the data folder across restarts and updates.

Questions do not repeat until the available sports question bank is
exhausted. Previously answered question messages cannot award XP again.

## XP and Leveling

Brain-Rush allows Discord server members to earn XP and level up.

- `!level @user` — View a user's total XP and current level.
- `!testxp @user amount` — Award XP to a user for testing purposes (administrators only).

Users begin at Level 1 with 0 XP and gain one level for every 100 XP earned.

XP is stored using SQLite and tracked separately for each user and Discord server. XP persists between bot restarts as long as the database is preserved.

## Server Leaderboard

Brain-Rush includes a leaderboard that ranks server members based on their total XP.

### Command

/leaderboard — Display the top 10 users in the server, ranked by XP.

The leaderboard displays each user's name, current level, and total XP.

Slash Command Setup
The leaderboard uses a Discord slash command, which must be registered before use.

Add the following variables to your .env file:

TOKEN — Discord bot token.
CLIENT_ID — Discord application ID.
GUILD_ID — Discord server ID.

Register the command by running:

npm run register

Once registered, use /leaderboard in the configured Discord server.

The leaderboard uses the same XP database as the leveling and trivia systems.

## Testing

Run automated tests:

```bash
npm test
```

Build and start the bot:

```bash
npm start
```

Use a `.env` file containing the bot's `TOKEN`. Never commit that file.

