begin;

create role indieco_demo login password 'password';
grant indieco_anonymous to indieco_demo;

commit;
