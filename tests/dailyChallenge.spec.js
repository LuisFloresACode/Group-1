const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

describe("Daily sports challenges", function () {
    let db;
    let startDailyChallenge;
    let answerDailyQuestion;
    let getXP;
    let questionBank;
    let temporaryFolder;

    before(function () {
        const projectFolder = process.cwd();
        temporaryFolder = fs.mkdtempSync(
            path.join(os.tmpdir(), "brain-rush-test-")
        );

        // Open a separate test database, not the bot's real database.
        process.chdir(temporaryFolder);

        try {
            ({ db, getXP } = require(
                path.join(projectFolder, "src/xp/xpStorage.js")
            ));

            ({ startDailyChallenge, answerDailyQuestion } = require(
                path.join(projectFolder, "src/trivia/dailyChallenge.js")
            ));

            ({ questionBank } = require(
                path.join(projectFolder, "src/trivia/questionBank.js")
            ));
        } finally {
            process.chdir(projectFolder);
        }
    });

    after(function () {
        if (db) db.close();
        if (temporaryFolder) {
            fs.rmSync(temporaryFolder, { recursive: true, force: true });
        }
    });

    function correctOption(questionId) {
        return questionBank.find(q => q.id === questionId)
            .correctOptionIndex;
    }

    it("resumes the same challenge", function () {
        const first = startDailyChallenge("server", "resume-user");
        const second = startDailyChallenge("server", "resume-user");

        assert.equal(first.question.id, second.question.id);
        assert.equal(second.answered, 0);
        assert.equal(second.total, 5);
    });

    it("awards 10 XP once and rejects a repeated answer", function () {
        const first = startDailyChallenge("server", "correct-user");
        const option = correctOption(first.question.id);

        const result = answerDailyQuestion(
            "server", "correct-user", first.question.id, option
        );

        assert.equal(result.xpAwarded, 10);
        assert.equal(getXP("server", "correct-user"), 10);
        assert.equal(result.progress.answered, 1);

        assert.throws(() => answerDailyQuestion(
            "server", "correct-user", first.question.id, option
        ), /no longer active/);

        assert.equal(getXP("server", "correct-user"), 10);
    });

    it("gives no XP for a wrong answer but counts the question", function () {
        const first = startDailyChallenge("server", "wrong-user");
        const wrongOption = (correctOption(first.question.id) + 1) % 4;

        const result = answerDailyQuestion(
            "server", "wrong-user", first.question.id, wrongOption
        );

        assert.equal(result.correct, false);
        assert.equal(result.xpAwarded, 0);
        assert.equal(getXP("server", "wrong-user"), 0);
        assert.equal(result.progress.answered, 1);
    });

    it("stops after five questions, even when started again", function () {
        let progress = startDailyChallenge("server", "limit-user");

        for (let i = 0; i < 5; i++) {
            const id = progress.question.id;
            progress = answerDailyQuestion(
                "server", "limit-user", id, correctOption(id)
            ).progress;
        }

        assert.equal(progress.complete, true);
        assert.equal(getXP("server", "limit-user"), 50);
        assert.equal(
            startDailyChallenge("server", "limit-user").complete,
            true
        );

        assert.throws(() => answerDailyQuestion(
            "server", "limit-user", "sports-01", 0
        ), /finished/);
    });

    it("keeps different users and servers separate", function () {
        assert.equal(
            startDailyChallenge("server", "another-user").answered,
            0
        );

        assert.equal(
            startDailyChallenge("another-server", "correct-user").answered,
            0
        );

        assert.equal(getXP("another-server", "correct-user"), 0);
    });
        it("lets a player start a challenge, answer, and check their XP", async function () {
        const event = require("../src/events/messageCreate.js").default;
        const player = { id: "12345", bot: false };
        const client = { user: { id: "99999" } };
        const replies = [];

        // Capture what the bot would send to Discord.
        const message = {
            content: "!daily sports",
            author: player,
            guild: {
                id: "smoke-server",
                members: { fetch: async () => player }
            },
            reply: async (response) => { replies.push(response); }
        };

        await event.execute(message, client);

        const prompt = replies[0].embeds[0];
        assert.equal(prompt.title, "Sports: Question 1/5");
        const footer = /^brainrush:12345:(sports-\d+)$/.exec(prompt.footer.text);
        assert.ok(footer, "The question should belong to this player");

        // Answer the actual question the bot picked.
        const answerNumber = correctOption(footer[1]) + 1;
        await event.execute({
            ...message,
            content: `!answer ${answerNumber}`,
            reference: { messageId: "first-question" },
            fetchReference: async () => ({
                author: client.user,
                embeds: [prompt]
            })
        }, client);

        assert.equal(replies[1].content, "Correct! +10 XP.");
        assert.equal(replies[2].embeds[0].title, "Sports: Question 2/5");

        await event.execute({
            ...message,
            content: "!level <@12345>",
            mentions: { users: { first: () => player } }
        }, client);

        assert.match(replies[3], /Total XP: 10\b/);
    });
});