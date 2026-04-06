using { my.showroom as db } from '../db/vehicle';

service VehicleService {
    entity Dealer as projection on db.Dealer;
    entity Vehicle as projection on db.Vehicle;
    entity Customer as projection on db.Customer;
    entity Order as projection on db.Order;
    entity State as projection on db.State;
    entity Discount as projection on db.Discount;
    entity Invoice as projection on db.Invoice;
    entity Payment as projection on db.Payment;
}

service AdminService {
     entity DealerView as select from db.Dealer{
        ID
    }
    entity StateView as select from db.State{
        ID
    }
}
annotate AdminService with @(requires: 'admin');
