const cds = require('@sap/cds');
const { UPSERT } = require('@sap/cds/lib/ql/cds-ql');

module.exports = cds.service.impl(async function () {
    const { Customer, CustomerDet, CustomerCompany, Supplier, SupplierCompanyJunc } = this.entities;
    console.log("this", this.entities);
    console.log("cds", cds.entities);

    const ext = await cds.connect.to('API_BUSINESS_PARTNER');

    this.on('READ', Customer, async (req) => {
        const result = await ext.run(
            SELECT.from('A_Customer').columns(c => {
                c.Customer;
                c.CustomerFullName;
                c.to_CustomerCompany(cc => {
                    cc.CompanyCode;
                });
            })
        );
        for (const e of result) {
            await UPSERT.into(CustomerDet).entries({
                ID: e.Customer,
                CustomerFullName: e.CustomerFullName,
                to_CustomerCompany_CompanyCode: e.to_CustomerCompany && e.to_CustomerCompany.length > 0
                    ? e.to_CustomerCompany.map((comp) => {
                        return { CompanyCode: comp.CompanyCode }
                    })
                    : null
            });
        }
        return result;
    });

    this.on('READ', CustomerCompany, async (req) => {
        const result = await ext.run(req.query);
        for (const comp of result) {
            await UPSERT.into(CustomerCompany).entries({
                Customer: comp.Customer,
                CompanyCode: comp.CompanyCode,
                CustomerHeadOffice: comp.CustomerHeadOffice
            });
        }
        return result
    })

    this.on('READ', Supplier, async (req) => {
        const result = await ext.run(req.query);
        for (const e of result) {
            await UPSERT.into(Supplier).entries({
                Supplier : e.Supplier,
                Customer : e.Customer,
                SupplierName : e.SupplierName,
                BirthDate : e.BirthDate,
                to_SupplierCompany : e.to_SupplierCompany
            })
        }
        return result
    })

})