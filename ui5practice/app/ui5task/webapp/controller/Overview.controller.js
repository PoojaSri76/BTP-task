sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent"
], (Controller, UIComponent) => {
    "use strict";

    return Controller.extend("ui5task.controller.Overview", {
        onInit() {
        },
        onGoToCart() {
            const router = UIComponent.getRouterFor(this);
            router.navTo("cart");
        },
        onLogin(){
            const router = UIComponent.getRouterFor(this);
            router.navTo("login")
        }
    });
});