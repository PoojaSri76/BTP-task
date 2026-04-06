namespace model1;

entity users
{
    key ID : UUID;
    username : String(100);
    useremail : String(100);
    city : String(50);
    country : String(50);
    status : String(100);
}
