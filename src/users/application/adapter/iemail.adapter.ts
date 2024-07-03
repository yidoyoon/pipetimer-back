export interface IEmailAdapter {
  sendSignupEmailToken: (email: string, token: string) => Promise<void>;
  sendResetPasswordToken: (email: string, token: string) => Promise<void>;
  sendChangeEmailToken: (newEmail: string, token: string) => Promise<void>;
}
