import { verifyPassword } from './password-util';

const password = 'testtest';
const hashedPassword =
  '$argon2id$v=19$m=65536,t=3,p=4$DqXAK7MFhkfZ5Umd81XjMQ$qv9VUeqv6oLNvsmvwnfpv9KGOz2W6Kw57IEtK455I7s';
const taintedPassword =
  '$argon2id$v=19$m=65536,t=3,p=4$DqXAK7MFhkfZ5Umd81XjMQ$qv9VUeqv6oLNvsmvwnfpv9KGOz2W6Kw57IEtK455I6s';

describe('verifyPassword', () => {
  it('should check the password is valid', async () => {
    // Given
    // When
    const expected1 = await verifyPassword(hashedPassword, password);
    const expected2 = await verifyPassword(taintedPassword, password);
    // Then
    expect(expected1).toEqual(true);
    expect(expected2).toEqual(false);
  });
});
