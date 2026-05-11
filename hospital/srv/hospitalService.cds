using { my.hospital as db } from '../db/hospSchema';

service Hospital {
    entity Doctor as projection on db.Doctor;
    entity Patient as projection on db.Patient;
}