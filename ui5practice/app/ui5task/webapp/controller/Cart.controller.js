
sap.ui.define(["sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/ui/core/UIComponent"],
    function (Controller, MessageBox, MessageToast, Fragment, UIComponent) {
        return Controller.extend("ui5task.controller.Cart", {
            onInit() {
                const router = UIComponent.getRouterFor(this);
			    router.getRoute("cart").attachPatternMatched(this.onCalculateSummary, this);
            },
            onAddToCart(event) {
                const source = event.getSource();
                const selectedProduct = source.getBindingContext("cart");
                const productObject = selectedProduct.getObject();
                const cartModel = this.getOwnerComponent().getModel("cart");
                const cartItems = cartModel.getProperty("/items");
                const existingItemIndex = cartItems.findIndex(item => item.id === productObject.id);
                console.log(existingItemIndex);
                cartItems[existingItemIndex].quantity += 1;
                cartModel.setProperty("/items", cartItems);
                console.log(cartItems);
                this.onCalculateSummary()
            },
            onRemoveFromCart(event) {
                const source = event.getSource();
                const selectedProduct = source.getBindingContext("cart");
                const productObject = selectedProduct.getObject();
                const cartModel = this.getOwnerComponent().getModel("cart");
                const cartItems = cartModel.getProperty("/items");
                const existingItemIndex = cartItems.findIndex(item => item.id === productObject.id);
                console.log(existingItemIndex);
                cartItems[existingItemIndex].quantity -= 1;
                if (cartItems[existingItemIndex].quantity <= 0) {
                    cartItems.splice(existingItemIndex, 1);
                    console.log(cartItems);
                }
                cartModel.setProperty("/items", cartItems);
                console.log(cartItems);
                this.onCalculateSummary()
            },
            onCalculateSummary() {
                const cartModel = this.getOwnerComponent().getModel("cart");
                const cartItems = cartModel.getProperty("/items");
                const totalItems = cartItems.reduce((acc, e) => acc + e.quantity, 0);
                cartModel.setProperty("/summary/totalItems", totalItems);
                const subTotal = cartItems.reduce((acc, e) => acc + (e.price * e.quantity), 0);
                cartModel.setProperty("/summary/subTotal", subTotal);
                const tax = subTotal * 0.03;
                cartModel.setProperty("/summary/tax", tax);
                cartModel.setProperty("/summary/grandTotal", subTotal + tax);
                console.log("Summary", cartModel);

            },
            onPlaceOrder() {
                const cartModel = this.getOwnerComponent().getModel("cart");
                MessageBox.confirm("Are you sure you want to place the order?", {
                    async onClose(cartAction) {
                        console.log("action", cartAction);
                        if (cartAction == MessageBox.Action.OK) {
                            this.dialog ??= await Fragment.load({
                                name: "ui5task.view.OrderSuccess"
                            });
                            this.dialog.open();
                            setTimeout(() => {
                                this.dialog.close();
                                cartModel.setProperty("/items", [])
                                cartModel.setProperty("/summary", {
                                    totalItems: 0,
                                    subTotal: 0,
                                    tax: 0,
                                    grandTotal: 0
                                });
                                MessageToast.show("Order placed successfully!");
                                // const router = UIComponent.getRouterFor(this);
                                const router = this.getOwnerComponent().getRouter()
                                console.log("router:", router)
                                router.navTo("overview")
                            }, 3000);
                        }
                    }
                })
            }
        });
    })