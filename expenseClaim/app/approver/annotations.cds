using ManagerService as service from '../../srv/Service';

annotate service.ExpenseClaim with @(
    UI.FieldGroup #GeneralInfo      : {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Label: 'Claim Date',
                Value: claimDate,
            },
            {
                $Type: 'UI.DataField',
                Label: 'Trip Purpose',
                Value: tripPurpose,
            },
            {
                $Type: 'UI.DataField',
                Label: 'Total Amount',
                Value: totalAmount,
            },
            {
                $Type: 'UI.DataField',
                Label: 'Currency',
                Value: currency,
            },
            {
                $Type: 'UI.DataField',
                Label: 'Status',
                Value: status,

            }
        ],
    },
    UI.FieldGroup #ClaimApprovalInfo: {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Label: 'Approved Amount',
                Value: approvedAmount
            },
            {
                $Type: 'UI.DataField',
                Label: 'Approved By',
                Value: approvedBy.name
            },
            {
                $Type: 'UI.DataField',
                Label: 'Paid On',
                Value: paidOn,
            }
        ]
    },
    UI.Facets                       : [
        {
            $Type : 'UI.ReferenceFacet',
            ID    : 'GeneratedFacet1',
            Label : 'General Information',
            Target: '@UI.FieldGroup#GeneralInfo',
        },
        {
            $Type : 'UI.ReferenceFacet',
            ID    : 'ApprovalInfo',
            Label : 'Approval Status',
            Target: '@UI.FieldGroup#ClaimApprovalInfo',
        },
        {
            $Type : 'UI.ReferenceFacet',
            ID    : 'ClaimItems',
            Label : 'Claim Items',
            Target: 'expenseItems/@UI.LineItem'
        }
    ],
    UI.LineItem                     : [
        {
            $Type: 'UI.DataField',
            Label: 'Claim Date',
            Value: claimDate,
        },
        {
            $Type             : 'UI.DataField',
            Label             : 'Trip Purpose',
            Value             : tripPurpose,
            @HTML5.CssDefaults: {width: '150px'}
        },
        {
            $Type: 'UI.DataField',
            Label: 'Total Amount',
            Value: totalAmount,
        },
        {
            $Type             : 'UI.DataField',
            Label             : 'Currency',
            Value             : currency,
            @HTML5.CssDefaults: {width: '100px'}
        },
        {
            $Type             : 'UI.DataField',
            Label             : 'Status',
            Value             : status,
            @HTML5.CssDefaults: {width: '150px'}
        },
        {
            $Type        : 'UI.DataFieldForAction',
            Label        : 'Complete Review',
            Action       : 'ManagerService.CompleteReview',
            ![@UI.Hidden]: {$edmJson: {$Not: {$Eq: [
                {$Path: 'status'},
                'Submitted'
            ]}}},
            Inline       : true
        }
    ],
    UI.Identification               : [{
        $Type        : 'UI.DataFieldForAction',
        Label        : 'Complete Review',
        Action       : 'ManagerService.CompleteReview',
        ![@UI.Hidden]: {$edmJson: {$Not: {$Eq: [
            {$Path: 'status'},
            'Submitted'
        ]}}},
    }],
);

annotate service.ExpenseItem with {
    receiptAttachment @Core.ContentDisposition.Type    : 'inline'
                      @Core.ContentDisposition.Filename: receiptFileName;
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
                ValueListProperty: 'empNo',
            },
            {
                $Type            : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty: 'name',
            },
            {
                $Type            : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty: 'email',
            },
            {
                $Type            : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty: 'bankAccount',
            },
        ],
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
                ValueListProperty: 'empNo',
            },
            {
                $Type            : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty: 'name',
            },
            {
                $Type            : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty: 'email',
            },
            {
                $Type            : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty: 'bankAccount',
            },
        ],
    }
};

annotate service.Employee with {
    name @readonly: true
};

annotate service.ExpenseItem with @(
    UI.LineItem                  : [
        {
            $Type: 'UI.DataField',
            Label: 'Expense Date',
            Value: expenseDate
        },
        {
            $Type             : 'UI.DataField',
            Label             : 'Category',
            Value             : category_ID,
            @HTML5.CssDefaults: {width: '100px'}

        },
        {
            $Type: 'UI.DataField',
            Label: 'Amount',
            Value: amount
        },
        {
            $Type             : 'UI.DataField',
            Label             : 'Status',
            Value             : status,
            @HTML5.CssDefaults: {width: '100px'}

        },
        {
            $Type        : 'UI.DataFieldForAction',
            Label        : 'Approve',
            Action       : 'ManagerService.approveClaim',
            Inline       : true,
            ![@UI.Hidden]: {$edmJson: {$Not: {$Eq: [
                {$Path: 'status'},
                'Submitted'
            ]}}},
            Criticality  : #Positive
        },
        {
            $Type        : 'UI.DataFieldForAction',
            Label        : 'Reject',
            Action       : 'ManagerService.rejectClaim',
            Inline       : true,
            ![@UI.Hidden]: {$edmJson: {$Not: {$Eq: [
                {$Path: 'status'},
                'Submitted'
            ]}}},
            Criticality  : #Negative
        }
    ],
    UI.FieldGroup #ItemInfo      : {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Label: 'Expense Date',
                Value: expenseDate
            },
            {
                $Type: 'UI.DataField',
                Label: 'Category',
                Value: category_ID
            },
            {
                $Type: 'UI.DataField',
                Label: 'Amount',
                Value: amount
            },
            {
                $Type: 'UI.DataField',
                Label: 'Currency',
                Value: currency
            },
            {
                $Type: 'UI.DataField',
                Label: 'Receipt',
                Value: receiptAttachment
            },
            {
                $Type: 'UI.DataField',
                Label: 'Description',
                Value: description
            }
        ]
    },
    UI.FieldGroup #ItemStatusInfo: {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Label: 'Status',
                Value: status
            },
            {
                $Type: 'UI.DataField',
                Label: 'Converted Amount',
                Value: convertedAmount
            },
            {
                $Type      : 'UI.DataField',
                Label      : 'Policy Violation',
                Value      : policyViolation,
                Criticality: criticality
            },
            {
                $Type: 'UI.DataField',
                Label: 'Review Comments',
                Value: reviewComments
            },
        ]
    },
    UI.Facets                    : [
        {
            $Type : 'UI.ReferenceFacet',
            ID    : 'ItemInfo',
            Label : 'General Information',
            Target: '@UI.FieldGroup#ItemInfo',
        },
        {
            $Type : 'UI.ReferenceFacet',
            ID    : 'ItemStatusInfo',
            Label : 'Status Information',
            Target: '@UI.FieldGroup#ItemStatusInfo',
        },
    ]
);

annotate service.ExpenseItem with actions {
    approveClaim @Common.SideEffects: {TargetProperties: ['status']};
    rejectClaim  @Common.SideEffects: {TargetProperties: ['status']}
};

annotate service.ExpenseClaim with actions {
    CompleteReview @Common.SideEffects: {TargetProperties: [
        'status',
        'approvedAmount'
    ]}
};
