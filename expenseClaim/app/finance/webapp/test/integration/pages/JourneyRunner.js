sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"finance/test/integration/pages/ReimbursementList",
	"finance/test/integration/pages/ReimbursementObjectPage"
], function (JourneyRunner, ReimbursementList, ReimbursementObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('finance') + '/test/flp.html#app-preview',
        pages: {
			onTheReimbursementList: ReimbursementList,
			onTheReimbursementObjectPage: ReimbursementObjectPage
        },
        async: true
    });

    return runner;
});

