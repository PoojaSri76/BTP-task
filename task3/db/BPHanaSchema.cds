namespace BusinessPartner.db;
using { external.businessPartner as ext} from './extBP';

entity CustomerDet {
    key ID               : String;
        CustomerFullName       : String;
        // to_CustomerCompany_CompanyCode : String;
        // to_CustomerCompany : Association to one ext.CustomerCompany on to_CustomerCompany.CompanyCode = to_CustomerCompany_CompanyCode;
        to_CustomerCompany : Association to many ext.CustomerCompany on to_CustomerCompany.Customer = ID;
}

entity SupplierCompanyJunc {
    key supplier : Association to one ext.Supplier;
    key company_CompanyCode : String;
    company : Association to one ext.CustomerCompany on company.CompanyCode = company_CompanyCode;
}