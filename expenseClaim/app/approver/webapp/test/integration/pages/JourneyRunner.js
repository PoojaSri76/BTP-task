sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"approver/test/integration/pages/ExpenseClaimList",
	"approver/test/integration/pages/ExpenseClaimObjectPage"
], function (JourneyRunner, ExpenseClaimList, ExpenseClaimObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('approver') + '/test/flp.html#app-preview',
        pages: {
			onTheExpenseClaimList: ExpenseClaimList,
			onTheExpenseClaimObjectPage: ExpenseClaimObjectPage
        },
        async: true
    });

    return runner;
});

