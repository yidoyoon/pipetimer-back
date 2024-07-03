import * as argon2 from '@node-rs/argon2';

export const verifyPassword = async (
  hashedPassword: string,
  password: string
): Promise<boolean> => {
  return await argon2.verify(hashedPassword, password);
};
