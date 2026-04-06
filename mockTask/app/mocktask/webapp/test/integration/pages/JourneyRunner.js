sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"mocktask/test/integration/pages/DealerList",
	"mocktask/test/integration/pages/DealerObjectPage"
], function (JourneyRunner, DealerList, DealerObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('mocktask') + '/test/flp.html#app-preview',
        pages: {
			onTheDealerList: DealerList,
			onTheDealerObjectPage: DealerObjectPage
        },
        async: true
    });

    return runner;
});

