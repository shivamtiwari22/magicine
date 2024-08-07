
import passport from 'passport';
import { Strategy as FacebookStrategy } from 'passport-facebook';

passport.use(
	new FacebookStrategy(
		{
			clientID: process.env.FACEBOOK_APP_ID,
			clientSecret: process.env.FACEBOOK_APP_SECRET,
			callbackURL: "http://localhost:5000/api/user/facebook/callback",
			profileFields: ['id', 'displayName', 'photos', 'email']
		},
		function (accessToken, refreshToken, profile, callback) {
			console.log('Profile Data')
			// console.log(profile)
			callback(null, profile);
		}
	)
);

passport.serializeUser((user, done) => {
	done(null, user);
});

passport.deserializeUser((user, done) => {
	done(null, user);
});
