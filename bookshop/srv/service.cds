using { bookshopModel as my } from '../db/schema.cds';

@path:'/shop'
@impl:'srv/bookshopService.js'
service bookshopService {
    entity Books as projection on my.Books;
    // entity Category as projection on my.Category;

    entity Movie as projection on my.Movie;

    entity BookView as select from my.Books {
        title,
        author,
        price as INR
    } where price > 300;

    // entity MovieView as select from Movie as m left join  Category as c on m.category_ID = c.ID{
    //     m.name as title,
    //     c.name as category
    // }

    entity MovieView as select from Movie {
        name,
        category.name as category
    } where status='ACTIVE'

    entity ActiveMovies as select from Movie{
        category.name as category,
        count(*) as total
    }  where status = 'ACTIVE' group by category.name;
    entity aggregationView as select from Movie {
        count(*) as total,
        category.name as category
    }    group by category.name having count(*)>2;

    function bookInstock() returns array of Books;
}

@impl:'srv/admin.js'
service AdminService {
    entity Books as projection on my.Books;
    // entity movie as projection on my.Movie;
}
