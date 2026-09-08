namespace my.showroom;

entity Vehicles {
    key vehicleId : UUID;
    name          : String(100);
    brand         : String(50);
    model         : String(50);
    year          : Integer;
    color         : String(30);
    fuelType      : String(20);
    transmission  : String(20);
    mileage       : Decimal(10,2);
    oldPrice      : Decimal(12,2);
    newPrice      : Decimal(12,2);
    state         : String(20);
}