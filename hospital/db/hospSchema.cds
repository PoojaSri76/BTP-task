namespace my.hospital;


entity Patient {
    key ID            : String;
        name          : String(100);
        gender        : String(10);
        dateOfBirth   : Date;
        bloodGroup    : String(5);
        contactNumber : String(15);
}

entity Doctor {
    key ID             : String;
        name           : String(100);
        specialization : String(50);
        department     : String(50);
        contactNumber  : String(15);
}
