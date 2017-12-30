import User from '../data/models/User';
import DNSUser from '../data/models/DNSUser';

export default {
  authenticate(u, p) {
    return User.findOne({ username: u })
      .then((user) => {
        if (!user) return { error: 'Authentication failed' };
        return user.checkPassword(p)
          .then((res) => {
            if (res) {
              const { fullName, username, isAdmin, _id } = user;
              return { fullName, username, isAdmin, _id };
            }
            return { error: 'Authentication failed' };
          });
      })
      .catch(e => ({ error: e.message }));
  },
  register({ fullName, username, password, isAdmin }) {
    return User.create({ fullName, username, password, isAdmin });
  },
  authenticateDNSUser(u, p) {
    return DNSUser.findOne({ username: u })
      .then((user) => {
        if (!user) return { error: 'Authentication failed' };
        return user.checkPassword(p)
          .then((res) => {
            if (res) {
              return { username: u };
            }
            return { error: 'Authentication failed' };
          });
      })
      .catch(e => ({ error: e.message }));
  },
  registerDNSUser({ username, password }) {
    return DNSUser.create({ username, password });
  },
};
