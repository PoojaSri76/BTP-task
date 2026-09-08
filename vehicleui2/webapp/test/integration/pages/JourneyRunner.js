sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"vehicleui2/test/integration/pages/VehicleList.gen",
	"vehicleui2/test/integration/pages/VehicleObjectPage.gen"
], function (JourneyRunner, VehicleListGenerated, VehicleObjectPageGenerated) {
    'use strict';

    const runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('vehicleui2') + '/test/flp.html#app-preview',
        pages: {
			onTheVehicleListGenerated: VehicleListGenerated,
			onTheVehicleObjectPageGenerated: VehicleObjectPageGenerated
        },
        async: true
    });

    return runner;
});

