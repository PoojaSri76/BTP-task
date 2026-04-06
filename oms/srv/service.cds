using { my.oms as db } from '../db/schema';

service OmsServices {
    entity Customer as projection on db.Customer;
    entity CustomerAddress as projection on db.CustomerAddress;
    entity Supplier as projection on db.Supplier;
    entity ProductCategory as projection on db.ProductCategory;
    entity Product as projection on db.Product;
    entity SupplierProduct as projection on db.SupplierProduct;
    entity Inventory as projection on db.Inventory;
    entity OrderHeader as projection on db.OrderHeader;
    entity OrderDetail as projection on db.OrderDetail;
    entity Payment as projection on db.Payment;
    entity Shipping as projection on db.Shipping;
    entity ProductReturns as projection on db.ProductReturns;
    entity Refund as projection on db.Refund;

    // cancel order in irder header and order detail
    action cancelOrder(ID: UUID) returns String;
    // process payment based on payment type
    action processPayment(orderId: UUID, paymentMethod: String, amount: Integer)
    // customer specific orders
    function getCustomerOrders(ID:UUID) returns OrderHeader;
    // List orders that are ready to be shipped or pending shipment
    function getPendingOrders() returns many OrderHeader;
    // List all products with stock in a warehouse
    function getProductInWarehouse(warehouseId:UUID) returns many Inventory;
    // refund
    action amountRefund(orderId: UUID) returns {
        success : Boolean;
        message : String;
    };
    // order deliver status
    action markDelivered(ID : UUID) returns {
        success : Boolean;
        message : String
    }
}