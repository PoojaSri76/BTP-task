namespace external.businessPartner;
using { API_BUSINESS_PARTNER as ext } from '../srv/external/API_BUSINESS_PARTNER';

entity CustomerDet as projection on ext.A_Customer{
    key Customer,
    CustomerFullName,
    to_CustomerCompany
};

@cds.persistence.table
entity CustomerCompany as projection on ext.A_CustomerCompany{
    key Customer,
    key CompanyCode,
    CustomerHeadOffice
};

@cds.persistence.table
entity Supplier as projection on ext.A_Supplier{
    key Supplier,
    Customer,
    SupplierName,
    BirthDate,
    to_SupplierCompany
}

