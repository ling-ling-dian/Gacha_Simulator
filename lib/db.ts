import { execFile } from "node:child_process";
import { promisify } from "node:util";

const exec = promisify(execFile);

type DbConfig = { host: string; port: string; user: string; password: string; database: string };

function config(): DbConfig {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("缺少 DATABASE_URL");
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: parsed.port || "3306",
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.replace(/^\//, ""),
  };
}

export function sqlValue(value: unknown) {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return `'${String(value).replaceAll("\\", "\\\\").replaceAll("'", "''")}'`;
}

export async function query(statement: string): Promise<string[][]> {
  const db = config();
  const { stdout } = await exec(
    "mysql",
    [
      "-h", db.host,
      "-P", db.port,
      "-u", db.user,
      `-p${db.password}`,
      "--batch",
      "--raw",
      "--silent",
      "--default-character-set=utf8mb4",
      db.database,
      "-e",
      statement,
    ],
    { windowsHide: true, maxBuffer: 10_000_000 },
  );
  if (!stdout.trim()) return [];
  return stdout.replaceAll("\r\n", "\n").trimEnd().split("\n").map((line) => line.split("\t"));
}

export type PublicUser = { id: string; username: string };

export async function findUserByUsername(username: string) {
  const rows = await query(
    `SELECT id, username, password_hash FROM users WHERE username = ${sqlValue(username)} LIMIT 1`,
  );
  const row = rows[0];
  if (!row) return undefined;
  return { id: row[0], username: row[1], passwordHash: row[2] };
}

export async function findUserById(id: string): Promise<PublicUser | null> {
  const rows = await query(`SELECT id, username FROM users WHERE id = ${sqlValue(id)} LIMIT 1`);
  const row = rows[0];
  return row ? { id: row[0], username: row[1] } : null;
}

export async function createUser(username: string, passwordHash: string): Promise<PublicUser> {
  const id = crypto.randomUUID();
  await query(
    `INSERT INTO users (id, username, password_hash) VALUES (${sqlValue(id)}, ${sqlValue(username)}, ${sqlValue(passwordHash)})`,
  );
  return { id, username };
}

export async function readProgress(userId: string, gameSlug: string) {
  const rows = await query(
    `SELECT payload FROM user_game_progress WHERE user_id = ${sqlValue(userId)} AND game_slug = ${sqlValue(gameSlug)} LIMIT 1`,
  );
  if (!rows[0]) return null;
  const raw = rows[0][0];
  return typeof raw === "string" ? JSON.parse(raw) : raw;
}

export async function writeProgress(userId: string, gameSlug: string, payload: unknown) {
  const json = sqlValue(JSON.stringify(payload));
  await query(
    `INSERT INTO user_game_progress (user_id, game_slug, payload)
     VALUES (${sqlValue(userId)}, ${sqlValue(gameSlug)}, ${json})
     ON DUPLICATE KEY UPDATE payload = ${json}`,
  );
}
