using {my.erm as db} from '../db/Schema';

@impl: 'srv/ExpenseService.js'
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

    @Analytics.query           : true
    @Aggregation.ApplySupported: {
        Transformations       : [
            'aggregate',
            'groupby',
            'filter'
        ],
        GroupableProperties   : ['Category'],
        AggregatableProperties: ['TotalAmount']
    }
    entity ExpenseByCategory as
        select from ExpenseItem as I
        inner join ExpensePolicies as P
            on I.category.ID = P.ID
        {
            key P.category             as Category,
                @Aggregation.default: #SUM
                sum(I.convertedAmount) as TotalAmount : Decimal(15, 2)
        }
        where
            I.status = 'Paid'
        group by
            P.category;

    function getPendingReimbursements() returns array of Reimbursement;
}

@impl: 'srv/ManagerService.js'
service ManagerService {
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

annotate ManagerService.ExpenseClaim with @restrict:[
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

annotate ManagerService.ExpenseItem with @restrict:[
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
 