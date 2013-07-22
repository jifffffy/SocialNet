module.exports = function(app, models) {

	// -----------
	// POST /login
	// -----------
	app.post('/login', function(req, res) {
		console.log('login request');

		var email = req.param('email', null);
		var password = req.param('password', null);

		if (null == email || email.length < 1 || null == password || password.length < 1) {
			res.send(400);
			return;
		}

		models.Account.login(email, password, function(account) {
			if ( !account ) {
				res.send(401);
				return;
			}
			console.log('login was successful');
			req.session.loggedIn = true;
			req.session.accountId = account._id;
			res.send(account._id);
		});
	});

	// --------------
	// POST /register
	// --------------
	app.post('/register', function(req, res) {
		var firstName = req.param('firstName', '');
		var lastName = req.param('lastName', '');
		var email = req.param('email', null);
		var password = req.param('password', null);

		if (null == email || null == password) {
			res.send(400);
			return;
		}

		// Account.register has no callback, 200 code is
		// sent before the actual register function is performed.
		// TODO: implement a callback function
		models.Account.register(email, password, firstName, lastName);
		res.send(200);
	});

	// --------------------------
	// GET /account/authenticated
	// --------------------------
	app.get('/account/authenticated', function(req, res) {
		if (req.session.loggedIn) {
			res.send(req.session.accountId);
		} else {
			res.send(401);
		}
	});

	// --------------------
	// POST /forgotpassword
	// --------------------
	app.post('/forgotpassword', function(req, res) {
		var hostname = req.headers.host;
		var resetPasswordUrl = 'http://' + hostname + '/resetPassword';
		var email = req.param('email', null);

		if (null == email || email.length < 1) {
			res.send(400);
			return;
		}

		models.Account.forgotPassword(email, resetPasswordUrl, function(success) {
			if (success) {
				res.send(200);
			} else {
				res.send(404);
			}
		});
	});

	// ------------------
	// GET /resetPassword
	// ------------------
	app.get('/resetPassword', function(req, res) {
		var accountId = req.param('account', null);
		res.render('resetPassword.jade', {locals:{accountId: accountId}});
	});

	// -------------------
	// POST /resetPassword
	// -------------------
	app.post('/resetPassword', function(req, res) {
		var accountId = req.param('accountId', null);
		var password = req.param('password', null);
		if (null != accountId && null != password) {
			Account.changePassword(accountId, password);
		}
		res.render('resetPasswordSuccess.jade');
	});

} // module.exports