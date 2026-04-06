namespace bookshopModel;

entity Books
{
    key ID : UUID;
    title : String(100);
    description : String(200);
    author : String(100);
    genre : String(100);
    price : Decimal;
    stock : Integer;
}
