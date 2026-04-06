using { external.businessPartner as s4 } from '../db/extBP';
using { BusinessPartner.db as db } from '../db/BPHanaSchema';


service BusinessPartnerService{
    entity Customer as projection on s4.CustomerDet;
    entity CustomerDet as projection on db.CustomerDet;
    entity CustomerCompany as projection on s4.CustomerCompany;
    entity Supplier as projection on s4.Supplier;
    entity SupplierCompanyJunc as projection on db.SupplierCompanyJunc;
}