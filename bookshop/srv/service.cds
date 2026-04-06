using { bookshopModel as my } from '../db/schema.cds';


service bookshopService
{
    entity Books as
        projection on my.Books;
}

