const cds = require('@sap/cds');
const { UPDATE, SELECT } = require('@sap/cds/lib/ql/cds-ql');

module.exports = cds.service.impl(async function () {
    const { Dealer, Vehicle, Order, State } = this.entities;

    // actions
    this.on('approveVehicle', async (req) => {
        const { ID } = req.data;
        console.log(ID);
        const vehicle = await SELECT.from(Vehicle).where({ ID });
        if (!vehicle) {
            return req.reject(404, "Vehicle not found")
        }
        await UPDATE(Vehicle).set({ status: 'Approved' }).where({ ID });
        return "Successfully updated"
    })

    // functions
    this.on('getTotalOrderValue', async (req) => {
        const { ID } = req.data;
        const vehicle = await SELECT.one.from(Vehicle).where({ ID });
        if (!vehicle) {
            return req.reject(404, "Vehicle not found")
        }
        const orders = await SELECT.from(Order).where({ vehicleRef_ID: ID });
        if (!orders) {
            return req.reject(404, "No order found for this vehicle")
        }
        const totalValue = orders.reduce((acc, e) => acc + e.quantity, 0) * vehicle.price;
        return totalValue
    })

    // Generic handler
    // basic validations
    this.before('CREATE', '*', (req) => {
        const entity = req.target.name;
        console.log(`Entity name : ${entity}`);
        let fields;
        if (entity == 'VehicleService.Dealer') {
            fields = ['name', 'location'];
        } else if (entity == 'VehicleService.Vehicle') {
            fields = ['model', 'price', 'dealer_ID', 'state_ID'];
        } else if (entity == 'VehicleService.Order') {
            fields = ['quantity', 'vehicleRef_ID'];
        }
        for (const e of fields) {
            if (!req.data[e]) {
                return req.reject(404, `${e} is missing`)
            }
        }
    })
    // vehicle ID
    this.before('CREATE', Vehicle, async (req) => {
        const { price, dealer_ID, state_ID } = req.data;
        const dealerDetail = await SELECT.one.from(Dealer).where({ ID: dealer_ID });
        if (!dealerDetail) {
            return req.reject(404, "Dealer not found")
        }
        const state = await SELECT.one.from(State).where({ID : state_ID});
        const newPrice = Math.round( price * (1 + state.tax / 100));
        req.data.price = newPrice;
        const generateVehicleNumber = async function () {
            const vehicleNumber = Math.floor(100+ Math.random() * 900);
            const newID = state.stateCode + vehicleNumber;
            const isExist = await SELECT.one.from(Vehicle).where({ ID: newID });
            if (isExist) {
                return await generateVehicleNumber()
            }else{
                return newID
            }
        }
        // console.log( await generateVehicleNumber());
        req.data.ID = await generateVehicleNumber();
    })

    // after vehicle creation
    this.after('CREATE', Vehicle, (data, req)=>{
        // console.log(data);
        
        req.info(`Vehicle successfully created, vehicle ID - ${data.ID}`)
    })
})