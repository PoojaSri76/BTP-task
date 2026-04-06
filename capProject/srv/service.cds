// using {my.bookshop as db} from '../db/schema';

// service BookService {
//     entity Books   as projection on db.Books;
//     entity Authors as projection on db.Authors;
//     entity Orders  as projection on db.Orders;
//     entity Awards as projection on db.Awards;
//     entity BookAwards as projection on db.BookAwards;
//     entity Customer as projection on db.Customer;
//     entity ReadingClubs as projection on db.ReadingClubs;
//     entity ClubMembers as projection on db.ClubMembers;

//     // apply discount for specific book
//     action bookStatus(ID: UUID);
//     // increase the price based on the country
//     action increasePricesByCountry(country: String, percentage: Decimal);
//     // change order complete status
//     action orderCompleted(ID: UUID);
//     // Get all books by an author
//     function getBookByAuthor(author: UUID) returns Books;
//     // Get customers who ordered a specific book
//     function getCustomerByBook(bookID: UUID) returns Customer;
// }
