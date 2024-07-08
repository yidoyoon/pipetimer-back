import session from 'express-session';

export type Session = session.Session & Partial<session.SessionData>;
export type RedisExec = [error: Error, result: unknown];
