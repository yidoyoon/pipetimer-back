import * as dotenv from 'dotenv';
import * as path from 'path';
import { DataSource } from 'typeorm';

dotenv.config({
  path: path.resolve(
    __dirname,
    '../../env',
    process.env.NODE_ENV === 'development'
      ? '.development.env'
      : process.env.NODE_ENV === 'local-staging'
      ? '.local-staging.env'
      : process.env.NODE_ENV === 'staging'
      ? '.staging.env'
      : '.production.env'
  ),
});

export const ormConfig = new DataSource({
  type: 'mysql',
  host: process.env.DB_BASE_URL,
  port: +process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: ['dist/**/*.entity{.ts,.js}'],
  synchronize: Boolean(process.env.DB_SYNCHRONIZE),
  migrations: ['dist/migration/*{.ts,.js}'],
  timezone: 'Z',
});

export const ormTestConfig = new DataSource({
  type: 'mysql',
  host: process.env.DB_BASE_URL,
  port: +process.env.DB_TEST_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: ['dist/**/*.entity{.ts,.js}'],
  synchronize: Boolean(process.env.DB_SYNCHRONIZE_TEST),
  migrations: ['dist/migration/*{.ts,.js}'],
  timezone: 'Z',
});
