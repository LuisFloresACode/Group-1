
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const dataFolder = path.join(process.cwd(), "data");

fs.mkdirSync(dataFolder, { recursive: true });

export const db = new Database(path.join(dataFolder, "xp.sqlite"));

db.exec(`
  CREATE TABLE IF NOT EXISTS user_xp (
    server_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    xp INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (server_id, user_id)
  );
`);

export function getXP(serverId, userId) {
    const row = db.prepare(
        "SELECT xp FROM user_xp WHERE server_id = ? AND user_id = ?"
    ).get(serverId, userId);

    if (row === undefined) {
        return 0;
    }

    return row.xp;
}

export function saveXP(serverId, userId, xp) {
    db.prepare(`
        INSERT INTO user_xp (server_id, user_id, xp)
        VALUES (?, ?, ?)
        ON CONFLICT(server_id, user_id)
        DO UPDATE SET xp = excluded.xp
    `).run(serverId, userId, xp);
}

// Get the top users in a server, ranked by XP
export function getLeaderboard(serverId, limit = 10) {
    return db.prepare(`
        SELECT user_id AS userId, xp
        FROM user_xp
        WHERE server_id = ?
        ORDER BY xp DESC, user_id ASC
        LIMIT ?
    `).all(serverId, limit);
}
