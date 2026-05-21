const cds = require("@sap/cds");

module.exports = (srv) => {
    console.log("ReimbursementService");
    const { Reimbursement } = srv.entities;
    const {ExpenseClaim} = cds.entities;

    srv.on('processReimbursement', async (req) => {
        const { ID } = req.params[0];
        const { paymentRef } = req.data;
        const reimbursement = await SELECT.one.from(ExpenseClaim).where({ID});
        if (!reimbursement) return req.reject(404, "Reimbursement not found");
        if (!reimbursement.status == "ManagerReviewed") return req.reject(400, "Claim not approved");
        const processCompleted = await UPDATE(Reimbursement).set({
            processedBy_ID: req.user.ID,
            processedDate: new Date().toISOString(),
            status: Paid,
            paymentRef
        }).where({ ID });
        if (processCompleted == 1) {
            const claimUpdate = UPDATE(ExpenseClaim).set({status: "Paid", paidOn: new Date.toISOString()}).where({ID: reimbursement.expenseClaim_ID})
        }
    })

    srv.on('getPendingReimbursements', async(req)=>{
        const pendingData = await SELECT.from(Reimbursement).where({status: 'Pending'})
        return pendingData
    })

}