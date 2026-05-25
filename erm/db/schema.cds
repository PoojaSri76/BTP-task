using {
    cuid,
    managed
} from '@sap/cds/common';

namespace my.erm;

entity Department : cuid {
    departmentCode : String(10);
    name           : String(100)
}

entity Employee : cuid {
    empNo       : String(100);
    firstName : String(100);
    lastName :  String(100);
    empName    : String(100);
    email       : String;
    bankAccount : String;
    department  : Association to one Department;
    manager     : Association to one Employee;
}

entity ExpensePolicies : cuid {
    category          : String(100);
    maxAmountPerDay   : Decimal(15, 2);
    maxAmountPerClaim : Decimal(15, 2);
    receiptRequired   : Boolean;
    currenciesAllowed : array of String(3);
}

entity ExpenseClaim : cuid, managed {
    employee       : Association to one Employee;
    claimDate      : Date                        @Core.Computed;
    tripPurpose    : String(200);
    totalAmount    : Decimal(15, 2)              @Core.Computed;
    currency       : String(3) default 'INR'     @readonly;

    @readonly
    status         : String enum {
        Draft;
        Submitted;
        ManagerReviewed;
        Rejected;
        Paid;
        Withdrawn;
    };
    approvedBy     : Association to one Employee @readonly;
    approvedAmount : Decimal(15, 2)              @readonly;
    paidOn         : Timestamp                   @readonly;
    expenseItems   : Composition of many ExpenseItem
                         on expenseItems.expenseClaim = $self;
}

entity ExpenseItem : cuid {
    expenseClaim        : Association to ExpenseClaim;
    category            : Association to one ExpensePolicies;
    expenseDate         : Date;
    amount              : Decimal(15, 2);
    currency            : String(3);
    convertedAmount     : Decimal(15, 2) @Core.Computed;
    receiptAttachment   : LargeBinary    @Core.MediaType: receiptType;
    receiptType         : String(100)    @Core.IsMediaType;
    receiptFileName     : String(100);
    description         : String(200);
    policyViolation     : Boolean        @Core.Computed;

    @readonly
    status              : String enum {
        Draft;
        Submitted;
        ManagerApproved;
        Rejected;
        Paid;
        Withdrawn;
    };
    reviewComments      : String(200)    @readonly;
    virtual criticality : Integer;
}

entity Reimbursement : cuid {
    expenseClaim  : Association to one ExpenseClaim;
    processedBy   : Association to one Employee;
    processedDate : Timestamp;
    paymentRef    : String(100);
    status        : String enum {
        Pending;
        Processing;
        Paid;
        Failed;
    };
    amount        : Decimal(15, 2);
}
