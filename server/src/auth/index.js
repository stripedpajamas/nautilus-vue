import User from '../data/models/User';

export default {
  authenticate(u, p) {
    return User.findOne({ username: u })
      .then((user) => {
        if (!user) return { error: 'Authentication failed' };
        return user.checkPassword(p)
          .then((res) => {
            if (res) {
              const { fullName, username, isAdmin } = user;
              return { fullName, username, isAdmin };
            }
            return { error: 'Authentication failed' };
          });
      })
      .catch(e => ({ error: e.message }));
  },
  register({ fullName, username, password, isAdmin }) {
    return User.create({ fullName, username, password, isAdmin });
  },
};
