import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as request from 'supertest';
import { DataSource } from 'typeorm';

import { AppModule } from '@/app.module';
import { UserEntity } from '@/users/infra/db/entity/user.entity';
import { CreateRandomObject } from '@/utils/test-object-builder.util';

jest.setTimeout(30000);

function extractExpires(cookies, cookieName) {
  const cookie = cookies.find((c) => c.includes(cookieName));

  if (cookie) {
    const expiresMatch = cookie.match(/Expires=([^;]+)/);
    if (expiresMatch) {
      const expires = new Date(expiresMatch[1]).getTime();
      return expires;
    }
  }
  return null;
}

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  const user = CreateRandomObject.RandomUserForSignup();
  const testServer = `https://${process.env.HOST_URL}:${process.env.API_PORT_0}/`;
  let cookies: string[];

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, TypeOrmModule.forFeature([UserEntity])],
    }).compile();

    app = moduleRef.createNestApplication();
    dataSource = moduleRef.get<DataSource>(DataSource);

    await app.init();
  });

  afterAll(async () => {
    await dataSource.dropDatabase();
    await app.close();
  });

  it('should register a user', async () => {
    const response = await request(testServer)
      .post('auth/register')
      .trustLocalhost(true)
      .send(user);

    expect(response.body).toEqual({ success: true });
  });

  it('should login as user', async () => {
    const response = await request(testServer)
      .post('auth/login')
      .trustLocalhost(true)
      .send({ email: user.email, password: user.password });

    cookies = response.headers['set-cookie'];

    expect(cookies).toBeDefined();
    expect(cookies.length).toBe(2);
  });

  it('should delete a user', async () => {
    const response = await request(testServer)
      .post('users/delete-account')
      .trustLocalhost(true)
      .send({ validation: 'Delete account' })
      .set('Cookie', cookies);

    cookies = response.headers['set-cookie'];
    const currentTimestamp = Date.now();
    const accessTokenExpires = extractExpires(cookies, 'accessToken');
    const refreshTokenExpires = extractExpires(cookies, 'refreshToken');

    expect(accessTokenExpires).toBeLessThan(currentTimestamp);
    expect(refreshTokenExpires).toBeLessThan(currentTimestamp);
  });
});
