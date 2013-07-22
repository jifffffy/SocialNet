define(['SocialNetView', 'views/contact', 'text!templates/contacts.html'], 
	function(SocialNetView, ContactView, contactsTemplate) {

	var contactsView = SocialNetView.extend({
		el: $('#content'),

		initialize: function() {
			// Change from reset to sync
			// It seems backbone would catch sync event with no problem
			this.collection.on('sync', this.renderCollection, this);
		},

		render: function() {
			this.$el.html(contactsTemplate);
		},

		renderCollection: function(collection) {
			collection.each(function(contact) {
				var statusHtml = (new ContactView(
												{ removeButton: true, model: contact }
												)).render().el;
				$(statusHtml).appendTo('.contacts_list');
			});
		}
	});

	return contactsView;
});