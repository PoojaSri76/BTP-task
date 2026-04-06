using { model1 as my } from '../db/schema.cds';

@path : '/service/Project1Service'
service Project1Service
{
    @cds.redirection.target
    @odata.draft.enabled
    entity users as
        projection on my.users;
}

annotate Project1Service with @requires :
[
    'authenticated-user'
];
