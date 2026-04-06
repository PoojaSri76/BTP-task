sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"ns/hospital/test/integration/pages/AppointmentList",
	"ns/hospital/test/integration/pages/AppointmentObjectPage"
], function (JourneyRunner, AppointmentList, AppointmentObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('ns/hospital') + '/test/flp.html#app-preview',
        pages: {
			onTheAppointmentList: AppointmentList,
			onTheAppointmentObjectPage: AppointmentObjectPage
        },
        async: true
    });

    return runner;
});

