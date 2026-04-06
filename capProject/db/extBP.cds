namespace external.businessPartner;
using { API_BUSINESS_PARTNER as ext } from '../srv/external/API_BUSINESS_PARTNER';

entity CustomerDet as projection on ext.A_Customer{
    key Customer,
    CustomerClassification,
    CustomerFullName
};

entity CustomerCompany as projection on ext.A_CustomerCompany{
    key Customer,
    key CompanyCode,
    CustomerHeadOffice
};
