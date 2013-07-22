define(['text!templates/login.html'], function(loginTemplate) {
	var loginView = Backbone.View.extend({

			requireLogin: false,

			el: $('#content'),

			events: {
				"submit form": "login"
			},

			initialize: function(options) {
				this.socketEvents = options.socketEvents;
			},

			login: function() {
				
				var socketEvents = this.socketEvents;
				
				$.post('/login', {
					email: $('input[name=email]').val(), 
					password: $('input[name=password]').val(),
				}, function(data) {
					
					// Trigger app:loggedin event
					socketEvents.trigger('app:loggedin', data);
					// Redirect window to #index
					window.location.hash = 'index';

				}).error(function() {
					$("#error").text('Unable to login.');
					$("#error").slideDown();
				});
				
				return false;
			},

			render: function() {
				this.$el.html(loginTemplate);
				$("#error").hide();
				$("input[name=email]").focus();
			}
	});

	return loginView;
});