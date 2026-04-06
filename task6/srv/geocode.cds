service GeocodeService {
    action getLocation(location: String) returns {
        latitude     : Double;
        longitude    : Double;
        display_name : String;
        boundingbox  : array of String;
        sub_division : array of String;
    }

    action getStructuredLocation(amenity: String,
                                 street: String,
                                 city: String,
                                 county: String,
                                 state: String,
                                 country: String,
                                 postalcode: String) returns {
        latitude     : Double;
        longitude    : Double;
        display_name : String;
        boundingbox  : array of String;
    }
}
