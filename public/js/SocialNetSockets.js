define(['Sockets', 'models/ContactCollection', 'views/chat'], function(sio, ContactCollection, ChatView) {

	var SocialNetSockets = function(eventDispatcher) {
		var socket = null;
		var accountId = null;

		var connectSocket = function(socketAccountId) {
			
			accountId = socketAccountId;
			socket = io.connect();

			socket.on('connect_failed', function(reason) {
				console.error('unable to connect', reason);
			}).on('connect', function() {
				
				console.info('successfully established a connection');

				// socket:chat is triggered when a user sends
				// a chat to any of his contacts
				eventDispatcher.bind('socket:chat', sendChat);
				
				// trigger both events for interested observer
				// to process incoming chat data from server
				socket.on('chatserver', function(data) {
					eventDispatcher.trigger('socket:chat:start:' + data.from);
					eventDispatcher.trigger('socket:chat:in:' + data.from, data);
				});
				
				socket.on('contactEvent', handleContactEvent);

				// start chat view and fetch contacts data
				var contactsCollection = new ContactCollection();
				contactsCollection.url = '/accounts/me/contacts';
				var chatView = new ChatView({ collection: contactsCollection, socketEvents: eventDispatcher});
				chatView.render();
				contactsCollection.fetch();
			});
		};

		var handleContactEvent = function(eventObj) {
			var eventName = eventObj.action + ':' + eventObj.from;
			eventDispatcher.trigger(eventName, eventObj);

			if (eventObj.from == accountId) {
				eventName = eventObj.action + ':me';
				eventDispatcher.trigger(eventName, eventObj);
			}
		};

		var sendChat = function(payload) {
			if (null != socket) {
				socket.emit('chatclient', payload);
			}
		};

		// connect socket on app:loggedin event
		eventDispatcher.bind('app:loggedin', connectSocket);
	}

	return {
		initialize: function(eventDispatcher) {
			SocialNetSockets(eventDispatcher);
		}
	};

});