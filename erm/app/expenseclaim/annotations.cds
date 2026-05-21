using ExpenseService as service from '../../srv/service';

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
            Target: '@UI.FieldGroup#ClaimApprovalInfo'
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
        },
        {
            $Type : 'UI.DataFieldForAction',
            Label : 'Submit Claim',
            Action: 'ExpenseService.submitClaim',
            Inline: true
        }
    ],
);

annotate service.ExpenseItem with {
    receiptAttachment @Core.ContentDisposition.Type : 'inline'
    @Core.ContentDisposition.Filename : receiptFileName
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
            Label: 'Status',
            Value: status
        },
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
                $Type: 'UI.DataField',
                Label: 'Policy Violation',
                Value: policyViolation
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


annotate service.ExpenseItem with {
    category @Common.ValueList: {
        $Type         : 'Common.ValueListType',
        CollectionPath: 'ExpensePolicies',
        Parameters    : [
            {
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: category_ID,
                ValueListProperty: 'ID',
            },
            {
                $Type            : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty: 'category',
            },
        ],
    }
};
