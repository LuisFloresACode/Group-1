# Brain-Rush Code Analysis Report

## 1. Cyclomatic Complexity Analysis

### Method

I used ESLint to check the cyclomatic complexity of the methods in our bot.

I used 5 as the maximum complexity for this analysis and ran this command in the terminal:

```bash
npx eslint src --rule 'complexity: ["warn", 5]'
```

### Results

ESLint found four functions with a complexity higher than 5.

| Function | File | Complexity |
|---|---|---:|
| `handleTrivia` | `src/trivia/handleTrivia.js` | 21 |
| `execute` | `src/events/messageCreate.js` | 20 |
| `createChallenge` | `src/trivia/challenge.js` | 17 |
| Anonymous function in `answerTransaction` | `src/trivia/dailyChallenge.js` | 7 |

### Findings

The `handleTrivia` function has the highest complexity, which is 21. This function does many things, such as checking commands, checking user answers, checking Discord messages, and handling errors.

The `execute` function in `messageCreate.js` has a complexity of 20. It handles different commands, including `!testxp` and `!level`. It also checks user permissions and input.

The `createChallenge` function has a complexity of 17. It checks the user's choices, finds questions, checks if there are enough questions, and creates a challenge.

The anonymous function inside `answerTransaction` has a complexity of 7. It checks the user's challenge progress, checks answers, gives XP, and updates the database.

### Recommendations

I think some of these functions are doing too many things. We can separate them into smaller functions. This can make the code easier to read, understand, test and maintain.

For example, we can move command checking, input checking, and question filtering into separate functions.

For `answerTransaction`, we should keep the database transaction when making changes because it helps keep the data correct.

A high complexity number does not always mean there is a bug. However, it means the function has more possible paths, so it may be harder to test and maintain when we need to.

## 2. Threat Model Analysis

### Assets to Protect

The important things we need to protect in Brain-Rush are:

- Users' XP and leaderboard rankings.
- Daily challenge progress and question history.
- Discord server and users' information.
- The SQLite database that stores users' progress.

### Potential Threats and Current Protections

| Threat | Possible Problem | Current Protection |
|---|---|---|
| Unauthorized XP changes | Users may change XP without permission. | The `!testxp` command checks if the user has Administrator permission. |
| Invalid XP values | Wrong XP values may cause problems with levels and rankings. | `awardXP()` checks that the amount is a positive integer and does not exceed the safe integer limit. |
| Starting daily challenges many times | Users may try to get extra questions and more XP. | The bot continues the current challenge if the user already started one today. |
| Using old answers again | Users may try to answer the same question more than once. | The bot checks if the question ID matches the current question. |
| SQL injection | Attackers may try to change database queries through input. | The XP storage code uses parameterized SQL queries. |
| Mixing XP between servers | XP from different Discord servers may get mixed together. | The database uses both server ID and user ID to keep records separate. |

### Other Risks

The code already has some security protections, but I found some risks that may need more attention.

- **Command spam:** Users may send commands many times in a short period. This can increase the bot's workload. I did not find a general cooldown or rate limit in the code I checked.
- **Database access:** Someone who can access the computer running the bot may also access or change the SQLite database.
- **Unexpected errors:** Database errors or Discord API problems may stop some commands from working correctly.

### Recommendations

I suggest making these improvements:

1. Add cooldowns to commands to prevent users from sending too many commands.
2. Test that normal users cannot use `!testxp`.
3. Add tests to make sure users cannot get XP more than once for the same question.
4. Protect the SQLite database file from unauthorized access.
5. Add more tests for invalid inputs and unexpected errors.

### Conclusion

After checking the code, I found that Brain-Rush already has some useful security protections. For example, it checks administrator permissions, validates XP amounts, uses parameterized SQL queries, and checks daily challenge progress.

However, I think the bot can be improved by adding command cooldowns and more security tests. These changes can help make the bot safer and more reliable.