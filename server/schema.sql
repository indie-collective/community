begin;


create schema indieco;
create schema indieco_private;


---------
-- types

create type indieco.entity_type as enum (
  'company',
  'association',
  'organisation'
);


---------
-- tables

create table indieco.person (
  id               serial primary key,
  first_name       text not null check (char_length(first_name) < 80),
  last_name        text check (char_length(last_name) < 80),
  about            text,
  created_at       timestamptz default now()
);

comment on table indieco.person is 'A user of the site.';
comment on column indieco.person.id is 'The primary unique identifier for the person.';
comment on column indieco.person.first_name is 'The person’s first name.';
comment on column indieco.person.last_name is 'The person’s last name.';
comment on column indieco.person.about is 'A short description of the user, written by the user.';
comment on column indieco.person.created_at is 'The time this person was created.';

create table indieco.location (
  id               serial primary key,
  country          text not null check (char_length(country) < 80),
  city             text not null check (char_length(city) < 80),
  latitude         float,
  longitude        float
);

comment on table indieco.location is 'A location.';
comment on column indieco.location.id is 'The primary unique identifier for the location.';
comment on column indieco.location.country is 'The location country.';
comment on column indieco.location.city is 'The location city.';
comment on column indieco.location.latitude is 'The location latitude.';
comment on column indieco.location.longitude is 'The location longitude.';

create table indieco.image (
  id               serial primary key,
  image_file       text,
  created_at       timestamptz default now()
);

comment on table indieco.image is 'An image.';
comment on column indieco.image.id is 'The primary unique identifier for the image.';
comment on column indieco.image.image_file is 'The image file.';
comment on column indieco.image.created_at is 'The time this image was created.';

create table indieco.tag (
  id               serial primary key,
  name             text not null check (char_length(name) < 30),
  created_at       timestamptz default now()
);

comment on table indieco.tag is 'An tag.';
comment on column indieco.tag.id is 'The primary unique identifier for the tag.';
comment on column indieco.tag.name is 'The tag name.';
comment on column indieco.tag.created_at is 'The time this tag was created.';

create table indieco.entity (
  id               serial primary key,
  type             indieco.entity_type,
  name             text not null check (char_length(name) < 80),
  about            text,
  location_id      integer not null references indieco.location(id),
  created_at       timestamptz default now()
);

comment on table indieco.entity is 'An entity.';
comment on column indieco.entity.id is 'The primary unique identifier for the entity.';
comment on column indieco.entity.type is 'The type of entity.';
comment on column indieco.entity.name is 'The entity name.';
comment on column indieco.entity.about is 'A short description of the entity.';
comment on column indieco.entity.location_id is 'The location of the entity.';
comment on column indieco.entity.created_at is 'The time this entity was created.';

create table indieco.game (
  id               serial primary key,
  name             text not null check (char_length(name) < 80),
  about            text,
  site             text check (char_length(name) < 512),
  created_at       timestamptz default now()
);

comment on table indieco.game is 'A game.';
comment on column indieco.game.id is 'The primary unique identifier for the game.';
comment on column indieco.game.name is 'The game name.';
comment on column indieco.game.about is 'A short description of the game.';
comment on column indieco.game.site is 'The website of the game.';
comment on column indieco.game.created_at is 'The time this game was created.';

create table indieco.event (
  id               serial primary key,
  name             text not null check (char_length(name) < 80),
  about            text,
  location_id      integer not null references indieco.location(id),
  site             text check (char_length(name) < 512),
  starts_at        timestamptz not null,
  ends_at          timestamptz not null,
  created_at       timestamptz default now()
);

comment on table indieco.event is 'An event.';
comment on column indieco.event.id is 'The primary unique identifier for the event.';
comment on column indieco.event.name is 'The event name.';
comment on column indieco.event.about is 'A short description of the event.';
comment on column indieco.event.location_id is 'The location of the event.';
comment on column indieco.event.site is 'The website of the event.';
comment on column indieco.event.starts_at is 'The start time of the event.';
comment on column indieco.event.ends_at is 'The end time of the event.';
comment on column indieco.event.created_at is 'The time this event was created.';


------------
-- relations

create table indieco.entity_member (
  entity_id        int constraint team_member_entity_id_fkey references indieco.entity(id),
  person_id        int constraint team_member_person_id_fkey references indieco.person(id),
  created_at       timestamptz not null,
  primary key (entity_id, person_id)
);

comment on constraint team_member_entity_id_fkey on indieco.entity_member is E'@manyToManyFieldName entities';
comment on constraint team_member_person_id_fkey on indieco.entity_member is E'@manyToManyFieldName people';

create table indieco.entity_image (
  entity_id        int constraint entity_image_entity_id_fkey references indieco.entity(id),
  image_id         int constraint entity_image_image_id_fkey references indieco.image(id),
  created_at       timestamptz not null,
  primary key (entity_id, image_id)
);

