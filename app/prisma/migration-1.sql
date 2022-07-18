begin;

alter type "indieco"."entity_type" rename to "entityType";
alter type "indieco"."event_status" rename to "eventStatus";

alter table "indieco"."entity" rename to "Entity";
alter table "indieco"."Entity" rename column created_at to "createdAt";
alter table "indieco"."Entity" rename column updated_at to "updatedAt";
alter table "indieco"."Entity" rename column logo_id to "logoId";
alter table "indieco"."Entity" rename column location_id to "locationId";
alter table "indieco"."Entity" alter column type type "indieco"."entityType";

alter table "indieco"."game" rename to "Game";
alter table "indieco"."Game" add column igdbSlug text;
alter table "indieco"."Game" rename column created_at to "createdAt";
alter table "indieco"."Game" rename column updated_at to "updatedAt";
alter table "indieco"."Game" drop column tag_list;

alter table "indieco"."event" rename to "Event";
alter table "indieco"."Event" rename column created_at to "createdAt";
alter table "indieco"."Event" rename column updated_at to "updatedAt";
alter table "indieco"."Event" rename column starts_at to "start";
alter table "indieco"."Event" rename column ends_at to "end";
alter table "indieco"."Event" rename column location_id to "locationId";
alter table "indieco"."Event" rename column cover_id to "coverId";

alter table "indieco"."image" rename to "Image";
alter table "indieco"."Image" rename column created_at to "createdAt";
alter table "indieco"."Image" rename column updated_at to "updatedAt";
alter table "indieco"."Image" rename column image_file to "file";

alter table "indieco"."location" rename to "Location";
alter table "indieco"."Location" rename column updated_at to "updatedAt";
alter table "indieco"."Location" rename column country_code to "countryCode";

alter table "indieco"."person" rename to "User";
alter table "indieco"."User" add column email text unique;
alter table "indieco"."User" add column "passwordHash" text;
alter table "indieco"."User" add column "isAdmin" boolean;
alter table "indieco"."User" add column "discordId" text unique;
alter table "indieco"."User" add column "githubId" text unique;
alter table "indieco"."User" rename column first_name to "name";
alter table "indieco"."User" rename column avatar_id to "avatarId";
alter table "indieco"."User" rename column created_at to "createdAt";
alter table "indieco"."User" rename column updated_at to "updatedAt";
alter table "indieco"."User" drop column last_name;

alter table "indieco"."tag" rename to "Tag";
alter table "indieco"."Tag" rename column created_at to "createdAt";
alter table "indieco"."Tag" rename column updated_at to "updatedAt";

alter table "indieco"."entity_event" rename to "_EntityToEvent";
alter table "indieco"."_EntityToEvent" rename column entity_id to "A";
alter table "indieco"."_EntityToEvent" rename column event_id to "B";
alter table "indieco"."_EntityToEvent" rename column created_at to "createdAt";
alter table "indieco"."_EntityToEvent" rename column updated_at to "updatedAt";

alter table "indieco"."entity_member" rename to "_EntityToUser";
alter table "indieco"."_EntityToUser" rename column entity_id to "A";
alter table "indieco"."_EntityToUser" rename column person_id to "B";
alter table "indieco"."_EntityToUser" rename column created_at to "createdAt";
alter table "indieco"."_EntityToUser" rename column updated_at to "updatedAt";

alter table "indieco"."event_participant" rename to "_EventToUser";
alter table "indieco"."_EventToUser" rename column event_id to "A";
alter table "indieco"."_EventToUser" rename column person_id to "B";
alter table "indieco"."_EventToUser" rename column joined_at to "joinedAt";

alter table "indieco"."game_entity" rename to "_EntityToGame";
alter table "indieco"."_EntityToGame" rename column game_id to "A";
alter table "indieco"."_EntityToGame" rename column entity_id to "B";
alter table "indieco"."_EntityToGame" rename column created_at to "createdAt";
alter table "indieco"."_EntityToGame" rename column updated_at to "updatedAt";

alter table "indieco"."game_event" rename to "_EventToGame";
alter table "indieco"."_EventToGame" rename column game_id to "A";
alter table "indieco"."_EventToGame" rename column event_id to "B";
alter table "indieco"."_EventToGame" rename column created_at to "createdAt";
alter table "indieco"."_EventToGame" rename column updated_at to "updatedAt";

alter table "indieco"."game_image" rename to "_GameToImage";
alter table "indieco"."_GameToImage" rename column game_id to "A";
alter table "indieco"."_GameToImage" rename column image_id to "B";
alter table "indieco"."_GameToImage" rename column created_at to "createdAt";
alter table "indieco"."_GameToImage" rename column updated_at to "updatedAt";

alter table "indieco"."game_tag" rename to "_GameToTag";
alter table "indieco"."_GameToTag" rename column game_id to "A";
alter table "indieco"."_GameToTag" rename column tag_id to "B";
alter table "indieco"."_GameToTag" rename column created_at to "createdAt";
alter table "indieco"."_GameToTag" rename column updated_at to "updatedAt";

drop table "indieco"."entity_image";
drop table "indieco"."game_author";

drop trigger entity_updated_at on indieco."Entity";
drop trigger event_updated_at on indieco."Event";
drop trigger game_updated_at on indieco."Game";
drop trigger image_updated_at on indieco."Image";
drop trigger location_updated_at on indieco."Location";
drop trigger tag_updated_at on indieco."Tag";
drop trigger person_updated_at on indieco."User";
drop trigger entity_event_updated_at on indieco."_EntityToEvent";
drop trigger game_entity_updated_at on indieco."_EntityToGame";
drop trigger entity_member_updated_at on indieco."_EntityToUser";
drop trigger game_event_updated_at on indieco."_EventToGame";
drop trigger game_image_updated_at on indieco."_GameToImage";
drop trigger game_tag_updated_at on indieco."_GameToTag";

update indieco."User"
set email = indieco_private.person_account.email, 
  "passwordHash" = indieco_private.person_account.password_hash
from indieco_private.person_account
where indieco."User".id = indieco_private.person_account.person_id;

delete from indieco."User"
where email is null;

drop schema indieco_private cascade;

commit;
