const cds = require("@sap/cds");

module.exports = (srv) => {
    console.log("ReimbursementService");
    const { Reimbursement,Employee } = srv.entities;
    const {ExpenseClaim, ExpenseItem} = cds.entities;

    srv.on('processReimbursement', async (req) => {
        const { ID } = req.params[0];
        const paymentRef = `PAY-${Math.floor(Math.random() * 1000000)}`;
        const reimbursement = await SELECT.one.from(Reimbursement).where({ID});
        console.log(reimbursement);

        const employee = await SELECT.one.from(Employee).where({ email: req.user.id });
        if (!employee) return req.reject(404, "Employee not found")
        
        if (!reimbursement) return req.reject(404, "Reimbursement not found");
        const claim = await SELECT.one.from(ExpenseClaim).where({ID:reimbursement.expenseClaim_ID});
        console.log(claim);
        
        if (claim.status !== "ManagerReviewed") return req.reject(400, "Claim not approved");
        const processCompleted = await UPDATE(Reimbursement).set({
            processedBy_ID: req.user.ID || 'Anonymous',
            processedDate: new Date(),
            status: 'Paid',
            paymentRef,
            processedBy_ID: employee.ID
        }).where({ ID });
        if (processCompleted == 1) {
            const claimUpdate = await UPDATE(ExpenseClaim).set({status: "Paid", paidOn: new Date()}).where({ID: claim.ID});
            const itemUpdate = await UPDATE(ExpenseItem).set({status: 'Paid'}).where({expenseClaim_ID: claim.ID , status:'ManagerApproved'})
        }
    })

    srv.on('getPendingReimbursements', async(req)=>{
        const pendingData = await SELECT.from('Reimbursement').where({status: 'Pending'})
        return pendingData
    })

    srv.after('READ', Reimbursement, async(data)=>{
         data.forEach(e => {
            if (e.status == "Pending") return e.statusCriticality = 2;
            else if (e.status == "Failed") return e.statusCriticality = 1;
            else if (e.status == "Paid") return e.statusCriticality = 3;
        })
    })

}