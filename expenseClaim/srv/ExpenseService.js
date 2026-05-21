const cds = require('@sap/cds');
// const axios = require('axios');
module.exports = async (srv) => {
    console.log("ExpenseService");
    const { ExpensePolicies, ExpenseClaim, ExpenseItem } = srv.entities;

    const currencyConverter = await cds.connect.to('currencyAPI');

    srv.before('CREATE', ExpenseClaim, async (req) => {
        req.data.currency = "INR";
        req.data.status = "Draft";
        // read.data.employee_ID = req.user.ID;
        console.log(req.data);
        if (req.data.expenseItems) {
            for (const item of req.data.expenseItems) {
                item.status = "Draft";
                if (item.currency !== 'INR') {
                    try {
                        const res = await currencyConverter.send({
                            method: 'GET',
                             path: `/latest?base=${item.currency}&symbols=INR`
                        });
                        const rate = Number(res.rates.INR);
                        item.convertedAmount = rate * Number(item.amount);
                    } catch (error) {
                        req.reject(
                            error.response?.status || 500,
                            error.response?.message || error.message
                        );
                    }
                } else {
                    item.convertedAmount = Number(item.amount);
                }
            }
            req.data.totalAmount = req.data.expenseItems.reduce(
                (acc, e) => acc + Number(e.convertedAmount || 0),
                0
            );
        }
    });

    srv.before('UPDATE', ExpenseClaim, async (req) => {
        const claim = await SELECT.one
            .from(ExpenseClaim)
            .where({ ID: req.data.ID });
        if (!claim) {
            return req.reject(404, 'Expense claim not found');
        }
        if (claim.status !== 'Draft') {
            return req.reject(
                400,
                'Only Draft claims can be updated'
            );
        }
        if (req.data.expenseItems) {
            console.log(req.data.expenseItems);
            
            for (const item of req.data.expenseItems) {
                if (item.currency !== 'INR') {
                    try {
                        const res = await currencyConverter.send({
                            method: 'GET',
                            path: `/latest?base=${item.currency}&symbols=INR`
                        });
                        console.log(res);

                        const rate = Number(res.rates.INR);
                        item.convertedAmount = rate * Number(item.amount);
                    } catch (error) {
                        req.reject(
                            error.response?.status || 500,
                            error.response?.message || error.message
                        );
                    }
                } else {
                    item.convertedAmount = Number(item.amount);
                }
            }
            req.data.totalAmount = req.data.expenseItems.reduce(
                (acc, e) => acc + Number(e.convertedAmount || 0),
                0
            );
        }
    });

    srv.before('CREATE', ExpenseItem, async (req) => {
        console.log("Before expense item ");
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
            if (policy.receiptRequired && !e.receiptType) {
                req.reject(400, `Receipt required for ${policy.category} , attach receipt`)
            }
        };
        // max amount per claim check
        const claimsByCategory = claimItems.reduce((acc, e) => {
            if (!acc[e.category_ID]) {
                acc[e.category_ID] = 0
            }
            acc[e.category_ID] += Number(e.convertedAmount);
            return acc
        }, {})

            console.log("claims bu category........", claimsByCategory) ;
        for (const key in claimsByCategory) {            
            const policy = policies.find(e => e.ID == key);
            if (Number(claimsByCategory[key]) > policy.maxAmountPerClaim) {
                const policyViolation = await UPDATE(ExpenseItem).set({ policyViolation: true }).where({ expenseClaim_ID: claim.ID, category_ID: key })
            } else {
                const policyViolation = await UPDATE(ExpenseItem).set({ policyViolation: false }).where({ expenseClaim_ID: claim.ID, category_ID: key })
            }
        }
        // max amount per day check
        const claimsByDate = claimItems.reduce((acc, e) => {
            if (!acc[`${e.expenseDate}_${e.category_ID}`]) {
                acc[`${e.expenseDate}_${e.category_ID}`] = 0
            }
            acc[`${e.expenseDate}_${e.category_ID}`] += Number(e.convertedAmount);
            return acc
        }, {})

        console.log("Claims by date.........", claimsByDate);
        
        for (const key in claimsByDate) {
            const policy = policies.find(e => e.ID == key.split('_')[1]);
            console.log(policy);
            console.log(claimsByDate[key]);

            if (Number(claimsByDate[key]) > policy.maxAmountPerDay) {
                const policyViolation = await UPDATE(ExpenseItem).set({ policyViolation: true }).where({ expenseClaim_ID: claim.ID, category_ID: key.split('_')[1], expenseDate: key.split('_')[0] })
            } else {
                const policyViolation = await UPDATE(ExpenseItem).set({ policyViolation: false }).where({ expenseClaim_ID: claim.ID, category_ID: key.split('_')[1], expenseDate: key.split('_')[0] })
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
        const claimdetail = await SELECT.one.from(ExpenseClaim).where({ ID: claimID });
        if (claimdetail.status !== "Submitted") return req.reject(400, "Claim cannot be withdrawn");
        const updatedClaim = await UPDATE(ExpenseClaim).set({ status: 'Withdrawn' }).where({ ID: claimID });
        const updatedItems = await UPDATE(ExpenseItem).set({ status: 'Withdrawn' }).where({ expenseClaim_ID: claimID })
    })

     srv.after('READ', ExpenseItem, async (data) => {
        data.forEach(e => {
            if (e.policyViolation == false) return e.criticality = 3;
            else if (e.policyViolation == true) return e.criticality = 1;
        })
    })
}