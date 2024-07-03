export const tokenExtractor = (tokenTypes: string) => (req) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies[tokenTypes];
  }

  return token;
};
