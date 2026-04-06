// using { my.showroom as db } from '../db/vehicleSchema';

// service VehicleService {
//     entity Dealer as projection on db.Dealer;
//     entity Vehicle as projection on db.Vehicle;
//     entity Order as projection on db.Order;
//     entity State as projection on db.State;

//     // actions
//     // approve vehicle
//     action approveVehicle(ID : UUID) returns String;
//     // function
//     // total order value for a specific vehicle
//     function getTotalOrderValue(ID:UUID) returns Integer;
// }