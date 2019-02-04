const { verify } = require('jsonwebtoken');
const { prisma } = require('./generated/prisma-client')

const APP_SECRET = prisma._secret;

class AuthError extends Error {
  constructor() {
    super('Not authorized')
  }
};

function getUserId(context) {
  const Authorization = context.request.get('Authorization');
  if (Authorization) {
    const token = Authorization.replace('Bearer ', '');
    const verifiedToken = verify(token, APP_SECRET);
    return verifiedToken && verifiedToken.userId;
  }
}

module.exports = {
  getUserId,
  APP_SECRET,
};
