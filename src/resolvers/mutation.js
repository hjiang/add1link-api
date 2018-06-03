const LC = require('leanengine');
const { getUser } = require('./utils');
const title = require('url-to-title');

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
  // TODO: fetching title should be asynchronous. But this is sufficient for a userbase of one.
  link.set({
    ...args,
    title: args.title || await title(args.url),
    user
  });
  try {
    const savedLink = await link.save();
    return {
      id: savedLink.getObjectId(),
      url: savedLink.get('url'),
      title: savedLink.get('title'),
      user: mapUserToJson(user)
    };
  } catch (err) {
    console.error('ERROR %d: %s', err.code, err);
    throw new Error('ERROR_UNKNOWN');
  }
}

async function deleteLink(root, args, ctx) {
  const user = await getUser(ctx);
  const link = LC.Object.createWithoutData('Link', args.id);
  await link.fetch();
  if (link.get('user').getObjectId() !== user.getObjectId()) {
    throw new Error('ERROR_UNAUTHORIZED');
  }
  try {
    await link.destroy();
  } catch(err) {
    console.error('ERROR %d: %s', err.code, err);
    throw new Error('ERROR_UNKNOWN');
  }
  return args.id;
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

module.exports = { saveLink, signUp, login, deleteLink };
