module.exports = (srv) => {
    const { Order, Product, OrderTimeline } = srv.entities;

    srv.before(['NEW', 'CREATE'], Order, async (req) => {
        console.log("Creating order...");
        const { quantity, shippingCharge, product_ID } = req.data;
        const product = await SELECT.one.from(Product).where({ ID: product_ID });
        if (!product) return req.reject(404, 'Product not found');
        req.data.pricePerUnit = product.price;
        req.data.subTotal = quantity * req.data.pricePerUnit;
        req.data.totalAmount = req.data.subTotal + shippingCharge;
        req.data.status = 'Ordered';

    })

    srv.on('orderDelivery', async (req) => {
        const ID = req.params[0].ID;
        console.log(ID);

        const updated = await UPDATE(Order).set({ status: 'Delivered' }).where({ ID });
        console.log(updated);

        if (updated == 1) {
            req.notify(`${ID} is updated as delivered`)
            // sap.m.MessageToast.show("Saved Successfully");
        } else {
            return req.error((404, 'order not found'));

        }
    })

    srv.after('CREATE', Order, (data, req) => {
        req.info('Order Created Successfully')
    })

    srv.after('UPDATE', Order, (data, req) => {
        req.info('Changes updated successfully')
    })

    srv.after('READ', Order, async (data) => {
        data.forEach(e => {
            if (e.totalAmount > 0) {
                e.amountPending = e.totalAmount - e.amountPaid;
            }
            if (e.status == 'Ordered') return e.criticality = 0;
            else if (e.status == 'Delivered') return e.criticality = 3;
            else if (e.status == 'Cancelled') return e.criticality = 1;
        })
    })

    // srv.on('insertOrderTimeline', async(req)=>{
    //     const {order_ID, status, note} = req.data;

    // })

    srv.on('cancelOrder', async (req) => {

        const { orderID, reason } = req.data;

        await UPDATE(Order)
            .set({
                status: 'Cancelled'
            })
            .where({ ID: orderID });

        await INSERT.into(OrderTimeline).entries({
            ID: 'T' + Date.now(),
            status: 'Cancelled',
            note: reason,
            order_ID: orderID
        });

        return 'Order Cancelled Successfully';
    });

    srv.on('getOrdersCount', async(req)=>{
        console.log("In function");
        
        const {status} = req.data;
        const delivered = await SELECT.from(Order).where({status});
        const count = delivered.length;
        console.log(count);
        
        req.info(count)
        return count
    })
}