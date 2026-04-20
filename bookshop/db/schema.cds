using {cuid} from '@sap/cds/common';

namespace bookshopModel;

@cds.autoexpose
entity Category : cuid {
    name   : String;
    movies : Association to many Movie
                 on movies.category = $self;
}

entity Movie : cuid {
    name     : String;
    category : Association to one Category @assert.target;

    @assert.range: [
        'ACTIVE',
        'INACTIVE'
    ]
    status   : String enum {
        ACTIVE;
        INACTIVE;
    } default 'ACTIVE';
}

entity Books {
    key ID          : UUID;
        title       : String(100) @mandatory;
        description : String(200);
        author      : String(100) @readonly;
        genre       : String;
        price       : Decimal;
        stock       : Integer;
}
