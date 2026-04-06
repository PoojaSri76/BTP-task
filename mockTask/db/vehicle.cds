using {managed} from '@sap/cds/common';

namespace my.showroom;

type Address {
    amenity    : String;
    street     : String;
    city       : String;
    county     : String;
    state      : String;
    country    : String;
    postalcode : String;
}

entity Dealer : managed {
    key ID        : UUID;
        name      : String;
        address  : Address;
        latitude  : String;
        longitude : String;
}

entity Vehicle : managed {
    key ID           : String;
        model        : String;
        currentPrice : Decimal(15, 2);
        prevPrice    : Decimal(15, 2);
        state        : Association to one State;
        dealer_ID    : UUID;
        dealer       : Association to Dealer
                           on dealer.ID = dealer_ID;
        orders       : Composition of many Order
                           on orders.vehicleRef = $self;
        status       : String enum {
            Active;
            Inactive
        } default 'Active';
}

entity Customer : managed {
    key ID      : UUID;
        name    : String;
        email   : String;
        mobile  : String;
        address : String;
}

entity Order : managed {
    key ID         : UUID;
        quantity   : Integer;
        vehicleRef : Association to Vehicle;
        customer   : Association to Customer;
        amount     : Decimal(15, 2)
}

entity State : managed {
    key ID        : UUID;
        name      : String;
        stateCode : String;
        tax       : Decimal(5, 2);
}

entity Discount : managed {
    key ID          : UUID;
        code        : String;
        description : String;
        percent     : Decimal(5, 2)
}

entity Invoice : managed {
    key ID             : UUID;
        order          : Association to one Order;
        discount       : Association to one Discount;
        subTotal       : Decimal(15, 2);
        discountAmount : Decimal(15, 2);
        taxAmount      : Decimal(15, 2);
        netAmount      : Decimal(15, 2);
        payment        : Composition of one Payment
                             on payment.invoice = $self;
}

entity Payment : managed {
    key ID            : UUID;
        invoice       : Association to one Invoice;
        amount        : Decimal(15, 2);
        paymentMethod : String enum {
            Cash;
            Card;
            UPI;
        }
        status        : String enum {
            Pending;
            Paid;
            Failed
        } default 'Pending';
}
