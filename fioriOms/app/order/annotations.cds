using retailService as service from '../../srv/shop';

annotate service.Order with @(
    UI.DataPoint #payment      : {
        Value        : amountPaid,
        TargetValue  : totalAmount,

        Visualization: #Progress
    },
    UI.FieldGroup #GeneralInfo : {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Label: 'ID',
                Value: ID,
            },
            {
                $Type: 'UI.DataField',
                Label: 'quantity',
                Value: quantity,
            },
            {
                $Type: 'UI.DataField',
                Label: 'totalAmount',
                Value: totalAmount,
            },
            {
                $Type      : 'UI.DataField',
                Label      : 'status',
                Value      : status,
                Criticality: criticality
            },
        // {
        //     $Type: 'UI.DataField',
        //     Label: 'Product Image',
        //     Value: imageUrl
        // },
        ],
    },
    UI.FieldGroup #Invoice     : {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Label: 'customer_ID',
                Value: customer_ID,
            },
            {
                $Type: 'UI.DataField',
                Label: 'product_ID',
                Value: product_ID,
            },
            {
                $Type: 'UI.DataField',
                Label: 'quantity',
                Value: quantity,
            },
            {
                $Type: 'UI.DataField',
                Label: 'pricePerUnit',
                Value: pricePerUnit,
            },
            {
                $Type: 'UI.DataField',
                Label: 'subTotal',
                Value: subTotal,
            },
            {
                $Type: 'UI.DataField',
                Label: 'shippingCharge',
                Value: shippingCharge,
            },
            {
                $Type: 'UI.DataField',
                Label: 'totalAmount',
                Value: totalAmount,
            },
            {
                $Type : 'UI.DataFieldForAnnotation',
                Target: '@UI.DataPoint#payment',
                Label : 'Amount Paid'
            }
        ]
    },
    UI.FieldGroup #ProductInfo : {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Label: 'Name',
                Value: product.name
            },
            {
                $Type: 'UI.DataField',
                Label: 'Category',
                Value: product.category
            }
        ]
    },
    UI.FieldGroup #CustomerInfo: {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Label: 'Name',
                Value: customer.name
            },
            {
                $Type: 'UI.DataField',
                Label: 'Contact',
                Value: customer.phone
            },
            {
                $Type: 'UI.DataField',
                Label: 'Location',
                Value: customer.city
            }
        ]
    },
    UI.FieldGroup #DetailInfo  : {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Label: 'product_ID',
                Value: product_ID,
            },
            {
                $Type: 'UI.DataField',
                Label: 'Quantity',
                Value: quantity,
            },
            {
                $Type: 'UI.DataField',
                Label: 'Total Amount',
                Value: totalAmount,
            },
            {
                $Type: 'UI.DataField',
                Label: 'Amount Paid',
                Value: amountPaid,
            },
            {
                $Type: 'UI.DataField',
                Label: 'Amount Pending',
                Value: amountPending,
            },
        ]
    },

    UI.Facets                  : [
        {
            $Type : 'UI.ReferenceFacet',
            ID    : 'GeneralInfoFacet',
            Label : 'General Information',
            Target: '@UI.FieldGroup#GeneralInfo',
        },
        {
            $Type : 'UI.ReferenceFacet',
            ID    : 'InvoiceFacet',
            Label : 'Invoice',
            Target: '@UI.FieldGroup#Invoice'
        },
        {
            $Type        : 'UI.CollectionFacet',
            Label        : 'Additional info',
            Facets       : [
                {
                    $Type : 'UI.ReferenceFacet',
                    Label : 'Product Details',
                    Target: '@UI.FieldGroup#ProductInfo',

                },
                {
                    $Type : 'UI.ReferenceFacet',
                    Label : 'Customer Details',
                    Target: '@UI.FieldGroup#CustomerInfo',
                }
            ],
            ![@UI.Hidden]: {$edmJson: {$Not: {$Path: 'IsActiveEntity'}}}
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Order Timeline',
            Target: 'timeline/@UI.LineItem'
        }
    ],
    UI.HeaderFacets            : [{
        $Type : 'UI.ReferenceFacet',
        ID    : 'DetailFacet',
        Label : 'Details',
        Target: '@UI.FieldGroup#DetailInfo'
    }],
    UI.LineItem                : [
        {
            $Type             : 'UI.DataField',
            Label             : 'ID',
            Value             : ID,

            @HTML5.CssDefaults: {width: '75px'}

        },
        {
            $Type: 'UI.DataField',
            Label: 'Ordered on',
            Value: orderDate,
        },
        {
            $Type             : 'UI.DataField',
            Label             : 'Quantity',
            Value             : quantity,
            @HTML5.CssDefaults: {width: '70px'}
        },
        {
            $Type: 'UI.DataField',
            Label: 'Price Per Unit',
            Value: pricePerUnit,
        },
        {
            $Type: 'UI.DataField',
            Label: 'SubTotal',
            Value: subTotal,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Shipping Charge',
            Value: shippingCharge,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Total Amount',
            Value: totalAmount
        },
        {
            $Type             : 'UI.DataField',
            Label             : 'Status',
            Value             : status,
            Criticality       : criticality,
            @HTML5.CssDefaults: {width: '100px'}
        },
        {
            $Type             : 'UI.DataFieldForAction',
            Action            : 'retailService.orderDelivery',
            Label             : 'Mark Delivered',
            Inline            : true,
            ![@UI.Hidden]     : {$edmJson: {$Not: {$Eq: [
                {$Path: 'status'},
                'Ordered'
            ]}}},

            @HTML5.CssDefaults: {width: '150px'}
        },
        {
            $Type             : 'UI.DataFieldWithUrl',
            Label             : 'Tracking ID',
            Value             : trackingID,
            Url               : TrackingURL,
            @HTML5.CssDefaults: {width: '100px'}
        },
        {
            $Type: 'UI.DataFieldForAction',
            Label: 'Cancel Order',
            Action: 'retailService.EntityContainer/cancelOrder'
        },
        {
            $Type: 'UI.DataFieldForAction',
            Label: 'Get Count',
            Action: 'retailService.EntityContainer/getOrdersCount'
        }
    ],
    UI.SelectionFields         : [
        totalAmount,
        customer_ID,
        product_ID,
    ],
    UI.HeaderInfo              : {
        TypeName      : 'Order',
        TypeNamePlural: 'Orders',
        Title         : {
            $Type: 'UI.DataField',
            Value: ID
        },
        Description   : {
            $Type: 'UI.DataField',
            Value: status
        },
        ImageUrl      : imageUrl
    },
    UI.Identification          : [{
        $Type        : 'UI.DataFieldForAction',
        Label        : 'Mark Delivered',
        action       : 'retailService.orderDelivery',
        ![@UI.Hidden]: {$edmJson: {$Not: {$Eq: [
            {$Path: 'status'},
            'Ordered'
        ]}}},
    }],
    UI.PresentationVariant     : {
        Visualizations: ['@UI.LineItem'],
        MaxItems      : 5
    },
);

