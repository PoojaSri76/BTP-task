const cds = require('@sap/cds');
const { message } = require('@sap/cds/lib/log/cds-error');
const { SELECT, UPDATE } = require('@sap/cds/lib/ql/cds-ql');
module.exports = cds.service.impl(async function () {
    const { Product } = this.entities;
    const bundle = cds.i18n.bundle4('i18n');

    console.log("env data",cds.env.requires.auth)

    this.before('DELETE', Product, async (req) => {

        console.log(bundle);

        const exist = await SELECT.one.from(Product).where({ ID: req.data.ID })
        if (!exist) {
            return req.reject(404, bundle.at('invalidProduct'))
        }
    })

    this.on('getAllData', async () => {
        console.log(Product);

        const active = await SELECT.from(Product);
        const drafts = await SELECT.from(Product.drafts);
        console.log(drafts);
        const allData = [...active, ...drafts]
        return allData
    })

    this.on('activateProduct', async(req)=>{
        const ID=req.params[0].ID;
        console.log(ID);
        
        const updated = await UPDATE(Product).set({status : 'Active'}).where({ID});
        console.log(`${updated} columns`);
    })

    this.on('addDiscount', async(req)=>{
        const {ID, discount} = req.data;
        const oldData = await SELECT.one.from(Product).where({ID});
        const newPrice = oldData.price*(1-discount/100)
        await UPDATE(Product).set({price: newPrice}).where({ID})
    })

    this.on('getdata', ()=>{
        return 'HI'
    })
})