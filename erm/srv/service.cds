using {my.erm as db} from '../db/schema';

@impl:'srv/ExpenseService.js'
service ExpenseService {
    entity Employee as projection on db.Employee;
    entity Department as projection on db.Department;
    entity ExpensePolicies as projection on db.ExpensePolicies;
    @odata.draft.enabled
    entity ExpenseClaim as projection on db.ExpenseClaim actions{
        action submitClaim();
        action withdrawClaim();
        action rejectClaim(reason : String(200));
        action approveClaim();
        action CompleteReview();
    };
    entity ExpenseItem as projection on db.ExpenseItem;
}

@impl:'srv/ReimbursementService.js'
service ReimbursementService  {
    entity Reimbursement as projection on db.Reimbursement actions{
        action processReimbursement(paymentRef: String);
    };
    function getPendingReimbursements() returns array of Reimbursement;
}