sap.ui.define(["sap/ui/core/mvc/Controller", "sap/m/MessageToast", "sap/ui/core/Fragment"], (Controller, MessageToast, Fragment) => {
    "use strict";

    return Controller.extend("ui5task.controller.Product", {
        onInit() {

        },
        onAddToCart(event) {
            const source = event.getSource();
            const selectedProduct = source.getBindingContext("product");
            const productObject = selectedProduct.getObject();
            const cartObject = { ...productObject, quantity: 1 };

            const cartModel = this.getOwnerComponent().getModel("cart");
            const cartItems = cartModel.getProperty("/items");

            const existingProduct = cartItems.find(item => item.id === productObject.id);
            if (existingProduct) {
                existingProduct.quantity++;
                console.log("Cartitems after update quantity",cartItems);
                
            } else {
                cartItems.push(cartObject);
            }
            cartModel.setProperty("/items", cartItems);
            console.log(cartItems);
            MessageToast.show(`${productObject.name} added to your cart`);
        },
        async onProductPress(event) {
            console.log("product press");

            this.dialog ??= await Fragment.load({
                name: "ui5task.view.ProductPopover",
                controller: this
            });
            this.getView().addDependent(this.dialog)
            const source = event.getSource();
            this.dialog.bindElement({ path: source.getBindingContext("product").getPath(), model: "product" })
            console.log(source.getBindingContext("product").getPath());
            console.log(this.dialog.getBindingContext("product"));

            this.dialog.openBy(source);

        }
    });
});