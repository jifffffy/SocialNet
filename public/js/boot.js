require.config({
	
	paths: {
		jQuery: '/js/libs/jquery-1.10.2.min',
		Underscore: '/js/libs/underscore-min',
		Backbone: '/js/libs/backbone-min',
		text: '/js/libs/text',
		templates: '../templates',
		Sockets: '/socket.io/socket.io',

		SocialNetView: '/js/SocialNetView'
	},

	shim: {
		'Backbone': ['Underscore', 'jQuery'],
		'SocialNet': ['Backbone']
	}
});

require(['SocialNet'], function(SocialNet){
	SocialNet.initialize();
});