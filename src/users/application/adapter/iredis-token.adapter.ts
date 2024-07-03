import Redis from 'ioredis';

export interface IRedisTokenAdapter {
  setPXAT: (key: string, value: string, duration?: number) => Promise<'OK'>;
  getPexpiretime: (key: string) => Promise<number>;
  getValue: (key: string) => Promise<string>;
  deleteValue: (key: string) => Promise<number>;
  renameToken: (oldToken: string, newToken: string) => Promise<'OK'>;
  getClient: () => Promise<Redis>;
}