annotate service.Order with actions {
    orderDelivery @Common.IsActionCritical: true
                  @Common.SideEffects     : {TargetProperties: [
        'status',
        'criticality'
    ]}
};

annotate service.Order with {
    totalAmount @Common.Label: 'Total Amount';
    customer    @Common.Label: 'Customer';
    product     @Common.Label: 'Product';
    pricePerUnit @Core.Computed;
    subTotal @Core.Computed;
    totalAmount @Core.Computed;
    status @Core.Computed;
};

annotate service.Order with {
    customer @Common.ValueList: {
        $Type         : 'Common.ValueListType',
        CollectionPath: 'Customer',
        Parameters    : [
            {
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: customer_ID,
                ValueListProperty: 'ID',
            },
            {
                $Type            : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty: 'name',
            },
            {
                $Type            : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty: 'email',
            },
            {
                $Type            : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty: 'phone',
            },
            {
                $Type            : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty: 'city',
            },
        ],
    }
};

annotate service.Order with {
    product @Common.ValueList: {
        $Type         : 'Common.ValueListType',
        CollectionPath: 'Product',
        Parameters    : [
            {
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: product_ID,
                ValueListProperty: 'ID',
            },
            {
                $Type            : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty: 'name',
            },
            {
                $Type            : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty: 'category',
            },
            {
                $Type            : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty: 'price',
            },
            {
                $Type            : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty: 'stock',
            },
        ],
    }
};

annotate service.OrderTimeline with @(
    UI.LineItem                : [
        {
            $Type: 'UI.DataField',
            Label: 'ID',
            Value: ID
        },
        {
            $Type: 'UI.DataField',
            Label: 'Status',
            Value: status
        },
        {
            $Type: 'UI.DataField',
            Label: 'Date and Time',
            Value: date
        },

    ],
    UI.FieldGroup #TimelineInfo: {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Label: 'ID',
                Value: ID
            },
            {
                $Type: 'UI.DataField',
                Label: 'Status',
                Value: status
            },
            {
                $Type: 'UI.DataField',
                Label: 'Date and Time',
                Value: date
            },
            {
                $Type: 'UI.DataField',
                Label: 'Note',
                Value: note
            },
        ]
    },
    UI.Facets                  : [{
        $Type : 'UI.ReferenceFacet',
        ID    : 'GeneralInfo',
        Label : 'General Information',
        Target: '@UI.FieldGroup#TimelineInfo'
    }],
    UI.HeaderInfo              : {
        TypeName      : 'Timeline',
        TypeNamePlural: 'Timeline Entries',
        Title         : {
            $Type: 'UI.DataField',
            Value: ID
        },
        Description   : {
            $Type: 'UI.DataField',
            Value: status
        }
    }
);

annotate service.cancelOrder with @(
    Common.SideEffects : {
        TargetEntities : [
            '/retailService.EntityContainer/Order'
        ]
    }
);

annotate service.getOrdersCount with (
    status @Common.ValueList: {
        CollectionPath : 'Order',
        Parameters : [
            {
                $Type : 'Common.ValueListParameterInOut',
                ValueListProperty : 'status'
            }
        ]
    }
);
