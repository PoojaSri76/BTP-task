using ReimbursementService as service from '../../srv/service';

annotate service.Reimbursement with @(
    UI.FieldGroup #GeneratedGroup                 : {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Label: 'Employee',
                Value: expenseClaim.employee.empName,
            },
            {
                $Type: 'UI.DataField',
                Label: 'Purpose',
                Value: expenseClaim.tripPurpose,
            },
            {
                $Type: 'UI.DataField',
                Label: 'Approved By',
                Value: expenseClaim.approvedBy.empName,
            },
            {
                $Type      : 'UI.DataField',
                Label      : 'Status',
                Value      : status,
                Criticality: statusCriticality
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
            },
            {
                 $Type: 'UI.DataField',
                Label: 'Processed By',
                Value: processedBy.empName,
            }
        ],
    },
    UI.Facets                                     : [{
        $Type : 'UI.ReferenceFacet',
        ID    : 'GeneratedFacet1',
        Label : 'General Information',
        Target: '@UI.FieldGroup#GeneratedGroup',
    }, ],
    UI.LineItem                                   : [
        {
            $Type             : 'UI.DataField',
            Label             : 'Employee',
            Value             : expenseClaim.employee.empName,
            @HTML5.CssDefaults: {width: '150px'}
        },
        {
            $Type             : 'UI.DataField',
            Label             : 'Purpose',
            Value             : expenseClaim.tripPurpose,
            @HTML5.CssDefaults: {width: '200px'}
        },
        {
            $Type             : 'UI.DataField',
            Label             : 'Approved By',
            Value             : expenseClaim.approvedBy.empName,
            @HTML5.CssDefaults: {width: '150px'}
        },
        {
            $Type             : 'UI.DataField',
            Label             : 'Amount',
            Value             : amount,
            @HTML5.CssDefaults: {width: '100px'}
        },
        {
            $Type             : 'UI.DataField',
            Label             : 'Status',
            Value             : status,
            Criticality       : statusCriticality,
            @HTML5.CssDefaults: {width: '100px'}
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
        },
    ],
    UI.HeaderInfo                : {
        TypeName      : 'Reimbursement',
        TypeNamePlural: 'Reimbursements',
        Title         : {
            $Type: 'UI.DataField',
            Value: expenseClaim.employee.empName
        },
        Description   : ''
    },
    Analytics.AggregatedProperty #amount_sum : {
        $Type : 'Analytics.AggregatedPropertyType',
        Name : 'amount_sum',
        AggregatableProperty : amount,
        AggregationMethod : 'sum',
        @Common.Label : 'amount (Sum)',
    },
    UI.Chart #alpChart : {
        $Type : 'UI.ChartDefinitionType',
        ChartType : #Column,
        Dimensions : [
            status,
        ],
        DynamicMeasures : [
            '@Analytics.AggregatedProperty#amount_sum',
            '@Analytics.AggregatedProperty#ID_countdistinct',
        ],
    },
    Analytics.AggregatedProperty #ID_countdistinct : {
        $Type : 'Analytics.AggregatedPropertyType',
        Name : 'ID_countdistinct',
        AggregatableProperty : ID,
        AggregationMethod : 'countdistinct',
        @Common.Label : 'ID (Count Distinct Values)',
    },
  
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
            {
                $Type            : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty: 'employee/empName',
            },
            {
                $Type            : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty: 'approvedBy/empName',
            }
        ],
    }
};

annotate service.Reimbursement with actions {
    processReimbursement @Common.IsActionCritical: true
                         @Common.SideEffects     : {TargetProperties: ['status', 'statusCriticality']}
};

annotate service.ExpenseClaim with {
    employee @Common.ValueList: {
        $Type         : 'Common.ValueListType',
        CollectionPath: 'Employee',
        Parameters    : [
            {
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: employee_ID,
                ValueListProperty: 'ID',
            },
            {
                $Type            : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty: 'empName',
            },
        ]
    }
};


annotate service.ExpenseClaim with {
    approvedBy @Common.ValueList: {
        $Type         : 'Common.ValueListType',
        CollectionPath: 'Employee',
        Parameters    : [
            {
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: approvedBy_ID,
                ValueListProperty: 'ID',
            },
            {
                $Type            : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty: 'empName',
            },
        ]
    }
};

// status chart
annotate service.Reimbursement with @Aggregation.ApplySupported: {
    Transformations       : [
        'aggregate',
        'groupby',
        'filter',
        'search'
    ],
    GroupableProperties   : [
        status,
    ],
    AggregatableProperties: [
        {Property: amount},
        {Property: ID}
    ]
};

// annotate service.ExpenseItem with @Aggregation.ApplySupported: {
//     Transformations       : [
//         'aggregate',
//         'groupby',
//         'filter',
//         'search'
//     ],

//     GroupableProperties   : [
//         category
//     ],

//     AggregatableProperties: [
//         { Property: convertedAmount }
//     ]
// };
