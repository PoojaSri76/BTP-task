using { my.showroom as db } from '../db/schema';

service vehicleService {
    entity Vehicle as projection on db.Vehicles;
}