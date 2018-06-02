const LC = require('leanengine');
const { getUser } = require('./utils');

function mapUserToJson(user) {
  return {
    id: user.getObjectId(),
    email: user.getEmail(),
    name: user.getUsername()
  };
}

async function saveLink(root, args, ctx) {
  const user = await getUser(ctx);
  const Link = LC.Object.extend('Link');
  const link = new Link();
  link.set({
    ...args,
    user
  });
  const savedLink = await link.save();
  return {
    id: savedLink.getObjectId(),
    url: savedLink.get('url'),
    title: savedLink.get('title'),
    user: mapUserToJson(user)
  };
}

// TODO: create resolvers for User

const isBadPassword = (password) => password.length < 8;

async function signUp(root, args) {
  const user = new LC.User();
  const email = args.email;
  const password = args.password;
  user.setUsername(email);
  user.setPassword(password);
  user.setEmail(email);
  if (isBadPassword(password)) {
    throw new Error('ERROR_WEAK_PASSWORD');
  }
  try {
    const savedUser = await user.signUp();
    return {
      user: mapUserToJson(savedUser),
      token: savedUser.getSessionToken()
    };
  } catch (err) {
    switch (err.code) {
    case LC.Error.EMAIL_TAKEN:
      throw new Error('ERROR_EMAIL_TAKEN');
    case LC.Error.USERNAME_TAKEN:
      throw new Error('ERROR_EMAIL_TAKEN');
    case LC.Error.INVALID_EMAIL_ADDRESS:
      throw new Error('ERROR_INVALID_EMAIL');
    default:
      console.error('ERROR %d: %s', err.code, err);
      throw new Error('ERROR_UNKNOWN');
    }
  }
}

async function login(root, args) {
  try {
    const user = await LC.User.logIn(args.email, args.password);
    return {
      user: {
        id: user.getObjectId(),
        email: user.getEmail(),
        name: user.getUsername()
      },
      token: user.getSessionToken()
    };
  } catch (err) {
    // TODO: More fine-grained error handling
    console.error(err);
    throw new Error('ERROR_CREDENTIAL_REJECTED');
  }
}

module.exports = { saveLink, signUp, login };
