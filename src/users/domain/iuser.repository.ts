import { DataSource, DeleteResult, UpdateResult } from 'typeorm';

import { User, UserJwt, UserWithoutPassword } from '@/users/domain/user.model';

export interface IUserRepository {
  findByEmail: (email: string) => Promise<User | null>;
  findById: (id: string) => Promise<UserJwt | null>;
  findByEmailAndPassword: (
    email: string,
    password: string
  ) => Promise<UserWithoutPassword>;
  findByUsername: (name: string) => Promise<UserWithoutPassword | null>;
  findBySignupToken: (token: string) => Promise<UserWithoutPassword | null>;
  findByResetPasswordToken: (
    token: string
  ) => Promise<UserWithoutPassword | null>;
  findByChangeEmailToken: (
    token: string
  ) => Promise<UserWithoutPassword | null>;
  findByToken: (
    event: string,
    token: string
  ) => Promise<UserWithoutPassword | null>;
  registerUser: (user: User) => Promise<UserWithoutPassword>;
  deleteUser: (email: string) => Promise<DeleteResult>;
  changePassword: (
    id: string,
    token: string,
    password: string
  ) => Promise<UpdateResult>;
  verifySignupToken: (id: string, token: string) => Promise<UpdateResult>;
  changeEmail: (
    id: string,
    newEmail: string,
    token: string
  ) => Promise<UpdateResult>;
  sendResetPasswordToken: (email: string) => Promise<UpdateResult>;
  sendChangeEmailToken: (
    oldEmail: string,
    newEmail: string
  ) => Promise<UpdateResult>;
  renewSignupToken: (
    email: string,
    oldSignupToken: string
  ) => Promise<UpdateResult>;
  updateUser: (
    criteria: object,
    partialEntity: object
  ) => Promise<UpdateResult>;
  getDataSource: () => DataSource;
}
