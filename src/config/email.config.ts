import { registerAs } from '@nestjs/config';

interface IEmailConfig {
  host: string;
  api_port: number;
  front_port: number;
  auth: {
    mailgunKey?: string;
    mailgunHost?: string;
    sgMailKey?: string;
    testService: string;
    testUser: string;
    testPassword: string;
  };
}

export default registerAs('email', (): IEmailConfig => {
  const emailConfig: IEmailConfig = {
    host: process.env.HOST_URL,
    api_port: +process.env.API_PORT_0,
    front_port: +process.env.FRONT_PORT_0,
    auth: {
      mailgunKey: process.env.TEST ? null : process.env.MAILGUN_KEY,
      mailgunHost: process.env.TEST ? null : process.env.MAILGUN_HOST,
      sgMailKey: process.env.TEST ? null : process.env.SENDGRID_KEY,
      testService: process.env.EMAIL_SERVICE,
      testUser: process.env.EMAIL_AUTH_USER,
      testPassword: process.env.EMAIL_AUTH_PASSWORD,
    },
  };

  return emailConfig;
});
