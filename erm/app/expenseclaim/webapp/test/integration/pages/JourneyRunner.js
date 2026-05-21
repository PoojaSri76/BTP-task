sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"expenseclaim/test/integration/pages/ExpenseClaimList",
	"expenseclaim/test/integration/pages/ExpenseClaimObjectPage",
	"expenseclaim/test/integration/pages/ExpenseItemObjectPage"
], function (JourneyRunner, ExpenseClaimList, ExpenseClaimObjectPage, ExpenseItemObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('expenseclaim') + '/test/flp.html#app-preview',
        pages: {
			onTheExpenseClaimList: ExpenseClaimList,
			onTheExpenseClaimObjectPage: ExpenseClaimObjectPage,
			onTheExpenseItemObjectPage: ExpenseItemObjectPage
        },
        async: true
    });

    return runner;
});

