namespace retail.shop;

entity Product {
    key ID       : String(10);
        name     : String(100);
        category : String(50);
        price    : Decimal(10, 2);
        stock    : Integer;
}

entity Customer {
    key ID    : String(10);
        name  : String(100);
        email : String(100);
        phone : String(10);
        city  : String(50);
}

entity Orders {
    key ID                    : String(10);
        quantity              : Integer;
        pricePerUnit          : Decimal(10, 2);
        subTotal              : Decimal(10, 2);
        shippingCharge        : Decimal(10, 2);
        totalAmount           : Decimal(10, 2);

        @assert.range: [
            'Ordered',
            'Delivered',
            'Cancelled'
        ]
        status                : String enum {
            Ordered;
            Delivered;
            Cancelled;
        };

        @UI.Hidden   : true
        virtual criticality   : Integer;
        trackingID            : String;

        @UI.Hidden   : true
        TrackingURL           : String;
        orderDate             : Timestamp default CURRENT_TIMESTAMP @UI.DateTimeStyle: 'medium';
        amountPaid            : Decimal(10, 2);
        virtual amountPending : Decimal(10, 2);
        customer              : Association to Customer;
        product               : Association to Product;
        imageUrl              : String                              @UI.IsImageURL   : true;
        timeline              : Composition of many OrderTimeline
                                    on timeline.order = $self;
}

entity OrderTimeline {
    key ID     : String(10);
        status : String enum {
            Ordered;
            Delivered;
            Cancelled;
        };
        date   : Timestamp default CURRENT_TIMESTAMP @UI.DateTimeStyle: 'short';
        note   : String(255);
        order  : Association to Orders;
}
