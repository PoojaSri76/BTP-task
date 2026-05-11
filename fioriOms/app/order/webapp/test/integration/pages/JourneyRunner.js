sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"order/test/integration/pages/OrderList",
	"order/test/integration/pages/OrderObjectPage"
], function (JourneyRunner, OrderList, OrderObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('order') + '/test/flp.html#app-preview',
        pages: {
			onTheOrderList: OrderList,
			onTheOrderObjectPage: OrderObjectPage
        },
        async: true
    });

    return runner;
});