comment on constraint entity_image_entity_id_fkey on indieco.entity_image is E'@manyToManyFieldName entities';
comment on constraint entity_image_image_id_fkey on indieco.entity_image is E'@manyToManyFieldName images';

create table indieco.entity_event (
  entity_id        int constraint entity_event_entity_id_fkey references indieco.entity(id),
  event_id         int constraint entity_event_event_id_fkey references indieco.event(id),
  created_at       timestamptz not null,
  primary key (entity_id, event_id)
);

comment on constraint entity_event_entity_id_fkey on indieco.entity_event is E'@manyToManyFieldName entities';
comment on constraint entity_event_event_id_fkey on indieco.entity_event is E'@manyToManyFieldName events';

create table indieco.game_author (
  game_id          int constraint game_author_game_id_fkey references indieco.game(id),
  person_id        int constraint game_author_person_id_fkey references indieco.person(id),
  created_at       timestamptz not null,
  primary key (game_id, person_id)
);

comment on constraint game_author_game_id_fkey on indieco.game_author is E'@manyToManyFieldName games';
comment on constraint game_author_person_id_fkey on indieco.game_author is E'@manyToManyFieldName people';

create table indieco.game_entity (
  game_id          int constraint game_entity_game_id_fkey references indieco.game(id),
  entity_id        int constraint game_entity_entity_id_fkey references indieco.entity(id),
  created_at       timestamptz not null,
  primary key (game_id, entity_id)
);

comment on constraint game_entity_game_id_fkey on indieco.game_entity is E'@manyToManyFieldName games';
comment on constraint game_entity_entity_id_fkey on indieco.game_entity is E'@manyToManyFieldName entities';

create table indieco.game_image (
  game_id          int constraint game_image_game_id_fkey references indieco.game(id),
  image_id         int constraint game_image_image_id_fkey references indieco.image(id),
  created_at       timestamptz not null,
  primary key (game_id, image_id)
);

comment on constraint game_image_game_id_fkey on indieco.game_image is E'@manyToManyFieldName games';
comment on constraint game_image_image_id_fkey on indieco.game_image is E'@manyToManyFieldName images';

create table indieco.game_tag (
  game_id          int constraint game_tag_game_id_fkey references indieco.game(id),
  tag_id           int constraint game_tag_tag_id_fkey references indieco.tag(id),
  created_at       timestamptz not null,
  primary key (game_id, tag_id)
);

comment on constraint game_tag_game_id_fkey on indieco.game_tag is E'@manyToManyFieldName games';
comment on constraint game_tag_tag_id_fkey on indieco.game_tag is E'@manyToManyFieldName tags';

create table indieco.game_event (
  game_id          int constraint game_event_game_id_fkey references indieco.game(id),
  event_id         int constraint game_event_event_id_fkey references indieco.event(id),
  created_at       timestamptz not null,
  primary key (game_id, event_id)
);

comment on constraint game_event_game_id_fkey on indieco.game_event is E'@manyToManyFieldName games';
comment on constraint game_event_event_id_fkey on indieco.game_event is E'@manyToManyFieldName events';


------------
-- functions

alter default privileges revoke execute on functions from public;

create function indieco.person_full_name(person indieco.person) returns text as $$
  select person.first_name || ' ' || person.last_name
$$ language sql stable;

comment on function indieco.person_full_name(indieco.person) is 'A person’s full name which is a concatenation of their first and last name.';

-- create function indieco.post_summary(
--   post indieco.post,
--   length int default 50,
--   omission text default '…'
-- ) returns text as $$
--   select case
--     when post.body is null then null
--     else substr(post.body, 0, length) || omission
--   end
-- $$ language sql stable;

-- comment on function indieco.post_summary(indieco.post, int, text) is 'A truncated version of the body for summaries.';

-- create function indieco.person_latest_post(person indieco.person) returns indieco.post as $$
--   select post.*
--   from indieco.post as post
--   where post.author_id = person.id
--   order by created_at desc
--   limit 1
-- $$ language sql stable;

-- comment on function indieco.person_latest_post(indieco.person) is 'Gets the latest post written by the person.';

-- create function indieco.search_posts(search text) returns setof indieco.post as $$
--   select post.*
--   from indieco.post as post
--   where post.headline ilike ('%' || search || '%') or post.body ilike ('%' || search || '%')
-- $$ language sql stable;

-- comment on function indieco.search_posts(text) is 'Returns posts containing a given search term.';

-- alter table indieco.person add column updated_at timestamptz default now();
-- alter table indieco.post add column updated_at timestamptz default now();

create function indieco_private.set_updated_at() returns trigger as $$
begin
  new.updated_at := current_timestamp;
  return new;
end;
$$ language plpgsql;

create trigger person_updated_at before update
  on indieco.person
  for each row
  execute procedure indieco_private.set_updated_at();

-- create trigger post_updated_at before update
--   on indieco.post
--   for each row
--   execute procedure indieco_private.set_updated_at();


