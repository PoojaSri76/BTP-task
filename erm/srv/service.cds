using {my.erm as db} from '../db/schema';

@impl: 'srv/EmployeeService.js'
service ExpenseService {
    entity Employee        as projection on db.Employee;
    entity Department      as projection on db.Department;
    entity ExpensePolicies as projection on db.ExpensePolicies;

    @odata.draft.enabled
    entity ExpenseClaim    as projection on db.ExpenseClaim
        actions {
            action submitClaim();
            action withdrawClaim();
        };

    entity ExpenseItem     as projection on db.ExpenseItem;
    entity Currency as projection on db.Currency;

}

@impl: 'srv/ReimbursementService.js'
service ReimbursementService {
    entity Reimbursement     as projection on db.Reimbursement
        actions {
            action processReimbursement();
        };

    entity ExpensePolicies   as projection on db.ExpensePolicies;
    entity ExpenseClaim      as projection on db.ExpenseClaim;
    entity ExpenseItem       as projection on db.ExpenseItem;
    function getPendingReimbursements() returns array of Reimbursement;
    entity Employee as projection on db.Employee;
}

@impl: 'srv/ApproverService.js'
service ApproverService {
    entity Employee        as projection on db.Employee;
    entity ExpensePolicies as projection on db.ExpensePolicies;
    entity ExpenseClaim    as projection on db.ExpenseClaim
        actions {
            action CompleteReview();
        };
    entity ExpenseItem     as projection on db.ExpenseItem
        actions {
            action rejectClaim(reason: String(200));
            action approveClaim();
        };

}

annotate ReimbursementService.Reimbursement with @restrict: [
    {
        grant: ['READ'],
        to   : 'Finance'
    },

    {
        grant: ['processReimbursement'],
        to   : 'Finance'
    },

    {
        grant: '*',
        to   : 'Administrator'
    }
];

 
annotate ExpenseService.ExpenseClaim with @restrict: [
    {
        grant: ['WRITE', 'READ'],
        to: 'Employee'
    },
     {
        grant: ['submitClaim', 'withdrawClaim'],
        to: 'Employee'
    },
    {
        grant: '*',
        to: 'Administrator'
    },
 
];

annotate ApproverService.ExpenseClaim with @restrict:[
     {
        grant: ['WRITE', 'READ'],
        to: 'Manager'
    },
     { grant: ['completeReview'], to: 'Manager' },
    {
        grant: '*',
        to: 'Administrator'
    },
] ;

annotate ApproverService.ExpenseItem with @restrict:[
   {
      grant: ['READ','WRITE'],
      to: 'Manager'
   },
   {
      grant: ['approveClaim','rejectClaim'],
      to: 'Manager'
   },
   {
      grant: '*',
      to: 'Administrator'
   }
];
 
annotate ExpenseService.Employee with {
    bankAccount @restrict: [
        { grant: 'READ', to: 'Finance' },
        { grant: 'READ', to: 'Administrator' }
    ];
};
 