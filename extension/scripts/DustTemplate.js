/*
	A template to which a hunk of JSON can be applied to generate HTML.
*/
var dustTemplateGloballyUniqueId = 0;

var DustTemplate = klass(function(templateName) {
	if(!templateName) throw new Error("Template name not provided when attempted to set up dust template.");
		
	dustTemplateGloballyUniqueId++;
	this.templateId = "dust-template-with-unique-id-of-" + dustTemplateGloballyUniqueId.toString();
	var templatePath = chrome.extension.getURL("views/" + templateName + ".dust");
	var thisTemplate = this;
	
	// These templates are being loaded from the Chrome extension's file store so this should be quick enough
	// to perform synchrously.
	$.ajax({
		async: false,
		url: templatePath
	})
	.done(function(data, textStatus, jqXHR) {
		dust.loadSource(dust.compile(data, thisTemplate.templateId));
	})
	.fail(function(jqXHR, textStatus, errorThrown) {
		thisTemplate.errorMessage = "Could not load template from path " + templatePath + ". Error was: " + errorThrown;
	});
})
.methods({
	/*
		Generates HTML from this template using the provided context.
		
		context - The JSON to use to populate values in the template.
		callback - The function to use when rendering has finished to eithe report errors or consume output.
	*/
	render: function(context, callback) {
		if(this.errorMessage) {
			if(callback) callback(this.errorMessage, null); else console.error(this.errorMessage);
		}
		else {
			dust.render(this.templateId, context, function(error, out) {
				if(callback) callback(
					error? "Error rendering dust template. Error reported by dust: " + error : null, out);
			});
		}
	}
});