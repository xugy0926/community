import passport from 'passport';
import config from '../config';
const GitHubStrategy = require('passport-github').Strategy;

export default function () {
  passport.serializeUser(function(user, done) {
    done(null, user);
  });

  passport.deserializeUser(function(user, done) {
    done(null, user);
  });

  passport.use(
    new GitHubStrategy(config.github, function(
      accessToken,
      refreshToken,
      profile,
      done
    ) {
      profile.accessToken = accessToken;
      done(null, profile);
    })
  );

  return passport.initialize();
}
