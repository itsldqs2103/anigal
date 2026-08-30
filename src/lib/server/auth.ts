import { randomBytes, scrypt, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';
import { sql } from './db';

const scryptAsync = promisify(scrypt);

const SESSION_DURATION = 60 * 60 * 24 * 30;

export type User = {
	id: string;
	email: string;
};

type PasswordHash = {
	salt: string;
	hash: string;
};

function normalizeEmail(email: string) {
	return email.trim().toLowerCase();
}

async function hashPassword(password: string): Promise<string> {
	const salt = randomBytes(16).toString('hex');

	const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;

	const result: PasswordHash = {
		salt,
		hash: derivedKey.toString('hex')
	};

	return JSON.stringify(result);
}

async function verifyPassword(password: string, storedPassword: string): Promise<boolean> {
	try {
		const parsed = JSON.parse(storedPassword) as PasswordHash;

		const derivedKey = (await scryptAsync(password, parsed.salt, 64)) as Buffer;
		const storedKey = Buffer.from(parsed.hash, 'hex');

		if (derivedKey.length !== storedKey.length) {
			return false;
		}

		return timingSafeEqual(derivedKey, storedKey);
	} catch {
		return false;
	}
}

function generateSessionToken() {
	return randomBytes(32).toString('base64url');
}

function hashSessionToken(token: string) {
	return createHash('sha256').update(token).digest('hex');
}

export async function createUser(email: string, password: string): Promise<User> {
	const normalizedEmail = normalizeEmail(email);
	const passwordHash = await hashPassword(password);

	const rows = await sql`
		INSERT INTO users (email, password_hash)
		VALUES (${normalizedEmail}, ${passwordHash})
		RETURNING id, email
	`;

	return rows[0] as User;
}

export async function findUserByEmail(
	email: string
): Promise<(User & { password_hash: string }) | null> {
	const normalizedEmail = normalizeEmail(email);

	const rows = await sql`
		SELECT id, email, password_hash
		FROM users
		WHERE email = ${normalizedEmail}
		LIMIT 1
	`;

	return (rows[0] as (User & { password_hash: string }) | undefined) ?? null;
}

export async function verifyUser(email: string, password: string): Promise<User | null> {
	const user = await findUserByEmail(email);

	if (!user) {
		return null;
	}

	const valid = await verifyPassword(password, user.password_hash);

	if (!valid) {
		return null;
	}

	return {
		id: user.id,
		email: user.email
	};
}

export async function createSession(userId: string): Promise<string> {
	const token = generateSessionToken();
	const sessionId = hashSessionToken(token);

	const expiresAt = new Date(Date.now() + SESSION_DURATION * 1000);

	await sql`
		INSERT INTO sessions (id, user_id, expires_at)
		VALUES (${sessionId}, ${userId}, ${expiresAt})
	`;

	return token;
}

export async function getUserFromSession(token: string): Promise<User | null> {
	const sessionId = hashSessionToken(token);

	const rows = await sql`
		SELECT
			u.id,
			u.email
		FROM sessions s
		INNER JOIN users u ON u.id = s.user_id
		WHERE s.id = ${sessionId}
			AND s.expires_at > now()
		LIMIT 1
	`;

	return (rows[0] as User | undefined) ?? null;
}

export async function deleteSession(token: string): Promise<void> {
	const sessionId = hashSessionToken(token);

	await sql`
		DELETE FROM sessions
		WHERE id = ${sessionId}
	`;
}

export async function deleteExpiredSessions(): Promise<void> {
	await sql`
		DELETE FROM sessions
		WHERE expires_at <= now()
	`;
}
