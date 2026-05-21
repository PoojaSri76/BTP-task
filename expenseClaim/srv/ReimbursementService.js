const cds = require("@sap/cds");
const { SELECT } = require("@sap/cds/lib/ql/cds-ql");
const { Anonymous } = require("@sap/cds/lib/req/user");

module.exports = (srv) => {
    console.log("ReimbursementService");
    const { Reimbursement } = srv.entities;
    const {ExpenseClaim, ExpenseItem} = cds.entities;

    srv.on('processReimbursement', async (req) => {
        const { ID } = req.params[0];
        const paymentRef = `PAY-${Math.floor(Math.random() * 1000000)}`;
        const reimbursement = await SELECT.one.from(Reimbursement).where({ID});
        console.log(reimbursement);
        
        if (!reimbursement) return req.reject(404, "Reimbursement not found");
        const claim = await SELECT.one.from(ExpenseClaim).where({ID:reimbursement.expenseClaim_ID});
        console.log(claim);
        
        if (claim.status !== "ManagerReviewed") return req.reject(400, "Claim not approved");
        const processCompleted = await UPDATE(Reimbursement).set({
            processedBy_ID: req.user.ID || 'Anonymous',
            processedDate: new Date(),
            status: 'Paid',
            paymentRef
        }).where({ ID });
        if (processCompleted == 1) {
            const claimUpdate = await UPDATE(ExpenseClaim).set({status: "Paid", paidOn: new Date()}).where({ID: claim.ID});
            const itemUpdate = await UPDATE(ExpenseItem).set({status: 'Paid'}).where({expenseClaim_ID: claim.ID , status:'ManagerApproved'})
        }
    })

    srv.on('getPendingReimbursements', async(req)=>{
        const pendingData = await SELECT.from(Reimbursement).where({status: 'Pending'})
        return pendingData
    })

}