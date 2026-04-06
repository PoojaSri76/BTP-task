namespace my.bookshop;

entity Books {
    key     ID       : UUID;
            name     : String;
            author   : Association to Authors;
            price    : Integer;
            genre    : String;
            stock    : Integer;
            status   : String enum {
                Active;
                Inactive;
            }
    virtual discount : Integer;
}

entity Authors {
    key     ID        : UUID;
            name      : String;
            country   : String;
    virtual bookCount : Integer;
}

entity Customer {
    key ID      : UUID;
        name    : String;
        mobile  : String(20);
        address : String;
        Order   : Association to many Orders
                      on Order.customer = $self;
}

entity Orders {
    key ID       : UUID;
        book     : Association to one Books;
        quantity : Integer;
        status   : String enum {
            Pending;
            Completed;
            Cancelled;
        };
        total    : Decimal(15, 2);
        customer : Association to one Customer;
}

entity Awards {
    key ID   : UUID;
        name : String;
}

entity BookAwards {
    key book   : Association to Books;
    key award  : Association to Awards;
        year   : String;
        status : String enum {
            Won;
            Nominated;
        }
}

entity ReadingClubs {
    key ID          : UUID;
        name        : String;
        description : String;
}

entity ClubMembers {
    key club   : Association to ReadingClubs;
    key member : Association to Customer;
}
