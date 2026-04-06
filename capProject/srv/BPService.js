const cds = require('@sap/cds');

module.exports = cds.service.impl(async function () {
    const { Customer, CustomerDet } = this.entities;
    console.log("this", this.entities);
    console.log("cds", cds.entities);

    const ext = await cds.connect.to('API_BUSINESS_PARTNER');
    this.on('READ', Customer, async (req) => {
        // console.log(req.query);
        const result = await ext.run(req.query);
        // console.log(result);
        for (const e of result) {
            await UPSERT.into(CustomerDet).entries({
                ID : e.Customer,
                CustomerClassification: e.CustomerClassification,
                CustomerFullName: e.CustomerFullName
            })
        }
        return result
    })
})