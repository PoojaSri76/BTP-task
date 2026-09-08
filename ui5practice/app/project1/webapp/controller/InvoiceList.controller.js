sap.ui.define(["sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel", "sap/ui/model/Filter", "sap/ui/model/FilterOperator", "sap/ui/core/UIComponent"], function (Controller, JSONModel, Filter, FilterOperator, UIComponent) {
	"use strict";

	const App = Controller.extend("ui5.tutorial.walkthrough.controller.App", {
		onInit() {
			const viewModel = new JSONModel({
				currency: "EUR"
			});
			this.getView()?.setModel(viewModel, "view");
		},
		onFilterInvoices(event) {
			// build filter array
			const filter = [];
			const query = event.getParameter("query");
			if (query) {
				filter.push(new Filter("ProductName", FilterOperator.Contains, query));
			}

			// filter binding
			const list = this.byId("invoiceList");
			const binding = list?.getBinding("items");
			binding?.filter(filter);
		},
        onPress(event) {
			const item = event.getSource(); 	// gets the ObjectListItem fired the event			
			const router = UIComponent.getRouterFor(this); // gets the router for this controller
			router.navTo("detail", { // navigates to the detail route - detail/{invoicePath}
				invoicePath: window.encodeURIComponent( 	// creates a URL-encoded string from the invoice path - invoices%2F1
					item.getBindingContext("invoice") 	// returns the binding context of the selected item
					.getPath() 	// returns "/invoice/1"
					.substring(1)) 	// removes the first character, resulting in "invoice/1"
			});
		}
	});
	;
	return App;
});