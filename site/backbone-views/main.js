// Represents the base-level view for the Sous web application.
var CtmlRotoMainView = Backbone.View.extend({
	// Since this is the base-level view, it is tied to the body of the page.
	el: "body",

	initialize: function() {
		_.bindAll(this, "loginCheck", "postDustRender");
		
		this.dustTemplate = new DustTemplate({
			backboneView: this,
			templateLinkId: "ctml-view-main"
		});
		
		this.yahooConsumerKey = 
			(window.location.host == "localhost" || window.location.host == "127.0.0.1")?
				this.developmentYahooConsumerKey : this.productionYahooConsumerKey;

		this.loginCheck();
	},

	loginCheck: function() {
		if(hello && _.isFunction(hello.init)) 
			hello.init({ yahoo: this.yahooConsumerKey });
		if(!_.isFunction(hello))
			throw "Hello.js is not loaded so login verification check can't be made.";

		var thisView = this;

		hello.on("auth.login", function(authorization) {
			thisView.render();
		}).login();
	},

	// Begins loading child views
	postDustRender: function() {
	},

	developmentYahooConsumerKey: "dj0yJmk9QVg0QU5pMDk5SWRyJmQ9WVdrOVZHbzVaMHhWTm5VbWNHbzlNQS0tJnM9Y29uc3VtZXJzZWNyZXQmeD1kZA--",
	productionYahooConsumerKey: "dj0yJmk9bGkwOXpJc3kxWnhYJmQ9WVdrOVVsWkhkR3RUTldFbWNHbzlNQS0tJnM9Y29uc3VtZXJzZWNyZXQmeD0yMQ--",
});

// Bootstraps the application
(function() {
	$(document).ready(function() { new CtmlRotoMainView(); });
})();