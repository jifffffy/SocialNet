module.exports = function(app, models) {

	// --------------------------
	// GET /accounts/:id/contacts
	// --------------------------
	app.get('/accounts/:id/contacts', function(req, res) {
		var accountId = req.params.id == 'me' 
							? req.session.accountId 
							: req.params.id;
		models.Account.findById(accountId, function(account) {
			console.info('Sending ' + account.contacts.length + ' contacts');
			res.send(account.contacts);
		});
	});

	// --------------------------
	// GET /accounts/:id/activity
	// --------------------------
	app.get('/accounts/:id/activity', function(req, res) {
		var accountId = req.params.id == 'me' 
							? req.session.accountId 
							: req.params.id;
		models.Account.findById(accountId, function(account) {
			res.send(account.activity);
		});
	});

	// ------------------------
	// GET /accounts/:id/status
	// ------------------------
	app.get('/accounts/:id/status', function(req, res) {
		var accountId = req.params.id == 'me' 
							? req.session.accountId 
							: req.params.id;
		models.Account.findById(accountId, function(account) {
			res.send(account.status);
		});
	});

	// -------------------------
	// POST /accounts/:id/status
	// -------------------------
	app.post('/accounts/:id/status', function(req, res) {
		var accountId = req.params.id == 'me' 
							? req.session.accountId 
							: req.params.id;

		models.Account.findById(accountId, function(account) {
			status = {
				name: account.name,
				status: req.param('status', '')
			};
			account.status.push(status);
			account.activity.push(status);

			account.save(function (err){
				if (err) {
					console.log('Error saving account: ' + err);
				} else {
					app.triggerEvent('event:' + accountId, {
						from: accountId,
						data: status,
						action: 'status'
					});
				}
			});
		});

		// Async return
		res.send(200);
	});

	// ----------------------------
	// DELETE /accounts/:id/contact
	// ----------------------------
	app.delete('/accounts/:id/contact', function(req, res) {
		var accountId = req.params.id == 'me' 
							? req.session.accountId 
							: req.params.id;
		var contactId = req.param('contactId', null);

		if (null == contactId) {
			res.send(400);
			return;
		}

		models.Account.findById(accountId, function(account) {
			if (!account) return;
			models.Account.findById(contactId, function(contact) {
				if (!contact) return;
				models.Account.removeContact(account, contactId);
				models.Account.removeContact(contact, accountId);
			});
		});

		// Return immediately! (Not in callback)
		res.send(200);
	});

	// --------------------------
	// POST /accounts/:id/contact
	// --------------------------
	app.post('/accounts/:id/contact', function(req, res) {
		var accountId = req.params.id == 'me' 
							? req.session.accountId 
							: req.params.id;
		var contactId = req.param('contactId', null);

		if (null == contactId) {
			res.send(400);
			return;
		}

		models.Account.findById(accountId, function(account) {
			if (account) {
				models.Account.findById(contactId, function(contact) {
					models.Account.addContact(account, contact);
					models.Account.addContact(contact, account);
					account.save();
				});
			}
		});

		// Return immediately! (Not in callback)
		res.send(200);
	});

	// -----------------
	// GET /accounts/:id
	// -----------------
	app.get('/accounts/:id', function(req, res) {
		var accountId = req.params.id == 'me' 
							? req.session.accountId 
							: req.params.id;
		models.Account.findById(accountId, function(account) {
			if (accountId == 'me' 
				|| models.Account.hasContact(account, req.session.accountId)) {
				account.isFriend = true;
			}

			// ALERT: possible security breach
			// account password still inside object
			res.send(account);
		});
	});

} // end of module.exports