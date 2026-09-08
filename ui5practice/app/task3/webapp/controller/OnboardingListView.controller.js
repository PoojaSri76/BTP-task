sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast"
], (Controller, Filter, FilterOperator, MessageToast) => {
    "use strict";

    return Controller.extend("task3.controller.OnboardingListView", {
        onInit() {
        },
        onSearch(event) {
            console.log("Search function...");

            const filter = [];
            const sQuery =
                event.getParameter("newValue");
            if (sQuery) {
                filter.push(
                    new Filter(
                        {
                            path: "firstName",
                            operator: FilterOperator.Contains,
                            value1: sQuery,
                            caseSensitive: false
                        }
                    )
                );
            }
            const table =
                this.byId("employeeTable");
            const binding =
                table.getBinding("items");
            binding.filter(filter);
        },
        onEmployeePress(event) {
            const source = event.getSource();
            const context = source.getBindingContext();
            const path = context.getPath();

            const detailForm = this.byId("employeeDetail")

            detailForm.bindElement({
                path: path
            });

            detailForm.setVisible(true);

        },
        onCloseDetail() {

            const detail =
                this.byId("employeeDetail");

            detail.setVisible(false);
            detail.unbindElement();
        },
        onSave() {
            const oModel = this.getView().getModel();
            oModel.submitBatch("$auto")
                .then(() => {
                    MessageToast.show(
                        "Employee updated successfully"
                    );
                })
                .catch((error) => {
                    sap.m.MessageBox.error(
                        "Failed to update employee"
                    );
                    console.error(error);
                });
        },
        async onDocumentUpload(oEvent) {

            const oFile = oEvent.getParameter("files")[0];

            if (!oFile) {
                MessageToast.show("Please select a file");
                return;
            }

            try {

                // Get selected employee
                const oEmployeeContext =
                    this.byId("employeeDetail").getBindingContext();

                if (!oEmployeeContext) {
                    MessageToast.show(
                        "Please select an employee first."
                    );
                    return;
                }

                // Employee ID
                const sEmployeeId =
                    oEmployeeContext.getProperty("ID");

                console.log("Employee ID:", sEmployeeId);
                console.log("File:", oFile.name);
                console.log("Type:", oFile.type);

                // Get OData V4 model
                const oModel =
                    this.getView().getModel();

                // Create Documents binding
                const oDocumentListBinding =
                    oModel.bindList("/Documents");

                // Create document metadata
                const oDocumentContext =
                    oDocumentListBinding.create({
                        employee_ID: sEmployeeId,
                        fileName: oFile.name,
                        mediaType:
                            oFile.type || "application/octet-stream",
                        uploadedAt: new Date().toISOString()
                    });

                // Wait until CAP creates the document
                await oDocumentContext.created();

                // Get generated Document ID
                const sDocumentId =
                    oDocumentContext.getProperty("ID");

                console.log(
                    "Document ID:",
                    sDocumentId
                );

                // Upload actual binary file
                const sUrl =
                    `/odata/v4/onboarding/Documents(${sDocumentId})/content`;

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
                    "Document uploaded successfully"
                );

                // Clear selected file
                this.selectedFile = null;

                // Clear FileUploader
                this.byId("documentUploader").clear();

            } catch (error) {

                console.error(
                    "Document upload failed:",
                    error
                );

                MessageToast.show(
                    "Document upload failed"
                );
            }
        }
    });
});