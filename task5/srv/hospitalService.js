const cds = require('@sap/cds');
const { SELECT } = require('@sap/cds/lib/ql/cds-ql');

module.exports = cds.service.impl(async function () {
    if (this.name !== 'HospitalService') return;

    const {Appointment} = this.entities;

    this.before('UPDATE', Appointment, async(req)=>{
        const appointmentDetail = await SELECT.one.from(Appointment).where({ID:req.data.ID});
        if (appointmentDetail.status_code == 'C') return req.reject(400, "Cannot update completed appointments");
    })
})