-----------------
-- private tables

create table indieco_private.person_account (
  person_id        integer primary key references indieco.person(id) on delete cascade,
  email            text not null unique check (email ~* '^.+@.+\..+$'),
  password_hash    text not null,
  is_admin         boolean not null default false
);

comment on table indieco_private.person_account is 'Private information about a person’s account.';
comment on column indieco_private.person_account.person_id is 'The id of the person associated with this account.';
comment on column indieco_private.person_account.email is 'The email address of the person.';
comment on column indieco_private.person_account.password_hash is 'An opaque hash of the person’s password.';

-------------------------
-- registration functions

create extension if not exists "pgcrypto";

create function indieco.register_person(
  first_name text,
  last_name text,
  email text,
  password text
) returns indieco.person as $$
declare
  person indieco.person;
begin
  insert into indieco.person (first_name, last_name) values
    (first_name, last_name)
    returning * into person;

  insert into indieco_private.person_account (person_id, email, password_hash) values
    (person.id, email, crypt(password, gen_salt('bf')));

  return person;
end;
$$ language plpgsql strict security definer;

comment on function indieco.register_person(text, text, text, text) is 'Registers a single user and creates an account in our forum.';

create role indieco_postgraphile login password 'xyz';

create role indieco_anonymous;
grant indieco_anonymous to indieco_postgraphile;

create role indieco_person;
grant indieco_person to indieco_postgraphile;

create type indieco_private.jwt_token as (
  role text,
  exp integer,
  person_id integer,
  is_admin boolean,
  email varchar
);

create function indieco.authenticate(
  email text,
  password text
) returns indieco_private.jwt_token as $$
  select (
    'indieco_person',
    extract(epoch from now() + interval '7 days'),
    person_id,
    is_admin,
    email
  )::indieco_private.jwt_token
    from indieco_private.person_account
    where 
      person_account.email = $1 
      and person_account.password_hash = crypt($2, person_account.password_hash);
$$ language sql strict security definer;

comment on function indieco.authenticate(text, text) is 'Creates a JWT token that will securely identify a person and give them certain permissions.';

create function indieco.current_person() returns indieco.person as $$
  select *
  from indieco.person
  where id = current_setting('jwt.claims.person_id', true)::integer
$$ language sql stable;

comment on function indieco.current_person() is 'Gets the person who was identified by our JWT.';

create function indieco.change_password(current_password text, new_password text) 
returns boolean as $$
declare
  current_person indieco.person;
begin
  current_person := indieco.current_person();
  if exists (select 1 from indieco_private.person_account where person_account.person_id = current_person.id and person_account.password_hash = crypt($1, person_account.password_hash)) 
  then
    update indieco_private.person_account set password_hash = crypt($2, gen_salt('bf')) where person_account.person_id = current_person.id; 
    return true;
  else 
    return false;
  end if;
end;
$$ language plpgsql strict security definer;

grant usage on schema indieco to indieco_anonymous, indieco_person;

grant select on table indieco.person to indieco_anonymous, indieco_person;
grant update, delete on table indieco.person to indieco_person;

-- grant select on table indieco.post to indieco_anonymous, indieco_person;
-- grant insert, update, delete on table indieco.post to indieco_person;
-- grant usage on sequence indieco.post_id_seq to indieco_person;

-- grant execute on function indieco.person_full_name(indieco.person) to indieco_anonymous, indieco_person;
-- grant execute on function indieco.post_summary(indieco.post, integer, text) to indieco_anonymous, indieco_person;
-- grant execute on function indieco.person_latest_post(indieco.person) to indieco_anonymous, indieco_person;
-- grant execute on function indieco.search_posts(text) to indieco_anonymous, indieco_person;
grant execute on function indieco.authenticate(text, text) to indieco_anonymous, indieco_person;
grant execute on function indieco.current_person() to indieco_anonymous, indieco_person;
grant execute on function indieco.change_password(text, text) to indieco_person;

grant execute on function indieco.register_person(text, text, text, text) to indieco_anonymous;

alter table indieco.person enable row level security;
-- alter table indieco.post enable row level security;

create policy select_person on indieco.person for select
  using (true);

-- create policy select_post on indieco.post for select
--   using (true);

create policy update_person on indieco.person for update to indieco_person
  using (id = current_setting('jwt.claims.person_id', true)::integer);

create policy delete_person on indieco.person for delete to indieco_person
  using (id = current_setting('jwt.claims.person_id', true)::integer);

-- create policy insert_post on indieco.post for insert to indieco_person
--   with check (author_id = current_setting('jwt.claims.person_id', true)::integer);

-- create policy update_post on indieco.post for update to indieco_person
--   using (author_id = current_setting('jwt.claims.person_id', true)::integer);

-- create policy delete_post on indieco.post for delete to indieco_person
--   using (author_id = current_setting('jwt.claims.person_id', true)::integer);


commit;
