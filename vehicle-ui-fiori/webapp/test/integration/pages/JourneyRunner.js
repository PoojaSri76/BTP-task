sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"vehicleuifiori/test/integration/pages/VehicleList.gen",
	"vehicleuifiori/test/integration/pages/VehicleObjectPage.gen"
], function (JourneyRunner, VehicleListGenerated, VehicleObjectPageGenerated) {
    'use strict';

    const runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('vehicleuifiori') + '/test/flp.html#app-preview',
        pages: {
			onTheVehicleListGenerated: VehicleListGenerated,
			onTheVehicleObjectPageGenerated: VehicleObjectPageGenerated
        },
        async: true
    });

    return runner;
});

