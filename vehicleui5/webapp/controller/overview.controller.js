sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], (Controller, UIComponent, Filter, FilterOperator) => {
    "use strict";

    return Controller.extend("vehicleui5.controller.overview", {
        onInit() {
        },
        onAddVehicle() {
            console.log("Add vehicle.....");

            const router = UIComponent.getRouterFor(this);
            router.navTo("AddVehicleView");
        },
        onDashboard () {
            console.log("Dashboard.....");

            const router = UIComponent.getRouterFor(this);
            router.navTo("Dashboard");
        },
        onFilterSelect(event) {
            const filter = [];
            const query = event.getParameter("key");
            const view = this.byId("listView");
            const list = view.byId("vehicleList");
            const binding = list?.getBinding("items");
            if (query && query != "All") {
                filter.push(new Filter("state", FilterOperator.Contains, query));
            }
            console.log("filter event:", filter);
            binding?.filter(filter);
        }
    });
});