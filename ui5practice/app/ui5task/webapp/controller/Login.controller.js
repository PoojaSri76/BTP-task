sap.ui.define(["sap/ui/core/mvc/Controller", "sap/ui/core/UIComponent"], function (Controller, UIComponent) {
    "use strict";
    return Controller.extend("ui5task.controller.Login",{
        onSubmit(){
            const router = UIComponent.getRouterFor(this);
            router.navTo("overview")
        }
    })
})