const { executeHttpRequest } = require('@sap-cloud-sdk/http-client');
const cds = require('@sap/cds');
const { SELECT, UPDATE } = require('@sap/cds/lib/ql/cds-ql');
module.exports = cds.service.impl(async function () {
    console.log(this.name);

    if (this.name !== 'VehicleService') return;
    const { Vehicle, State, Dealer, Customer, Invoice, Order, Discount } = this.entities;

    const geocode = await cds.connect.to('geo');

    this.before('CREATE', Dealer, async (req) => {
        const { address_amenity,
            address_street,
            address_city,
            address_county,
            address_state,
            address_country,
            address_postalcode } = req.data;
        try {
            const res = await geocode.send({
                // event: 'getStructuredLocation',
                method: 'POST',
                path: '/odata/v4/geocode/getStructuredLocation',
                data: {
                    // amenity: address_amenity,
                    street: address_street,
                    city: address_city,
                    county: address_county,
                    state: address_state,
                    country: address_country,
                    postalcode: address_postalcode
                },
                
            })
            console.log("Response", res);

            const {latitude, longitude} = res;
            req.data.latitude = latitude;
            req.data.longitude = longitude;
        } catch (error) {
            console.log(error);
        }

        // try {
        //     const res = await executeHttpRequest(
        //         {
        //             destinationName: 'geocoding',
        //             destination: {
        //                 url: 'https://961f0509trial-dev-task6-srv.cfapps.us10-001.hana.ondemand.com'
        //             }
        //         },
        //         {
        //             method: 'POST',
        //             url: '/odata/v4/geocode/getStructuredLocation',
        //             data: {
        //                 street: address_street,
        //                 city: address_city,
        //                 state: address_state,
        //                 country: address_country,
        //                 postalcode: address_postalcode
        //             }
        //         })
        //     console.log(res);

        // } catch (error) {
        //     console.log(error);

        // }

    })

    // state based ID 
    this.before('CREATE', Vehicle, async (req) => {
        const { dealer_ID, state_ID } = req.data;
        const state = await SELECT.one.from(State).where({ ID: state_ID });
        const dealerDetail = await SELECT.one.from(Dealer).where({ ID: dealer_ID });
        if (!dealerDetail) {
            req.reject(404, "Dealer not found")
        }
        const count = await SELECT.from(Vehicle).columns('count(*) as total').where({ state_ID });
        console.log(count);
        req.data.ID = state.stateCode + (++count[0].total);
    })

    // validation for unique state code in state
    this.before(['CREATE', 'UPDATE'], State, async (req) => {
        const { stateCode, tax } = req.data;
        if (req.event == 'CREATE') {
            const exist = await SELECT.one.from(State).where({ stateCode })
            if (exist) {
                return req.reject(409, "State code already exist")
            }
        }
        if (tax <= 0 || tax > 100) {
            return req.reject(400, "Invalid tax percentage")
        }
    })

    // validations in customer
    this.before(['CREATE', 'UPDATE'], Customer, async (req) => {
        const { mobile, email } = req.data;
        if (mobile.length < 10 || mobile.length > 10) {
            return req.reject(400, "Invalid mobile number format")
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return req.reject(400, "Invalid email")
        }
    })

    // get amount for ordes
    this.before('CREATE', Order, async (req) => {
        const { vehicleRef_ID } = req.data;
        const vehicleDetail = await SELECT.one.from(Vehicle).where({ ID: vehicleRef_ID });
        if (!vehicleDetail || !vehicleDetail.status == 'Active') {
            return req.reject(404, "Vehicle not found")
        }
        req.data.amount = vehicleDetail.currentPrice * req.data.quantity;
    })

    // invoice calculations
    this.before('CREATE', Invoice, async (req) => {
        const { order_ID, discount_ID } = req.data;
        const isExist = await SELECT.one.from(Invoice).where({ order_ID });
        if (isExist) {
            return req.reject(409, "Invoice for this order already exist")
        }
        const order = await SELECT.one.from(Order).where({ ID: order_ID });
        if (!order) {
            return req.reject(400, "Invalid order ID")
        }
        req.data.subTotal = order.amount;
        let percent = 0;
        if (discount_ID) {
            const discount = await SELECT.one.from(Discount).where({ ID: discount_ID });
            if (!discount) {
                return req.reject(404, "Discount ID not found")
            }
            percent = discount.percent;
        }
        const vehicleTax = await SELECT.one.from(Vehicle).columns('state.tax').where({ ID: order.vehicleRef_ID })
        console.log(vehicleTax);
        req.data.taxAmount = order.amount * vehicleTax.state_tax / 100;
        req.data.discountAmount = order.amount * percent / 100;
        req.data.netAmount = req.data.subTotal - req.data.discountAmount + req.data.taxAmount;
    })

    // update current price
    this.on('UPDATE', Vehicle, async (req) => {
        const { ID, currentPrice } = req.data;
        const existing = await SELECT.one.from(Vehicle).where({ ID });
        console.log(existing);
        await UPDATE(Vehicle).set({
            currentPrice,
            prevPrice: existing.currentPrice
        }).where({ ID });
    })
    // soft delete in vehicle
    this.on('DELETE', Vehicle, async (req) => {
        const { ID } = req.data;
        await UPDATE(Vehicle).set({ status: 'Inactive' }).where({ ID });
    })

    // read invoice
    this.on('READ', Invoice, async (req) => {
        const result = await SELECT.from(Invoice).columns(inv => {
            inv.ID,
                inv.order(o => {
                    o.quantity,
                        o.vehicleRef(v => {
                            v.model
                        })
                }),
                inv.discount(d => {
                    d.code
                }),
                inv.subTotal,
                inv.discountAmount,
                inv.taxAmount,
                inv.netAmount
        })
        return result
    })

    // after handler for read only active vehicles
    this.after('READ', Vehicle, async (data) => {
        return data.filter(e => e.status == 'Inactive')
    })
})