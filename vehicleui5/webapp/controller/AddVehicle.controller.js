sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/core/routing/History",
    "sap/m/MessageBox"
], (Controller, UIComponent, JSONModel, MessageToast, History,MessageBox) => {
    "use strict";

    return Controller.extend("vehicleui5.controller.AddVehicle", {
        onInit() {
            const oVehicleModel = new JSONModel({
                name: "",
                brand: "",
                model: "",
                year: null,
                color: "",
                fuelType: "",
                transmission: "",
                mileage: null,
                newPrice: null,
                state: "",
                oldPrice: null
            });
            this.getView().setModel(oVehicleModel, "vehicleTempJson")
        },
        onNavBack() {

            this.onClear()
            
			const history = History.getInstance();
			const previousHash = history.getPreviousHash();
			if (previousHash !== undefined) {
				window.history.go(-1);
			} else {
				const router = UIComponent.getRouterFor(this);
				router.navTo("Routeoverview", {}, true);
			}
		},
        onWizardNavBack() {
            const container = this.byId("wizardContainer");
            const page = this.byId("addVehicleWizard");
            container.to(page)
        },
        onHandleAdd() {
            const container = this.byId("wizardContainer");
            // console.log(nav);
            const page = this.byId("reviewPage");
            // console.log(page);
            container.to(page)

        },
        onClear() {
            const wiz = this.byId("vehicleWizard");
            wiz.discardProgress(this.byId("basicInfo"));
            wiz.discardProgress(this.byId("specifications"));
            wiz.discardProgress(this.byId("pricing"));
            wiz.discardProgress(this.byId("availability"));
             // wiz.goToStep(this.byId("basicInfo"))
            const oModel = this.getView().getModel("vehicleTempJson");
            oModel.setData({
                name: "",
                brand: "",
                model: "",
                year: null,
                color: "",
                fuelType: "",
                transmission: "",
                mileage: null,
                newPrice: null,
                state: "",
                oldPrice: null
            });
            const container = this.byId("wizardContainer");
            const page = this.byId("addVehicleWizard");
            container.to(page)
        },
        onDiscard() {
            MessageBox.warning("You have unsaved changes. Are you sure you want to leave?",
                {
                    actions:["Discard", MessageBox.Action.CANCEL],
                    emphasizedAction: MessageBox.Action.CANCEL,
                    onClose: (sAction)=> {
                        if(sAction == "Discard"){
                            this.onClear()
                        }
                    }
                }
            )
        },
        async onAddVehicle() {
            try {
                const oVehicleData = this.getView()
                    .getModel("vehicleTempJson")
                    .getData();

                console.log(oVehicleData);

                const oODataModel = this.getView().getModel();
                const oListBinding = oODataModel.bindList("/Vehicle");

                // Create the vehicle
                const oContext = oListBinding.create(oVehicleData);

                await oODataModel.submitBatch("$auto");

                await oContext.created();

                MessageToast.show("Vehicle created successfully");
                this.onClear()
                this.oContext = null;
                const router = UIComponent.getRouterFor(this);
                router.navTo("Routeoverview");

            } catch (error) {
                console.error(error);
                MessageToast.show("Vehicle creation failed");
            }
        }

    });
});