using {my.showroom as db} from '../db/Vehicle';

service VehicleService {
    entity Vehicles as projection on db.Vehicles;
    entity VehicleDocuments as projection on db.VehicleDocuments;
    function overallSummary() returns array of {
        state:String; 
        count:Integer;
    }
}