const LC = require('leanengine');

async function getUser(ctx) {
  const token = ctx.request.get('Authorization');
  if (!token) {
    throw new Error('ERROR_UNAUTHORIZED');
  } else {
    try {
      const user = await LC.User.become(token);
      return user;
    } catch(err) {
      throw new Error('ERROR_UNAUTHORIZED');
    }
  }
}

module.exports = { getUser };
