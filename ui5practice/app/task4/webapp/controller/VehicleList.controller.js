sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/export/Spreadsheet",
    "sap/ui/model/json/JSONModel"
], (Controller, Filter, FilterOperator, MessageToast, MessageBox, Spreadsheet, JSONModel) => {
    "use strict";

    return Controller.extend("task4.controller.VehicleList", {
        onInit() {
            const oViewModel = new sap.ui.model.json.JSONModel({
                editMode: false
            });

            this.getView().setModel(oViewModel, "view");
        },
        onSearch(event) {
            console.log("search...");

            const filter = [];
            const sQuery =
                event.getParameter("newValue");
            if (sQuery) {
                filter.push(
                    new Filter(
                        {
                            path: "name",
                            operator: FilterOperator.Contains,
                            value1: sQuery,
                            caseSensitive: false
                        }
                    )
                );
            }
            const table = this.byId("vehicleTable");
            const binding = table.getBinding("rows");
            binding.filter(filter);
        },
        async onAddVehicle() {
            this.addVehicleDialog ??= await this.loadFragment({
                name: "task4.view.AddVehicle"
            });

            this.addVehicleDialog.open();
        },

        onCancelAddVehicle() {
            this.addVehicleDialog.close();
        },
        async onSaveVehicle() {
            console.log("on save...");

            try {

                const oModel = this.getView().getModel();

                const oVehicle = {
                    vehicleId: this.byId("vehicleIdInput").getValue(),
                    name: this.byId("vehicleNameInput").getValue(),
                    state: this.byId("vehicleStateInput").getValue(),
                    newPrice: parseFloat(
                        this.byId("vehiclePriceInput").getValue()
                    )
                };

                // Get the Vehicles list binding
                const oListBinding = oModel.bindList("/Vehicles");

                // Create a transient context
                this.oCreateContext = oListBinding.create(oVehicle);

                // Send the request
                await oModel.submitBatch("$auto");

                await this.oCreateContext.created();

                MessageToast.show("Vehicle created successfully");
                this.oCreateContext = null;
                this.addVehicleDialog.close();

            } catch (error) {

                console.error(error);

                MessageToast.show("Vehicle creation failed");
            }
        },
        onEdit() {
            this.getView()
                .getModel("view")
                .setProperty("/editMode", true);
        },
        async onSave() {
            try {
                const oModel = this.getView().getModel();
                await oModel.submitBatch("$auto");
                MessageToast.show("Vehicles updated successfully");
                this.getView()
                    .getModel("view")
                    .setProperty("/editMode", false);
            } catch (error) {
                console.error(error);
                MessageToast.show("Failed to save changes");
            }
        },
        onDeleteVehicle() {
            const oTable = this.byId("vehicleTable");
            const aSelectedItems = oTable.getSelectedIndices();
            if (aSelectedItems.length === 0) {
                MessageToast.show("Please select at least one vehicle");
                return;
            }

            // Get vehicle IDs for confirmation
            const aVehicleIds = aSelectedItems.map(oItem => {
                return oTable
                    .getContextByIndex(oItem)
                    .getProperty("vehicleId");
            });
            MessageBox.confirm(
                `Are you sure you want to delete ${aSelectedItems.length} vehicle(s)?`,
                {
                    title: "Confirm Delete",
                    onClose: async (sAction) => {

                        if (sAction !== MessageBox.Action.OK) {
                            return;
                        }

                        try {
                            // Delete each selected vehicle
                            for (const oItem of aSelectedItems) {

                                const oContext =
                                    oTable.getContextByIndex(oItem);

                                await oContext.delete("$auto");
                            }

                            MessageToast.show(
                                `${aSelectedItems.length} vehicle(s) deleted successfully`
                            );
                            // Clear selection
                            oTable.removeSelections();
                        } catch (error) {
                            console.error(error);
                            MessageToast.show(
                                "Failed to delete vehicle(s)"
                            );
                        }
                    }
                }
            );
        },
        async onDocumentUpload(oEvent) {

            const oFile = oEvent.getParameter("files")[0];

            if (!oFile) {
                MessageToast.show("Please select a file");
                return;
            }

            try {

                // Get the FileUploader that triggered the event
                const oUploader = oEvent.getSource();

                // Get the row's binding context
                const oVehicleContext =
                    oUploader.getBindingContext();

                if (!oVehicleContext) {
                    MessageToast.show("Vehicle not found");
                    return;
                }

                // Get vehicle ID from that row
                const sVehicleId =
                    oVehicleContext.getProperty("vehicleId");

                console.log("Vehicle ID:", sVehicleId);
                console.log("File:", oFile.name);
                console.log("Type:", oFile.type);

                const oModel =
                    this.getView().getModel();

                // Create VehicleDocuments binding
                const oDocumentListBinding =
                    oModel.bindList("/VehicleDocuments");

                // Create document metadata
                const oDocumentContext =
                    oDocumentListBinding.create({
                        vehicle_vehicleId: sVehicleId,
                        fileName: oFile.name,
                        mediaType:
                            oFile.type || "application/octet-stream"
                    });

                // Wait for CAP to create the document
                await oDocumentContext.created();

                // Get generated document ID
                const sDocumentId =
                    oDocumentContext.getProperty("ID");

                console.log("Document ID:", sDocumentId);

                // Upload actual file content
                const sUrl =
                    `/odata/v4/vehicle/VehicleDocuments(${sDocumentId})/content`;

                const response = await fetch(sUrl, {
                    method: "PUT",
                    headers: {
                        "Content-Type":
                            oFile.type || "application/octet-stream"
                    },
                    body: oFile
                });

                if (!response.ok) {
                    throw new Error(
                        `Upload failed: ${response.status}`
                    );
                }

                MessageToast.show(
                    "Vehicle document uploaded successfully"
                );

                // Clear this particular uploader
                oUploader.clear();

            } catch (error) {

                console.error(
                    "Vehicle document upload failed:",
                    error
                );

                MessageToast.show(
                    "Vehicle document upload failed"
                );
            }
        },
        onExportExcel() {
            const aData = this.byId("vehicleTable").getBinding("rows");
            const aColumns = [
                { label: "Vehicle ID", property: "vehicleId" },
                { label: "Name", property: "name" },
                { label: "State", property: "state" },
                { label: "Old Price", property: "oldPrice", type: "Number" },
                { label: "New Price", property: "newPrice", type: "Number" },
            ];
            // create a Spreadsheet export object.
            const oSheet = new Spreadsheet({
                workbook: { columns: aColumns },
                dataSource: aData,
                fileName: "Vehicles_Export.xlsx"
            });
            // starts generating the Excel file.
            oSheet.build()
                .then(() => MessageToast.show("Export completed"))
                .finally(() => oSheet.destroy());
        },
        onFileChange(oEvent) {
            const oFile = oEvent.getParameter("files") && oEvent.getParameter("files")[0];
            if (!oFile) { return; }
            const sName = oFile.name.toLowerCase();
            console.log(sName);

            const oReader = new FileReader();
            if (sName.endsWith(".csv")) {
                oReader.onload = (e) => this._processCSV(e.target.result);
                oReader.readAsText(oFile);
            } else if (sName.endsWith(".xlsx") || sName.endsWith(".xls")) {
                oReader.onload = (e) => this._processExcel(e.target.result);
                oReader.readAsArrayBuffer(oFile);
            } else {
                MessageBox.error("Unsupported file type. Use .xlsx, .xls or .csv");
            }
            oEvent.getSource().clear(); // allow re-selecting the same filename later 
        },
        _processCSV(sCsvText) {
            try {
                const aLines = sCsvText
                    .split(/\r\n|\n/)
                    .filter(l => l.trim().length > 0);
                if (aLines.length < 2) {
                    throw new Error("No data rows found");
                }
                const aHeaders = aLines[0]
                    .split(",")
                    .map(h => h.trim());
                const aData = aLines.slice(1).map(sLine => {
                    const aCols = sLine
                        .split(",")
                        .map(c => c.trim());
                    const oRow = {};
                    aHeaders.forEach((sHeader, i) => {
                        oRow[sHeader] = this._castValue(aCols[i]);
                    });
                    return oRow;
                });

                // send the records to OData
                this._createVehicles(aData);

            } catch (oErr) {
                MessageBox.error(
                    "CSV parse error: " + oErr.message
                );
            }
        },
        _processExcel(oArrayBuffer) {

            if (typeof XLSX === "undefined") {

                MessageToast.show(
                    "XLSX library not loaded. Check index.html."
                );

                return;
            }

            try {

                const oWorkbook = XLSX.read(
                    oArrayBuffer,
                    {
                        type: "array"
                    }
                );

                const sFirstSheet =
                    oWorkbook.SheetNames[0];

                const oWorksheet =
                    oWorkbook.Sheets[sFirstSheet];

                const aData =
                    XLSX.utils.sheet_to_json(
                        oWorksheet,
                        {
                            defval: ""
                        }
                    );

                if (aData.length === 0) {
                    throw new Error("No data rows found");
                }

                console.log("Excel data:", aData);

                this._createVehicles(aData);

            } catch (oErr) {

                MessageBox.error(
                    "Excel parse error: " + oErr.message
                );
            }
        },
        _castValue(vVal) {
            if (vVal === undefined || vVal === "") {
                return vVal;
            }
            if (!isNaN(vVal) && vVal.trim() !== "") {
                return Number(vVal);
            }
            return vVal;
        },
        _createVehicles(aData) {
            const oModel = this.getView().getModel();
            const oListBinding = oModel.bindList("/Vehicles");
            const aPromises = aData.map(oData => {
                const oContext = oListBinding.create({
                    vehicleId: oData.vehicleId,
                    name: oData.name,
                    state: oData.state,
                    oldPrice: oData.oldPrice,
                    newPrice: oData.newPrice
                });
                return oContext.created();
            });

            Promise.all(aPromises)
                .then(() => {
                    MessageBox.success(
                        `${aData.length} vehicles imported successfully.`
                    );
                })
                .catch((oError) => {
                    console.error(
                        "Vehicle import failed:",
                        oError
                    );
                    MessageBox.error(
                        "Vehicle import failed."
                    );
                });
        },
        async onOverallSummary() {
            try {
                const oModel = this.getView().getModel();
                const oAction = oModel.bindContext("/overallSummary(...)");

                await oAction.execute();
                console.log("result:", oAction.getBoundContext().getObject());  //gives you the context associated with the result of the execute operation
                const value = oAction.getBoundContext().getObject().value;
                console.log("value:", value);
                
                this.overallSummary ??= await this.loadFragment({
                    name: "task4.view.OverallSummary"
                });
                const oSummary = new JSONModel({items: value});
                this.overallSummary.setModel(oSummary, "summary")
                this.overallSummary.open();
            } catch (error) {
                MessageBox.error(error)
                console.error("overallSummary failed:", error);
            }
        },
        onCloseSummary(){
                this.overallSummary.close();
        }
    });
});