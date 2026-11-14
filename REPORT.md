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

## 3. Technical Debt and Code Smell Analysis

### Method

For this analysis, I used ESLint to identify potential problems in our JavaScript code and manually examined the XP and leveling system.

After configuring ESLint for Node.js and JavaScript modules, I ran the following command in our Codespace:

```bash
npx eslint src/
```

I also reviewed `src/xp/xpManager.js` to examine the XP calculations, input validation, and overall maintainability of the code.

### Results

ESLint reported one error and zero warnings.

| File | Finding | Type |
|---|---|---|
| `src/events/guildMemberAdd.js` | `getWelcomeMessageWithMeme` is declared but never used. | Unused code |
| `src/xp/xpManager.js` | `addXP()` uses an unnecessary temporary variable. | Minor code smell |

### Findings

**Unused function**

ESLint identified an unused function named `getWelcomeMessageWithMeme` in `guildMemberAdd.js`, at line 34. The function is defined but not used in the current welcome-message implementation.

Although this does not necessarily prevent the bot from working, unused code can make the project harder to understand and maintain. It may also cause confusion about which features are currently supported.

**Unnecessary temporary variable**

While reviewing `xpManager.js`, I noticed that the `addXP()` function creates a temporary variable, adds the XP amount, and then returns the result.

The function works correctly, but it could be simplified to return `currentXP + amount` directly. This is a minor maintainability issue rather than a functional bug.

### Recommendations

I recommend removing unused code if the team does not plan to use it and simplifying unnecessary calculations where possible.

We should also continue reviewing the XP system as new features are added, especially when multiple commands can modify user progress.

## 4. XP and Leveling Unit Tests

### Method

For my second analysis activity, I wrote three unit tests for the XP and leveling system.

The tests were added to a new file:

`tests/xpManager.spec.js`

I used a temporary SQLite database so the tests would not modify the bot's normal XP records.

I ran the automated tests using:

```bash
npm test
```

Before adding my tests, the project had five passing tests for the daily trivia system. After adding my three tests, all eight tests passed.

### Results

| Test | Purpose | Result |
|---|---|---|
| Level calculations | Verify that XP values produce the expected levels. | Passed |
| Invalid XP amounts | Verify that zero, negative, decimal, and infinite XP awards are rejected. | Passed |
| XP storage and separation | Verify that XP accumulates correctly and remains separate for different users and servers. | Passed |

Final test results:

- Existing daily trivia tests: 5 passing
- New XP and leveling tests: 3 passing
- Total: 8 passing, 0 failing

### Findings

**Level calculations**

The first test checks that `calculateLevel()` returns the expected levels for different XP amounts, including boundary values such as 99 and 100 XP.

All assertions passed, indicating that the tested level calculations behave as expected.

**Invalid XP amounts**

The second test attempts to award invalid XP amounts, including zero, negative numbers, decimals, and infinity.

The `awardXP()` function correctly rejected these values by throwing errors. This confirmed that the existing input validation works for the cases tested.

**XP storage and separation**

The third test awards XP to different users across different Discord servers.

It verifies that XP accumulates correctly for an existing user, different users have independent XP records, and the same user can have different XP totals in separate servers.

It also verifies that a user without an existing XP record starts with zero XP.

All assertions passed.

### Recommendations

Although the tests passed, there are additional scenarios worth testing in the future.

For example, we could test database failures, larger XP totals, and whether data remains available after closing and reopening the database.

The current tests verify important XP behavior, but they do not cover every possible failure or prove persistence across a complete bot restart.

I recommend keeping these tests in the project and expanding them as new XP and leveling features are implemented.