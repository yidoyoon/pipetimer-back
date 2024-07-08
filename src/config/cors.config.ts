import { registerAs } from '@nestjs/config';

export default registerAs('cors', () => ({
  origin: [
    `https://www.${process.env.HOST_URL}`,
    `https://${process.env.HOST_URL}`,
    `https://${process.env.HOST_URL}:${process.env.FRONT_PORT_0}`,
    `https://${process.env.HOST_URL}:${process.env.FRONT_PORT_2}`,
  ],
  credentials: true,
}));
