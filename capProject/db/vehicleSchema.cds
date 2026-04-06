using { managed } from '@sap/cds/common';

namespace my.showroom;

entity Dealer {
    key ID : UUID;
    name : String;
    location : String;
}

entity Vehicle{
    key ID : String;
    model : String;
    price : Integer;
    state : Association to one State;
    dealer : Association to Dealer;
    orders : Composition of many Order on orders.vehicleRef = $self;
    status : String enum{
        Pending;
        Approved;
        Rejected;
    } default 'Pending';
}

entity Order : managed {
    key ID : UUID;
    quantity : Integer;
    vehicleRef : Association to Vehicle;
}

entity State {
    key ID : UUID;
    name : String;
    stateCode : String;
    tax : Decimal;
}


