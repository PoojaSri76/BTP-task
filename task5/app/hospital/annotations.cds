using HospitalService as service from '../../srv/hospitalService';
using from '../../db/hospital';

annotate service.Appointment with @(
    UI.FieldGroup #GeneratedGroup : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Value : ID,
                Label : '{i18n>AppointmentId}',
            },
            {
                $Type : 'UI.DataField',
                Value : date,
                Label : '{i18n>AppointmentDateAndTime}',
            },
            {
                $Type : 'UI.DataField',
                Value : status.name,
                Label : '{i18n>Status}',
            },
        ],
    },
    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'GeneratedFacet1',
            Label : 'General Information',
            Target : '@UI.FieldGroup#GeneratedGroup',
        },
        {
            $Type : 'UI.CollectionFacet',
            Label : 'Overview',
            ID : 'Overview',
            Facets : [
                {
                    $Type : 'UI.ReferenceFacet',
                    Label : '{i18n>AppointmentDetail}',
                    ID : 'GeneralAppointmentDetail',
                    Target : '@UI.FieldGroup#GeneralAppointmentDetail',
                },
            ],
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Patient Details',
            ID : 'PatientDetails',
            Target : '@UI.FieldGroup#PatientDetails',
        },
    ],
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Value : ID,
            Label : 'ID',
        },
        {
            $Type : 'UI.DataField',
            Label : '{i18n>DateAndTime}',
            Value : date,
        },
        {
            $Type : 'UI.DataField',
            Value : Doctor.name,
            Label : '{i18n>Doctorname}',
        },
        {
            $Type : 'UI.DataField',
            Value : patient.name,
            Label : '{i18n>Patientname}',
        },
        {
            $Type : 'UI.DataField',
            Value : status.name,
            Label : '{i18n>Status}',
            Criticality : status.criticality,
        },
    ],
    UI.SelectionFields : [
        Doctor_ID,
    ],
    UI.HeaderInfo : {
        Title : {
            $Type : 'UI.DataField',
            Value : patient.name,
        },
        TypeName : '',
        TypeNamePlural : '',
        Description : {
            $Type : 'UI.DataField',
            Value : patient.ID,
        },
        TypeImageUrl : 'sap-icon://detail-more',
    },
    UI.FieldGroup #GeneralAppointmentDetail : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Value : Doctor.name,
                Label : '{i18n>ToVisit}',
            },
            {
                $Type : 'UI.DataField',
                Value : Doctor.specialization.name,
                Label : '{i18n>Regarding}',
            },
        ],
    },
    UI.FieldGroup #PatientDetails : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Value : patient.name,
                Label : 'name',
            },
            {
                $Type : 'UI.DataField',
                Value : patient.age,
                Label : 'age',
            },
            {
                $Type : 'UI.DataField',
                Value : patient.mobile,
                Label : 'mobile',
            },
        ],
    },
);

annotate service.Appointment with {
    patient @(
        Common.ValueList : {
            $Type : 'Common.ValueListType',
            CollectionPath : 'Patient',
            Parameters : [
                {
                    $Type : 'Common.ValueListParameterInOut',
                    LocalDataProperty : patient_ID,
                    ValueListProperty : 'ID',
                },
                {
                    $Type : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty : 'name',
                },
                {
                    $Type : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty : 'age',
                },
                {
                    $Type : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty : 'mobile',
                },
            ],
        },
        Common.Label : 'patient_ID',
    )
};

annotate service.Appointment with {
    Doctor @(
        Common.ValueList : {
            $Type : 'Common.ValueListType',
            CollectionPath : 'Doctor',
            Parameters : [
                {
                    $Type : 'Common.ValueListParameterInOut',
                    LocalDataProperty : Doctor_ID,
                    ValueListProperty : 'ID',
                },
                {
                    $Type : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty : 'name',
                },
                {
                    $Type : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty : 'mobile',
                },
            ],
        },
        Common.Label : '{i18n>DoctorId}',
    )
};

annotate service.Appointment with {
    status @(
        Common.Label : '{i18n>Status}',
        Common.ValueList : {
            $Type : 'Common.ValueListType',
            CollectionPath : 'Appointment',
            Parameters : [
                {
                    $Type : 'Common.ValueListParameterInOut',
                    LocalDataProperty : status,
                    ValueListProperty : 'status',
                },
            ],
        },
        Common.ValueListWithFixedValues : true,
        )
};

annotate service.Patient with {
    ID @Common.Label : '{i18n>Patientid}'
};

annotate service.Doctor with {
    ID @Common.Label : 'Doctor/ID'
};

annotate service.Status with {
    name @(
        Common.ValueList : {
            $Type : 'Common.ValueListType',
            CollectionPath : 'Status',
            Parameters : [
                {
                    $Type : 'Common.ValueListParameterInOut',
                    LocalDataProperty : name,
                    ValueListProperty : 'code',
                },
            ],
        },
        Common.ValueListWithFixedValues : true,
        Common.Label : 'Status',
        )};

annotate service.Status with {
    code @Common.Text : descr
};

