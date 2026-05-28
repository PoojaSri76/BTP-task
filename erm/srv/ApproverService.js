const cds = require('@sap/cds');
module.exports = (srv) => {
    const { Employee, ExpenseClaim, ExpenseItem } = srv.entities;
    const { Reimbursement } = cds.entities;

    srv.on('READ', ExpenseClaim, async (req, next) => {
        const manager = await SELECT.one.from(Employee).where({ email: req.user.id });
        if (!manager) return req.reject(404, "Employee not found");
        const employees = await SELECT.from(Employee).where({ manager_ID: manager.ID })
        if (employees.length === 0) {
            return req.info('No employees Assigned');
        }
        const empIDs = employees.map(e => e.ID);
        if (req.params.length > 0) {
            return next();
        } else {
            const data = await SELECT.from(ExpenseClaim).where({ status: { in: ["Submitted", "ManagerReviewed", "Paid", "Rejected"] }, employee_ID: { in: empIDs } });
            return data
        }
    })

    srv.on('approveClaim', async (req) => {
        const employee = await SELECT.one.from(Employee).where({ email: req.user.id });
        if (!employee) return req.reject(404, "Employee not found")
        const claimItemID = req.params[1].ID;
        console.log(req.params);

        console.log(claimItemID);

        const claimItemDetails = await SELECT.one.from(ExpenseItem).where({ ID: claimItemID });
        console.log(claimItemDetails);

        if (!claimItemDetails) return req.reject(404, "Claim Item not found");
        if (claimItemDetails.status !== "Submitted") return req.reject(400, "Claim cannot be approved");
        const updatedItems = await UPDATE(ExpenseItem).set({ status: 'ManagerApproved', approvedBy_ID: employee.ID }).where({ ID: claimItemID });
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
        const employee = await SELECT.one.from(Employee).where({ email: req.user.id });
        if (!employee) return req.reject(404, "Employee not found");
        const claimItems = await SELECT.from(ExpenseItem).where({ expenseClaim_ID: ID });
        const allReviewed = claimItems.every(item => item.status === "ManagerApproved" || item.status === "Rejected");
        if (!allReviewed) {
            return req.reject(400, "Complete review for all items before submission");
        }
        const hasApproved = claimItems.some(item => item.status === "ManagerApproved");
        if (hasApproved) {
            const approvedAmount = claimItems.filter(item => item.status == "ManagerApproved").reduce((acc, e) => acc + Number(e.convertedAmount), 0);
            const updatedClaim = await UPDATE(ExpenseClaim).set({ status: "ManagerReviewed", approvedAmount, approvedBy_ID: employee.ID }).where({ ID })
            console.log(updatedClaim);
            const claimReimbursement = await INSERT.into(Reimbursement).entries({
                expenseClaim_ID: ID,
                status: "Pending",
                amount: approvedAmount
            })
        } else {
            const updatedClaim = await UPDATE(ExpenseClaim).set({ status: "Rejected", approvedAmount: 0, approvedBy_ID: employee.ID }).where({ ID })
        }

    })

    srv.after('READ', ExpenseItem, async (data) => {
        data.forEach(e => {
            if (e.policyViolation == false) return e.criticality = 3;
            else if (e.policyViolation == true) return e.criticality = 1;
        })
    })

}
