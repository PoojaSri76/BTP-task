module.exports = (srv) => {
    const { Employee, ExpenseClaim, ExpenseItem } = srv.entities;
    const { Reimbursement } = cds.entities;

    srv.on('READ', ExpenseClaim, async (req, next) => {
        if (req.params.length > 0) {
            return next();
        } else {
            const data = await SELECT.from(ExpenseClaim).where({ status: { in: ["Submitted", "ManagerReviewed"] } })
            return data
        }
    })

    srv.on('approveClaim', async (req) => {
        const claimItemID = req.params[1].ID;
        console.log(req.params);

        console.log(claimItemID);

        const claimItemDetails = await SELECT.one.from(ExpenseItem).where({ ID: claimItemID });
        console.log(claimItemDetails);

        if (!claimItemDetails) return req.reject(404, "Claim Item not found");
        if (claimItemDetails.status !== "Submitted") return req.reject(400, "Claim cannot be approved");
        const updatedItems = await UPDATE(ExpenseItem).set({ status: 'ManagerApproved', }).where({ ID: claimItemID });
    })

    srv.on('rejectClaim', async (req) => {
        const claimItemID = req.params[1].ID;
        const { reason } = req.data;
        if (!reason) return req.reject(400, "Reason is mandatory for rejection");
        const claimItemDetails = await SELECT.one.from(ExpenseItem).where({ ID: claimItemID });
        console.log(claimItemDetails);

        if (!claimItemDetails) return req.reject(404, "Claim Item not found");
        if (claimItemDetails.status !== "Submitted") return req.reject(400, "Claim cannot be approved");
        const updatedItems = await UPDATE(ExpenseItem).set({ status: 'Rejected', reviewComments: reason }).where({ ID: claimItemID })
    })

    srv.on('CompleteReview', async (req) => {
        const { ID } = req.params[0];
        const claimItems = await SELECT.from(ExpenseItem).where({ expenseClaim_ID: ID });
        for (const item of claimItems) {
            if (item.status !== "ManagerApproved" && item.status !== "Rejected") return req.reject(400, "Complete review for all items before submission")
        }
        const approvedAmount = claimItems.filter(item => item.status == "ManagerApproved").reduce((acc, e) => acc + Number(e.convertedAmount), 0);
        const updatedClaim = await UPDATE(ExpenseClaim).set({ status: "ManagerReviewed", approvedAmount }).where({ ID })
        console.log(updatedClaim);
        const claimReimbursement = await INSERT.into(Reimbursement).entries({
            expenseClaim_ID: ID,
            status: "Pending",
            amount: approvedAmount
        })
    })

    srv.after('READ', ExpenseItem, async (data) => {
        data.forEach(e => {
            if (e.policyViolation == false) return e.criticality = 3;
            else if (e.policyViolation == true) return e.criticality = 1;
        })
    })


}