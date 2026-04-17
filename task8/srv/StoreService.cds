using { my.store as db } from '../db/StoreSchema';

service StoreService {
    // @odata.draft.enabled
    entity Product @(restrict: [
  { grant: 'READ', to: 'User' },
  { grant: ['READ','WRITE'], to: 'Admin' }
])
    as projection on db.Product actions{
    action activateProduct(); 
        function getdata() returns String;   

    };

    function getAllData() returns array of Product;
    action addDiscount(ID:String, discount: Decimal(5, 2)) ;

}

annotate StoreService.Product with actions {
    activateProduct @Common.SideEffects: {
        TargetProperties: ['status'],
    };
};
