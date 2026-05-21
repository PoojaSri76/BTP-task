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
    entity Reimbursement   as projection on db.Reimbursement
        actions {
            action processReimbursement(paymentRef: String);
        };

    entity ExpensePolicies as projection on db.ExpensePolicies;
    entity ExpenseClaim    as projection on db.ExpenseClaim;
    entity ExpenseItem     as projection on db.ExpenseItem;

    function getPendingReimbursements() returns array of Reimbursement;
}

@impl: 'srv/ManagerService.js'
service ManagerService {
    entity Employee     as projection on db.Employee;

    entity ExpenseClaim as projection on db.ExpenseClaim
        actions {
            action CompleteReview();
        };

    entity ExpenseItem  as projection on db.ExpenseItem
        actions {
            action rejectClaim(reason: String(200));
            action approveClaim();
        };

}
