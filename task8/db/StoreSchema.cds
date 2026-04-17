namespace my.store;

entity Product {
  key ID          : String;
      name        : localized String @Common.Label : '{i18n>productName}';
      description : localized String @Common.Label : '{i18n>productDesc}';
      price       : Decimal(10, 2) @Common.Label : '{i18n>productPrice}';
      status : String enum{
        Active;
        Inactive
      } default 'Inactive';     
}

 