// Represents an asynchronously loaded Dust template.
var DustTemplate = klass(function(parameters) {
	this.compiledTemplateIdentifier = (new Date()).getMilliseconds().toString();
	this.error = null;
	this.pendingRenderRequests = [];
	this.pendingPostRenderCallbacks = [];
	this.templateIsLoaded = false;
	
	var templateLinkId = parameters? parameters.templateLinkId : null;
	var backboneView = parameters? parameters.backboneView : null;
	
	if(!templateLinkId) { this.error = "No ID for the script element containing the template was provided."; return; }
	
	var targetTemplateLink = $("#" + templateLinkId);
	if(!targetTemplateLink.length) { this.error = "No element with ID '" + templateLinkId + "' was found."; return; }
	
	var templateUrl = targetTemplateLink.attr("href");
	if(!templateUrl) { 
		this.error = "No 'src' attribute could be found on the element with ID '" + templateLinkId + "'.";
		return;
	}
	
	var thisTemplate = this;

	// Begins the retrieval of the file representing this template.
	$.get(templateUrl)
		.done(function(data, textStatus, jqXHR) {
			var templateSource = data;
			var compiledTemplate = dust.compile(templateSource, thisTemplate.compiledTemplateIdentifier);
			dust.loadSource(compiledTemplate);
			
			thisTemplate.templateIsLoaded = true;
			$.each(thisTemplate.pendingRenderRequests, function() { this(); });
		})
		.fail(function( jqXHR, textStatus, errorThrown) {
			thisTemplate.error = "Unable to load template at URL '" + templateUrl + "'. Error was: " + errorThrown;
			$.each(thisTemplate.pendingRenderRequests, function() { this(); });
		});
	
	// If Backbone view is provided, its render method is set up to render this template.
	if(backboneView) {		
		var thisTemplate = this;
		backboneView.render = function(context) {	
			if(!context && backboneView.model) context = backboneView.model;
			
			thisTemplate.render(context, function(error, output) {
				if(error) console.error(error);
				else {
					if(backboneView) {
						if(backboneView.dustOptions && backboneView.dustOptions.renderType) {
							switch(backboneView.dustOptions.renderType) {
								case "first":
									backboneView.$el.prepend(output);
									break;
								case "last":
									backboneView.$el.append(output);
									break;
								default:
									break;
							}
						}
						else backboneView.$el.html(output);
					}
					if(backboneView && backboneView.postDustRender) {
						// Short timeout allows transitions to take affect
						setTimeout(function() { backboneView.postDustRender(); }, 10);
					}
					if(thisTemplate.pendingPostRenderCallbacks.length > 0) {
						$.each(thisTemplate.pendingPostRenderCallbacks, function(index, callback) {
							// Short timeout allows transitions to take affect
							setTimeout(function() { callback(thisTemplate); }, 10);
						});
					}
				}
			});
		};
	}
})
.methods({
	render: function(context, callback) {
		// If no callback is provided, there is no point in rendering the template since this method will do nothing.
		var thisTemplate = this;
		if(callback) {
			var renderFunction = function() {
				if(thisTemplate.error) {
					callback(thisTemplate.error, null);
				}
				else {
					dust.render(thisTemplate.compiledTemplateIdentifier, context, function(error, output) {
						callback(
							error? "Error rendering the dust template. Error was: " + error : null,
							output);
					});
				}
			};
			
			// If the template is ready to go or an error was encountered, just renders it, otherwise adds it to the list of 
			// requests to process once the template *is* ready.
			if(!this.templateIsLoaded && !this.error) { this.pendingRenderRequests.push(renderFunction); }
			else { renderFunction(); }
		}
	},
	
	renderSuccess: function(callback) {
		// Validates that provided object is not null and is actually a function.
		if(callback && ({}).toString.call(callback) === '[object Function]') {
			this.pendingPostRenderCallbacks.push(callback);
		}
	}
});