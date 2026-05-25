sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"employee/test/integration/pages/ExpenseClaimList",
	"employee/test/integration/pages/ExpenseClaimObjectPage"
], function (JourneyRunner, ExpenseClaimList, ExpenseClaimObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('employee') + '/test/flp.html#app-preview',
        pages: {
			onTheExpenseClaimList: ExpenseClaimList,
			onTheExpenseClaimObjectPage: ExpenseClaimObjectPage
        },
        async: true
    });

    return runner;
});

