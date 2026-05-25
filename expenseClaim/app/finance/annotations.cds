using ReimbursementService as service from '../../srv/Service';

annotate service.Reimbursement with @(
    UI.FieldGroup #GeneratedGroup: {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Label: 'Employee',
                Value: expenseClaim.employee.fullName,
            },
            {
                $Type: 'UI.DataField',
                Label: 'Purpose',
                Value: expenseClaim.tripPurpose,
            },
            {
                $Type: 'UI.DataField',
                Label: 'Approved By',
                Value: expenseClaim.approvedBy.fullName,
            },
            {
                $Type: 'UI.DataField',
                Label: 'Status',
                Value: status,
            },
            {
                $Type: 'UI.DataField',
                Label: 'Amount',
                Value: amount,
            },
            {
                $Type: 'UI.DataField',
                Label: 'Transaction ID',
                Value: paymentRef,
            }
        ],
    },
    UI.Facets                    : [{
        $Type : 'UI.ReferenceFacet',
        ID    : 'GeneratedFacet1',
        Label : 'General Information',
        Target: '@UI.FieldGroup#GeneratedGroup',
    }, ],
    UI.LineItem                  : [
        {
            $Type: 'UI.DataField',
            Label: 'Employee',
            Value: expenseClaim.employee.fullName,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Purpose',
            Value: expenseClaim.tripPurpose,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Approved By',
            Value: expenseClaim.approvedBy.fullName,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Amount',
            Value: amount,
        },
        {
            $Type        : 'UI.DataFieldForAction',
            Label        : 'Release Payment',
            Action       : 'ReimbursementService.processReimbursement',
            Inline       : true,
            ![@UI.Hidden]: {$edmJson: {$Not: {$Eq: [
                {$Path: 'status'},
                'Pending'
            ]}}},
        }
    ],
);

annotate service.Reimbursement with {
    expenseClaim @Common.ValueList: {
        $Type         : 'Common.ValueListType',
        CollectionPath: 'ExpenseClaim',
        Parameters    : [
            {
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: expenseClaim_ID,
                ValueListProperty: 'ID',
            },
            {
                $Type            : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty: 'claimDate',
            },
            {
                $Type            : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty: 'tripPurpose',
            },
            {
                $Type            : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty: 'totalAmount',
            },
            {
                $Type            : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty: 'currency',
            },
        ],
    }
};

annotate service.Reimbursement with actions {
    processReimbursement @Common.IsActionCritical: true
                         @Common.SideEffects     : {TargetProperties: ['status']}
};

annotate service.ExpenseByCategory with @(
    UI.Chart              : {
        Title              : 'Expense by Category',
        ChartType          : #Donut,
        Dimensions         : ['Category'],
        DimensionAttributes: [{
            Dimension: 'Category',
            Role     : #Category
        }],
        Measures           : ['TotalAmount'],
        MeasureAttributes  : [{
            Measure: 'TotalAmount',
            Role   : #Axis1
        }]
    },

    UI.PresentationVariant: {Visualizations: ['@UI.Chart']}
);
