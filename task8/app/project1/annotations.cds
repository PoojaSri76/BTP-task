using StoreService as service from '../../srv/StoreService';

annotate service.Product with @(
    UI.FieldGroup #GeneratedGroup: {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Label: 'ID',
                Value: ID,
            },
            {
                $Type: 'UI.DataField',
                Label: 'pro name',
                Value: name,
            },
            {
                $Type: 'UI.DataField',
                Value: description,
            },
            {
                $Type: 'UI.DataField',
                Value: price,
            }, 
            {
                $Type: 'UI.DataField',
                Value: status,
                Label: 'Status'
            },
            {
                $Type : 'UI.DataFieldForAction',
                Action: 'StoreService.activateProduct',
                Label : 'Activate',
            }
        ],
    },
    UI.Facets                    : [{
        $Type : 'UI.ReferenceFacet',
        ID    : 'GeneratedFacet1',
        Label : 'General Information',
        Target: '@UI.FieldGroup#GeneratedGroup',
    }, ],
    UI.LineItem                  : [
        {
            $Type: 'UI.DataField',
            Label: 'ID',
            Value: ID,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Status',
            Value: status,
        },
        {
            $Type: 'UI.DataField',
            Value: name,
        },
        {
            $Type : 'UI.DataFieldForAction',
            Action: 'StoreService.activateProduct',
            Label : 'Activate',
            Inline: true,
        },
        {
            $Type: 'UI.DataField',
            Value: description,
        },
        {
            $Type: 'UI.DataField',
            Value: price,
        },
        {
            $Type : 'UI.DataFieldForAction',
            Action: 'StoreService.EntityContainer/addDiscount',
            Label : 'Add Discount',
        },
    ],
    // Common.SideEffects           : {
    //     TargetEntities: ['StoreService.Product'],
    //     TargetProperties:['status'],
    //     TriggerAction : 'StoreService.activateProduct'
    // }
);
