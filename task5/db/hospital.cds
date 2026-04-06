using { managed, cuid, sap.common.CodeList } from '@sap/cds/common';

namespace my.hospital;

entity Department : cuid, managed {
    name : String;
    description : String(100);
}

entity Doctor : cuid, managed {
    name : String;
    specialization : Association to one Department;
    mobile : String;
}

entity Patient : cuid, managed {
    name: String;
    age : Integer;
    mobile : String;
}

entity Appointment : cuid, managed {
    patient : Association to one Patient;
    Doctor : Association to one Doctor;
    date : DateTime;
    status : Association to one Status;
}

entity Status : CodeList {
    key code : String enum {
        Scheduled = 'S';
        Completed = 'C';
        Cancelled = 'X';
    };
    criticality : Integer;
}