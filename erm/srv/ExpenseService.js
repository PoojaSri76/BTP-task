const cds = require('@sap/cds');
// const axios = require('axios');
module.exports = (srv) => {
    console.log("ExpenseService");
    const { Employee, ExpensePolicies, ExpenseClaim, ExpenseItem } = srv.entities;
    const { Reimbursement } = cds.entities;

    const currencyConverter = cds.connect.to('currencyAPI');

    srv.before('CREATE', ExpenseClaim, async (req) => {

    req.data.currency = "INR";
    req.data.status = "Draft";

    console.log(req.data);

    if (req.data.expenseItems) {

        for (const item of req.data.expenseItems) {

            item.status = "Draft";

            if (item.currency !== 'INR') {

                try {

                    const res = await currencyConverter.send({
                        method: 'GET',
                        query: {
                            base: item.currency,
                            symbols: 'INR'
                        }
                    });

                    const data = res.data;
                    console.log(data);

                    const rate = data.rates.INR;

                    item.convertedAmount = rate * item.amount;

                } catch (error) {

                    req.reject(
                        error.response?.status || 500,
                        error.response?.message || error.message
                    );
                }

            } else {

                item.convertedAmount = item.amount;
            }
        }

        req.data.totalAmount = req.data.expenseItems.reduce(
            (acc, e) => acc + (e.convertedAmount || 0),
            0
        );
    }
});

    // srv.after('READ', ExpenseClaim, async (data) => {        
    //     const claims = Array.isArray(data) ? data : [data];
    //     for (const claim of claims) {
    //         const items = await SELECT.from(ExpenseItem).where({ expenseClaim_ID: claim.ID });
    //         claim.totalAmount = items.reduce((acc, e) => acc + e.convertedAmount,0);
    //     }
    // })

    srv.before('CREATE', ExpenseItem, async (req) => {
        console.log("Before expense item ..............");
    })

    srv.on('submitClaim', async (req) => {
        const claim = await SELECT.one.from(ExpenseClaim).where({ ID: req.params[0].ID })
        if (claim.status !== 'Draft') {
            req.reject(400, 'Only draft claims can be submitted')
        }
        const claimItems = await SELECT.from(ExpenseItem).where({ expenseClaim_ID: claim.ID });
        const policies = await SELECT.from(ExpensePolicies);
        
        // Receipt check
        for (const e of claimItems) {            
            const policy = policies.find(p => p.ID == e.category_ID);
            console.log(policy);
            
            if (policy.receiptRequired && !e.receiptAttachment) {
                req.reject(400, `Receipt required for ${policy.category} , attach receipt`)
            }
        };
        // max amount per claim check
        const claimsByCategory = claimItems.reduce((acc, e) => {
            if (!acc[e.category_ID]) {
                acc[e.category_ID] = 0
            }
            acc[e.category_ID] += e.convertedAmount;
            return acc
        }, {})
        for (const key in claimsByCategory) {
            const policy = policies.find(e => e.ID == key);
            if (claimsByCategory[key] > policy.maxAmountPerClaim) {
                const policyViolation = await UPDATE(ExpenseItem).set({ policyViolation: true }).where({ expenseClaim_ID: claim.ID, category_ID: key })
            }
        }
        // max amount per day check
        const claimsByDate = claimItems.reduce((acc, e) => {
            if (!acc[`${e.expenseDate}_${e.category_ID}`]) {
                acc[`${e.expenseDate}_${e.category_ID}`] = 0
            }
            acc[`${e.expenseDate}_${e.category_ID}`] += e.convertedAmount;
            return acc
        }, {})
        for (const key in claimsByDate) {
            const policy = policies.find(e => e.ID == key.split('_')[1]);
            if (claimsByDate[key] > policy.maxAmountPerDay) {
                const policyViolation = await UPDATE(ExpenseItem).set({ policyViolation: true }).where({ expenseClaim_ID: claim.ID, category_ID: key.split('_')[1], expenseDate: key.split('_')[0] })
            }
        }
        // update status
        const claimDate = new Date().toISOString().split('T')[0];
        console.log(claimDate);

        const updatedClaim = await UPDATE(ExpenseClaim).set({ status: "Submitted", claimDate }).where({ ID: claim.ID });
        if (updatedClaim == 1) {
            const updateExpenseItem = await UPDATE(ExpenseItem).set({ status: "Submitted" }).where({ expenseClaim_ID: claim.ID })
        }
    })

    srv.on('withdrawClaim', async (req) => {
        const claimID = req.params[0].ID;
        const claimdetail = await SELECT.one.from(ExpenseClaim).where({ID:claimID});
        if(claimdetail.status !== "submitted") return req.reject(400, "Claim cannot be withdrawn");
        const updatedClaim = await UPDATE(ExpenseClaim).set({ status: 'Withdrawn' }).where({ ID: claimID });
        const updatedItems = await UPDATE(ExpenseItem).set({ status: 'Withdrawn' }).where({ expenseClaim_ID: claimID })
    })

    srv.on('approveClaim', async (req) => {
        const claimItemID = req.params[0].ID;
        const claimItemDetails = await SELECT.one.from(ExpenseItem).where({ ID: claimItemID });
        if (!claimItemDetails) return req.reject(404, "Claim Item not found");
        if (claimItemDetails.status !== "Submitted") return req.reject(400, "Claim cannot be approved");
        const updatedItems = await UPDATE(ExpenseItem).set({ status: 'ManagerApproved' }).where({ ID: claimItemID });
    })

    srv.on('rejectClaim', async (req) => {
        const claimItemID = req.params[0].ID;
        const { reason } = req.data;
        if (!reason) return req.reject(400, "Reason is mandatory for rejection");
        const updatedItems = await UPDATE(ExpenseItem).set({ status: 'Rejected', reviewComments: reason }).where({ ID: claimItemID })
    })

    srv.on('CompleteReview', async (req) => {
        const { ID } = req.params[0];
        const claimItems = await SELECT.from(ExpenseItem).where({ ID });
        let expenseClaim_ID;
        for (const item of claimItems) {
            expenseClaim_ID = item.expenseClaim_ID;
            if (item.status !== "ManagerApproved" && item.status !== "Rejected") return req.reject(400, "Complete review for all items before submission")
        }
        const approvedAmount = claimItems.filter(item => item.status == "ManagerApproved").reduce((acc, e) => acc + e.convertedAmount, 0);
        const updatedClaim = await UPDATE(ExpenseClaim).set({ status: "ManagerReviewed", approvedAmount }).where({ ID: expenseClaim_ID })
        const claimReimbursement = await INSERT.into(Reimbursement).entries({
            expenseClaim_ID,
            status: "Pending",
            amount: approvedAmount
        })
    })

}