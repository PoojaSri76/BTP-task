using {my.hospital as db} from '../db/hospital';

service HospitalService {
    entity Department  as projection on db.Department;
    entity Doctor      as projection on db.Doctor;
    entity Patient     as projection on db.Patient;
    entity Appointment as projection on db.Appointment;
    entity Status      as projection on db.Status;
}

annotate HospitalService.Appointment with @odata.draft.enabled;

service AdminService {
    entity AdminAppointments as
        select from db.Appointment {
            key ID,
                date,

                patient.name as patientName,
                Doctor.name  as doctorName,

                status.code  as statusCode,
                status.name  as statusName,
                status.criticality
        };
}

annotate AdminService with @(requires: 'admin');
