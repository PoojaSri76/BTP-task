using {retail.shop as db} from '../db/retailShop';

@impl: 'srv/retailService.js'
service retailService {
    entity Product  as projection on db.Product;
    entity Customer as projection on db.Customer;

    entity OrderTimeline as projection on db.OrderTimeline;

    entity Shipping as projection on db.Shipping;
    @odata.draft.enabled
    entity Order as projection on db.Orders actions{
        action orderDelivery();
    };

    // action insertOrderTimeline(order_ID: String, status:String, note:String);

    action cancelOrder(orderID : String, reason: String);
    function getOrdersCount(status: String) returns Integer;
}
