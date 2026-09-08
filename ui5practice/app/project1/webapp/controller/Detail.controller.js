sap.ui.define(["sap/ui/core/mvc/Controller", "sap/ui/core/UIComponent", "sap/ui/core/routing/History"], function (Controller, UIComponent, History) {
	"use strict";

	const Detail = Controller.extend("ui5.tutorial.walkthrough.controller.Detail", {
		onInit() {
			const router = UIComponent.getRouterFor(this);	// gets the app router for this controller, has all the routes in it
			router.getRoute("detail")	// gets the route named "detail"
			.attachPatternMatched(this.onObjectMatched, this); // registers the onObjectMatched() to be called when the route is matched
		},
		onObjectMatched(event) {
			this.getView().bindElement({
				path: "/" + window.decodeURIComponent(event.getParameter("arguments").invoicePath),	// gets the invoicePath argument from the route URL and decodes it, e.g. invoices%2F1 becomes invoices/1
				model: "invoice"
			});
		},
        onNavBack() {
			const history = History.getInstance();	//gets the history instance - previous routes
			const previousHash = history.getPreviousHash();
			if (previousHash !== undefined) {
				window.history.go(-1); //use browser history to go back to the previous page
			} else {
				const router = UIComponent.getRouterFor(this);
				router.navTo("overview", {}, true); //navigate to the overview route, replace the current history entry
			}
		}
	});
	return Detail;
});