namespace my.showroom;

entity Vehicles {
    key vehicleId : String(20);
    name          : String(100);
    state         : String(100);
    oldPrice      : Decimal(15,2);
    newPrice      : Decimal(15,2);
    documents     : Composition of one VehicleDocuments
                      on documents.vehicle = $self;
}

entity VehicleDocuments {
    key ID      : UUID;
    vehicle     : Association to Vehicles;
    fileName    : String(255);
    mediaType   : String(100) @Core.IsMediaType;
    content     : LargeBinary @Core.MediaType: mediaType
    @Core.ContentDisposition.Filename: fileName;
}