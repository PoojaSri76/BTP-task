const cds = require("@sap/cds")
module.exports = async (srv)=>{
    const {Documents, Employees} = srv.entities
    srv.after('CREATE', Documents, async(doc, req)=>{
        console.log("after create....");
        await cds.tx(req).run(UPDATE(Employees).set({status:"Active"}).where({ID:doc.employee_ID}))
    } )
}