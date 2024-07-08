export function calculateExpirationTime(): number {
  return new Date(
    new Date().getTime() + +process.env.VERIFICATION_LIFETIME * 60 * 1000
  ).getTime();
}
