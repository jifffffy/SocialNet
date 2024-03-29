module.exports = function(app, config, mongoose, nodemailer) {

	var crypto = require('crypto');

	var Status = new mongoose.Schema({
		name: {
			first: 				{ type: String },
			last: 				{ type: String },
			full: 				{ type: String }
		},
		status: 				{ type: String }
	});



	var Contact = new mongoose.Schema({
		name: {
			first: 				{ type: String },
			last: 				{ type: String }
		},
		accountId: 				{ type: mongoose.Schema.ObjectId },
		added:  				{ type: Date },
		updated: 				{ type: Date }
	}, {
		toJSON:  				{ virtuals: true },
		toObject: 				{ virtuals: true }
	});

	Contact.virtual('online').get(function() {
		return app.isAccountOnline(this.get('accountId'));
	});

	var AccountSchema = new mongoose.Schema({

		email: 					{ type: String, unique: true },
		password: 				{ type: String },
		name: {
			first: 				{ type: String },
			last:  				{ type: String },
			full: 				{ type: String }  
		},
		birthday: {
			day: 				{ type: Number, min: 1, max: 31, required: false },
			month: 				{ type: Number, min: 1, max: 12, required: false },
			year: 				{ type: Number }
		},
		photoUrl: 				{ type: String },
		biography: 				{ type: String },
		contacts: 				[Contact],
		status: 				[Status],
		activity: 				[Status]
	});

	var Account = mongoose.model('Account', AccountSchema);

	var registerCallback = function(err) {
		if (err) {
			return console.log(err);
		}
		return console.log('Account was created');
	};

	var changePassword = function(accountId, newpassword) {

		var shaSum = crypto.createHash('sha256');
		shaSum.update(newpassword);

		var hashedPassword = shaSum.digest('hex');

		Account.update(
			{_id: accountId},
			{$set: {password: hashedPassword}},
			{upsert: false},
			function changePasswordCallback(err) {
				if (err) {
					console.log(err);
				}
				console.log('Change password done for account ' + accountId);
			}
		);

	};

	var forgotPassword = function(email, resetPasswordUrl, callback) {

		var user = Account.findOne(
			{email: email}, 
			function findAccount(err, doc) {
				if (err) {
					// Email address does not link to a valid user
					callback(false);
				} else {
					var smtpTransport = nodemailer.createTransport('SMTP', config.mail);
					resetPasswordUrl += '?account=' + doc._id;
					smtpTransport.sendMail(
						{
							from: 'davidiamyou@gmail.com',
							to: doc.email,
							subject: 'SocialNet Password Request',
							text: 'Click here to reset your password: ' + resetPasswordUrl  
						}, 
						function forgotPasswordResult(err){
							if (err) {
								callback(false);
							} else {
								callback(true);
							}
						}
					);
				}
			}
		);
	};

	var login = function(email, password, callback) {

		var shaSum = crypto.createHash('sha256');
		shaSum.update(password);
		Account.findOne(
			{
				email: email, 
				password: shaSum.digest('hex')
			},
			function(err, doc) {
				callback(doc);
			}
		);
	};

	var register = function(email, password, firstName, lastName) {

		var shaSum = crypto.createHash('sha256');
		shaSum.update(password);

		console.log('Registering ' + email);

		var user = new Account({
			email: email,
			name: {
				first: firstName,
				last: lastName,
				full: firstName + ' ' + lastName
			},
			password: shaSum.digest('hex')
		});
		user.save(registerCallback);

		console.log('Save command was sent');
	};

	var findById = function(accountId, callback) {
		Account.findOne({_id: accountId}, function(err, doc) {
			callback(doc);
		});
	};

	var findByString = function(searchStr, callback) {
		var searchRegex = new RegExp(searchStr, 'i');
		Account.find({
			$or: [
				{ 'name.full': 	{ $regex: searchRegex } },
				{ email: 		{ $regex: searchRegex } }
			]
		}, callback);
	};

	var addContact = function(account, addcontact) {
		contact = {
			name: {
				first: addcontact.name.first,
				last:  addcontact.name.last
			},
			accountId: addcontact._id,
			added: new Date(),
			updated: new Date()
		};
		account.contacts.push(contact);

		account.save(function(err) {
			if (err) {
				console.log('Error saving account: ' + err);
			}
		});
	};

	var removeContact = function(account, contactId) {
		if (null == account.contacts) return;

		account.contacts.forEach(function(contact) {
			if (contact.accountId == contactId) {
				accounts.contacts.remove(contact);
			}
		});

		account.save();
	};

	var hasContact = function(account, contactId) {
		if (null == account.contacts) return false;

		account.contacts.forEach(function(contact) {
			if (contact.accountId == contactId) {
				return true;
			}
		});

		return false;
	};

	return {
		findById: findById,
		findByString: findByString,
		addContact: addContact,
		removeContact: removeContact,
		hasContact: hasContact,
		register: register,
		forgotPassword: forgotPassword,
		changePassword: changePassword,
		login: login,
		Account: Account
	}
}