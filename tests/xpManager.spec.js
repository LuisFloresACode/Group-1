const assert = require("node:assert/strict");
const fs = require("node:fs");
const { get } = require("node:http");
const os = require("node:os");
const path = require("node:path");

describe("XP and Leveling", function () {
    let calculateLevel;
    let db;
    let awardXP;
    let getXP;
    let temporaryFolder;

    before(function () {
        const projectFolder = process.cwd();

        temporaryFolder = fs.mkdtempSync(
            path.join(os.tmpdir(), "brain-rush-xp-")
        );

        const storagePath = path.join(
            projectFolder, "src/xp/xpStorage.js"
        );
        const managerPath = path.join(
            projectFolder, "src/xp/xpManager.js"
        );

        process.chdir(temporaryFolder);

        try {
            // Reload modules to use our temporary database.
            delete require.cache[require.resolve(storagePath)];
            delete require.cache[require.resolve(managerPath)];

            ({ db, getXP } = require(storagePath));
            ({ calculateLevel, awardXP } = require(managerPath));
        } finally {
            process.chdir(projectFolder);
        }
    });

    after(function () {
        if (db) db.close();

        if (temporaryFolder) {
            fs.rmSync(temporaryFolder, {
                recursive: true,
                force: true
            });
        }
    });

    it("calculates levels correctly from XP", function () {
        assert.equal(calculateLevel(0), 1);
        assert.equal(calculateLevel(99), 1);
        assert.equal(calculateLevel(100), 2);
        assert.equal(calculateLevel(200), 3);
        assert.equal(calculateLevel(10000), 101);
    });


    it("rejects invalid XP amounts", function () {
        assert.throws(() => awardXP("server", "user", 0));
        assert.throws(() => awardXP("server", "user", -10));
        assert.throws(() => awardXP("server", "user", 2.5));
        assert.throws(() => awardXP("server", "user", Infinity));
    });


    it("stores XP separately for users and servers", function () {
        // Award XP to different users and servers
        awardXP("server-A", "user-1", 10);
        awardXP("server-A", "user-1", 5);
        awardXP("server-A", "user-2", 20);
        awardXP("server-B", "user-1", 30);

        // Check that XP accumulates correctly
        assert.equal(getXP("server-A", "user-1"), 15);

        // Check that different users have separate XP
        assert.equal(getXP("server-A", "user-2"), 20);

        // Check that different servers have separate XP
        assert.equal(getXP("server-B", "user-1"), 30);

        // Check that a new user starts with 0 XP
        assert.equal(getXP("server-A", "user-3"), 0);
    });


});
