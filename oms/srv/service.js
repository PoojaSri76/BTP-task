const cds = require('@sap/cds');
const { message } = require('@sap/cds/lib/log/cds-error');
const { SELECT, INSERT, UPDATE } = require('@sap/cds/lib/ql/cds-ql');

module.exports = cds.service.impl(async function () {
    const { Customer, SupplierProduct, OrderHeader, OrderDetail, Payment, Inventory, ProductReturns, Refund } = this.entities;

    // validate customer
    this.before('CREATE', Customer, async (req) => {
        const { userEmail, customerName, phoneNo, addresses, password } = req.data;
        if (!userEmail || !customerName || !phoneNo || !addresses || !password) {
            return req.reject(400, "All fields are required")
        }
        const isExisting = await SELECT.one.from(Customer).where({ userEmail })
        if (isExisting) {
            return req.reject(400, "User already exist")
        }
    })

    // Actions
    // cancel order
    this.on('cancelOrder', async (req) => {
        const { ID } = req.data;
        const orderExist = await SELECT.one.from(OrderHeader).where({ ID })
        if (!orderExist) {
            return req.reject(404, "Can't find the order with this ID.");
        }
        if (orderExist.status == "Cancelled") {
            return req.reject(400, "This order was cancelled")
        }
        await UPDATE(OrderHeader).set({ status: 'Cancelled' }).where({ ID });
        await UPDATE(OrderDetail).set({ status: 'Cancelled' }).where({ order_ID: ID });
        await this.emit('amountRefund', { orderId: ID })        
    })

    // Return product
    this.after('CREATE', ProductReturns, async (data, req) => {
        if (data.returnType == 'Refund') {
            const refundResult = await this.emit('amountRefund', { orderId: data.order_ID });
            console.log(refundResult);
        }
    })

    // refund for both return and cancel
    this.on('amountRefund', async (req) => {
        const { orderId } = req.data;
        const payment = await SELECT.one.from(Payment).where({ order_ID: orderId });
        if (!payment || payment.paymentStatus != 'Paid') return {
            success: false,
            message: "Payment is not done for this order"
        };
        const productReturn = await SELECT.one.from(ProductReturns).where({ order_ID: orderId })        
        let returnId;
        let preDelivery = false;
        if (!productReturn) {
            returnId = null;
            preDelivery = true;
        } else {
            returnId = productReturn.ID;
        }
        let refund;
        if (preDelivery) {
            refund = await INSERT.into(Refund).entries({
                returnRef_ID: returnId,
                payment_ID: payment.ID,
                refundAmount: payment.amount,
                paymentStatus: 'Paid'
            })
        } else {
            const orderDetail = await SELECT.one.from(OrderDetail).where({ ID: productReturn.orderItem_ID }).columns(o => {
                o.quantity,
                    o.product(sp => {
                        sp.price
                    })
            })
            console.log("Order detail:",orderDetail);
            
            refund = await INSERT.into(Refund).entries({
                returnRef_ID: returnId,
                payment_ID: payment.ID,
                refundAmount: orderDetail.product.price/ orderDetail.quantity * productReturn.quantity,
                paymentStatus: 'Paid'
            })
        }

        return {
            success: true,
            message: `Refund completed, refund ID - ${refund.ID}`
        };
    })

    // processPayment
    this.on('processPayment', async (req) => {
        const { orderId, paymentMethod, amount } = req.data;
        const order = await cds.db.read(OrderHeader).where({ ID: orderId });
        if (!order) {
            return req.reject(404, "Order not found")
        }
        let paymentStatus;
        if (paymentMethod == 'Cash' || paymentMethod == 'Card') {
            paymentStatus = 'Pending'
        } else if (paymentMethod == 'UPI') {
            paymentStatus = 'Paid'
        }
        const insert = await INSERT.into(Payment).entries({
            order: orderId,
            paymentType: paymentMethod,
            paymentStatus: paymentStatus,
            amount: amount
        })
    })

    // functions
    // get orders by customer
    this.on('getCustomerOrders', async (req) => {
        const { ID } = req.data;
        const orders = await SELECT.from(OrderHeader).where({ customer_ID: ID }).columns(o => {
            o.ID,
                o.status,
                o.totalAmount,
                o.items(i => {
                    i.ID,
                        i.product(sp => {
                            sp.product(p => {
                                p.productName
                            })
                        }),
                        i.quantity,
                        i.price
                })
        })
        const customerOrders = orders.map(e => {
            const items = e.items.map(i => {
                return { product: i.product.product.productName, price: i.price, quantity: i.quantity, total: i.price * i.quantity }
            })
            return { orderID: e.ID, items, Amount: e.totalAmount }
        })
        return customerOrders
    })
    // get pending orders in the orderheader
    this.on('getPendingOrders', async () => {
        const pendingOrders = await SELECT.from(OrderHeader).where({ status: { in: ['Ordered', 'Shipped'] } });
        console.log(pendingOrders);
        return pendingOrders
    })
    // products with stock in a warehouse
    this.on('getProductInWarehouse', async (req) => {
        const { warehouseId } = req.data;
        const productsWithStock = await SELECT.from(Inventory)
            .where({ warehouse_ID: warehouseId })
            .columns(i => {
                i.product(sp => {
                    sp.product(p => {
                        p.productName
                    })
                }),
                    i.stockQuantity
            });

        console.log(productsWithStock);

        const result = productsWithStock.map(e => {
            return { product: e.product.product.productName, stockQuantity: e.stockQuantity }
        });
        console.log(result);

        return result
    })

    // mark as delivered
    this.on('markDelivered', async (req) => {
        const { ID } = req.data;
        await UPDATE(OrderHeader).set({ status: 'Delivered' }).where({ ID });
        await UPDATE(OrderDetail).set({ status: 'Delivered' }).where({order_ID: ID})
        return {
            success: true,
            message: "Order marked as delivered"
        }
    })

})