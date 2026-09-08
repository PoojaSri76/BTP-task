namespace employee.onboarding;

using {cuid, managed } from '@sap/cds/common';

entity Employees : cuid, managed {
    firstName       : String(100);
    lastName        : String(100);
    email           : String(150);
    department      : String(100);
    joiningDate     : Date;
    status          : Status default 'Draft';
    documents       : Composition of many Documents on documents.employee = $self;
}

entity Documents : cuid, managed {
    employee        : Association to Employees;
    fileName        : String(255);
    mediaType       : String(100)  @Core.IsMediaType;
    content         : LargeBinary  @Core.MediaType: mediaType
    @Core.ContentDisposition.Filename: fileName;
    uploadedAt      : Timestamp;
}

type Status : String enum {
    Draft;
    Active;
    Inactive;
}