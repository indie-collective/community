--
-- PostgreSQL database dump
--

-- Dumped from database version 10.10
-- Dumped by pg_dump version 10.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: location; Type: TABLE DATA; Schema: indieco; Owner: engleek
--

COPY indieco.location (id, country, city, latitude, longitude, updated_at) FROM stdin;
8478990b-6f63-43ca-b1ae-0d0a8791df4b	France	Rennes	\N	\N	2019-08-12 18:12:48.922266+02
\.


--
-- Data for Name: entity; Type: TABLE DATA; Schema: indieco; Owner: engleek
--

COPY indieco.entity (id, type, name, about, location_id, created_at, updated_at) FROM stdin;
dcc076bc-7804-47c9-a433-637b509e6be2	studio	Pixelnest	\N	\N	2019-08-12 18:12:49.18868+02	2019-08-12 18:12:49.18868+02
c8cb51fe-9c94-4235-a287-5af043560a96	studio	Skaven	\N	\N	2019-08-12 18:12:49.195311+02	2019-08-12 18:12:49.195311+02
9b1e0464-9dcd-4f29-890a-13612e989a77	studio	Rufflerim	\N	\N	2019-08-12 18:12:49.19932+02	2019-08-12 18:12:49.19932+02
d762f5d6-e420-456b-b58e-063983e34bab	studio	MrLapinou	\N	\N	2019-08-12 18:12:49.20348+02	2019-08-12 18:12:49.20348+02
ee4cb0b6-3349-4af2-9f8b-121cc1a5b8b0	studio	Studio Quendi	\N	\N	2019-08-12 18:12:49.207585+02	2019-08-12 18:12:49.207585+02
3a17261c-57f7-4d61-934d-b8ead6ac9df1	studio	aWay team	\N	\N	2019-08-12 18:12:49.211383+02	2019-08-12 18:12:49.211383+02
81f1dead-3cdf-45a1-9712-0ddd376e3ae9	studio	Frenetic Experience Studio	\N	\N	2019-08-12 18:12:49.216949+02	2019-08-12 18:12:49.216949+02
6fc5a1ab-e8a4-4df6-bb8b-c4bab5eaaccb	studio	YoruNoHikage	\N	\N	2019-08-12 18:12:49.221087+02	2019-08-12 18:12:49.221087+02
36683ac6-6636-4b6c-8e60-e4d61b2d75f8	studio	Nicoplv Games	\N	\N	2019-08-12 18:12:49.225576+02	2019-08-12 18:12:49.225576+02
5351bda2-7a07-4d48-9641-6a71e4e1636f	studio	Flying Oak Games	\N	\N	2019-08-12 18:12:49.232094+02	2019-08-12 18:12:49.232094+02
b1bea61a-d336-4cfe-9a42-782df8256641	studio	5 Bits Games	\N	\N	2019-08-12 18:12:49.237049+02	2019-08-12 18:12:49.237049+02
4bbdd9d4-7227-44fb-aa89-b3c32d9ad6a2	studio	Alkemi	\N	\N	2019-08-12 18:12:49.241616+02	2019-08-12 18:12:49.241616+02
05f0b591-de25-4a5c-bff5-890607b862f0	studio	Seederrant Studio	\N	\N	2019-08-12 18:12:49.24606+02	2019-08-12 18:12:49.24606+02
fd868a95-d924-49f1-ac9f-9be807b4933f	studio	FairyTell Me	\N	\N	2019-08-12 18:12:49.249578+02	2019-08-12 18:12:49.249578+02
777bdb22-4d8e-4266-ba16-e094a75657d0	studio	Sushee	\N	\N	2019-08-12 18:12:49.253042+02	2019-08-12 18:12:49.253042+02
39ce0eb3-4f44-4a07-92e6-fc0a2b1cab6d	studio	SillyCat Studio	\N	\N	2019-08-12 18:12:49.256877+02	2019-08-12 18:12:49.256877+02
90faafd0-60f5-47a5-b2ba-601b7f8c12d4	studio	Tetedebug	\N	\N	2019-08-12 18:12:49.261275+02	2019-08-12 18:12:49.261275+02
f9c38add-ec22-49b8-a7ce-f0ef43a0d4a1	studio	Aurora Studio	\N	\N	2019-08-12 18:12:49.266512+02	2019-08-12 18:12:49.266512+02
85513b7a-3b9e-458b-9ae0-ef57cbe5644f	studio	GlobZ	\N	\N	2019-08-12 18:12:49.272151+02	2019-08-12 18:12:49.272151+02
8e7383b8-0282-4bee-9a04-cfb519029ae1	studio	Mi Clos	\N	\N	2019-08-12 18:12:49.275994+02	2019-08-12 18:12:49.275994+02
ad95af9f-bdae-4c13-970a-8e1bea6fd87b	studio	Noxis Studio	\N	\N	2019-08-12 18:12:49.280194+02	2019-08-12 18:12:49.280194+02
fcf20bce-54a7-42dd-9564-eaec80e4ffb2	studio	Pixelnest Studio	\N	\N	2019-08-12 18:12:49.283743+02	2019-08-12 18:12:49.283743+02
fa25fe71-1585-4f20-8b4e-35eb175f4e15	studio	Monkey King Studio	\N	\N	2019-08-12 18:12:49.287631+02	2019-08-12 18:12:49.287631+02
68681a1f-dbce-4945-a5ec-5735a5c237ef	studio	Agharta Studio	\N	\N	2019-08-12 18:12:49.292371+02	2019-08-12 18:12:49.292371+02
c0cfde94-136a-49df-bab3-7ae65c926212	studio	Splashteam	\N	\N	2019-08-12 18:12:49.296627+02	2019-08-12 18:12:49.296627+02
921b9d60-6f9b-465f-a5b6-bf5a6850ba09	studio	Subtle Games	\N	\N	2019-08-12 18:12:49.300036+02	2019-08-12 18:12:49.300036+02
8918a604-ca57-42a9-9771-0bf9ea3dfa59	studio	Insane Unity	\N	\N	2019-08-12 18:12:49.303296+02	2019-08-12 18:12:49.303296+02
13820117-8049-4d3e-9b57-94f5b83e7afc	studio	Leikir Studio	\N	\N	2019-08-12 18:12:49.306842+02	2019-08-12 18:12:49.306842+02
b49ce50e-bad1-462f-933b-4f4cc573d7e4	studio	9 And Some	\N	\N	2019-08-12 18:12:49.310474+02	2019-08-12 18:12:49.310474+02
b3397f6b-85b2-48c1-98c8-f74e51a6fbdb	studio	Electric Dragons	\N	\N	2019-08-12 18:12:49.313894+02	2019-08-12 18:12:49.313894+02
12913d48-0a52-4763-9c7d-331a3a026aef	studio	Gwleclerc	\N	\N	2019-08-12 18:12:49.317393+02	2019-08-12 18:12:49.317393+02
564f75be-c295-4d65-8549-4a43631f5c6e	studio	Strance	\N	\N	2019-08-12 18:12:49.321634+02	2019-08-12 18:12:49.321634+02
cffd3264-642a-401c-b28f-24f9891ce65b	studio	Corentin Derbre	\N	\N	2019-08-12 18:12:49.325748+02	2019-08-12 18:12:49.325748+02
6dca2d24-2b85-4e61-bf01-1f503a81e749	studio	Gildas P	\N	\N	2019-08-12 18:12:49.329612+02	2019-08-12 18:12:49.329612+02
a7776ed3-711b-4205-8cfb-0e08282dd634	studio	Da Picky Monkey	\N	\N	2019-08-12 18:12:49.333142+02	2019-08-12 18:12:49.333142+02
df2afc6c-0081-48da-8608-7e22e8942e15	studio	Lone Stone	\N	\N	2019-08-12 18:12:49.336527+02	2019-08-12 18:12:49.336527+02
e008440e-3166-41c3-baa7-b850123ada74	studio	Bulwark Studios	\N	\N	2019-08-12 18:12:49.339842+02	2019-08-12 18:12:49.339842+02
f7b07d77-346c-467b-8deb-4b43f18acffd	studio	Haunted Tie	\N	\N	2019-08-12 18:12:49.343713+02	2019-08-12 18:12:49.343713+02
c84f3695-ab22-4e5a-9282-f9aca020bc6d	studio	Gamelier	\N	\N	2019-08-12 18:12:49.346778+02	2019-08-12 18:12:49.346778+02
42c29817-36a8-4672-b432-8bbe93e04147	studio	Anthony Beyer	\N	\N	2019-08-12 18:12:49.349836+02	2019-08-12 18:12:49.349836+02
6687feca-c4aa-4e66-af5e-2db85eb8d383	studio	Piranaking	\N	\N	2019-08-12 18:12:49.352999+02	2019-08-12 18:12:49.352999+02
5061aa00-3f7a-4062-95b7-fd820c652534	studio	4EdgesGames	\N	\N	2019-08-12 18:12:49.356912+02	2019-08-12 18:12:49.356912+02
03f7b668-6c8f-405e-9f5c-42cc9a1bdb7d	studio	Triskell Interactive	\N	\N	2019-08-12 18:12:49.360747+02	2019-08-12 18:12:49.360747+02
2e36b235-3a31-4594-82a6-9018c473ae44	studio	Concrete Games	\N	\N	2019-08-12 18:12:49.364411+02	2019-08-12 18:12:49.364411+02
7aba22ab-f555-4664-b341-52337dda626e	studio	Tchagata Games	\N	\N	2019-08-12 18:12:49.367809+02	2019-08-12 18:12:49.367809+02
8598b997-56ff-4247-af9f-7efe2e6af137	studio	Ballistic Frogs	\N	\N	2019-08-12 18:12:49.37128+02	2019-08-12 18:12:49.37128+02
f80fcf2f-c64f-410e-ad44-093e3ecb44f7	studio	Acreplume	\N	\N	2019-08-12 18:12:49.375213+02	2019-08-12 18:12:49.375213+02
74789559-c9c3-43c6-aef3-b89c16b2a479	studio	Wako Factory	\N	\N	2019-08-12 18:12:49.378545+02	2019-08-12 18:12:49.378545+02
fcead3cd-073f-4d0e-873f-dce533c4b3a1	studio	Bulo Studio	\N	\N	2019-08-12 18:12:49.382006+02	2019-08-12 18:12:49.382006+02
27859f70-0c77-4a5b-ad82-169ca9065dc6	studio	Emedion Games	\N	\N	2019-08-12 18:12:49.385396+02	2019-08-12 18:12:49.385396+02
6395188a-3f99-4d8f-8788-77bb24792139	studio	Morphiks	\N	\N	2019-08-12 18:12:49.388623+02	2019-08-12 18:12:49.388623+02
54c14d28-f1a9-4a70-9cfa-8102e99b9871	studio	Christophe Galati	\N	\N	2019-08-12 18:12:49.392065+02	2019-08-12 18:12:49.392065+02
99930ac5-1ae2-4491-89e9-18bf6495b9ee	studio	Swing Swing Submarine	\N	\N	2019-08-12 18:12:49.39521+02	2019-08-12 18:12:49.39521+02
d90eb83d-95f3-4349-8c17-64b2da61539d	studio	Nahala	\N	\N	2019-08-12 18:12:49.398512+02	2019-08-12 18:12:49.398512+02
25007b04-5e7b-484a-8b0f-d4fcb3101c9d	studio	feoche	\N	\N	2019-08-12 18:12:49.401523+02	2019-08-12 18:12:49.401523+02
023b0ff8-e0ad-4bd6-8ec8-e093c792de41	studio	Nemotaku	\N	\N	2019-08-12 18:12:49.404824+02	2019-08-12 18:12:49.404824+02
fc90bd66-8317-4208-88a1-0b271e779715	studio	RegisRquoi	\N	\N	2019-08-12 18:12:49.408681+02	2019-08-12 18:12:49.408681+02
72e3eb39-5a7d-4929-8146-3b2f1ac81b7d	studio	Car De Cercles	\N	\N	2019-08-12 18:12:49.412172+02	2019-08-12 18:12:49.412172+02
4b7df003-66f0-41f9-b24d-e5316f81d115	studio	The Sliced Up Dudes	\N	\N	2019-08-12 18:12:49.415788+02	2019-08-12 18:12:49.415788+02
56306189-65b7-4202-8cf7-f8305c9d33a4	studio	Headbang Club	\N	\N	2019-08-12 18:12:49.419529+02	2019-08-12 18:12:49.419529+02
50cd6ec9-37a6-4dbb-b2b6-8f4c4310961b	studio	Team Kwakwa	\N	\N	2019-08-12 18:12:49.423659+02	2019-08-12 18:12:49.423659+02
58e54759-340e-4dee-8505-aacd417b32aa	studio	Persistant Studios	\N	\N	2019-08-12 18:12:49.42782+02	2019-08-12 18:12:49.42782+02
dc439da1-e568-4d1e-a3bf-2d706a397a95	studio	Aurelien Da Campo	\N	\N	2019-08-12 18:12:49.431578+02	2019-08-12 18:12:49.431578+02
2005a45d-5b67-41e1-b477-ba5896c27bf8	studio	David Canela	\N	\N	2019-08-12 18:12:49.434999+02	2019-08-12 18:12:49.434999+02
e3dd2c8b-7374-4823-b4f3-5f1ec67a4f71	studio	Octo Studio	\N	\N	2019-08-12 18:12:49.438505+02	2019-08-12 18:12:49.438505+02
fe2e6ab5-a3e4-49da-a3c9-8cbe371e96aa	studio	Wuthrer	\N	\N	2019-08-12 18:12:49.44185+02	2019-08-12 18:12:49.44185+02
0b48a895-18e7-4fda-b4bb-5c72f7a542fe	studio	Goblinz Studio	\N	\N	2019-08-12 18:12:49.445036+02	2019-08-12 18:12:49.445036+02
6e94a3f4-899d-4ab0-af2b-6bbf2a763268	studio	Wasteam	\N	\N	2019-08-12 18:12:49.448973+02	2019-08-12 18:12:49.448973+02
d946c915-30f1-41c7-8742-9819a0e870ae	studio	Neko Entertainment	\N	\N	2019-08-12 18:12:49.452909+02	2019-08-12 18:12:49.452909+02
e7a70002-84d2-4584-85b4-c76a631ccf0b	studio	Cipher Pusher Team	\N	\N	2019-08-12 18:12:49.457095+02	2019-08-12 18:12:49.457095+02
533682fb-eca6-40ce-ac1b-66fb898dd026	studio	Rezo Zero	\N	\N	2019-08-12 18:12:49.461219+02	2019-08-12 18:12:49.461219+02
bbd7e11a-155e-4e06-8298-0a1d2046d168	studio	Play Fool	\N	\N	2019-08-12 18:12:49.465366+02	2019-08-12 18:12:49.465366+02
e096b219-b653-4f67-b064-68aa05a185bb	studio	Fractal Box	\N	\N	2019-08-12 18:12:49.46899+02	2019-08-12 18:12:49.46899+02
704d9e48-36b2-4193-ad8e-743c1f44da88	studio	Eode Group	\N	\N	2019-08-12 18:12:49.472554+02	2019-08-12 18:12:49.472554+02
34894149-78b8-4fa5-8fab-54b0b94471ee	studio	Oniroforge	\N	\N	2019-08-12 18:12:49.476384+02	2019-08-12 18:12:49.476384+02
e9e96c2f-2da2-425c-9939-4457ee498875	studio	Claws Up Games	\N	\N	2019-08-12 18:12:49.482208+02	2019-08-12 18:12:49.482208+02
d5d1d199-5f3c-46f0-b776-79988e943891	studio	i3 Game Jam	\N	\N	2019-08-12 18:12:49.485613+02	2019-08-12 18:12:49.485613+02
54953e9a-bba7-4f43-af5e-84f6c154c4f0	studio	Stomp Team	\N	\N	2019-08-12 18:12:49.489078+02	2019-08-12 18:12:49.489078+02
30a68374-cbc8-484e-a243-2d989be29e9f	studio	zriL	\N	\N	2019-08-12 18:12:49.492741+02	2019-08-12 18:12:49.492741+02
49891538-ad68-4831-a8f8-bf3b27eefc3c	studio	Pascal Le Merrer	\N	\N	2019-08-12 18:12:49.495898+02	2019-08-12 18:12:49.495898+02
f814f11a-a0b4-4fc8-afb0-0a37292a3b24	studio	Devs Must Die	\N	\N	2019-08-12 18:12:49.498927+02	2019-08-12 18:12:49.498927+02
d6274415-c034-4fba-a784-2d2e9a0def14	studio	Rablo Games	\N	\N	2019-08-12 18:12:49.502211+02	2019-08-12 18:12:49.502211+02
93d5950e-52b0-4ca4-8c35-b85b7e942d75	studio	Sköll Studio	\N	\N	2019-08-12 18:12:49.505886+02	2019-08-12 18:12:49.505886+02
97f8bcd9-9837-4ffc-aff5-f7c0409d7b50	studio	Benoît Freslon	\N	\N	2019-08-12 18:12:49.512011+02	2019-08-12 18:12:49.512011+02
b98c5208-765f-4bfb-8147-885003f83a21	studio	Atomic Raccoon Studio	\N	\N	2019-08-12 18:12:49.516019+02	2019-08-12 18:12:49.516019+02
ca306c69-2c51-4770-962e-a17d74eb0f6d	studio	Ark Rep	\N	\N	2019-08-12 18:12:49.51955+02	2019-08-12 18:12:49.51955+02
501ee93b-fc08-4fb5-8442-241f6627713b	studio	Macrales Studio	\N	\N	2019-08-12 18:12:49.523432+02	2019-08-12 18:12:49.523432+02
690af2e0-4902-4795-93ed-c5290f9cbc9b	studio	Lightshards	\N	\N	2019-08-12 18:12:49.526977+02	2019-08-12 18:12:49.526977+02
c8e58941-b481-48b5-82c8-2bb6bcf5edc1	studio	Black Flag	\N	\N	2019-08-12 18:12:49.530339+02	2019-08-12 18:12:49.530339+02
8b0a99dd-eea2-4708-a1d5-0c5415f38a2f	studio	Mi-Clos Studio	\N	\N	2019-08-12 18:12:49.533293+02	2019-08-12 18:12:49.533293+02
bd23fd98-f3de-4464-ac4f-303ece9677d4	studio	Immaterial Studio	\N	\N	2019-08-12 18:12:49.536263+02	2019-08-12 18:12:49.536263+02
ac85fbd1-870e-49fd-9694-2a1a0d820c20	studio	Chromatic Room	\N	\N	2019-08-12 18:12:49.539338+02	2019-08-12 18:12:49.539338+02
7f14455f-d525-4b9e-a868-851fd3e5fb3f	studio	Sébastien Dubois	\N	\N	2019-08-12 18:12:49.542839+02	2019-08-12 18:12:49.542839+02
0c008dee-6457-45be-9aa0-7282c3cbc42b	studio	Seenapsis	\N	\N	2019-08-12 18:12:49.545886+02	2019-08-12 18:12:49.545886+02
c72561e8-a6df-4cee-b144-b85ed0ca720c	studio	The Fun Institute	\N	\N	2019-08-12 18:12:49.54912+02	2019-08-12 18:12:49.54912+02
63cb1da8-6606-4760-8e44-919a9485266c	studio	Endroad	\N	\N	2019-08-12 18:12:49.55404+02	2019-08-12 18:12:49.55404+02
60637ecf-54ba-495b-8194-0d77baad23eb	studio	Arte	\N	\N	2019-08-12 18:12:49.557975+02	2019-08-12 18:12:49.557975+02
1966ea84-c297-417a-bfda-2a3698e74efd	studio	Bryo Studio	\N	\N	2019-08-12 18:12:49.56188+02	2019-08-12 18:12:49.56188+02
92d1760e-20f6-4842-8778-44b35fdf163b	studio	Mirum Studio	\N	\N	2019-08-12 18:12:49.566047+02	2019-08-12 18:12:49.566047+02
99376ed0-3a8c-4096-9075-a9423d8a95db	studio	Motion Twin	\N	\N	2019-08-12 18:12:49.569254+02	2019-08-12 18:12:49.569254+02
8ecda564-c546-4531-aefe-3b53fd9adafb	studio	Marble Oak	\N	\N	2019-08-12 18:12:49.572206+02	2019-08-12 18:12:49.572206+02
655dd4db-579c-49e8-b519-79d23e341a05	studio	Kesyd Games	\N	\N	2019-08-12 18:12:49.575431+02	2019-08-12 18:12:49.575431+02
d99c8272-b32f-4f6d-a2fe-bfdf7141ace0	studio	Paper Team	\N	\N	2019-08-12 18:12:49.578742+02	2019-08-12 18:12:49.578742+02
6291333c-7cfd-4811-9bdb-ea8b45caf015	studio	CNAM ENJMIN	\N	\N	2019-08-12 18:12:49.581791+02	2019-08-12 18:12:49.581791+02
2b431f90-819d-4cce-8a81-bb31c1894065	studio	A Game Studio	\N	\N	2019-08-12 18:12:49.584661+02	2019-08-12 18:12:49.584661+02
c56c45a7-d01e-4b38-a0c7-6b3c5027e2b2	studio	Overgame Studio	\N	\N	2019-08-12 18:12:49.587576+02	2019-08-12 18:12:49.587576+02
c4d6a411-2035-41d7-9458-6cc41de06b5f	studio	Julien Jacquart	\N	\N	2019-08-12 18:12:49.590754+02	2019-08-12 18:12:49.590754+02
c3aac68f-6e9e-4e95-bc8d-6e927bb995be	studio	Pictopals	\N	\N	2019-08-12 18:12:49.593938+02	2019-08-12 18:12:49.593938+02
4a9e9813-6cc3-4a95-8cb6-e0f22d5c2ee7	studio	Seed By Seed	\N	\N	2019-08-12 18:12:49.598675+02	2019-08-12 18:12:49.598675+02
db26940d-98d3-4d0c-9c87-faa76fbd9899	studio	Pause Café Kung-fu	\N	\N	2019-08-12 18:12:49.602186+02	2019-08-12 18:12:49.602186+02
f78c6988-d08d-4ae0-a943-7d54b7c6b0ee	studio	Wizama	\N	\N	2019-08-12 18:12:49.605711+02	2019-08-12 18:12:49.605711+02
c1ce19d4-4863-4827-9739-c218bb99d109	studio	Studio Casserole	\N	\N	2019-08-12 18:12:49.610513+02	2019-08-12 18:12:49.610513+02
f79dfef1-6670-4d7f-8444-581ed9cc99a0	studio	Manufacture 43	\N	\N	2019-08-12 18:12:49.614339+02	2019-08-12 18:12:49.614339+02
6ccdf27a-3f88-4f3b-bfff-b99cbec8b761	studio	Tako Studio	\N	\N	2019-08-12 18:12:49.618663+02	2019-08-12 18:12:49.618663+02
08d9f086-5eef-471b-8533-c84769944001	studio	Magic Design Studios	\N	\N	2019-08-12 18:12:49.622551+02	2019-08-12 18:12:49.622551+02
1d949128-f88e-481f-8bcc-d4f71ef1b5d0	studio	Clean Cut Games	\N	\N	2019-08-12 18:12:49.626086+02	2019-08-12 18:12:49.626086+02
6e0d2f3e-087e-4561-a80c-d907a13f9ab3	studio	Klakmioch	\N	\N	2019-08-12 18:12:49.629195+02	2019-08-12 18:12:49.629195+02
b1168630-f11d-4f4a-af62-1f2624d1cb6b	studio	Voxweaver	\N	\N	2019-08-12 18:12:49.632243+02	2019-08-12 18:12:49.632243+02
614ff2a0-37ec-436a-b0e4-4012d8ef7db1	studio	White Smoke Games	\N	\N	2019-08-12 18:12:49.635256+02	2019-08-12 18:12:49.635256+02
42c3fd05-cbff-4037-b893-7bcd3262f2b4	studio	Tea For Two	\N	\N	2019-08-12 18:12:49.638605+02	2019-08-12 18:12:49.638605+02
903e7ea6-e317-4681-9f91-67faade8a5f7	studio	Bubble Studios	\N	\N	2019-08-12 18:12:49.643892+02	2019-08-12 18:12:49.643892+02
40521a33-867e-4339-b3dd-9dcf5ca97a82	studio	Mastodonte	\N	\N	2019-08-12 18:12:49.647756+02	2019-08-12 18:12:49.647756+02
e6224e36-d071-41c6-9acd-e3dbafd88ef1	studio	Iumtec	\N	\N	2019-08-12 18:12:49.651562+02	2019-08-12 18:12:49.651562+02
04db5d07-6d59-4547-b6e3-017b13739045	studio	Ludupium	\N	\N	2019-08-12 18:12:49.655544+02	2019-08-12 18:12:49.655544+02
c4794375-566f-4d85-803b-c300dd6f91ee	studio	Ikigai	\N	\N	2019-08-12 18:12:49.659694+02	2019-08-12 18:12:49.659694+02
7a63ecec-99f8-42d5-a560-307c5c4399e1	studio	Let's Develop Change	\N	\N	2019-08-12 18:12:49.663227+02	2019-08-12 18:12:49.663227+02
8b9dd9e5-b296-4f2b-8e15-b11b1fc1a57a	studio	Sweet Dreams Studio	\N	\N	2019-08-12 18:12:49.666428+02	2019-08-12 18:12:49.666428+02
672f022b-de39-4839-a94a-200972655cdd	studio	Phlegmagames	\N	\N	2019-08-12 18:12:49.669521+02	2019-08-12 18:12:49.669521+02
7b64bdec-03f8-49bf-a7c7-ca9d2435e7d3	studio	Procrastination Entertainement	\N	\N	2019-08-12 18:12:49.672584+02	2019-08-12 18:12:49.672584+02
9a7d3b1d-04c7-4d37-bf2e-fe0a7b61cf98	studio	Damien Mayance, Simon Coroller & The Fun Institute	\N	\N	2019-08-12 18:12:49.675809+02	2019-08-12 18:12:49.675809+02
b096b961-fb79-4ed7-b59d-2f9d6aa96c97	studio	Reverence Prod	\N	\N	2019-08-12 18:12:49.679093+02	2019-08-12 18:12:49.679093+02
b6554bed-9958-42c9-acdf-5ddd1652260d	studio	3Axes	\N	\N	2019-08-12 18:12:49.682108+02	2019-08-12 18:12:49.682108+02
e54193bb-f58b-4f31-9b84-c6283a8d216d	studio	Maud L’Helgoualc’h et Ruben Amegan	\N	\N	2019-08-12 18:12:49.685295+02	2019-08-12 18:12:49.685295+02
530524a6-4e1f-4204-9807-d77de748169d	studio	SuperZikoure	\N	\N	2019-08-12 18:12:49.688528+02	2019-08-12 18:12:49.688528+02
92726ab1-c247-4932-9d88-00f56f11693b	studio	Mahjoub	\N	\N	2019-08-12 18:12:49.692342+02	2019-08-12 18:12:49.692342+02
d8dab01b-e8ea-449e-b7d4-42fffa0dc884	studio	Hamrod	\N	\N	2019-08-12 18:12:49.695663+02	2019-08-12 18:12:49.695663+02
\.


--
-- Data for Name: event; Type: TABLE DATA; Schema: indieco; Owner: engleek
--

COPY indieco.event (id, name, about, location_id, site, starts_at, ends_at, created_at, updated_at) FROM stdin;
0ba79c87-2fed-4c5c-98ce-c7dddcd76057	Stunfest 2013	\N	8478990b-6f63-43ca-b1ae-0d0a8791df4b	\N	2013-04-26 10:00:00+02	2013-04-28 17:00:00+02	2019-08-12 18:12:48.93724+02	2019-08-12 18:12:48.93724+02
5e05978a-38fc-4b99-99f2-24f258acef3c	Stunfest 2014	\N	8478990b-6f63-43ca-b1ae-0d0a8791df4b	\N	2014-05-02 10:00:00+02	2014-05-04 17:00:00+02	2019-08-12 18:12:48.943076+02	2019-08-12 18:12:48.943076+02
7b8ff662-804f-42d4-85c7-539fd4adcac9	Stunfest 2015	\N	8478990b-6f63-43ca-b1ae-0d0a8791df4b	\N	2015-05-22 10:00:00+02	2015-05-24 17:00:00+02	2019-08-12 18:12:48.948946+02	2019-08-12 18:12:48.948946+02
841c5f40-6f0b-475f-916e-664ac68a8449	Stunfest 2016	\N	8478990b-6f63-43ca-b1ae-0d0a8791df4b	\N	2016-05-20 10:00:00+02	2016-05-22 17:00:00+02	2019-08-12 18:12:48.953319+02	2019-08-12 18:12:48.953319+02
570f14c6-1213-481a-9d92-e16f1655e354	Stunfest 2018	\N	8478990b-6f63-43ca-b1ae-0d0a8791df4b	\N	2018-05-18 10:00:00+02	2018-05-20 17:00:00+02	2019-08-12 18:12:48.957562+02	2019-08-12 18:12:48.957562+02
7f34c787-14fb-46e1-b5d4-a1e675d4008c	Stunfest 2019	\N	8478990b-6f63-43ca-b1ae-0d0a8791df4b	\N	2019-05-17 10:00:00+02	2019-05-19 17:00:00+02	2019-08-12 18:12:48.961549+02	2019-08-12 18:12:48.961549+02
f26d5751-fb7a-4ff3-b8a4-fc6b28c33a2f	Stunjam 2014	\N	8478990b-6f63-43ca-b1ae-0d0a8791df4b	\N	2014-04-25 18:00:00+02	2014-04-27 18:00:00+02	2019-08-12 18:12:48.965801+02	2019-08-12 18:12:48.965801+02
b9303fb7-c6d6-4a2e-9e11-31b0ef2d0ead	Stunjam 2015	\N	8478990b-6f63-43ca-b1ae-0d0a8791df4b	\N	2015-05-15 18:00:00+02	2015-05-17 18:00:00+02	2019-08-12 18:12:48.969817+02	2019-08-12 18:12:48.969817+02
ba2258f7-11ba-4019-955d-723389a61e68	Stunjam 2016	\N	8478990b-6f63-43ca-b1ae-0d0a8791df4b	\N	2016-05-13 18:00:00+02	2016-05-15 18:00:00+02	2019-08-12 18:12:48.973962+02	2019-08-12 18:12:48.973962+02
1ae9a876-dc27-476b-9d89-68c3694aa98b	ADDON Jam 2017	\N	8478990b-6f63-43ca-b1ae-0d0a8791df4b	\N	2017-05-30 18:00:00+02	2017-06-01 18:00:00+02	2019-08-12 18:12:48.977753+02	2019-08-12 18:12:48.977753+02
ec9e4ed5-990e-45c1-b124-0316211fd711	Stunjam 2018	\N	8478990b-6f63-43ca-b1ae-0d0a8791df4b	\N	2018-05-11 18:00:00+02	2018-05-13 18:00:00+02	2019-08-12 18:12:48.981863+02	2019-08-12 18:12:48.981863+02
bff68afc-74ec-43ee-abca-bc5b8d38dc26	Stunjam 2019	\N	8478990b-6f63-43ca-b1ae-0d0a8791df4b	\N	2019-05-10 18:00:00+02	2019-05-12 18:00:00+02	2019-08-12 18:12:48.986971+02	2019-08-12 18:12:48.986971+02
2f200680-70c9-4fe9-80df-2429d08ff076	ADDON 2017	\N	8478990b-6f63-43ca-b1ae-0d0a8791df4b	\N	2017-05-18 10:00:00+02	2017-05-20 17:00:00+02	2019-08-12 18:12:48.992021+02	2019-08-12 18:12:48.992021+02
5a93cdc1-dd4d-4bf8-8728-e9e22afd43f6	ADDON 2018	\N	8478990b-6f63-43ca-b1ae-0d0a8791df4b	\N	2018-05-18 10:00:00+02	2018-05-20 17:00:00+02	2019-08-12 18:12:48.996404+02	2019-08-12 18:12:48.996404+02
229eaf6b-053c-4706-8fd0-bc7e6a76c950	ADDON 2019	\N	8478990b-6f63-43ca-b1ae-0d0a8791df4b	\N	2019-05-17 10:00:00+02	2019-05-19 17:00:00+02	2019-08-12 18:12:49.000482+02	2019-08-12 18:12:49.000482+02
\.


--
-- Data for Name: entity_event; Type: TABLE DATA; Schema: indieco; Owner: engleek
--

COPY indieco.entity_event (entity_id, event_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: image; Type: TABLE DATA; Schema: indieco; Owner: engleek
--

COPY indieco.image (id, image_file, created_at, updated_at) FROM stdin;
e1001555-74f4-442e-8aa1-46ef40972305	{"name": "20190902213441788.jpeg", "width": 1152, "height": 2048, "thumb_width": 225, "thumb_height": 400}	2019-09-02 23:34:41.78632+02	2019-09-02 23:34:41.78632+02
9afe0955-4fe5-4061-a990-b1da0f4c99eb	{"name": "20190902214057930.jpg", "width": 1200, "height": 1600, "thumb_width": 300, "thumb_height": 400}	2019-09-02 23:40:57.927357+02	2019-09-02 23:40:57.927357+02
9003c302-1370-4544-ab2a-9103b4dc99df	{"name": "20190902214057928.jpg", "width": 6191, "height": 2572, "thumb_width": 963, "thumb_height": 400}	2019-09-02 23:40:57.927165+02	2019-09-02 23:40:57.927165+02
da64f5b7-5042-449e-a667-ddc321b013e5	{"name": "20190902214228144.jpg", "width": 960, "height": 1280, "thumb_width": 300, "thumb_height": 400}	2019-09-02 23:42:28.143981+02	2019-09-02 23:42:28.143981+02
68aa5cc5-056c-4777-bd27-a4131dd67603	{"name": "20190902214316340.jpg", "width": 895, "height": 450, "thumb_width": 796, "thumb_height": 400}	2019-09-02 23:43:16.340027+02	2019-09-02 23:43:16.340027+02
\.


--
-- Data for Name: entity_image; Type: TABLE DATA; Schema: indieco; Owner: engleek
--

COPY indieco.entity_image (entity_id, image_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: person; Type: TABLE DATA; Schema: indieco; Owner: engleek
--

COPY indieco.person (id, first_name, last_name, about, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: entity_member; Type: TABLE DATA; Schema: indieco; Owner: engleek
--

COPY indieco.entity_member (entity_id, person_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: game; Type: TABLE DATA; Schema: indieco; Owner: engleek
--

COPY indieco.game (id, name, about, site, tag_list, created_at, updated_at) FROM stdin;
def4ddd9-a51a-495d-8334-9d3fbe189854	Koikoukesse	Koikoukesse est un jeu vidéo de quizz fait en collaboration avec Laurent Brossard. Connaissez-vous vos classiques? Trouvez un nom d'une simple image en solo ou en multi. Gagnez des pièces et débloquez des thèmes et d'autres modes de difficulté. Battez aussi vos amis en ligne !	https://pixelnest.io/products/koikoukesse/	{"party game",solo,multi,online,competition}	2019-08-12 18:12:49.700041+02	2019-08-12 18:12:49.700041+02
fa6ad040-70ef-44c0-a054-289001f724d5	George Le Pirate	Nous aimons tous l'or. George aussi ! George est un pirate amical en recherche d'aventure. Il trouve des îles au trésor où il doit trouver des coffres enterrés remplis de belles pièces en or la journée, et doit rentrer chez lui le soir. Mais d'autres priates veulent également voler son argent, alors il doit utiliser son bon vieux shotgun pour protéger ses trésors ! Montez à bord avec George ! En route pour de nouvelles aventures !	https://www.youtube.com/watch?v=RYJZvZfvyZY	{"leap motion",solo,competition}	2019-08-12 18:12:49.733409+02	2019-08-12 18:12:49.733409+02
fb80c726-e99f-45b5-b97f-3e8901119db2	.the rush//	Avec ses faux-airs de F-Zero et de Wipeout, .the rush// fait partie de ces jeux de course futuristes disposant de tracés hallucinants et de décors magnifiques à vous en décoller la rétine.	https://www.youtube.com/watch?v=RYJZvZfvyZY	{course,solo,competition}	2019-08-12 18:12:49.755946+02	2019-08-12 18:12:49.755946+02
f0a8ba14-6d6a-474b-8fa2-32205dc4e6a6	Lije	Dans les brumes permanentes d’une étrange contrée, une jeune femme lutte pour sortir du chemin qui a été tracé pour elle par des hommes, des sociétés et des dieux. Lije est un RPG 2D, inspiré à la fois de la tradition japonaise (personnages forts) et de la tradition occidentale (liberté d’action dans un univers cohérent). Le jeu est prévu en 5 épisodes. Dans l’univers de Lije, la croyance crée le réel. Si une rumeur se répand suffisamment, elle va se matérialiser. Au contraire, si un individu se retrouve isolé, si un endroit n’existe plus que dans la mémoire de quelques personnes âgées, il va disparaître dans la brume permanente qui baigne le monde : Bordure. Le joueur explora cet univers dangereux et pourra utiliser ses propriétés : il redessinera les cartes du monde pour le modifier, effacera dans la brume les obstacles qui se dressent sur sa route, réveillera et utilisera les mémoire des gens pour faire émerger des endroits oubliés de Bordure.	http://www.rufflerim.com	{aventure,solo,competition}	2019-08-12 18:12:49.781047+02	2019-08-12 18:12:49.781047+02
7dc705e3-31c6-4bbb-8fdd-fa78e475b387	Piyo Piyo	Vous incarnez Piyo, petit oiseau mignon qui doit défier les méchants ennemis sur son passage tout en utilisant son balancier comme projectile.	https://www.youtube.com/watch?v=wF-ADywfjHk	{"shoot 'em up","leap motion",coop,competition}	2019-08-12 18:12:49.808479+02	2019-08-12 18:12:49.808479+02
14c7dce8-23ab-43e2-a31c-3c219497e3b5	4theking	Défendez le roi des envahisseurs à l'aide de 18 tours avec des effets particuliers, en solo ou en coopération jusqu'à 4. Améliorez vos tours grâce à un arbre de compétences poussé	https://www.youtube.com/watch?v=cETnIdQXrJk	{"tower defense",strategy,coop,solo,multi,competition}	2019-08-12 18:12:49.834882+02	2019-08-12 18:12:49.834882+02
8904f13c-0b74-4eb1-87f4-b356fa1e33e3	aWay Project	aWAY est une expérience interactive qui questionne sur le dilemme que l’on peut ressentir dans le choix entre Rêve et Réalité.\n\nUne expérience sous deux formes interconnectées :\n\nL’une très immersive et solitaire pour la personne plongée dans le subconscient (à l’aide un casque de réalité virtuelle).\nL’autre plus accessible et plus ancrée dans le réel pour interagir avec le subconscient de la personne immergée (par le biais d’un périphérique tactile).\nOù l’expérience vous mènera-t-elle ?	http://novaplay.me/away	{vr,solo,competition}	2019-08-12 18:12:49.866554+02	2019-08-12 18:12:49.866554+02
751e4db0-88df-42eb-a95e-ef569e797a88	Birth of Papyrus	Birth of Papyrus est un jeu d’aventure/plateforme/réflexion où vous incarnez Jem, une jeune fille fantomatique qui voyage entre deux mondes accompagnée par son ami imaginaire.	http://www.freneticexperience.com/press/sheet.php?p=birth_of_papyrus	{puzzle,solo,competition}	2019-08-12 18:12:49.887094+02	2019-08-12 18:12:49.887094+02
aa042b65-94e4-4612-b315-98b67baea13c	Brezeliad : A Tale of Brocéliande	Venez défendre les châteaux et tours de Brocéliande à l’aide d’armes et de sorts en tout genre. Des niveaux spéciaux sont même présents pour le Stunfest !	http://brezeliad.yorunohikage.fr/presskit/	{"tower defense",solo,competition}	2019-08-12 18:12:49.910884+02	2019-08-12 18:12:49.910884+02
c28dcc12-8dce-4cda-b506-e065eee4bce9	Cubot	Cubot est un puzzle-game au gameplay simpliste, il suffit de déplacer des cubes de couleur sur des cases ayant la même couleur. Vraiment très simple ! Mais il va falloir se creuser les méninges pour compléter tout les niveaux du jeu car la simplicité apparente du jeu tranche avec la complexité du level-design. De plus un point important du gameplay se situe dans le fait que si plusieurs cubes se trouvent sur l’espace de jeu, ils bougent simultanément. Tout un système de synchronisation/désynchronisation à apprendre pour venir à bout du jeu.	http://games.nicoplv.com/presskitFR	{puzzle,solo,competition}	2019-08-12 18:12:49.934866+02	2019-08-12 18:12:49.934866+02
4087bb7d-9943-4f60-8ca2-a205ba621160	Dead End	Venu directement des années 70, Dead End est mélange entre un jeu de course rétro et les films d’horreur d’exploitation.\n\nPilotez pour votre survie et atteignez un endroit sûr.	http://www.flying-oak.com/presskit/sheet.php?p=dead_end	{course,solo,competition}	2019-08-12 18:12:49.954942+02	2019-08-12 18:12:49.954942+02
fd7901b9-9339-4153-97e1-48070c788423	DeadCore	Vous vous réveillez dans un monde abandonné après une chute interminable à travers les tempêtes magnétiques. Poussé par votre instinct, vous commencez à explorer ce monde plongé dans le vide et très vite vous devez faire face à de nouvelles interrogations au fur et à mesure que des messages cryptiques apparaissent sur votre chemin. Passé les premiers obstacles vous trouvez le “SwitchGun”, une sorte d’objet hybride à mi-chemin entre un outil et une arme : vous vous rendez compte que vous pouvez interagir avec certains éléments de votre environnement par son biais, et la première chose que vous faites est d’ouvrir une porte gigantesque. C’est à ce moment que vous l’apercevez, la Tour. Vous ne savez pas pourquoi ni comment, mais vous êtes convaincu d’une chose : toutes vos questions trouveront leurs réponses une fois arrivé à son sommet. Vous vous mettez ainsi en route pour un voyage périlleux, parsemé d’obstacles, de fossés à franchir, de mécanismes à activer et d’ennemis à vaincre afin de lever le voile sur le mystère entourant cet édifice colossal qui semble figé dans l’attente d’un évènement particulier.	http://deadcore-game.com/downloads/press_kit.zip	{platformer,solo,competition}	2019-08-12 18:12:49.975813+02	2019-08-12 18:12:49.975813+02
b5bbeb3e-aa46-408a-901c-e7aa698defea	Drifting Lands	Drifting Lands est un mix original de shoot’em’up horizontal classique avec les standards modernes du hack’n’slash, le descendant illégitime de Diablo et R-Type en quelque sorte. Drifting Lands est conçu pour satisfaire aussi bien les amateurs de shmups que de hack’n’slash. Le jeu propose un challenge très progressif que vous pourrez surmonter par votre seul Skill ou par une bonne sélection de compétences ainsi qu’une progression plus lente mais sûre de vos statistiques et équipements	 http://www.drifting-lands.com	{"shoot 'em up",solo,competition}	2019-08-12 18:12:49.997897+02	2019-08-12 18:12:49.997897+02
0f51298b-7052-4e15-9408-f97b81cfd99c	Era for Guild	Era for Guild est le premier jeu de Seederrant Studio. Explorer l’immensité de l’Univers à la recherche de nouveaux mondes, ça vous dit ? Alors vous serez intéressé par ce projet original dans lequel vous incarnez un Settler à la découverte d’horizons inexplorés. Era for Guild est un nouveau projet ambitieux de jeu communautaire prenant place dans l’espace et qui mêle gestion, combat, commerce, exploration et relations avec les autres Settlers.	http://www.seederrant.com/presskit/eraforguild/	{strategy,solo,competition}	2019-08-12 18:12:50.019131+02	2019-08-12 18:12:50.019131+02
13ca782c-f6c0-4c66-b9a1-b0b5679ddb7b	FairyTell.me	FairyTell Me est un jeu transmédia qui donne vie aux dessins papier de vos enfants dans un conte sur tablette. Une aventure à vivre, à imprimer et à partager avec toute la famille !	http://fairytell.me/stunfest/	{aventure,solo,competition}	2019-08-12 18:12:50.04263+02	2019-08-12 18:12:50.04263+02
9690589f-fb5d-41cb-8b01-aee978f74d87	Goetia	Goetia est un point’n click qui se déroule dans un univers fantastique. Vous incarnez un fantôme, Abigail Blackwood, à la recherche de réponses à propos de la disparition mystérieuse de membres de sa famille. Le jeu, soutenu par Square-Enix, est prévu pour la fin de l’année 2015 sur PC, Mac et Linux.	http://playgoetia.com/	{point'n'click,solo,competition}	2019-08-12 18:12:50.063646+02	2019-08-12 18:12:50.063646+02
3adc0d82-5bbb-4c07-94d3-ae7eed55efe7	GrimWar	GrimWar est un jeu d’action aventure pour appareils tactiles.\n\nVous explorez une immense tour, essayant d’atteindre son sommet. Chaque étage amène différents évènements et vous aurez à :\n\ncombattre afin de vous protéger des monstres occupant la tour\naccumuler les trésors\néviter les innombrables pièges (telles que d’anciennes puissances endormies…)\nfaire face à des choix difficiles	http://www.sillycatstudio.com/grimwar/presskit/	{aventure,solo,competition}	2019-08-12 18:12:50.095683+02	2019-08-12 18:12:50.095683+02
fcb10c9d-d6da-4426-a985-23b26acd2622	Hox the Last Ship	Hox the Last Ship est un runner game narratif. Vous devrez vous confronter à des parcours dangereux traversés à toute vitesse mais aussi à l’humeur des personnages avec qui vous pourrez dialoguer. Choisissez votre route et tenter d’atteindre le vaisseau. Chaque chemin vous en apprendra plus sur le monde de hox et ils vous permettront peut-être d’en comprendre la clef !	http://www.hoxthelastship.com/press	{runner,solo,competition}	2019-08-12 18:12:50.125171+02	2019-08-12 18:12:50.125171+02
daccd7a4-5c19-4585-8126-6ab5cc7e4d45	Ilios - Betrayal Of Gods	Ilios est un jeu d’action-aventure en 2D HD. S’inspirant de titres encensés par la critique telles que les productions du studio Vanillaware (Dragon’s Crown), des titres de chez Platinum Games (Bayonneta) ou de références plus ancienne (Megaman, Castlevania) la volonté de cette équipe est d’offrir une aventure qui sort des canons actuels en proposant une narration poussée et un gameplay nerveux. 	http://www.ilios-thegame.com	{action,solo,competition}	2019-08-12 18:12:50.154562+02	2019-08-12 18:12:50.154562+02
ac50fe11-9302-43ce-b1fc-f6212ea637ef	Lije	Dans les brumes permanentes d’une étrange contrée, une jeune femme lutte pour sortir du chemin qui a été tracé pour elle par des hommes, des sociétés et des dieux. Lije est un RPG 2D, inspiré à la fois de la tradition japonaise (personnages forts) et de la tradition occidentale (liberté d’action dans un univers cohérent). Le jeu est prévu en 5 épisodes. Dans l’univers de Lije, la croyance crée le réel. Si une rumeur se répand suffisamment, elle va se matérialiser. Au contraire, si un individu se retrouve isolé, si un endroit n’existe plus que dans la mémoire de quelques personnes âgées, il va disparaître dans la brume permanente qui baigne le monde : Bordure. Le joueur explora cet univers dangereux et pourra utiliser ses propriétés : il redessinera les cartes du monde pour le modifier, effacera dans la brume les obstacles qui se dressent sur sa route, réveillera et utilisera les mémoire des gens pour faire émerger des endroits oubliés de Bordure. 	http://www.rufflerim.com	{aventure,solo,competition}	2019-08-12 18:12:50.18536+02	2019-08-12 18:12:50.18536+02
2f456f1c-bdf9-4e89-b1ea-5679f645f280	Mucho Party	Mucho Party est une collection de 30 jeux jouables à 2 sur le même écran tactile iOS ou Android.\n\nLes joueurs commencent par créer un avatar avec leur selfie.\nEnsuite ils jouent à un mini jeu d’évaluation qui permettra d’équilibrer les parties multijoueurs\nLes 30 jeux sont jouables en 6 modes de jeu : mosaïque, roulette, duel, tic-tac-toe, hot seat, championnat (jusqu’à 8 joueurs)\n3 joueurs programmés (facile, moyen, difficile) permettent de s’entraîner à tous les jeux ou modes de jeu.	http://globz.com/games/muchoparty/	{"party game",multi,competition}	2019-08-12 18:12:50.214142+02	2019-08-12 18:12:50.214142+02
c0b40323-7766-4d5d-a53e-63fc5f19840a	Out There	Out There, un jeu d’exploration spatiale sur iOs et Android. Ce jeu unique mixe management de ressources, roguelike et fiction interactive dans une expérience addictive dédiée aux mobiles.	http://www.outtheregame.com/	{aventure,solo,competition}	2019-08-12 18:12:50.236126+02	2019-08-12 18:12:50.236126+02
95643a24-aee5-4661-a8fd-22eab7eb8b9d	Papy Stampy	Papy stampy is a 2D side scrolling platformer running on both Android and OUYA. Stampy is a retired Postman. When he was younger he was considered as a hero. He was an alternative against hackers and delivered mails all over the world. One day, he discovered a huge amount of mails spread all over the city and decided to distribute all the lost mails and to discover what happened. You help Stampy in his quest by controlling his movements while he walks, rides his bike or pilots an helicopter.	http://www.noxis-studio.com/presskit/papy-stampy/	{platformer,solo,competition}	2019-08-12 18:12:50.256883+02	2019-08-12 18:12:50.256883+02
03a1fe5c-cec5-413b-a574-a4113b11f963	Pixelnest Studio	Pixelnest Studio est une entreprise rennaise spécialisée dans le jeu vidéo et les applications web. Nous développons un nouveau shmup, un jeu multijoueur nommé Rampaint, le Shmupfest, mais aussi des plugins Unity et des sites internet.\n\nNous écrivons également des tutoriaux, principalement sur Unity. Finalement, nous sommes aussi responsables de l’organisation des “Pitch My Game” sur Rennes. :)	http://pixelnest.io/presskit	{point'n'click,solo,competition}	2019-08-12 18:12:50.280718+02	2019-08-12 18:12:50.280718+02
8430358c-fcd9-4309-987f-a16f66e7ba28	Prism	Prism est un shoot'em up vertical développé par le studio français Monkey King Studio. Le principe du jeu est original puisque les tirs de votre vaisseau vont tirer partie du pouvoir de réfraction d'un prisme. Originalité et challenge au rendez-vous ! 	http://monkey-king-studio.com/presskit/	{"shoot 'em up",solo,competition}	2019-08-12 18:12:50.301874+02	2019-08-12 18:12:50.301874+02
ff515266-00b0-4de8-bf9c-7a9eec37b630	Shufflepuck Cantina VR	Agharta Studio est un petit studio de développement indépendant basé à Lyon. Après avoir développé nombre de jeux mobile, nous travaillons maintenant principalement sur PC, Mac et Linux. Nous focalisant plus particulièrement sur des jeux et applications en réalité virtuelle :)	https://store.steampowered.com/app/259510/Shufflepuck_Cantina_Deluxe/?l=french	{vr,solo,multi,competition}	2019-08-12 18:12:50.322999+02	2019-08-12 18:12:50.322999+02
b3ffdaca-8482-4d8d-bec9-86d2a17c6d0f	Chop	Claws Up Games est un studio indépendant fondé par deux français.	http://chop-thegame.com/	{brawler,multi,village}	2019-08-12 18:12:53.111949+02	2019-08-12 18:12:53.111949+02
c1c833e4-92ff-490b-95b6-fb2ab8f5249b	Splasher	Splasher est un Plateformer 2D dans lequel vous êtes armé d’un canon à peinture surpuissant, et dont le but est de faire preuve d’adresse pour sauver un max d’innocents des griffes d’un big boss megalo. Chaque couleur de peinture offre des possibilités différentes comme se coller aux murs et aux plafonds, rebondir partout, ou encore barbouiller les ennemis pour altérer leurs comportements.	http://www.splasher-game.com/	{platformer,solo,competition}	2019-08-12 18:12:50.347872+02	2019-08-12 18:12:50.347872+02
e9ecf33d-6fbb-4b58-b782-f31fa98d35f2	Stormland	Petit studio breton comptant actuellement deux membres, Subtle Games s’attache à proposer des jeux qui ont du sens, transmettre des messages tout en maintenant une expérience vidéo-ludique prenante.	https://stormland-game.com	{strategy,solo,competition}	2019-08-12 18:12:50.368077+02	2019-08-12 18:12:50.368077+02
b61e49a0-6916-4351-8a93-3751b60c52d6	Win That War!	WinThatWar! est un jeu de strategy en temps réel qui vous entraîne au cœur d’une féroce conquête galactique dans un univers rétrofutur décalé. En plus des modes solo et multi, le cœur du jeu réside dans sa campagne MMO, à l’échelle planétaire. Construisez vos bases, formez des alliances et coordonnez vos armées de robots pour gagner en influence au sein de votre méga-corporation !	http://www.winthatwar.com	{strategy,solo,multi,online,competition}	2019-08-12 18:12:50.412011+02	2019-08-12 18:12:50.412011+02
623a8c36-498c-43e4-b51d-4872bac82df3	1 Shot 1 Kill	1 Shot 1 Kill est un jeu de bataille en arène, idéal pour s’amuser à 4 potes dans son canapé. Découvrez 4 armes aux gameplays différents : l’arc, le boomerang, le lance-pierre et le marteau, à travers plusieurs modes de jeu : bataille, équipes, coopération. Tirez, esquivez et punissez vos adversaires, avec comme seul allié, votre talent ! 1 Shot 1 Kill, no luck just skill!	https://www.facebook.com/1shot1killthegame	{"party game",multi,competition}	2019-08-12 18:12:50.446852+02	2019-08-12 18:12:50.446852+02
c522c2d9-cea9-4061-9393-452f61010ced	66-li	66-li est un projet transmédia permettant aux joueurs de se défier, tout en devenant coauteurs d’une bande dessinée immortalisant leurs sessions de jeu.	http://www.9andsome.com/stunfest	{multi,competition}	2019-08-12 18:12:50.468668+02	2019-08-12 18:12:50.468668+02
c75777e4-cc6e-40dd-aa21-c50b1b09c7f3	Port Tales	C’est un détournement ingénieux d’un genre classique, le jeu de patinoire, à compléter en coopération ! L’idée ? « Amener les joueurs à communiquer et à s’entre-aider pour atteindre un objectif commun. » Facile à dire ? Un indice : « Qui a dit que se faire marcher dessus est une mauvaise chose ? » L’idée fonctionne très bien, le jeu est amusant et propose une bonne dose de challenges !	https://github.com/webshinra/Port-Tales	{puzzle,solo,gamejam}	2019-08-12 18:12:50.484878+02	2019-08-12 18:12:50.484878+02
d74670c4-611f-4dce-8721-4c08a2f0e821	Asteruga	Une déclinaison en mode coopératif d’un grand classique : deux vaisseaux, chacun ne pouvant détruire que les astéroïdes de sa propre couleur. Il faut tenir ensemble le plus longtemps possible car, si l’un des deux meurt, les astéroïdes de sa couleur envahiront l’écran !	\N	{"shoot 'em up",coop,multi,gamejam}	2019-08-12 18:12:50.509729+02	2019-08-12 18:12:50.509729+02
cb832d9d-a032-4ed4-a381-ace5d3704783	Base Control	Un projet mystérieux, lui aussi en mode coopératif. Deux joueurs sont transportés dans une base en crise : incendies, inondations.. Un joueur devra parcourir les couloirs pour les réguler, à moins qu’il remporte des minijeux pour gagner du minerais utilisable par l’autre joueur, sous Occulus Rift et les yeux rivés sur des écrans de contrôle, pour payer au prix fort l’extinction du danger.	\N	{vr,puzzle,coop,gamejam}	2019-08-12 18:12:50.541384+02	2019-08-12 18:12:50.541384+02
97266237-7225-47bc-93e1-1ef3831391d4	ACME	3, 2, 1, FIGHT ! De la baston dans un univers tordu avec un loup, un agneau, des caisses d’explosifs et des coussins nichons. Pour le thème, c’est aussi barré : l’acronyme du thème donne ACMA, ce qui fait penser à …? ACME, la fausse firme des Toons ! Voilà. Le résultat est amusant, on découvre à travers les niveaux un tas d’idées rigolotes, avec une touche de plaisir nostalgique pour la licence.	http://arcade.gamesalad.com/game/121062	{brawler,multi,gamejam}	2019-08-12 18:12:50.572842+02	2019-08-12 18:12:50.572842+02
b0ceb9d9-8604-4466-b127-49646e2462f5	1 Shot 1 Kill	1 Shot 1 Kill est un jeu de bataille en arène, idéal pour s’amuser à 4 potes dans son canapé. Découvrez 4 armes aux gameplays différents : l’arc, le boomerang, le lance-pierre et le marteau, à travers plusieurs modes de jeu : bataille, équipes, coopération. Tirez, esquivez et punissez vos adversaires, avec comme seul allié, votre talent ! 1 Shot 1 Kill, no luck just skill!	https://www.facebook.com/1shot1killthegame	{"party game",multi,competition}	2019-08-12 18:12:50.597072+02	2019-08-12 18:12:50.597072+02
c6709eb4-ea0d-4e74-9089-f6ebd851cc5f	Abstract Pixel Run!	Il s’agit d’un plateformeur génératif, “die and retry”. 1 joueur, ambiance abstraite/design génératif.	http://abstractpixelgames.com/	{runner,solo,competition}	2019-08-12 18:12:50.620325+02	2019-08-12 18:12:50.620325+02
9949f1a0-4112-4088-b354-aad1c9af169c	aWay Project	aWAY est une expérience interactive qui questionne sur le dilemme que l’on peut ressentir dans le choix entre Rêve et Réalité. Une expérience sous deux formes interconnectées : L’une très immersive et solitaire pour la personne plongée dans le subconscient (à l’aide un casque de réalité virtuelle). L’autre plus accessible et plus ancrée dans le réel pour interagir avec le subconscient de la personne immergée (par le biais d’un périphérique tactile). Où l’expérience vous mènera-t-elle ?	http://novaplay.me/away	{vr,solo,competition}	2019-08-12 18:12:50.644401+02	2019-08-12 18:12:50.644401+02
8b30ec8b-cc1e-4966-819e-97e0c2706261	Box Out!	Fan de jeux de plateformes à la recherche de challenges ? Box Out! va mettre vos skills à l’épreuve. Prenez le contrôle de Boxy et maitrisez ses 6 transformations afin de venir à bout de 120 niveaux à la difficulté croissante. Repérez le meilleur parcours, optimisez vos mouvements et hissez-vous en haut des leaderboards.		{platformer,solo,competition}	2019-08-12 18:12:50.667849+02	2019-08-12 18:12:50.667849+02
f2865490-6bb7-4ce0-ad46-95928b56e5d9	City Invaders	Lone Stone est un studio indépendant créé en 2014 et basé à Nantes. Notre but est de créer des jeux Free2Play innovants et de qualité. Nous travaillons en ce moment sur notre premier jeu, City Invaders, un MMORPG tactique géolocalisé. Nous pensons que Free2Play ne veut pas dire “jeu de seconde zone”, mais qu’à l’inverse ce mode de commercialisation ouvre de nouvelles possibilités de gameplay.	https://cityinvaders.game/fr-FR/	{rpg,multi,competition}	2019-08-12 18:12:50.709948+02	2019-08-12 18:12:50.709948+02
e100c834-2358-44db-93d8-b329fecb4a5f	Crowd Smashers	Crowd Smashers est un jeu d’affrontement en local. Detruisez le public de votre adversaire tout en protégeant le votre. Combinez 3 écoles de magies pour créer des sorts puissants et surprenants. Plus vous faites d’échanges plus la boule gagne en puissance et en vitesse. Faites appel à des super attaques pour; Buff, Debuff, et détruire encore plus violemment la foule adverse.	http://www.CrowdSmashers.com	{arcade,multi,competition}	2019-08-12 18:12:50.739631+02	2019-08-12 18:12:50.739631+02
09c77b3b-d090-4d76-84c1-4afb240c8115	Crowntakers	Crowntakers est un tactical roguelike solo prenant place dans un univers médiéval fictif. Le joueur y incarne le fils illégitime d’un roi en chemin pour libérer ce dernier, enfermé dans les geôles de son propre château. Pour se faire, le joueur devra traverser les différentes contrées du royaume, recruter un groupe de mercenaires, les entraîner, pour finalement accomplir sa quête.	http://www.bulwarkstudios.com	{strategy,rogue-like,solo,competition}	2019-08-12 18:12:50.762068+02	2019-08-12 18:12:50.762068+02
9eb0b39c-c285-4549-9796-65a08630ee30	Domiverse	Vous avez 3 amis ? Défiez les à Domiverse et prouvez votre talent de gamer ! Choisissez parmi 8 héros aux capacités aussi surprenantes que variées, et remportez le tournoi Domiverse. Vous serez instantanément plongé dans son univers plein de limaces et de chats via un gameplay intuitif et dynamique où chaque attaque est fatale. Et si vous n’avez pas 3 amis, vous pouvez quand même jouer à 2 ou 3.	https://domiverse.be/	{brawler,multi,competition}	2019-08-12 18:12:50.78899+02	2019-08-12 18:12:50.78899+02
a1e37f77-a8ef-4e2e-b51a-4e1932e12221	Drifting Lands	Drifting Lands est un mix original de shoot’em’up horizontal classique avec les standards modernes du hack’n’slash, le descendant illégitime de Diablo et R-Type en quelque sorte. Drifting Lands est conçu pour satisfaire aussi bien les amateurs de shmups que de hack’n’slash. Le jeu propose un challenge très progressif que vous pourrez surmonter par votre seul Skill ou par une bonne sélection de compétences ainsi qu’une progression plus lente mais sûre de vos statistiques et équipements	 http://www.drifting-lands.com	{"shoot 'em up",solo,competition}	2019-08-12 18:12:50.814768+02	2019-08-12 18:12:50.814768+02
2cdb3d50-b6c1-413a-8104-97eed62afeca	Goetia	Goetia est un point’n click qui se déroule dans un univers fantastique. Vous incarnez un fantôme, Abigail Blackwood, à la recherche de réponses à propos de la disparition mystérieuse de membres de sa famille. Le jeu, soutenu par Square-Enix, est prévu pour la fin de l’année 2015 sur PC, Mac et Linux.	http://playgoetia.com/	{point'n'click,solo,competition}	2019-08-12 18:12:50.838524+02	2019-08-12 18:12:50.838524+02
7a295eb9-6d4a-4be3-aa05-c32c36e5fff9	Hazelrun	Hazelrun est un jeu de course multijoueur compétitif. Il met en scène 4 écureuils qui doivent se frayer un chemin dans un parcours semé d’obstacles, sans se faire rattraper par le scrolling. Le jeu prend tout son intérêt à quatre joueurs, chacun tentant de rattraper l’autre au moyen de noisettes piégées, d’inverseurs de gravité ou de marteaux rétrécissants.	https://www.facebook.com/hazelrungame/	{"party game",multi,competition}	2019-08-12 18:12:50.85768+02	2019-08-12 18:12:50.85768+02
220615fd-9082-4a1b-aae4-85f84ca1e7bf	Herocoli	Hero.Coli est un jeu d’aventure et de puzzle permettant d’apprendre les principes de base de la biologie de synthèse.	http://herocoli.com/	{aventure,puzzle,solo,competition}	2019-08-12 18:12:50.882826+02	2019-08-12 18:12:50.882826+02
05b086c5-aa7e-4435-970b-31c0c5e5f266	Hoy!	Dansez à la gloire de votre leader ! Hoy! est un jeu de danse prenant place dans une dictature totalitaire communiste. Reproduisez les figures et criez “Hoy!” pour valider votre pose. Faites en maximum en moins d’une minute pour satisfaire votre leader, ou sinon… Hoy! paraîtra prochainement sur Xbox One dans l’anthologie Best Party ever.	http://www.flying-oak.com/works/hoy/	{"party game",solo,multi,competition}	2019-08-12 18:12:50.908155+02	2019-08-12 18:12:50.908155+02
a7102533-5d0e-404d-a551-564be6355467	Ilios - Betrayal Of Gods	Ilios est un jeu d’action-aventure en 2D HD. S’inspirant de titres encensés par la critique telles que les productions du studio Vanillaware (Dragon’s Crown), des titres de chez Platinum Games (Bayonneta) ou de références plus ancienne (Megaman, Castlevania) la volonté de cette équipe est d’offrir une aventure qui sort des canons actuels en proposant une narration poussée et un gameplay nerveux. 	http://www.ilios-thegame.com	{action,solo,competition}	2019-08-12 18:12:50.933638+02	2019-08-12 18:12:50.933638+02
47825fe8-fa21-452a-9b9c-b560ca97ff0a	Interference	Interference est un jeu d’Aventure (mêlant Plateforme, Infiltration et Puzzles) en Solo dans un univers Cyberpunk. Les citoyens devenants trop couteux pour la société sont transférés au fur et à mesure sur des serveurs. Arriverez-vous à vous extirper de cette destinée ?	http://interference-game.com	{aventure,solo,competition}	2019-08-12 18:12:50.952937+02	2019-08-12 18:12:50.952937+02
b5873e64-8be5-4cb8-84bc-c711f022f57d	Isbarah	Isbarah est une fusion entre le platformer et le bullet hell. C’est un jeu particulièrement hardcore où chaque niveau est un duel contre un Boss. Vous contrôlez votre personnage comme dans un platformer et votre adversaire agit comme dans un bullet hell. Pour faire la liaison entre ces deux gameplay vous possédez trois pouvoirs : Un ralentissement du temps : Cela vous permet d ‘agir précisément et d’analyser la situation. Un dash omni directionnel : Il vous permet de bouger à très grande vitesse et de gérer les situations extrêmes. Une barrière d’énergie : Tracer ce mur vous permettra de vous en servir comme d’un bouclier ou comme d’une plateforme. Pour survivre dans Isbarah vous devez gérer correctement vos pouvoirs et vos déplacements. Tout est dans l’art de l’esquive.	http://www.leikir-studio.com/isbarah	{"shoot 'em up",solo,competition}	2019-08-12 18:12:50.973354+02	2019-08-12 18:12:50.973354+02
6eefab16-f495-4ed9-9ff0-cc17495be38d	Lastfight	LASTFIGHT est un jeu de combat / plateforme en 3D au style arcade inspiré de la bande dessinée récemment récompensée à Angoulêmes : LASTMAN. Plein d’humour, technique, fun, jouable à 4, LASTFIGHT présentera un roster de 10 personnages. Chacune des 8 arènes sera parsemée de boosts et d’objets spécifiques, pour un gameplay renouvelé à chaque partie ! LASTFIGHT est encore en développement, spécialement pour le STUNFEST nous allons faire une version beta avec 5 personnages et 3 arenes. Ça sera la première fois qu’on montrera le jeu en public !	http://www.lastfightgame.com/	{brawler,solo,multi,competition}	2019-08-12 18:12:50.994091+02	2019-08-12 18:12:50.994091+02
5ab8c783-18df-4b3b-8257-70ae4402163c	Lavapools	Lavapools est un jeu d’esquive hardcore d’arcade. Comparable à un pacman hardcore et modernisé, votre seul outil contre les scies, les chauves souris et autres pièges maléfiques sera l’esquive. Orienté speedrunning, leaderboard et scoring, il ravira les amateurs de jeux hardcore. Créé pendant plus d’une année, il est actuellement en préparation pour une sortie Steam prévue pour 2015. Des graphismes rétro, une bande son à la guitare éléctrique et un rythme endiablé, infernale sont les principales caractéristiques du jeu.	http://lavapools.com	{platformer,solo,competition}	2019-08-12 18:12:51.017645+02	2019-08-12 18:12:51.017645+02
823a68a1-8522-4ea4-a8e5-9eef4d135c2f	Lethis - Path Of Progress	Il s’agit d’un city builder old school en 2D isométrique dans un univers victorien steampunk. Le jeu se joue en solo, offline uniquement.	http://lethispop.com/	{strategy,solo,competition}	2019-08-12 18:12:51.037596+02	2019-08-12 18:12:51.037596+02
428f282c-ec88-48f3-9573-7c2256f3249d	Save Me Mr Tako !	Christophe Galati est un développeur indépendant de 23 ans, créateur de Save me Mr Tako!, projet commencé en 2014 pour les 25 ans de la Game Boy. Sous le pseudonyme ChrisDeneos, il s’occupa de la majeur partie de la conception du jeu sur son temps libre, avec l’aide du compositeur Marc-Antoine Archier. Le jeu est maintenant édité par Nicalis et sortira sur Nintendo Switch et Steam en 2018.	https://www.nicalis.com/games/savememrtako	{platformer,solo,competition}	2019-08-12 18:12:51.366262+02	2019-08-12 18:12:51.366262+02
f51913c2-9d65-4bad-b637-219a04b08ac9	Lije	Dans les brumes permanentes d’une étrange contrée, une jeune femme lutte pour sortir du chemin qui a été tracé pour elle par des hommes, des sociétés et des dieux. Lije est un RPG 2D, inspiré à la fois de la tradition japonaise (personnages forts) et de la tradition occidentale (liberté d’action dans un univers cohérent). Le jeu est prévu en 5 épisodes. Dans l’univers de Lije, la croyance crée le réel. Si une rumeur se répand suffisamment, elle va se matérialiser. Au contraire, si un individu se retrouve isolé, si un endroit n’existe plus que dans la mémoire de quelques personnes âgées, il va disparaître dans la brume permanente qui baigne le monde : Bordure. Le joueur explora cet univers dangereux et pourra utiliser ses propriétés : il redessinera les cartes du monde pour le modifier, effacera dans la brume les obstacles qui se dressent sur sa route, réveillera et utilisera les mémoire des gens pour faire émerger des endroits oubliés de Bordure. 	http://www.rufflerim.com	{aventure,solo,competition}	2019-08-12 18:12:51.062021+02	2019-08-12 18:12:51.062021+02
49abda9f-fa1c-45f4-96f4-76aa11d87d59	Macguffin	“Bien. Vos billets d’avion pour Chichijima sont prêts. J’ai fait un virement bancaire au montant de 1 000 000 sur votre compte. Je vous assisterai par smartphone quand vous serez dans la centrale nucléaire. J’espère que vous comprenez que ne pas trouver le MacGuffin n’est pas une option.” Richard N MacGuffin est une comédie/aventure à la premiere personne dans un present alternatif. Le jeu est inspiré par Jazzpunk, Gravity Bone et The Stanley Parable.	http://macguffin-game.com	{aventure,solo,competition}	2019-08-12 18:12:51.086454+02	2019-08-12 18:12:51.086454+02
486e779d-2add-454d-aa8f-9a375e468b66	Nandeyanen!? The 1st Sûtra	Nandeyanen!? est un shoot’em up horizontal en 2D pour 1 joueur dans lequel le joueur prend le rôle de Tenguman, un ermite au long nez qui se réveille après un sommeil millénaire et voit le monde en proie à une armée de figures mythologiques. Avec un visuel et une narration en hommage à « Hanatakadaka !? », un jeu Nec Pc-Engine de 1991, le gameplay introduit des mécaniques de jeu comme le bullet counter et les blast pods. Nandeyanen!? a été entièrement financé par notre entêtement, notre naïveté, et notre amitié.	http://www.tchagata.com	{"shoot 'em up",solo,competition}	2019-08-12 18:12:51.106461+02	2019-08-12 18:12:51.106461+02
3c480a01-a19d-4325-9b14-dadfc02d1b33	Neurovoider	NeuroVoider est un twin-stick shooter RPG dans un monde futuriste contrôlé par des robots. Frayez votre chemin à travers des hordes de robots armés jusqu’aux boulons, boostez votre personnage avec les restes de vos adversaires massacrés et défiez le master NeuroVoider au rythme frénétique de la musique Dark Synth de Dan Terminus.	http://neurovoider.flying-oak.com/	{"rogue like",coop,solo,multi,competition}	2019-08-12 18:12:51.129068+02	2019-08-12 18:12:51.129068+02
0f8882c5-a5df-498c-8196-1655932d7ed2	Psycho Starship Rampage	Psycho Starship Rampage est un space-shooter à scrolling horizontal dans lequel 1 à 4 joueurs construisent leur vaisseau et tentent de retrouver la Terre. Assemblez votre vaisseau spatial comme vous l’entendez. Ajoutez de l’armement. Détruisez des ennemis variés à travers de nombreux niveaux et pillez leurs carcasses. Puis améliorez votre vaisseau, ajoutez encore plus d’armes et sautez vers le prochain secteur pour plus d’action !	http://www.ballisticfrogs.com	{"shoot 'em up",rogue-like,solo,multi,competition}	2019-08-12 18:12:51.155641+02	2019-08-12 18:12:51.155641+02
b19109b0-e321-45ae-8a48-da6c8f0c8bf5	Raids Of Nohosphere	La Nohosphère est l’incarnation de l’imaginaire collectif, peuplée de tous les mythes, toutes les pensées de toutes les époques. A l’aide de puissantes créatures, protégez les anciens équilibres, affrontez les forteresses ennemies au travers de combats alliant réflexes et strategy. Découvrez l’Histoire et les menaces de Royaumes entre médiéval fantastique, mythologie, et traces futuristes. Une interface audio peut être activée pour les joueurs déficients visuels. (MMORPG 2D, PC Windows)	http://rono.fr	{mmorpg,multi,online,competition}	2019-08-12 18:12:51.187438+02	2019-08-12 18:12:51.187438+02
dcb3d44f-cf3f-4274-8b25-5183b2120c98	Samurai Riot	Wako Factory est un studio de développement de jeux-vidéo coopératifs indépendant. Depuis mai 2014, la Wako team travaille sur la production de Samurai Riot, un premier titre jouable en coopération, disponible sur PC via la plateforme Steam depuis le 13 Septembre 2017.	http://www.wakofactory.com/	{"beat'em all",solo,multi,competition}	2019-08-12 18:12:51.216075+02	2019-08-12 18:12:51.216075+02
a0b4ab1e-5d84-4df7-994d-b682927b13bb	Shmup Creator	Le SHMUP Creator est un outil de création de jeux vidéo qui permet à tout le monde de réaliser son propre shoot’ em up, sans aucune programmation. Puissant, simple d’utilisation et aussi fun qu’un jeu, il donne la possibilité d’exprimer sa créativité, puis de partager ses créations avec ses amis ou le grand public.		{"shoot 'em up",solo,competition}	2019-08-12 18:12:51.238703+02	2019-08-12 18:12:51.238703+02
65d18410-17f8-40b8-9e70-510575e5a836	Splasher	Splasher est un Plateformer 2D dans lequel vous êtes armé d’un canon à peinture surpuissant, et dont le but est de faire preuve d’adresse pour sauver un max d’innocents des griffes d’un big boss megalo. Chaque couleur de peinture offre des possibilités différentes comme se coller aux murs et aux plafonds, rebondir partout, ou encore barbouiller les ennemis pour altérer leurs comportements.	http://www.splasher-game.com/	{platformer,solo,competition}	2019-08-12 18:12:51.265908+02	2019-08-12 18:12:51.265908+02
8851f3da-770c-4384-a9e6-f6b353dfd0af	Starpicker	StarPicker est un jeu de course d’orientation dans un univers retrofuturiste. Sauvez le monde plongé dans le chaos depuis la disparition de la voûte céleste. Embarquez dans l’équipe de StarPicker et explorez des lieux fabuleux pour retrouver les étoiles manquantes, avec une carte et une boussole comme uniques armes. Incarnant le célèbre joueur de football américain Janus “Electric Eel” White, évoluez librement et avec agilité au travers de différents environnements et de leurs obstacles. Saurez-vous trouver le chemin le plus rapide dans cette course aux étoiles ?	https://www.facebook.com/StarPickerTheGame	{aventure,solo,competition}	2019-08-12 18:12:51.285455+02	2019-08-12 18:12:51.285455+02
4ce38f16-7f62-410a-9c46-59f4620aa493	Steredenn	Pixelnest Studio est un studio de développement de jeux, d’applications et sites webs.	http://pixelnest.io/	{"shoot 'em up",solo,competition}	2019-08-12 18:12:51.305187+02	2019-08-12 18:12:51.305187+02
33b4e410-67c5-4b95-8c93-79e2b67bcd6b	Stormland	Petit studio breton comptant actuellement deux membres, Subtle Games s’attache à proposer des jeux qui ont du sens, transmettre des messages tout en maintenant une expérience vidéo-ludique prenante.	https://stormland-game.com	{strategy,solo,competition}	2019-08-12 18:12:51.325402+02	2019-08-12 18:12:51.325402+02
f70aa32e-cef0-4c23-81d0-7be0db00e623	Synchrom	Synchrom sous-titre : Rhythm. Skill. Flow. Dans ce jeu musical mélangeant réflexes, anticipation et sens du rythme, vous contrôlez un Synchrom, mystérieux appareil capable de canaliser les impulsions de l’énergie lumineuse.	http://www.synchromthegame.com	{"jeu musical",solo,competition}	2019-08-12 18:12:51.346185+02	2019-08-12 18:12:51.346185+02
98d1ce32-d452-4cbc-a0cc-3ea32b60e8e1	Stormland	Petit studio breton comptant actuellement deux membres, Subtle Games s’attache à proposer des jeux qui ont du sens, transmettre des messages tout en maintenant une expérience vidéo-ludique prenante.	https://stormland-game.com	{strategy,solo,competition}	2019-08-12 18:12:51.802252+02	2019-08-12 18:12:51.802252+02
f74a5150-2d7b-4a5b-a9b9-7d43f8c2e12b	Tetrobot And Co.	Tetrobot and Co. est un pur jeu de réflexion, créé par et pour des joueurs qui aiment faire travailler leurs neurones. Guidez Psychobot, un microscopique robot réparateur, dans les engrenages et les circuits de Tetrobot : en absorbant des blocs de matière et en les recrachant, vous pouvez tout remettre en place ! Facile à prendre en main, Tetrobot and Co. peut être jouer par tous. Mais vous aurez besoin d’avoir un cerveau bien entrainé si vous voulez venir à bout de ses énigmes les plus retorses.	http://www.tetrobot.com	{puzzle,solo,competition}	2019-08-12 18:12:51.385888+02	2019-08-12 18:12:51.385888+02
f1cc0c19-20f2-4b75-be5a-658e3b5af0ad	Win That War!	WinThatWar! est un jeu de strategy en temps réel qui vous entraîne au cœur d’une féroce conquête galactique dans un univers rétrofutur décalé. En plus des modes solo et multi, le cœur du jeu réside dans sa campagne MMO, à l’échelle planétaire. Construisez vos bases, formez des alliances et coordonnez vos armées de robots pour gagner en influence au sein de votre méga-corporation !	http://www.winthatwar.com	{strategy,solo,multi,online,competition}	2019-08-12 18:12:51.407395+02	2019-08-12 18:12:51.407395+02
b3edf284-b01f-4e4c-9797-67c51b5b9303	Under The Sea	Récupérez le trésor sans vous faire repérer par le phare ! Restez dans la pénombre et envoyez des ondes à vos adversaires afin d'arriver à l'objectif en premier !	http://nahala-world.blogspot.com/2015/05/game-jam-stunjam-2015-under-sea.html	{"party game",multi,gamejam}	2019-08-12 18:12:51.434073+02	2019-08-12 18:12:51.434073+02
a9ebd2ff-bea8-435c-bf8d-b3dace2675a3	Towards The Past	Manipulez l'espace-temps pour interagir avec votre environnement et vous sortir des différentes embûches, tout en évitant les pirates de l'espace !	https://arthurmaugendre.wixsite.com/cgportfolio/vierge	{puzzle,platformer,solo,gamejam}	2019-08-12 18:12:51.459884+02	2019-08-12 18:12:51.459884+02
ac945fa9-8e1b-43f9-8d3f-0f37d1997890	Supa Shogen No Boken	Réussissez une pléthore de mini-jeux basés sur le quart de cercle tous plus délirants les uns que les autres en un minimum de temps !	\N	{mini-game,solo,gamejam}	2019-08-12 18:12:51.485964+02	2019-08-12 18:12:51.485964+02
cdfe0de2-0ca7-4d06-83a9-6f04eddac402	Silly Bundle	Ce bundle regroupe deux merveilleux jeux : Stunfest, The Game, où l'on peut assister aux dramas les plus dantesques des influenceurs du Stunfest, et Achivements, qui permet de réaliser les achivements de la Jam	https://twitter.com/regisRquoi/status/603124596297113601	{drama,solo,gamejam}	2019-08-12 18:12:51.514137+02	2019-08-12 18:12:51.514137+02
4b785d98-2fe5-46f6-babf-35e589fc72fe	Circle Survival Trip	VOilà un jeu coop où vous incarnez un car de cercles où vous devez avancer en tirant sur les vaisseaux qui veulent vous détruire ! Un runner-shumup de folie !	\N	{runner,"shoot 'em up",multi,gamejam}	2019-08-12 18:12:51.54596+02	2019-08-12 18:12:51.54596+02
3a3c441b-5dca-46ee-9069-124f9813e540	Sliced	SLICED est un jeu de combat en arène à trois joueurs où chaque personnage est divisé en trois parties : tête, torse et jambes. Chaque pièce procure une compétence unique. Au cours de la partie, ces pièces s’échangent aléatoirement entre joueurs, qui doivent s’adapter ! Le grand Samouraï Cosmique décide de découper trois univers parallèles avec son katana, puis de les mélanger entre eux !	http://www.slicedgame.com/	{combat,multi,competition}	2019-08-12 18:12:51.575482+02	2019-08-12 18:12:51.575482+02
ff62d9b5-b851-4efa-ada2-d60b3cd49912	Double Kick Heroes	DU METAL, DES ZOMBIES, DES SULFATEUSES, WHAT MOAR?!	http://dkh.rocks	{"shoot 'em up",solo,competition}	2019-08-12 18:12:51.596819+02	2019-08-12 18:12:51.596819+02
708c65c3-4ece-4320-9d0b-569c20a12857	Splash Blast Panic	Splash Blast Panic est un party game multi-joueur compétitif, où des personnages cartoonesques se tirent dessus avec des pistolets à eau et s’envolent avec des jetpacks.	http://playsbp.ch/	{"party game",multi,competition}	2019-08-12 18:12:51.618111+02	2019-08-12 18:12:51.618111+02
da501b57-1c84-4f63-88f9-eb4aec69402a	Crowd Smashers	Crowd Smashers est un jeu d’affrontement en local. Detruisez le public de votre adversaire tout en protégeant le votre. Combinez 3 écoles de magies pour créer des sorts puissants et surprenants. Plus vous faites d’échanges plus la boule gagne en puissance et en vitesse. Faites appel à des super attaques pour; Buff, Debuff, et détruire encore plus violemment la foule adverse.	http://www.CrowdSmashers.com	{arcade,multi,competition}	2019-08-12 18:12:51.644115+02	2019-08-12 18:12:51.644115+02
d64b6e14-6846-4611-9b2a-add681b13a25	Boiling Bolt	Utilisez vos différents pouvoirs élémentaires et élaborez votre propre façon de jouer pour assurer votre survie dans Boiling Bolt, un shooter nerveux et explosif ! Ralentissez le temps pour faire des combos et profitez de graphismes 3D époustouflants. Variez les plaisirs en jouant aux différents modes de jeux, seul ou en co-op.	http://popcornfx.fr/	{"shoot 'em up",coop,solo,multi,competition}	2019-08-12 18:12:51.665333+02	2019-08-12 18:12:51.665333+02
dcf70616-910c-454c-aa9f-c426f9c4c685	Looking For Imago	Looking for Imago est un jeu de plateforme et de réflexion dans lequel vous incarnez un petit personnage égaré dans le royaume des insectes depuis plusieurs années déjà. Guidés par votre instinct, vous décidez aujourd’hui de partir en quête d’Imago, le vôtre, car il n’est jamais trop tard…	http://looking-for-imago.com	{platformer,solo,competition}	2019-08-12 18:12:51.696355+02	2019-08-12 18:12:51.696355+02
aedadba3-6772-478d-bdfd-e9aeab019494	Modsork	MODSORK est un jeu d’arcade qui retourne le cerveau: Le joueur contrôle deux objets à la fois, chacun avec un stick de sa manette. Pour scorer, le joueur peut créer un laser entre eux pour détruire les ennemis rentrant en contact avec lui. En plus, les ennemis se bougent en rythme de la musique, qui pour sa part s’adapte aux événements du jeux. MODSORK a un mode classique et un mode coopératif.	http://modsork.com/	{arcade,solo,competition}	2019-08-12 18:12:51.716928+02	2019-08-12 18:12:51.716928+02
90c906e5-30e1-40fa-95a7-d40871824fd1	An Octonaut Odyssey	Dans ce platformer 2D, mêlant exploration, réflexion et plateforme, vous incarnerez Octo, le poulpe amnésique. Vous découvrirez avec lui des planètes sauvages, à la faune et à la flore étranges et évolutives. Vous ferez des rencontres insolites, vous récolterez des indices pour aider Octo à retrouver la mémoire. Vous apprendrez à vous déplacer et à évoluer dans un univers nouveau et accidenté, ainsi qu’à éviter les pièges qui attendent Octo pour le désorienter.	http://anoctonautodyssey.com/index.html	{platformer,solo,competition}	2019-08-12 18:12:51.73695+02	2019-08-12 18:12:51.73695+02
6c174d28-6483-4582-924a-e224fb957c11	Ilios - Betrayal Of Gods	Ilios est un jeu d’action-aventure en 2D HD. S’inspirant de titres encensés par la critique telles que les productions du studio Vanillaware (Dragon’s Crown), des titres de chez Platinum Games (Bayonneta) ou de références plus ancienne (Megaman, Castlevania) la volonté de cette équipe est d’offrir une aventure qui sort des canons actuels en proposant une narration poussée et un gameplay nerveux. 	http://www.ilios-thegame.com	{action,solo,competition}	2019-08-12 18:12:51.759236+02	2019-08-12 18:12:51.759236+02
118b735b-7a79-4a2a-8192-ce2726f7c3ea	Don't Kill Her	Don’t Kill Her est un plateformer étrange et mignon à la fois. Entièrement dessiné à la main, son intrigue a pour personnage principal une femme qui ne cesse de répéter au joueur qu’il est son meurtrier. L’aventure est jalonnée d’étonnantes surprises, dont il faudra démêler les tenants et aboutissants afin de percer les mystères de cet énigmatique univers.	http://wuthrer.net/dontkillher/	{platformer,solo,competition}	2019-08-12 18:12:51.779092+02	2019-08-12 18:12:51.779092+02
ff354e52-9246-497a-adcd-a4584832042f	Dungeon Rushers	Dungeon Rushers est un Heroic-Parody Tactical RPG combinant gameplay d’un dungeon crawler et combats au tour par tour. Gérez votre équipe, pillez des donjons poussiéreux, écrasez des armées de monstres et fabriquez de puissants équipements. Vivez cette aventure épique avec des héros hauts en couleurs dans un univers complètement décalé. Défiez les autres joueurs en construisant votre propre donjon ! 	http://dungeon-rushers.com/fr/	{rpg,solo,competition}	2019-08-12 18:12:51.824423+02	2019-08-12 18:12:51.824423+02
fc9750c5-7c06-4ee1-8b97-7d64f9765fe8	Wasted	Wasted est une expérience interactive et narrative visant à immerger le joueur au cœur de la dépression. Wasted raconte un morceau de vie d’une personne dépressive, le suivant dans son quotidien. Son appartement devient alors à la fois son lieu de vie et une réflexion de son état mental et émotionnel. L’expérience n’a pas pour objectif de procurer une forme de plaisir ludique. Plaçant le joueur dans la peau d’un dépressif, il s’agit avant tout d’une plongée sensitive et subjective dans la maladie.	http://wasted-game.com/	{vr,solo,competition}	2019-08-12 18:12:51.846069+02	2019-08-12 18:12:51.846069+02
aafc0b64-2a44-40f9-9929-0bffd0aae50a	Lije	Dans les brumes permanentes d’une étrange contrée, une jeune femme lutte pour sortir du chemin qui a été tracé pour elle par des hommes, des sociétés et des dieux. Lije est un RPG 2D, inspiré à la fois de la tradition japonaise (personnages forts) et de la tradition occidentale (liberté d’action dans un univers cohérent). Le jeu est prévu en 5 épisodes. Dans l’univers de Lije, la croyance crée le réel. Si une rumeur se répand suffisamment, elle va se matérialiser. Au contraire, si un individu se retrouve isolé, si un endroit n’existe plus que dans la mémoire de quelques personnes âgées, il va disparaître dans la brume permanente qui baigne le monde : Bordure. Le joueur explora cet univers dangereux et pourra utiliser ses propriétés : il redessinera les cartes du monde pour le modifier, effacera dans la brume les obstacles qui se dressent sur sa route, réveillera et utilisera les mémoire des gens pour faire émerger des endroits oubliés de Bordure. 	http://www.rufflerim.com	{aventure,solo,competition}	2019-08-12 18:12:51.864208+02	2019-08-12 18:12:51.864208+02
d094f925-b191-4b8c-a144-d0f4a477a4e3	Beam Gleam	Beam Gleam est un shoot’em up où on ne peut pas tirer. Le vaisseau a un miroir orientable dans huit directions avec lequel on peut réfléchir les lasers ennemis. Scorez au mieux pour être en haut de la table des high scores ! 	https://www.facebook.com/BeamGleamGame/	{"shoot 'em up",competition}	2019-08-12 18:12:51.884886+02	2019-08-12 18:12:51.884886+02
ac5fd6b8-56e1-4e3f-a5c7-0640d75372b6	Prism	Prism est un shoot ‘em up spatial avec certaines mécaniques de RPG. Les loot, ainsi que certaines missions et événements, sont générés procéduralement. Mais aussi plus de 12 différents pouvoirs, avec un arbre de talent pour chacun d’eux. Vous tirez à 360° à travers un Prism central qui renvoie des bullets plus puissantes, sur lesquelles vous influencez leur angle de réfraction avec vos gâchettes.	http://www.prismthegame.net/	{"shoot 'em up",competition}	2019-08-12 18:12:51.901837+02	2019-08-12 18:12:51.901837+02
4c449c2b-859d-4a3a-a5cf-3c9aeb8b8338	Cipher Pusher	Cipher Pusher est un jeu d’Action/Puzzle avec des blocs, des vortexs, et des fruits de mer! Des blocs à pousser, à porter, à tourner, et à assembler! Mais aussi pousser des blocs à distance, pousser plusieurs blocs d’un coup, lancer des réactions en chaîne… pour des combos encore plus craqués! Esquive des missiles! Expérimente des mécanismes obscurs et résous des énigmes!	http://anto80.free.fr/?id=cipher-pusher	{puzzle,solo,competition}	2019-08-12 18:12:51.919415+02	2019-08-12 18:12:51.919415+02
634474f2-ef55-4183-8c25-76634ade6da4	Save Me Mr Tako !	Christophe Galati est un développeur indépendant de 23 ans, créateur de Save me Mr Tako!, projet commencé en 2014 pour les 25 ans de la Game Boy. Sous le pseudonyme ChrisDeneos, il s’occupa de la majeur partie de la conception du jeu sur son temps libre, avec l’aide du compositeur Marc-Antoine Archier. Le jeu est maintenant édité par Nicalis et sortira sur Nintendo Switch et Steam en 2018.	https://www.nicalis.com/games/savememrtako	{platformer,solo,competition}	2019-08-12 18:12:51.957494+02	2019-08-12 18:12:51.957494+02
34b177ce-864b-40c4-8e8e-08acd0c50c58	Splasher	Splasher est un Plateformer 2D dans lequel vous êtes armé d’un canon à peinture surpuissant, et dont le but est de faire preuve d’adresse pour sauver un max d’innocents des griffes d’un big boss megalo. Chaque couleur de peinture offre des possibilités différentes comme se coller aux murs et aux plafonds, rebondir partout, ou encore barbouiller les ennemis pour altérer leurs comportements.	http://www.splasher-game.com/	{platformer,solo,competition}	2019-08-12 18:12:51.979554+02	2019-08-12 18:12:51.979554+02
bfa5a23e-9bff-4772-9b14-2d3e21373d74	Outskirts	Outskirts vous transporte sur un terrain circulaire envahi d’ennemis. À l’opposé des shoot’em up traditionnels, tout se joue sur la profondeur du niveau. Trois couleurs dominent à l’écran: revêtir l’une d’elle vous immunisera contre les tirs de cet élément. Alternez-les pour gagner en puissance et déchaîner des armes destructrices. Les assaillants éliminés dans le bon ordre débloqueront les combos.	http://www.outskirts-game.com/	{"shoot 'em up",solo,competition}	2019-08-12 18:12:52.002075+02	2019-08-12 18:12:52.002075+02
dc08eace-e6ba-4f1b-a68e-c4010d194653	Lethis - Daring Discovers	Lethis - Daring Discoverers est un jeu d’exploration dans lequel vous parcourez différentes planètes à la recherche d’artefacts mystérieux. Formez des expéditions et tentez votre chance en devenant l’un des passagers de l’Orbitron, l’incroyable canon à vapeur construit sur Lethis, qui vous enverra à la conquête de l’espace ! Pour l’Empereur, et pour la Science !	http://triskell-interactive.com/	{rogue-like,solo,competition}	2019-08-12 18:12:52.023124+02	2019-08-12 18:12:52.023124+02
f026106c-81fc-4739-a042-da14e166507c	Fancy Candy	Pas facile de jouer à Mario comme papa et maman, quand on n'a aucune expérience des jeux vidéos ! Fancy Candy est là pour ça : permettre aux petits (sous la supervision des plus grands) de s'initier en douceur à la notion d'avatar et au contrôle à la manette.	http://www.play-fool.net/fancy-candy	{platformer,solo,competition}	2019-08-12 18:12:52.043626+02	2019-08-12 18:12:52.043626+02
7ba8e228-7192-4b4d-8811-2a1143050898	Cubikolor	Faites évoluer votre cube en jouant sur la correspondance des couleurs de vos faces et les couleurs du plateau pour arriver à bout de chaque niveau. Avec votre logique pour seul atout, traversez les 150 niveaux en déjouant les pièges du “Système”, entité maligne et calculatrice, afin de prouver votre valeur face à la machine. Roulez, montez, descendez et rembobinez le temps pour venir à bout du Système!	http://www.fractalbox.fr/	{puzzle,solo,competition}	2019-08-12 18:12:52.066926+02	2019-08-12 18:12:52.066926+02
bd2fc111-8073-48f7-94d0-36fe7c47e0c3	Lost Paulette	Lost Paulette est un jeu PC solo avec beaucoup d’action et un feeling rétro, mélangeant des séquences en 2D pixel art et des niveaux en 3D ! Il mélange des niveaux en 2D run & gun dans lesquels vous tuez un maximum de sbires de la triade chinoise et des arènes bonus en 3D dans lesquels vous prenez un gros calibre et défonce tous ses ennemis. Vous jouez Maurice, un espion français à la retraite qui doit sauver sa fille Paulette d’une triade chinoise qui l’a kidnappée pour voler ses inventions.	https://thefuninstitute.itch.io/lostpaulette	{platformer,solo,competition}	2019-08-12 18:12:52.727244+02	2019-08-12 18:12:52.727244+02
f79a8fe9-7c06-49ca-a30e-9e36ac03c10d	Moonlight	Moonlight est un party-game poético-déjanté où l’on incarne le plus petit être du monde de Grinn, une cellule magique. Dans cette environnement aquatique coloré, entre des modes de jeux variés et un mode histoire prenant, chaque joueur y trouvera son compte ! Encore mieux, vous n’aurez plus besoin de vous battre pour les manettes : avec Moonlight vous pourrez rejoindre la partie avec votre smartphone comme contrôleur. Fini la loose des manettes qui ne tournent pas, bonjour les soirées à 36 joueurs ! En plus de pouvoir servir de manette, l’application Moonlight vous permettra de faire progresser votre cellule et de la personnaliser. Seul ou à plusieurs, une partie est toujours possible et toujours aussi fun !	http://moonlight.eode.studio/	{"party game",multi,competition}	2019-08-12 18:12:52.086486+02	2019-08-12 18:12:52.086486+02
ff885fa0-16c4-45b7-85fa-3223684ec94c	Hell Eluja	Hell Eluja est un jeu à deux joueurs asymétrique. Un des joueurs joue en réalité virtuelle avec le Gear VR, l’autre sur tablette. Chaque personne a une façon de jouer complètement différente. Le premier, livré à lui-même, doit éviter des monstres pour sortir d’un donjon (horreur à la première personne). Le second l’en empêche en y invoquant les monstres (strategy / dungeon defender).	http://oniroforge.ch/hell-eluja/	{vr,tablette,multi,competition}	2019-08-12 18:12:52.108568+02	2019-08-12 18:12:52.108568+02
8524a346-ec11-41c1-9975-1ce7a00abef3	Jumphead: Battle 4 Fun!	Dans Jumphead, jeu de combat délirant dans lequel quatre joueurs s’affrontent, amusez-vous à travers des dizaines de niveaux différents, avec toujours plus de bonus et faites varier les modes de jeu pour encore plus de fun !	https://www.facebook.com/JumpHead.Battle4Fun	{"party game",multi,competition}	2019-08-12 18:12:52.134691+02	2019-08-12 18:12:52.134691+02
a64f91b4-0944-4435-b98b-aa44dfab716b	Chop	Claws Up Games est un studio indépendant fondé par deux français.	http://chop-thegame.com/	{brawler,multi,competition}	2019-08-12 18:12:52.158173+02	2019-08-12 18:12:52.158173+02
11cb745f-8502-4adf-a3e9-4b7d159916e4	STONEBOND: The Gargolye's Domain	STONEBOND : Le Domaine des Gargouilles est un jeu de combat gothique multijoueur. Nourri par notre amour des grands classiques pixelisés et des séries TV des années 90, il s’agit d’un jeu de canapé à 4 joueurs dans lequel on crée un lien fragile avec un autre joueur, et on gagne en le protégeant. Chaque nuit, une vieille église maudite anime ses gargouilles et les fait combattre éternellement. Entrez dans le domaine…	https://www.facebook.com/i3gamejam	{brawler,multi,competition}	2019-08-12 18:12:52.181297+02	2019-08-12 18:12:52.181297+02
45108157-fce4-4a4e-a185-817b0e1a2f72	Neurovoider	NeuroVoider est un twin-stick shooter RPG dans un monde futuriste contrôlé par des robots. Frayez votre chemin à travers des hordes de robots armés jusqu’aux boulons, boostez votre personnage avec les restes de vos adversaires massacrés et défiez le master NeuroVoider au rythme frénétique de la musique Dark Synth de Dan Terminus.	http://neurovoider.flying-oak.com/	{"rogue like",coop,solo,multi,competition}	2019-08-12 18:12:52.201042+02	2019-08-12 18:12:52.201042+02
bc423de3-c1ae-493a-91ca-136b063a5211	Stomp	Stomp est un Battle Arena de 2 à 8 joueurs sans arme. Les joueurs s’affrontent en “stompant” les autres.	https://www.facebook.com/stompprojectisart/	{brawler,multi,competition}	2019-08-12 18:12:52.230495+02	2019-08-12 18:12:52.230495+02
dafdc604-23fb-46cc-9fe4-73a39b5719ab	Win That War!	WinThatWar! est un jeu de strategy en temps réel qui vous entraîne au cœur d’une féroce conquête galactique dans un univers rétrofutur décalé. En plus des modes solo et multi, le cœur du jeu réside dans sa campagne MMO, à l’échelle planétaire. Construisez vos bases, formez des alliances et coordonnez vos armées de robots pour gagner en influence au sein de votre méga-corporation !	http://www.winthatwar.com	{strategy,solo,multi,online,competition}	2019-08-12 18:12:52.251283+02	2019-08-12 18:12:52.251283+02
e6256530-80e5-4e07-b438-8d0869671e78	Samurai Riot	Wako Factory est un studio de développement de jeux-vidéo coopératifs indépendant. Depuis mai 2014, la Wako team travaille sur la production de Samurai Riot, un premier titre jouable en coopération, disponible sur PC via la plateforme Steam depuis le 13 Septembre 2017.	http://www.wakofactory.com/	{"beat'em all",solo,multi,competition}	2019-08-12 18:12:52.282379+02	2019-08-12 18:12:52.282379+02
968b3488-2696-4470-a7c8-6ef5e7ece907	City Invaders	Lone Stone est un studio indépendant créé en 2014 et basé à Nantes. Notre but est de créer des jeux Free2Play innovants et de qualité. Nous travaillons en ce moment sur notre premier jeu, City Invaders, un MMORPG tactique géolocalisé. Nous pensons que Free2Play ne veut pas dire “jeu de seconde zone”, mais qu’à l’inverse ce mode de commercialisation ouvre de nouvelles possibilités de gameplay.	https://cityinvaders.game/fr-FR/	{rpg,multi,competition}	2019-08-12 18:12:52.304918+02	2019-08-12 18:12:52.304918+02
5fe4be5c-a05e-4053-96c9-17437ddf2b5f	Merci Jambon !	Une histoire de dramas, de Dorian, d'Usul, de CdV et de faisage de sandwichs	https://regisrquoi.itch.io/merci-jambon-	{drama,solo,gamejam}	2019-08-12 18:12:52.325936+02	2019-08-12 18:12:52.325936+02
2558fb20-2de1-4e57-a14e-58d0e41a66d2	Mighty Miner 6	Sauvez le mineur des grottes dantesques à l'aide de moult puzzles à résoudre !	https://zril.itch.io/mighty-miner-6	{puzzle,solo,gamejam}	2019-08-12 18:12:52.347404+02	2019-08-12 18:12:52.347404+02
1c307199-353e-41ea-8bb9-80c5b63e6b09	Blob Jumper	Envoyez la petite goutte de blob dans les tuyaux ! A l'aide de mécaniques applicables sur les plateformes, soyez agiles afin de finir les niveaux !	https://pascallemerrer.itch.io/blob-jumper	{puzzle,solo,gamejam}	2019-08-12 18:12:52.37304+02	2019-08-12 18:12:52.37304+02
f77f3184-7e9f-4ed1-a555-8d7ff048cb9f	Skybolt Zack	Skybolt Zack est un jeu de plateforme ultra dynamique, dont la mécanique principale s’inspire des jeux de rythme. Sauf qu’on ne joue pas en rythme. Et on saute pas beaucoup non plus... Bref si c’est pas clair, venez tester plutôt tester notre démo !	https://isart-digital.itch.io/skybolt-zack	{platformer,solo,competition}	2019-08-12 18:12:52.395559+02	2019-08-12 18:12:52.395559+02
1dd6bbc7-1a9a-4092-a2b6-ed5155dfeb54	Healer's Quest	Healer’s Quest est un RPG humoristique dans lequel vous jouez le rôle le plus ingrat de tout l’univers de la fantasy  : le Soigneur. Partant à l’aventure avec bande de noobs un peu louches, vous devrez maintenir vos alliés en vie à l’aide de divers sorts de magie blanche. Si vos compagnons tombent au combat, vous serez tenu pour responsable et ils pourront se mettre à bouder. Gardez-les de bonne humeur en les empêchant de mourir et en ménageant les susceptibilités lors de dialogues interactifs.	http://healersquestgame.com/	{rpg,solo,competition}	2019-08-12 18:12:52.416959+02	2019-08-12 18:12:52.416959+02
cb23b112-18a5-43fa-8cdb-f0fd47237afd	Koloro	Koloro relate l’histoire de Kora qui part à la recherche de sa soeur dans un monde imaginaire et onirique, à travers un jeu contemplatif de plateformes et de réflexion. Le jeu propose un gameplay original jouable à un seul bouton qui permettra au joueur de sauter et de sauter contre les murs pour faire demi-tour. L’aventure offre plus d’une centaines de niveaux avec plusieurs boss épiques et le tout accompagné d’un scénario intriguant. Il est aussi possible de découvrir une aventure annexe à deux joueurs en coopération dans laquelle l’entraide sera primordiale pour sortir des tableaux.	http://skoll-studio.com/koloro.html	{platformer,solo,competition}	2019-08-12 18:12:52.438204+02	2019-08-12 18:12:52.438204+02
00abee6e-53c9-4fd6-becf-a694a7f84d8f	Enigmbox	EnigmBox est un jeu d’énigmes original dans lequel il faudra utiliser toutes les fonctionnalités et capteurs de votre téléphone pour résoudre une cinquantaine de niveaux. Attention, ne vous attendez pas à répondre aux questions d’un vieux sage à barbe blanche. Dans EnigmBox il vous faudra jouer avec toutes les fonctionnalités de votre smartphone. Manipulez et trifouiller votre appareil comme jamais : Bougez-le, tripotez-le, prenez des photos, des vidéos, parlez, branchez des trucs, appuyez sur des boutons, et bien plus encore. Plusieurs fois récompensé par pour son originalité, EnigmBox vous surprendra à chaque instant. Des enfants de 8 ans sont arrivés à résoudre 90% des énigmes les doigts dans le nez. Il suffit d’imaginer la solution la plus “simple” et la plus “logique”. Donc aucune excuse ! Ha, j’allais oublier ! Munissez-vous d’une fourchette. Oui oui !	http://www.enigmbox.com	{puzzle,solo,competition}	2019-08-12 18:12:52.459517+02	2019-08-12 18:12:52.459517+02
f3076280-25a1-41fd-bce0-d16c480b39d6	Stay Safe	Stay Safe est un jeu de course / plateforme die and retry monojoueur. Boostez, dashez et volez pour atteindre le prochain portail. Mais attention, la piste ne va pas se laisser faire.	http://www.staysafe.rocks	{course,competition}	2019-08-12 18:12:52.479556+02	2019-08-12 18:12:52.479556+02
3a80642b-b5ed-4a36-995c-fc686e248581	Sumocrats	Sumocrats est un jeu de sport futuriste en zéro gravité. De gigantesques corporations s’affrontent pour leur suprématie aux confins de l’espace dans des tournois ultra médiatisés. Les matches sont intenses, en 2vs2, et durent 6 minutes. Il n’y a aucun arrêt de jeu. Blitzez et punchez vos adversaires ou la balle. Chargez votre poing pour infliger un KO “instant” ou un « supershot ». Tentez le combos dash + punch pour renverser le cours du match. Sumocrats offre un mix de foule frénétique et d’ électro minimal au cœur de stations spatiales abandonnées reconverties le temps d’un match en arènes de Sumo.	http://www.sumocrats.com	{sport,solo,multi,online,competition}	2019-08-12 18:12:52.49476+02	2019-08-12 18:12:52.49476+02
b3039fc5-0c8a-4af2-ae4b-2a7591cb0834	Epic Loon	Exigeant et décalé, Epic Loon entraîne les joueurs dans un univers étrange, regorgeant d’hommages aux grands classiques du cinéma, et leur propose de diriger un groupe d’aliens pénibles. Ils se retrouvent dans le magnétoscope de Joe , dérangés après une longue période de léthargie dans une vieille VHS de nettoyage et passent leur temps à pourrir ses films. Le jeu est basé sur un core gameplay de platformer physique, il est jouable de 1 à 4 joueurs : en mode Histoire co-op ou en mode Battle compétitif. L’ambiance créée par Epic Loon est celle d’un party game totalement déjanté, mêlant fous rires, exploits personnels et chance, le tout générant au sein d’un groupe de joueurs, une expérience de jeu unique alliant subtilement rage et bonne humeur.	http://www.epicloon.com	{plaftormer,coop,solo,multi,competition}	2019-08-12 18:12:52.522288+02	2019-08-12 18:12:52.522288+02
97555558-92fd-4eeb-b05b-c0643d4546a2	Speedjail	Speedjail est un shoot’em up 2D rétro futuriste où votre survie dépend de votre vitesse ! Redéfinissez votre manière de jouer en parcourant des niveaux conçus autour d’une mécanique unique de scrolling et tentez de faire le meilleur score en enchaînant les destructions !	\N	{"shoot 'em up",solo,competition}	2019-08-12 18:12:52.550881+02	2019-08-12 18:12:52.550881+02
dbaf1aa1-4813-4d31-bacc-e8595c5eed9c	Orphan Age	Au milieu d’une guerre cyberpunk, un gang d’orphelins tente de survivre. Orphan Age est un jeu de micro-gestion dans lequel le joueur contrôle un groupe d’enfants livrés à eux-mêmes dans une ville ravagée. Il faudra leur construire une base, s’aventurer en ville pour récupérer les ressources nécessaires à la survie et s’assurer que les orphelins tiennent le coup. Orphan Age est un jeu solo créé par deux personnes qui sera bientôt présenté sur Kickstarter !	http://orphan-age.com	{gestion,solo,competition}	2019-08-12 18:12:52.572555+02	2019-08-12 18:12:52.572555+02
c02c6398-1b0e-4c6c-889e-7f6db1c4192e	Robothorium	Robothorium est un tour par tour futuriste mêlant Rogue Like et RPG dans lequel vos choix auront un impact direct dans votre révolution contre le genre humain.Rassemblez votre équipe de robots, choisissez vos alliés et mener vos troupes à la prochaine ère robotique.	http://www.robothorium.com	{rpg,rogue-like,solo,competition}	2019-08-12 18:12:52.593844+02	2019-08-12 18:12:52.593844+02
c2f3b52e-5649-4230-95be-f29176adfbfa	Sigma Theory	Sigma Theory est un jeu de strategy solo en tour par tour traitant d’espionnage et de diplomatie. Alors que l’humanité vient de faire une découverte scientifique capitale, les superpuissances mondiales enclenchent une nouvelle guerre froide, cette fois-ci technologique. Votre nation vous a nommé directeur d’une cellule de renseignements spécialisée, avec une seule consigne : gagner cette guerre par tous les moyens. 	http://www.sigmatheorygame.com	{strategy,solo,competition}	2019-08-12 18:12:52.620663+02	2019-08-12 18:12:52.620663+02
3fcddd86-7e4b-4d7d-b12b-69ab73e7cdce	Freakout: TV Calamity Show	Freakout TV Calamity Show est un Dual Stick Shooter en vue du dessus. Son gameplay tendu et brutal est inspiré des jeux d’arcade à l’ancienne et plus récents Die & Retry. Jeu Solo, l’histoire a pour point de départ une émission de Télé Réalité qui se passe dans un futur dystopique à l’univers mutant sombre et décalé. Nous incarnons un héros traîné de niveau en niveau par des ennemis loufoques dans le meilleur des cas et par des rebelles qui ont un pète au casque le reste du temps !	https://www.facebook.com/Freakout-TV-Calamity-Show-1766440456745319/	{tps,solo,competition}	2019-08-12 18:12:52.639452+02	2019-08-12 18:12:52.639452+02
9a879ee2-1e8a-4fdc-8c82-062ccd1f7ab3	Served! A Gourmet Race	Served! est un jeu de course multijoueur (4 joueurs) en vue aérienne qui se déroule dans un univers culinaire. Il met en scène différents personnages typiques de la cuisine mondiale dans des lieux iconiques de la gastronomie locale. Les parties sont courtes et rejouables à volonté. Les différents personnages disposent tous d’une attaque propre à leur cuisine pour pimenter la partie. L’ambiance visuelle cartoon et la bande-son décalée feront voyager les joueurs de tout âge!	https://chromaticroom.com/games/served	{"party game",multi,competition}	2019-08-12 18:12:52.663242+02	2019-08-12 18:12:52.663242+02
f37f96e3-9629-4c67-b8ca-79c309056700	Gladiabots	Gladiabots est un jeu de strategy dans lequel vous programmez l’IA de votre équipe de robots tueurs avant de l’envoyer dans l’arène affronter les équipes d’autres joueurs.	http://gladiabots.com	{strategy,solo,competition}	2019-08-12 18:12:52.681976+02	2019-08-12 18:12:52.681976+02
bb7ed69f-8e15-49c5-8aec-3fafaf872046	A Long Way Down	A Long Way Down Plongez dans un monde obscur et tourmenté, et défiez le sournois maître du donjon. Collectez des cartes, améliorez votre équipement, et peut-être pourrez-vous sortir de ce labyrinthe ? Mais saurez-vous faire les bons choix et convaincre vos compagnons d’infortune ? Dans ce rogue-like teinté de RPG, votre moralité sera la clé.	https://alwd.seenapsis.studio	{rpg,strategy,solo,competition}	2019-08-12 18:12:52.701128+02	2019-08-12 18:12:52.701128+02
d875cf0e-1743-4db4-a01d-50c7bce93b0d	Stormland	Petit studio breton comptant actuellement deux membres, Subtle Games s’attache à proposer des jeux qui ont du sens, transmettre des messages tout en maintenant une expérience vidéo-ludique prenante.	https://stormland-game.com	{strategy,solo,village}	2019-08-12 18:12:53.068197+02	2019-08-12 18:12:53.068197+02
b73ddb01-e384-44bf-aa31-d4a9b43b2494	Fallback	Dans ce rogue-like dystopique, incarnez des volontaires et restaurez votre civilisation au bord du déclin. Aventurez-vous dans les profondeurs d’un monde envoûtant et dangereux – rempli de pièges, d’ennemis et d’énigmes. Progressez grâce à un équipement modulable à votre convenance. Surmontez les différents types d’obstacles que vous rencontrerez et percez les mystères de votre passé !	http://endroad.fr	{rogue-like,solo,competition}	2019-08-12 18:12:52.746729+02	2019-08-12 18:12:52.746729+02
417696d5-727b-4d0d-8687-3ec1357f006d	Vandals	Vandals est un jeu d’infiltration qui vous fera voyager dans les villes les plus emblématiques du street art. Dans ce jeu au tour par tour, l’objectif est d’échapper à la surveillance de la police afin de peindre des murs de plus en plus difficiles d’accès. De Paris à Tokyo en passant par São Paulo, Berlin et New York, vous pourrez ainsi marcher sur les traces des plus grands street artists comme Blek Le Rat ou Keith Haring. Vandals vous permettra de bomber votre pseudo sur les murs de New York comme Lady Pink, de dessiner des personnages enfantins à la manière de Keith Haring ou encore de vous inspirer des poèmes de Miss.Tic pour écrire les vôtres.	http://arte.tv/vandals	{strategy,solo,competition}	2019-08-12 18:12:52.768473+02	2019-08-12 18:12:52.768473+02
e7a8d568-1c17-4f26-a068-8ed8fa9fae9e	Homo Machina	Homo Machina est un puzzle narratif, inspiré de l’œuvre avant-gardiste du scientifique Fritz Kahn. Plongez l’espace d’une folle journée à l’intérieur du corps humain, représenté comme une gigantesque usine des années 20 et laissez vous guider par une narration poétique et surréaliste. Évoluez dans un agencement ingénieux de nerfs, de vaisseaux et de valves. Objectif : parvenir, en une trentaine d’étapes à faire tourner cette incroyable usine. Chaque séquence décortique nos petites actions quotidiennes dans un gameplay intuitif et inventif. Pionnier de l’infographie et vulgarisateur scientifique, Fritz Kahn avait imaginé des analogies parlantes et visionnaires pour faire comprendre le fonctionnement du corps humain. Combinant “design old school et touche contemporaine”, Homo Machina distille de savoureux dialogues entre un directeur tête en l’air aux commandes de ce corps machine, et Josiane, sa secrétaire pleine de zèle, incitant ainsi le joueur à faire travailler une armada d’ouvriers. 	http://arte.tv/homomachina-game	{puzzle,solo,competition}	2019-08-12 18:12:52.788051+02	2019-08-12 18:12:52.788051+02
bbde93ce-9234-4331-bc1a-4c5522a2ec1f	Akimo: L'Odyssée Des Mots Magiques	Bryo Studio a pour mission de développer des jeux vidéo éducatifs conçus pour assister les spécialistes en éducation et en santé dans leurs tâches avec leurs apprenants.	https://www.bryostudio.com/	{puzzle,solo,village}	2019-08-12 18:12:52.808477+02	2019-08-12 18:12:52.808477+02
46fd9b2d-3ac1-47c6-be96-819e416de262	Guards !	Mirum Studio est une entreprise de développement de logiciels, spécialisée dans la conception de jeux vidéo. Évoluant avec une mission forte qui est d’utiliser le pouvoir de l’émerveillement pour créer des expériences captivantes qui injuencent le quotidien de ses joueurs, le studio se dirige pour travailler uniquement sur ses créations originales, mais offre des services de conception pour avoir un bon fonds de roulement.	http://www.mirumstudio.com/	{coop,multi,village}	2019-08-12 18:12:52.829836+02	2019-08-12 18:12:52.829836+02
2842d0e9-fbf1-4902-9a54-1b81f56bf735	Soup Raiders: Jailbreak	Team-KwaKwa is a indie game studio creating game for game jams and bigger commercial projects.\n\n	http://www.team-kwakwa.com/	{platformer,solo,village}	2019-08-12 18:12:52.85216+02	2019-08-12 18:12:52.85216+02
d9dac500-2085-464e-9a44-231a68c739fe	Looking For Imago	Looking for Imago est un jeu de plateforme et de réflexion dans lequel vous incarnez un petit personnage égaré dans le royaume des insectes depuis plusieurs années déjà. Guidés par votre instinct, vous décidez aujourd’hui de partir en quête d’Imago, le vôtre, car il n’est jamais trop tard…	http://looking-for-imago.com	{platformer,solo,village}	2019-08-12 18:12:52.874638+02	2019-08-12 18:12:52.874638+02
13e31675-f5b4-4ad5-873f-5a280c8e2c8f	Modsork	MODSORK est un jeu d’arcade qui retourne le cerveau: Le joueur contrôle deux objets à la fois, chacun avec un stick de sa manette. Pour scorer, le joueur peut créer un laser entre eux pour détruire les ennemis rentrant en contact avec lui. En plus, les ennemis se bougent en rythme de la musique, qui pour sa part s’adapte aux événements du jeux. MODSORK a un mode classique et un mode coopératif.	http://modsork.com/	{arcade,solo,village}	2019-08-12 18:12:52.900863+02	2019-08-12 18:12:52.900863+02
6a414442-e163-44e7-b1c1-4475af75780a	Don't Kill Her	Don’t Kill Her est un plateformer étrange et mignon à la fois. Entièrement dessiné à la main, son intrigue a pour personnage principal une femme qui ne cesse de répéter au joueur qu’il est son meurtrier. L’aventure est jalonnée d’étonnantes surprises, dont il faudra démêler les tenants et aboutissants afin de percer les mystères de cet énigmatique univers.	http://wuthrer.net/dontkillher/	{platformer,solo,village}	2019-08-12 18:12:52.921333+02	2019-08-12 18:12:52.921333+02
a93aa0fa-6741-47ca-952c-704f06e139af	Dead Cells	Motion Twin is an anarcho-syndical (seriously) workers cooperative that is been making games in France since 2001. No boss, equal pay.	http://motion-twin.com/fr/	{platformer,solo,village}	2019-08-12 18:12:52.94217+02	2019-08-12 18:12:52.94217+02
5153d778-f2e3-4a0c-aa1e-818ec4fe7c9c	Domiverse	Vous avez 3 amis ? Défiez les à Domiverse et prouvez votre talent de gamer ! Choisissez parmi 8 héros aux capacités aussi surprenantes que variées, et remportez le tournoi Domiverse.\n\nVous serez instantanément plongé dans son univers plein de limaces et de chats via un gameplay intuitif et dynamique où chaque attaque est fatale. Et si vous n’avez pas 3 amis, vous pouvez quand même jouer à 2 ou 3.	https://domiverse.be/	{brawler,multi,village}	2019-08-12 18:12:52.960821+02	2019-08-12 18:12:52.960821+02
79aa2ae5-eebc-484d-903a-1dd3d93cae09	Hyperun	Constitué de Corentin (@CorentinDerbre), Mathieu (@MatoLabu) et Tom (@Tomavatars), Concrete Games crée des jeux vidéo uniques et extrêmes depuis 2015.\n\n	http://concretegames.xyz	{runner,solo,online,village}	2019-08-12 18:12:52.978925+02	2019-08-12 18:12:52.978925+02
f7a9c4d2-9eb8-48c3-a482-1aa1300fa548	Save Me Mr Tako !	Christophe Galati est un développeur indépendant de 23 ans, créateur de Save me Mr Tako!, projet commencé en 2014 pour les 25 ans de la Game Boy. Sous le pseudonyme ChrisDeneos, il s’occupa de la majeur partie de la conception du jeu sur son temps libre, avec l’aide du compositeur Marc-Antoine Archier. Le jeu est maintenant édité par Nicalis et sortira sur Nintendo Switch et Steam en 2018.	https://www.nicalis.com/games/savememrtako	{platformer,solo,village}	2019-08-12 18:12:53.000615+02	2019-08-12 18:12:53.000615+02
f4be121d-f03c-450f-b1e9-786aa681153a	Samurai Riot	Wako Factory est un studio de développement de jeux-vidéo coopératifs indépendant. Depuis mai 2014, la Wako team travaille sur la production de Samurai Riot, un premier titre jouable en coopération, disponible sur PC via la plateforme Steam depuis le 13 Septembre 2017.	http://www.wakofactory.com/	{"beat'em all",solo,multi,village}	2019-08-12 18:12:53.027242+02	2019-08-12 18:12:53.027242+02
29e4c768-b77e-4550-800d-ff667924c732	Double Kick Heroes	DU METAL, DES ZOMBIES, DES SULFATEUSES, WHAT MOAR?!	http://dkh.rocks	{"shoot 'em up",solo,village}	2019-08-12 18:12:53.049305+02	2019-08-12 18:12:53.049305+02
a7337952-d9a4-425b-8ab6-0c42981f49a1	Steredenn	Pixelnest Studio est un studio de développement de jeux, d’applications et sites webs.	http://pixelnest.io/	{"shoot 'em up",solo,village}	2019-08-12 18:12:53.086707+02	2019-08-12 18:12:53.086707+02
aa8e722e-920c-49a6-bd97-b523ff741330	City Invaders	Lone Stone est un studio indépendant créé en 2014 et basé à Nantes. Notre but est de créer des jeux Free2Play innovants et de qualité. Nous travaillons en ce moment sur notre premier jeu, City Invaders, un MMORPG tactique géolocalisé. Nous pensons que Free2Play ne veut pas dire “jeu de seconde zone”, mais qu’à l’inverse ce mode de commercialisation ouvre de nouvelles possibilités de gameplay.	https://cityinvaders.game/fr-FR/	{rpg,multi,village}	2019-08-12 18:12:53.134425+02	2019-08-12 18:12:53.134425+02
6bef7606-a9bb-4790-8586-68ee35e33d31	Dunst - Le Manuscrit De L'Aube	Voici le pitch : Via un jeu d’action/aventure en top-view, vous suivrez l’histoire de Colin et de ses amis orphelins. Quittant un Londres de 1940 meurtri par la guerre, nos héros rejoignent un monde où l’écriture règne. Soyez la plume qui guide leur épopée au travers d’une histoire dont vous êtes l’auteur. Pour la démo du salon, les joueurs débuteront dans l’orphelinat de Stockwood où ils prendront le contrôle de différents protagonistes, utilisant les spécificités de chacun pour surmonter les épreuves qui se présenteront sur leur chemin.	https://dunst-game.com	{action,solo,prototypes}	2019-08-12 18:12:53.156112+02	2019-08-12 18:12:53.156112+02
175be24d-c6c6-45fe-a1f5-a26d930c04e7	Bomb N' Bats	Jeu compétitif multijoueur jusqu’à 4 en local. Jeu commencé il y a plus de 2 ans à l’origine pour jouer ensemble avec toute la famille et notamment mes fils. Pas besoin de notice ou d’explications, manette en main la règle du jeu est claire : tuer ou être tué. Pour le ton du jeu, un mix de Combat sur Atari 2600 et de Bomberman, avec et un zeste de Unreal Tournament pour l’ambiance sonore. Option Deathmatch ou Team Deathmatch.	\N	{"party game",multi,prototypes}	2019-08-12 18:12:53.176525+02	2019-08-12 18:12:53.176525+02
4e65297d-b3a4-4224-bb52-f80074a48758	It's Paper Guy!	It’s Paper Guy est un jeu de plateforme-aventure en 2.5D dans un univers intégralement fait de papier. Le joueur contrôle un petit personnage en papier, et progresse en découpant divers éléments du monde!	https://twitter.com/ItsPaperGuy	{platformer,solo,prototypes}	2019-08-12 18:12:53.196966+02	2019-08-12 18:12:53.196966+02
c6949df2-a93b-4705-9128-ef2af1f4352e	Kaiju Snap	Kaiju Snap est un jeu VR solo jouable à l’aide d’une manette. Le joueur contrôle un drône sur une île paradisiaque mystérieuse afin de la documenter en la photographiant.	https://team-kaiju.itch.io/kaiju-snap	{vr,solo,prototypes}	2019-08-12 18:12:53.214401+02	2019-08-12 18:12:53.214401+02
61f32a05-39bb-4721-9327-ff7c468f6ac0	A Time Paradox	Toutes les 3 secondes, vous remontez le temps. Trouvez un chemin pour éviter les paradoxes temporels dans ce jeu de réflexion conçu pour Android.		{prototypes}	2019-08-12 18:12:53.232769+02	2019-08-12 18:12:53.232769+02
3e5ec59a-4d1a-4586-8454-c18f19547def	Kiss Or Kill	Dans KissOrKill vous êtes seul et vous devrez relever le défi qui vous est lancé en tant que joueur. Pour venir à bout de ce shoot-them-up vous devrez choisir entre la voie de l’amour ou celle de la mort. à travers une multitude de niveaux court et graphiquement variés vous devrez assumer les choix de vos actes.	http://kissorkillgame.com/	{"shoot 'em up",solo,prototypes}	2019-08-12 18:12:53.246277+02	2019-08-12 18:12:53.246277+02
84ce5716-c484-4788-9c56-c3f9d2452120	Super Battle Kube	Super Battle Kube est un twin stick shooter convivial jouable jusqu’à 4 joueurs en local. Sa particularité est de proposer un gameplay nerveux dans des environnements kubiques dont la gravité se trouve au centre du kube en question. Prendre des décisions stratégiques peut porter ses fruits mais attention à ne pas trop réfléchir car un adversaire purement offensif à aussi ses chances de parvenir à ses fins.	https://twitter.com/NeilujKarja	{"shoot 'em up",multi,prototypes}	2019-08-12 18:12:53.263749+02	2019-08-12 18:12:53.263749+02
389e832d-0d97-4241-86aa-1b7a5c4c018f	Bombert	Bombert est un brawler platformer explosif en multijoueur local. Chaque joueur incarne une bombe qui détruit tout ce qui l’entoure à chaque saut. Le but du jeu est de survivre à la destruction du décor et aux autres joueurs. Bombert peut se jouer de 2 à 4 joueurs, dans une ambiance de compétition entre amis.	\N	{brawler,multi,prototypes}	2019-08-12 18:12:53.283337+02	2019-08-12 18:12:53.283337+02
c445747d-8176-4d50-a02a-4a8d9377216f	Pile Up!	Bondissez sur vos ami·e·s, empilez vous et explorez ensemble un joyeux monde de carton ! Pile Up est un adorable jeu coopératif de plateformes et de puzzle en 3D qui peut se jouer jusqu’à quatre personnes !	https://www.pileupgame.com/	{platformer,puzzle,coop,solo,multi,prototypes}	2019-08-12 18:12:53.302524+02	2019-08-12 18:12:53.302524+02
ab72581a-f2d0-455a-807a-0ec83e833f89	Teabag Break	Teabag Break est un jeu de combat 1v1 en 2D inspiré des meilleurs titre versus de type arcade. Mais il y a un twist, dans Teabag Break les dommages ne sont pas infligés tant qu’un combo n’est pas confirmé par une Pose de victoire. Lancer une pose rend le joueur vulnérable il faut donc bien juger son timing ! Ce système encourage à des combats dynamiques plein de rebondissement et de retournements de situation !	http://bit.ly/TeabagBreak	{combat,multi,prototypes}	2019-08-12 18:12:53.339175+02	2019-08-12 18:12:53.339175+02
4da19bc2-f6ff-422f-9d59-1ca04877595e	Wizama	Notre console de jeux de société se compose d’un plateau de jeu doté d’un écran tactile et d’éléments de jeux connectés (cartes, dés et pions) permettant des interactions entre objets physiques et mondes numériques. Aujourd’hui wizama a développé 3 jeux spécialement conçus pour cette console avec un gameplay hybride à la croisée du tangible et du digital.	http://www.wizama.com/	{"jeu de société",multi,prototypes}	2019-08-12 18:12:53.357931+02	2019-08-12 18:12:53.357931+02
ef7f5e55-34bd-4ce7-b7d0-d98de33b0d56	Bonjour, Helen	Bonjour Helen explore le thème du refuge.  L'idée était de faire un jeu sensible, qui trouve un équilibre entre gameplay et narration. Nous voulions que chaque personne dans l'équipe puisse s'exprimer sur le projet, et que tout soit créé spécifiquement pour cette expérience de jeu.	https://felixelvis.com/bonjour-helen	{puzzle,solo,gamejam}	2019-08-12 18:12:53.377259+02	2019-08-12 18:12:53.377259+02
2348243a-3f7a-491c-9dc0-518f2f201fa5	Sanity Rush	Need a fix? Play our trippy puzzle game "Sanity Rush" made in 48h for the Stun Jam #gamejam. The theme was "Refuge".	https://zril.itch.io/sanity-rush	{puzzle,solo,gamejam}	2019-08-12 18:12:53.404255+02	2019-08-12 18:12:53.404255+02
4830abb9-cdf9-4b67-9cd1-901a17020da8	Pawarumi	Pawarumi est un shoot’em up moderne se déroulant dans un univers rétro-futuriste inspiré des cultures pré-colombiennes. Vous prenez les commandes du tout puissant vaisseau Chukaru; choisissez bien votre arme pour maximiser vos dégâts, vous soigner ou recharger votre attaque spéciale !	http://pawarumi.manufacture43.com/	{"shoot’em up",solo,competition}	2019-08-12 18:12:53.431662+02	2019-08-12 18:12:53.431662+02
48e0801b-0db2-4fd1-a988-6a5681b86b57	ScourgeBringer	ScourgeBringer est un jeu de plate-forme roguelite, où vous devrez aider Kyhra à explorer l’inconnu et à se frayer un chemin entre les anciennes machines gardant le sceau de son passé, mais aussi la rédemption de l’humanité.	http://scourgebringer.com/	{rogue-like,platformer,solo,competition}	2019-08-12 18:12:53.452248+02	2019-08-12 18:12:53.452248+02
7ad3d60f-7a79-42ad-944e-a7019c79fb7f	Sbirz	Incarnez Angus, cadre moyen du département marketing, qui se retrouve un jour propulsé par mégarde dans une dimension parallèle. Dans ce monde hostile habité par le bizarre et l’inconnu, il va rencontrer le petit peuple des Sbirz, dont il devra solliciter les pouvoirs dans l’espoir de rentrer un jour à la maison.	https://www.youtube.com/watch?v=r2O0ehZWnvQ	{pikmin-rogue,solo,competition}	2019-08-12 18:12:53.478983+02	2019-08-12 18:12:53.478983+02
7b20b5c9-cf23-4629-b072-ec2f33bcec55	Legend of Keepers	Legend of Keepers est le mélange parfait entre un Dungeon Defender et un roguelike. Vous avez été embauché en tant que maître de donjon par la Company of Dungeon. Votre travail est simple : protégez leurs cachots !	https://store.steampowered.com/app/978520/Legend_of_Keepers	{rpg,strategy,solo,multi,online,competition}	2019-08-12 18:12:53.499376+02	2019-08-12 18:12:53.499376+02
a2c8d89c-a883-4dae-bac8-1eb4ce5b4101	Minimal Move	Minimal Move est un nouveau type de jeu de puzzle en 3D. L’aventure commence lorsque deux inspecteurs de l’espace, Kaiten et Ido atterrissent dans un merveilleux monde cubique pour découvrir les secrets de cette galaxie... Les règles du jeu sont simples, bougez les blocs et atteignez le portail ! Un nouveau jeu de puzzle innovant, bienvenue dans le monde de Minimal Move !	http://www.minimal-move.com	{puzzle,solo,multi,competition}	2019-08-12 18:12:53.529406+02	2019-08-12 18:12:53.529406+02
bab1c9f0-0f1f-4e47-9cd7-9966e7765423	Unruly Heroes	Inspiré du célèbre roman chinois «La Pérégrination vers l’Ouest», Unruly Heroes conte l’aventure de quatre héros totalement invraisemblables que tout oppose. Ces derniers devront traverser des mondes fantastiques et coopérer pour rassembler tous les fragments de Parchemin et restaurer l’équilibre.	https://www.unrulyheroes.com	{platformer,solo,multi,competition}	2019-08-12 18:12:53.555391+02	2019-08-12 18:12:53.555391+02
f3359db6-6c01-4d02-b180-2637bbf97660	Last Moon	La Lune s’effondre, de viles créatures apparaissent, Un voile de ténêbres s’abat sur le monde! Last Moon est un Action-RPG inspiré par Zelda, Secret of Mana, Chrono Trigger, et d’autres jeux cultes des années 90 !	http://skoll-studio.com/lastmoon.html	{rpg,solo,competition}	2019-08-12 18:12:53.579832+02	2019-08-12 18:12:53.579832+02
3a5636a9-416a-4f50-9c80-688cdb924b52	Pile Up!	Bondissez sur vos ami·e·s, empilez vous et explorez ensemble un joyeux monde de carton ! Pile Up est un adorable jeu coopératif de plateformes et de puzzle en 3D qui peut se jouer jusqu’à quatre personnes !	https://www.pileupgame.com/	{platformer,puzzle,coop,solo,multi,competition}	2019-08-12 18:12:53.597787+02	2019-08-12 18:12:53.597787+02
c186c9c9-10a1-4ce6-a602-e66046447850	Hair Dash	Défendez votre île et ses habitants dans ce brawler d’arcade survolté ! Jaloux de la chevelure magnifique et de la puissance physique que procure l’arbre mystique de votre île à ses habitants, le Roi Poulpe - intégralement chauve - a décidé de l’envahir avec son armée de pirates. Vous incarnez Charmant au sein d’un gameplay simple à appréhender mais offrant une grande profondeur et nervosité : un bouton pour attaquer dans chaque direction (droite et gauche) et c’est là votre seul moyen de vous déplacer, attaquer les ennemis ! Déjouez les hordes de pirates, composées d’un grand nombre d’ennemis et de mécaniques préparées par le Roi Poulpe, collectionnez les cosmétiques pour Charmant et montrez au monde que vous êtes le (ou la !) meilleur(e) !	http://www.cleancutgames.com/	{arcade,action,solo,competition}	2019-08-12 18:12:53.629202+02	2019-08-12 18:12:53.629202+02
134c1fa2-7a6d-4372-9e4a-d2761f67947e	Ninza	Ninza est un jeu de confrontation d’un genre inédit : le platformer 2D brawler. En effet, les plateformes qui composent les niveaux du jeu servent autant à votre survie qu’à l’élimination de vos adversaires !	https://www.ninza-game.com/	{platformer,brawler,solo,multi,competition}	2019-08-12 18:12:53.651663+02	2019-08-12 18:12:53.651663+02
e9984f28-b8ec-4c45-af66-01e163715e40	Sillysquad	Avec leur premier projet Sillysquad, Voxweaver propose un party game déjanté où l’on doit nourrir la reine de notre tribu avec les corps inconscients de nos adversaires. Un mélange entre brawler et basketball qui mettra votre amitié à rude épreuve.	https://voxweaver.com/our-games/	{"party game",solo,multi,online,competition}	2019-08-12 18:12:53.67882+02	2019-08-12 18:12:53.67882+02
ffee3baa-6cba-4ab0-bb41-ce2d4c6c6169	Super Chicken Catchers	Dans ce jeu coopératif fou, une équipe de deux joueurs en combat une autre. Dans chaque équipe, un joueur est la monture, l’autre le cavalier. Pour gagner, ils devront attraper le poulet et fuir l’autre équipe pour marquer des points et devenir les Super Chicken Catchers !	https://whitesmokegames.com/	{battle,multi,competition}	2019-08-12 18:12:53.70471+02	2019-08-12 18:12:53.70471+02
ea0cc5c9-6cb4-403b-a331-594565256021	Snowtopia	Bienvenue à Snowtopia ! Concevez la station de ski idéale, satisfaites des profils de skieurs toujours plus exigeants, et améliorez vos installations dans un cadre de montagnes grandioses et d’hiver éternel.	https://www.playsnowtopia.com/	{gestion,solo,competition}	2019-08-12 18:12:53.725273+02	2019-08-12 18:12:53.725273+02
8cb56a97-476a-4e24-acaf-17eb98c82b06	Skelittle: A Giant Party	Dans Skelittle : A Giant Party ! incarnez de petites figurines échappées de leur boîte de céréales. Découvrez une maison à taille humaine, défiez et piégez vos amis dans une quinzaine de mini-jeux originaux, ou laissez libre cours à votre créativité dans un mode bac à sable qui vous permettra de créer vos propres jeux !	https://store.steampowered.com/app/916960/Skelittle_A_Giant_Party/	{"party game",multi,competition}	2019-08-12 18:12:53.744422+02	2019-08-12 18:12:53.744422+02
3a719c34-790d-44e9-a9cf-3f660f62c551	Beat the Clock	L’humanité touche à sa fin. Un monstre abyssal s’est réveillé des profondeurs, déterminé à soumettre le monde. La menace a atteint un point de non-retour, il n’y a plus d’avenir... Pourtant, il reste de l’espoir ! Si la menace est aujourd’hui inarrêtable, cela n’a pas toujours été le cas. Un Chronomancien a l’intention de ressusciter les plus grands héros de tous les temps et de les envoyer dans le passé, au moment où l’invasion pourrait encore être arrêtée. Mais le temps presse ...COUREZ !	http://www.beat-the-clock.fr/index.php/fr/	{rpg,rogue-like,solo,competition}	2019-08-12 18:12:53.7653+02	2019-08-12 18:12:53.7653+02
b64703c1-a048-4e19-82d2-9ad1cd8142a4	Protocore	Essaie un shooter nerveux dans un univers sci-fi en solo ou en coop ! Tire au travers d’implacables vagues de robots dans un vaisseau gigantesque et affronte l’IA la plus manipulatrice jamais programmée. Sois vif ! Tu perds déjà le contrôle... N’attend pas d’être dépassé par ton némésis, Anomalie. FAIS FACE AUX MACHINES dès maintenant !	https://protocore.fr/	{fps,coop,solo,multi,competition}	2019-08-12 18:12:53.786784+02	2019-08-12 18:12:53.786784+02
8ddd6219-befb-475c-8567-bcfb86bef2db	Skybolt Zack	Skybolt Zack est un jeu de plateforme ultra dynamique, dont la mécanique principale s’inspire des jeux de rythme. Sauf qu’on ne joue pas en rythme. Et on saute pas beaucoup non plus... Bref si c’est pas clair, venez tester plutôt tester notre démo !	https://isart-digital.itch.io/skybolt-zack	{platformer,solo,village}	2019-08-12 18:12:53.812153+02	2019-08-12 18:12:53.812153+02
ddc478e6-7b3b-4247-b5bd-c8077029e073	Matter	Explorez un monde mystique et expressif dans un dynamique jeu de plateformes à la première personne. Plongez dans un monde onirique et abstrait où la matière évolue et vit autour de vous en fonction de vos actions.	https://www.concretegames.xyz/matter-info	{platformer,solo,village}	2019-08-12 18:12:53.830728+02	2019-08-12 18:12:53.830728+02
85511217-f7d0-4a22-81bb-c131a81b22d3	Vectronom	Les joueurs devront observer les évolutions de l’environnement au gré de la musique pour déplacer un cube en rythme, et résoudre les énigmes auxquelles ils seront confrontés. Les obstacles évoluent avec la musique et deviennent de plus en plus difficile en fonction de la progression des joueurs, mettant à l’épreuve leurs capacités de réflexion dans l’espace.	https://www.arte.tv/sites/webproductions/vectronom/	{puzzle,multi,village}	2019-08-12 18:12:53.849205+02	2019-08-12 18:12:53.849205+02
95f86d77-4608-404c-91e8-6020033724ed	The Wanderer: Frankenstein’s Creature	Vous incarnez la Créature, un être sans mémoire et sans passé. Vous ne connaissez ni le Mal, ni le Bien. Vous êtes un esprit vierge dans un corps adulte. En découvrant le monde, vous explorez vos émotions et écrivez les premières pages de votre histoire. Lorsque vous serez confrontés à la communauté des hommes, vous ne pourrez échapper à la question de vos origines. Qui vous a livré au monde ? Viendra alors le temps d’une aventure qui vous mènera à travers l’Europe ; vos expériences – certaines brutales, d’autres tragiques, ou joyeuses – et vos choix, vous rapprocheront, à chaque pas, de la vérité. Mais, cette vérité, serez-vous prêts à l’affronter ?	http://www.labellegames.com/projects/frankenstein-and-the-wanderer	{aventure,solo,village}	2019-08-12 18:12:53.870025+02	2019-08-12 18:12:53.870025+02
c2da5867-e3c3-4aa5-981c-4d994cbb88fa	Hellink	Le premier visual novel sur les fake news ! Menez une enquête trépidante et pleine d’humour en 2044 ! Arriverez-vous à démonter les mensonges de vos adversaires et à résoudre le complot qui menace Néo-Sorbonne ?	http://hellink.fr/	{"visual novel",solo,village}	2019-08-12 18:12:53.887697+02	2019-08-12 18:12:53.887697+02
7197b4bc-662d-485b-91d6-de0acf6ac828	Kairos'Light	Dans un futur aux contours sombres et énigmatiques, un vieil homme triste, Edmond, appelle à l’aide dans un dernier espoir. Entendant son appel, le mage Kairos, dont les pouvoirs sont infinis, lui donne une chance de revivre sa jeunesse pour changer sa destinée. Après un voyage temporel vivifiant, vous incarnez Edmond dans son plus bel âge, celui des rencontres au bar et des choix de vie, dans l’agréable ville de Thésye. Dans ce jeu de gestion, vos choix auront un impact sur l’avenir d’Edmond et ses futurs alternatifs possibles.	https://www.facebook.com/KairosLight	{gestion,solo,prototypes}	2019-08-12 18:12:53.910943+02	2019-08-12 18:12:53.910943+02
5cb989ac-4d27-4258-9542-dc53b17afeb4	One Day To Remember	Amnésique, un enfant se réveille dans les ruines d’une cité oubliée, laissée à l’abandon. Pour retrouver son passé et découvrir l’histoire de la ville, il devra en explorer les moindres recoins, tout en déjouant les obstacles lui barrant la route.	https://www.facebook.com/SweetDreamsStd/	{puzzle,aventure,solo,prototypes}	2019-08-12 18:12:53.930048+02	2019-08-12 18:12:53.930048+02
746aabb8-50de-4ebe-930b-58107b8527e0	Spliti	Spliti est un jeu de plateforme et de réflexion se déroulant dans un monde onirique. Vous contrôlez l’esprit d’un scientifique coincé dans un cube d’énergie. Vous devrez être malin et habile pour passer les obstacles et aider le héro à regagner son corps.	https://phlegmagames.com/	{puzzle,platformer,solo,multi,prototypes}	2019-08-12 18:12:53.953823+02	2019-08-12 18:12:53.953823+02
1463e4ca-6f90-4510-8459-d198a6713b44	Disk Commander	Aux commandes de votre vaisseau spatial et armé d’un disque aux étranges propriétés, pourfendez l’envahisseur qui menace l’univers. Dans ce jeu solo votre sang froid et votre précision serons mis à rude épreuve ! Arriverez vous à sauver l’univers ?!	\N	{"shoot 'em up",rogue-like,solo,prototypes}	2019-08-12 18:12:53.982042+02	2019-08-12 18:12:53.982042+02
aa37fa99-d814-416f-aedf-4fe3fe074528	2DOOM	2DOOM est un demake 2D faisant hommage au plus célèbre des FPS. Sous son air tout mignon se cache un déluge d’action et de violence sanglante. Vous n’êtes pas le héros. Vous êtes simplement un autre Marine perdu sur Mars en pleine invasion démoniaque. Mais vous aussi, vous savez manier le fusil à pompe et le BFG. Redécouvrez l’univers de DOOM à travers cet hommage et parcourez un autre bout de la planète rouge.	https://dmayance.com/2DOOM/	{action,platformer,solo,prototypes}	2019-08-12 18:12:54.007026+02	2019-08-12 18:12:54.007026+02
92bd2516-7bf9-4b23-97de-ac36758f6bc3	Ghost 808	Ghost 808 est un danmaku alliant graphismes polygonés et ambiance Synthwave. Dans ce Shooter, un trou noir a fait apparition au centre de la galaxie et une armée de spectres suivie de leurs généraux étendent leur domination. Au crépuscule de l’Ère des Poissons, l’Histoire se répète...	https://www.ghost-808.com/	{"shoot 'em up",solo,prototypes}	2019-08-12 18:12:54.027901+02	2019-08-12 18:12:54.027901+02
fb9d445b-3c2b-4cb6-a3b6-93663356088c	Magicarium	Magicarium est une simulation d’apprenti sorcier en réalité virtuelle. Elle vous invites à découvrir ce qui se passe le soir quand le directeur de votre école de sorcellerie n’est pas dans son bureau.	\N	{vr,solo,prototypes}	2019-08-12 18:12:54.049311+02	2019-08-12 18:12:54.049311+02
94983916-4e1e-4554-a9c5-2b99ffd2a70d	Autonomia	Ce jeu se situe dans l’univers absurde mais néanmoins réaliste de Makan, une petite île où vous êtes à la quête du bonheur. Suivez le guide et gagnez la sympathie des habitants, ou bien désobéissez et trouvez vous même ce qui vous rendra heureux.	\N	{gestion,solo,prototypes}	2019-08-12 18:12:54.072127+02	2019-08-12 18:12:54.072127+02
d2d41235-8750-4251-af21-00d5c286ae6d	TVLink	Un jeu multi local de strategy sur les compagnies de publicité qui se combattent pour des parts d'audience	https://superzikoure.itch.io/tvlink	{strategy,multi,gamejam}	2019-08-12 18:12:54.092581+02	2019-08-12 18:12:54.092581+02
96eaac66-a3c7-4032-bef0-6efa6a649ffb	Quasi Mire	Fuyez les enfants, Casimir veut vous manger tout cru ! Evitez les obstacles et sortez du plateau de tournage de l'Île aux Enfants vivant !	https://studio-casserole.itch.io/quasimire	{platformer,solo,gamejam}	2019-08-12 18:12:54.114436+02	2019-08-12 18:12:54.114436+02
0ac4dfff-8a10-482d-80c2-ad7f9f9678eb	You Need to Translate	Placé dans la station mir, vous devez traduire des signaux de dirigeants mondiaux. Le gameplay consiste à brancher des cables entre des téléviseurs demandant et envoyant un symbole associé à une couleur.  Ces signaux devront être traduit en les passant dans des boites afin d'éviter que les dirigeants se déconnectent les uns après les autres.	https://mahjoub.itch.io/you-need-to-translate	{puzzle,solo,gamejam}	2019-08-12 18:12:54.135481+02	2019-08-12 18:12:54.135481+02
845a71fd-64dd-4a5b-bf67-900a1c680495	HDMI-RE	Vous incarnez l'amire-al Lumire devant étalonner des écrans de télé. Pour ce faire, réparez la TV Kassai à l'aide d'un modèle, et récupérez les couleurs manquantes sur le circuit imprimé rempli de puzzles !	https://hamrod.itch.io/hdmi-re	{puzzle,solo,gamejam}	2019-08-12 18:12:54.159408+02	2019-08-12 18:12:54.159408+02
\.


--
-- Data for Name: game_author; Type: TABLE DATA; Schema: indieco; Owner: engleek
--

COPY indieco.game_author (game_id, person_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: game_entity; Type: TABLE DATA; Schema: indieco; Owner: engleek
--

COPY indieco.game_entity (game_id, entity_id, created_at, updated_at) FROM stdin;
def4ddd9-a51a-495d-8334-9d3fbe189854	dcc076bc-7804-47c9-a433-637b509e6be2	2019-08-12 18:12:49.705055+02	2019-08-12 18:12:49.705055+02
fa6ad040-70ef-44c0-a054-289001f724d5	dcc076bc-7804-47c9-a433-637b509e6be2	2019-08-12 18:12:49.737051+02	2019-08-12 18:12:49.737051+02
fb80c726-e99f-45b5-b97f-3e8901119db2	c8cb51fe-9c94-4235-a287-5af043560a96	2019-08-12 18:12:49.760112+02	2019-08-12 18:12:49.760112+02
f0a8ba14-6d6a-474b-8fa2-32205dc4e6a6	9b1e0464-9dcd-4f29-890a-13612e989a77	2019-08-12 18:12:49.786523+02	2019-08-12 18:12:49.786523+02
7dc705e3-31c6-4bbb-8fdd-fa78e475b387	d762f5d6-e420-456b-b58e-063983e34bab	2019-08-12 18:12:49.81339+02	2019-08-12 18:12:49.81339+02
14c7dce8-23ab-43e2-a31c-3c219497e3b5	ee4cb0b6-3349-4af2-9f8b-121cc1a5b8b0	2019-08-12 18:12:49.838795+02	2019-08-12 18:12:49.838795+02
8904f13c-0b74-4eb1-87f4-b356fa1e33e3	3a17261c-57f7-4d61-934d-b8ead6ac9df1	2019-08-12 18:12:49.869991+02	2019-08-12 18:12:49.869991+02
751e4db0-88df-42eb-a95e-ef569e797a88	81f1dead-3cdf-45a1-9712-0ddd376e3ae9	2019-08-12 18:12:49.891453+02	2019-08-12 18:12:49.891453+02
aa042b65-94e4-4612-b315-98b67baea13c	6fc5a1ab-e8a4-4df6-bb8b-c4bab5eaaccb	2019-08-12 18:12:49.915+02	2019-08-12 18:12:49.915+02
c28dcc12-8dce-4cda-b506-e065eee4bce9	36683ac6-6636-4b6c-8e60-e4d61b2d75f8	2019-08-12 18:12:49.939019+02	2019-08-12 18:12:49.939019+02
4087bb7d-9943-4f60-8ca2-a205ba621160	5351bda2-7a07-4d48-9641-6a71e4e1636f	2019-08-12 18:12:49.958893+02	2019-08-12 18:12:49.958893+02
fd7901b9-9339-4153-97e1-48070c788423	b1bea61a-d336-4cfe-9a42-782df8256641	2019-08-12 18:12:49.979631+02	2019-08-12 18:12:49.979631+02
b5bbeb3e-aa46-408a-901c-e7aa698defea	4bbdd9d4-7227-44fb-aa89-b3c32d9ad6a2	2019-08-12 18:12:50.001866+02	2019-08-12 18:12:50.001866+02
0f51298b-7052-4e15-9408-f97b81cfd99c	05f0b591-de25-4a5c-bff5-890607b862f0	2019-08-12 18:12:50.023645+02	2019-08-12 18:12:50.023645+02
13ca782c-f6c0-4c66-b9a1-b0b5679ddb7b	fd868a95-d924-49f1-ac9f-9be807b4933f	2019-08-12 18:12:50.046627+02	2019-08-12 18:12:50.046627+02
9690589f-fb5d-41cb-8b01-aee978f74d87	777bdb22-4d8e-4266-ba16-e094a75657d0	2019-08-12 18:12:50.069791+02	2019-08-12 18:12:50.069791+02
3adc0d82-5bbb-4c07-94d3-ae7eed55efe7	39ce0eb3-4f44-4a07-92e6-fc0a2b1cab6d	2019-08-12 18:12:50.100771+02	2019-08-12 18:12:50.100771+02
fcb10c9d-d6da-4426-a985-23b26acd2622	90faafd0-60f5-47a5-b2ba-601b7f8c12d4	2019-08-12 18:12:50.130817+02	2019-08-12 18:12:50.130817+02
daccd7a4-5c19-4585-8126-6ab5cc7e4d45	f9c38add-ec22-49b8-a7ce-f0ef43a0d4a1	2019-08-12 18:12:50.159529+02	2019-08-12 18:12:50.159529+02
ac50fe11-9302-43ce-b1fc-f6212ea637ef	9b1e0464-9dcd-4f29-890a-13612e989a77	2019-08-12 18:12:50.192184+02	2019-08-12 18:12:50.192184+02
2f456f1c-bdf9-4e89-b1ea-5679f645f280	85513b7a-3b9e-458b-9ae0-ef57cbe5644f	2019-08-12 18:12:50.218178+02	2019-08-12 18:12:50.218178+02
c0b40323-7766-4d5d-a53e-63fc5f19840a	8e7383b8-0282-4bee-9a04-cfb519029ae1	2019-08-12 18:12:50.239975+02	2019-08-12 18:12:50.239975+02
95643a24-aee5-4661-a8fd-22eab7eb8b9d	ad95af9f-bdae-4c13-970a-8e1bea6fd87b	2019-08-12 18:12:50.260444+02	2019-08-12 18:12:50.260444+02
03a1fe5c-cec5-413b-a574-a4113b11f963	fcf20bce-54a7-42dd-9564-eaec80e4ffb2	2019-08-12 18:12:50.284522+02	2019-08-12 18:12:50.284522+02
8430358c-fcd9-4309-987f-a16f66e7ba28	fa25fe71-1585-4f20-8b4e-35eb175f4e15	2019-08-12 18:12:50.305545+02	2019-08-12 18:12:50.305545+02
ff515266-00b0-4de8-bf9c-7a9eec37b630	68681a1f-dbce-4945-a5ec-5735a5c237ef	2019-08-12 18:12:50.327234+02	2019-08-12 18:12:50.327234+02
c1c833e4-92ff-490b-95b6-fb2ab8f5249b	c0cfde94-136a-49df-bab3-7ae65c926212	2019-08-12 18:12:50.3515+02	2019-08-12 18:12:50.3515+02
e9ecf33d-6fbb-4b58-b782-f31fa98d35f2	921b9d60-6f9b-465f-a5b6-bf5a6850ba09	2019-08-12 18:12:50.372778+02	2019-08-12 18:12:50.372778+02
b61e49a0-6916-4351-8a93-3751b60c52d6	8918a604-ca57-42a9-9771-0bf9ea3dfa59	2019-08-12 18:12:50.417056+02	2019-08-12 18:12:50.417056+02
623a8c36-498c-43e4-b51d-4872bac82df3	13820117-8049-4d3e-9b57-94f5b83e7afc	2019-08-12 18:12:50.450785+02	2019-08-12 18:12:50.450785+02
c522c2d9-cea9-4061-9393-452f61010ced	b49ce50e-bad1-462f-933b-4f4cc573d7e4	2019-08-12 18:12:50.47235+02	2019-08-12 18:12:50.47235+02
c75777e4-cc6e-40dd-aa21-c50b1b09c7f3	b3397f6b-85b2-48c1-98c8-f74e51a6fbdb	2019-08-12 18:12:50.488247+02	2019-08-12 18:12:50.488247+02
d74670c4-611f-4dce-8721-4c08a2f0e821	12913d48-0a52-4763-9c7d-331a3a026aef	2019-08-12 18:12:50.51352+02	2019-08-12 18:12:50.51352+02
cb832d9d-a032-4ed4-a381-ace5d3704783	564f75be-c295-4d65-8549-4a43631f5c6e	2019-08-12 18:12:50.546416+02	2019-08-12 18:12:50.546416+02
97266237-7225-47bc-93e1-1ef3831391d4	cffd3264-642a-401c-b28f-24f9891ce65b	2019-08-12 18:12:50.577051+02	2019-08-12 18:12:50.577051+02
b0ceb9d9-8604-4466-b127-49646e2462f5	13820117-8049-4d3e-9b57-94f5b83e7afc	2019-08-12 18:12:50.600927+02	2019-08-12 18:12:50.600927+02
c6709eb4-ea0d-4e74-9089-f6ebd851cc5f	6dca2d24-2b85-4e61-bf01-1f503a81e749	2019-08-12 18:12:50.624842+02	2019-08-12 18:12:50.624842+02
9949f1a0-4112-4088-b354-aad1c9af169c	3a17261c-57f7-4d61-934d-b8ead6ac9df1	2019-08-12 18:12:50.648055+02	2019-08-12 18:12:50.648055+02
8b30ec8b-cc1e-4966-819e-97e0c2706261	a7776ed3-711b-4205-8cfb-0e08282dd634	2019-08-12 18:12:50.671644+02	2019-08-12 18:12:50.671644+02
f2865490-6bb7-4ce0-ad46-95928b56e5d9	df2afc6c-0081-48da-8608-7e22e8942e15	2019-08-12 18:12:50.716937+02	2019-08-12 18:12:50.716937+02
e100c834-2358-44db-93d8-b329fecb4a5f	90faafd0-60f5-47a5-b2ba-601b7f8c12d4	2019-08-12 18:12:50.744572+02	2019-08-12 18:12:50.744572+02
09c77b3b-d090-4d76-84c1-4afb240c8115	e008440e-3166-41c3-baa7-b850123ada74	2019-08-12 18:12:50.765544+02	2019-08-12 18:12:50.765544+02
9eb0b39c-c285-4549-9796-65a08630ee30	f7b07d77-346c-467b-8deb-4b43f18acffd	2019-08-12 18:12:50.796021+02	2019-08-12 18:12:50.796021+02
a1e37f77-a8ef-4e2e-b51a-4e1932e12221	4bbdd9d4-7227-44fb-aa89-b3c32d9ad6a2	2019-08-12 18:12:50.819549+02	2019-08-12 18:12:50.819549+02
2cdb3d50-b6c1-413a-8104-97eed62afeca	777bdb22-4d8e-4266-ba16-e094a75657d0	2019-08-12 18:12:50.842899+02	2019-08-12 18:12:50.842899+02
7a295eb9-6d4a-4be3-aa05-c32c36e5fff9	777bdb22-4d8e-4266-ba16-e094a75657d0	2019-08-12 18:12:50.861067+02	2019-08-12 18:12:50.861067+02
220615fd-9082-4a1b-aae4-85f84ca1e7bf	c84f3695-ab22-4e5a-9282-f9aca020bc6d	2019-08-12 18:12:50.887138+02	2019-08-12 18:12:50.887138+02
05b086c5-aa7e-4435-970b-31c0c5e5f266	5351bda2-7a07-4d48-9641-6a71e4e1636f	2019-08-12 18:12:50.911644+02	2019-08-12 18:12:50.911644+02
a7102533-5d0e-404d-a551-564be6355467	f9c38add-ec22-49b8-a7ce-f0ef43a0d4a1	2019-08-12 18:12:50.937048+02	2019-08-12 18:12:50.937048+02
47825fe8-fa21-452a-9b9c-b560ca97ff0a	42c29817-36a8-4672-b432-8bbe93e04147	2019-08-12 18:12:50.956196+02	2019-08-12 18:12:50.956196+02
b5873e64-8be5-4cb8-84bc-c711f022f57d	13820117-8049-4d3e-9b57-94f5b83e7afc	2019-08-12 18:12:50.977716+02	2019-08-12 18:12:50.977716+02
6eefab16-f495-4ed9-9ff0-cc17495be38d	6687feca-c4aa-4e66-af5e-2db85eb8d383	2019-08-12 18:12:50.998155+02	2019-08-12 18:12:50.998155+02
5ab8c783-18df-4b3b-8257-70ae4402163c	5061aa00-3f7a-4062-95b7-fd820c652534	2019-08-12 18:12:51.021389+02	2019-08-12 18:12:51.021389+02
823a68a1-8522-4ea4-a8e5-9eef4d135c2f	03f7b668-6c8f-405e-9f5c-42cc9a1bdb7d	2019-08-12 18:12:51.041719+02	2019-08-12 18:12:51.041719+02
f51913c2-9d65-4bad-b637-219a04b08ac9	9b1e0464-9dcd-4f29-890a-13612e989a77	2019-08-12 18:12:51.066142+02	2019-08-12 18:12:51.066142+02
49abda9f-fa1c-45f4-96f4-76aa11d87d59	2e36b235-3a31-4594-82a6-9018c473ae44	2019-08-12 18:12:51.090074+02	2019-08-12 18:12:51.090074+02
486e779d-2add-454d-aa8f-9a375e468b66	7aba22ab-f555-4664-b341-52337dda626e	2019-08-12 18:12:51.110775+02	2019-08-12 18:12:51.110775+02
3c480a01-a19d-4325-9b14-dadfc02d1b33	5351bda2-7a07-4d48-9641-6a71e4e1636f	2019-08-12 18:12:51.133592+02	2019-08-12 18:12:51.133592+02
0f8882c5-a5df-498c-8196-1655932d7ed2	8598b997-56ff-4247-af9f-7efe2e6af137	2019-08-12 18:12:51.160038+02	2019-08-12 18:12:51.160038+02
b19109b0-e321-45ae-8a48-da6c8f0c8bf5	f80fcf2f-c64f-410e-ad44-093e3ecb44f7	2019-08-12 18:12:51.191325+02	2019-08-12 18:12:51.191325+02
dcb3d44f-cf3f-4274-8b25-5183b2120c98	74789559-c9c3-43c6-aef3-b89c16b2a479	2019-08-12 18:12:51.219731+02	2019-08-12 18:12:51.219731+02
a0b4ab1e-5d84-4df7-994d-b682927b13bb	fcead3cd-073f-4d0e-873f-dce533c4b3a1	2019-08-12 18:12:51.243588+02	2019-08-12 18:12:51.243588+02
65d18410-17f8-40b8-9e70-510575e5a836	c0cfde94-136a-49df-bab3-7ae65c926212	2019-08-12 18:12:51.269729+02	2019-08-12 18:12:51.269729+02
8851f3da-770c-4384-a9e6-f6b353dfd0af	27859f70-0c77-4a5b-ad82-169ca9065dc6	2019-08-12 18:12:51.289506+02	2019-08-12 18:12:51.289506+02
4ce38f16-7f62-410a-9c46-59f4620aa493	fcf20bce-54a7-42dd-9564-eaec80e4ffb2	2019-08-12 18:12:51.309663+02	2019-08-12 18:12:51.309663+02
33b4e410-67c5-4b95-8c93-79e2b67bcd6b	921b9d60-6f9b-465f-a5b6-bf5a6850ba09	2019-08-12 18:12:51.328933+02	2019-08-12 18:12:51.328933+02
f70aa32e-cef0-4c23-81d0-7be0db00e623	6395188a-3f99-4d8f-8788-77bb24792139	2019-08-12 18:12:51.349691+02	2019-08-12 18:12:51.349691+02
428f282c-ec88-48f3-9573-7c2256f3249d	54c14d28-f1a9-4a70-9cfa-8102e99b9871	2019-08-12 18:12:51.369289+02	2019-08-12 18:12:51.369289+02
f74a5150-2d7b-4a5b-a9b9-7d43f8c2e12b	99930ac5-1ae2-4491-89e9-18bf6495b9ee	2019-08-12 18:12:51.389166+02	2019-08-12 18:12:51.389166+02
f1cc0c19-20f2-4b75-be5a-658e3b5af0ad	8918a604-ca57-42a9-9771-0bf9ea3dfa59	2019-08-12 18:12:51.41176+02	2019-08-12 18:12:51.41176+02
b3edf284-b01f-4e4c-9797-67c51b5b9303	d90eb83d-95f3-4349-8c17-64b2da61539d	2019-08-12 18:12:51.437573+02	2019-08-12 18:12:51.437573+02
a9ebd2ff-bea8-435c-bf8d-b3dace2675a3	25007b04-5e7b-484a-8b0f-d4fcb3101c9d	2019-08-12 18:12:51.463808+02	2019-08-12 18:12:51.463808+02
ac945fa9-8e1b-43f9-8d3f-0f37d1997890	023b0ff8-e0ad-4bd6-8ec8-e093c792de41	2019-08-12 18:12:51.489338+02	2019-08-12 18:12:51.489338+02
cdfe0de2-0ca7-4d06-83a9-6f04eddac402	fc90bd66-8317-4208-88a1-0b271e779715	2019-08-12 18:12:51.519237+02	2019-08-12 18:12:51.519237+02
4b785d98-2fe5-46f6-babf-35e589fc72fe	72e3eb39-5a7d-4929-8146-3b2f1ac81b7d	2019-08-12 18:12:51.550476+02	2019-08-12 18:12:51.550476+02
3a3c441b-5dca-46ee-9069-124f9813e540	4b7df003-66f0-41f9-b24d-e5316f81d115	2019-08-12 18:12:51.578842+02	2019-08-12 18:12:51.578842+02
ff62d9b5-b851-4efa-ada2-d60b3cd49912	56306189-65b7-4202-8cf7-f8305c9d33a4	2019-08-12 18:12:51.600558+02	2019-08-12 18:12:51.600558+02
708c65c3-4ece-4320-9d0b-569c20a12857	50cd6ec9-37a6-4dbb-b2b6-8f4c4310961b	2019-08-12 18:12:51.621453+02	2019-08-12 18:12:51.621453+02
da501b57-1c84-4f63-88f9-eb4aec69402a	90faafd0-60f5-47a5-b2ba-601b7f8c12d4	2019-08-12 18:12:51.648628+02	2019-08-12 18:12:51.648628+02
d64b6e14-6846-4611-9b2a-add681b13a25	58e54759-340e-4dee-8505-aacd417b32aa	2019-08-12 18:12:51.669391+02	2019-08-12 18:12:51.669391+02
dcf70616-910c-454c-aa9f-c426f9c4c685	dc439da1-e568-4d1e-a3bf-2d706a397a95	2019-08-12 18:12:51.699674+02	2019-08-12 18:12:51.699674+02
aedadba3-6772-478d-bdfd-e9aeab019494	2005a45d-5b67-41e1-b477-ba5896c27bf8	2019-08-12 18:12:51.720371+02	2019-08-12 18:12:51.720371+02
90c906e5-30e1-40fa-95a7-d40871824fd1	e3dd2c8b-7374-4823-b4f3-5f1ec67a4f71	2019-08-12 18:12:51.740947+02	2019-08-12 18:12:51.740947+02
6c174d28-6483-4582-924a-e224fb957c11	f9c38add-ec22-49b8-a7ce-f0ef43a0d4a1	2019-08-12 18:12:51.763278+02	2019-08-12 18:12:51.763278+02
118b735b-7a79-4a2a-8192-ce2726f7c3ea	fe2e6ab5-a3e4-49da-a3c9-8cbe371e96aa	2019-08-12 18:12:51.782609+02	2019-08-12 18:12:51.782609+02
98d1ce32-d452-4cbc-a0cc-3ea32b60e8e1	921b9d60-6f9b-465f-a5b6-bf5a6850ba09	2019-08-12 18:12:51.807113+02	2019-08-12 18:12:51.807113+02
ff354e52-9246-497a-adcd-a4584832042f	0b48a895-18e7-4fda-b4bb-5c72f7a542fe	2019-08-12 18:12:51.828173+02	2019-08-12 18:12:51.828173+02
fc9750c5-7c06-4ee1-8b97-7d64f9765fe8	6e94a3f4-899d-4ab0-af2b-6bbf2a763268	2019-08-12 18:12:51.84971+02	2019-08-12 18:12:51.84971+02
aafc0b64-2a44-40f9-9929-0bffd0aae50a	9b1e0464-9dcd-4f29-890a-13612e989a77	2019-08-12 18:12:51.867614+02	2019-08-12 18:12:51.867614+02
d094f925-b191-4b8c-a144-d0f4a477a4e3	d946c915-30f1-41c7-8742-9819a0e870ae	2019-08-12 18:12:51.888708+02	2019-08-12 18:12:51.888708+02
ac5fd6b8-56e1-4e3f-a5c7-0640d75372b6	fa25fe71-1585-4f20-8b4e-35eb175f4e15	2019-08-12 18:12:51.904852+02	2019-08-12 18:12:51.904852+02
4c449c2b-859d-4a3a-a5cf-3c9aeb8b8338	e7a70002-84d2-4584-85b4-c76a631ccf0b	2019-08-12 18:12:51.925659+02	2019-08-12 18:12:51.925659+02
634474f2-ef55-4183-8c25-76634ade6da4	54c14d28-f1a9-4a70-9cfa-8102e99b9871	2019-08-12 18:12:51.960896+02	2019-08-12 18:12:51.960896+02
34b177ce-864b-40c4-8e8e-08acd0c50c58	c0cfde94-136a-49df-bab3-7ae65c926212	2019-08-12 18:12:51.983957+02	2019-08-12 18:12:51.983957+02
bfa5a23e-9bff-4772-9b14-2d3e21373d74	533682fb-eca6-40ce-ac1b-66fb898dd026	2019-08-12 18:12:52.005709+02	2019-08-12 18:12:52.005709+02
dc08eace-e6ba-4f1b-a68e-c4010d194653	03f7b668-6c8f-405e-9f5c-42cc9a1bdb7d	2019-08-12 18:12:52.027641+02	2019-08-12 18:12:52.027641+02
f026106c-81fc-4739-a042-da14e166507c	bbd7e11a-155e-4e06-8298-0a1d2046d168	2019-08-12 18:12:52.047181+02	2019-08-12 18:12:52.047181+02
7ba8e228-7192-4b4d-8811-2a1143050898	e096b219-b653-4f67-b064-68aa05a185bb	2019-08-12 18:12:52.070619+02	2019-08-12 18:12:52.070619+02
f79a8fe9-7c06-49ca-a30e-9e36ac03c10d	704d9e48-36b2-4193-ad8e-743c1f44da88	2019-08-12 18:12:52.089784+02	2019-08-12 18:12:52.089784+02
ff885fa0-16c4-45b7-85fa-3223684ec94c	34894149-78b8-4fa5-8fab-54b0b94471ee	2019-08-12 18:12:52.112473+02	2019-08-12 18:12:52.112473+02
8524a346-ec11-41c1-9975-1ce7a00abef3	d946c915-30f1-41c7-8742-9819a0e870ae	2019-08-12 18:12:52.138948+02	2019-08-12 18:12:52.138948+02
a64f91b4-0944-4435-b98b-aa44dfab716b	e9e96c2f-2da2-425c-9939-4457ee498875	2019-08-12 18:12:52.162173+02	2019-08-12 18:12:52.162173+02
11cb745f-8502-4adf-a3e9-4b7d159916e4	d5d1d199-5f3c-46f0-b776-79988e943891	2019-08-12 18:12:52.185252+02	2019-08-12 18:12:52.185252+02
45108157-fce4-4a4e-a185-817b0e1a2f72	5351bda2-7a07-4d48-9641-6a71e4e1636f	2019-08-12 18:12:52.204107+02	2019-08-12 18:12:52.204107+02
bc423de3-c1ae-493a-91ca-136b063a5211	54953e9a-bba7-4f43-af5e-84f6c154c4f0	2019-08-12 18:12:52.233957+02	2019-08-12 18:12:52.233957+02
dafdc604-23fb-46cc-9fe4-73a39b5719ab	8918a604-ca57-42a9-9771-0bf9ea3dfa59	2019-08-12 18:12:52.255298+02	2019-08-12 18:12:52.255298+02
e6256530-80e5-4e07-b438-8d0869671e78	74789559-c9c3-43c6-aef3-b89c16b2a479	2019-08-12 18:12:52.286316+02	2019-08-12 18:12:52.286316+02
968b3488-2696-4470-a7c8-6ef5e7ece907	df2afc6c-0081-48da-8608-7e22e8942e15	2019-08-12 18:12:52.309539+02	2019-08-12 18:12:52.309539+02
5fe4be5c-a05e-4053-96c9-17437ddf2b5f	fc90bd66-8317-4208-88a1-0b271e779715	2019-08-12 18:12:52.329404+02	2019-08-12 18:12:52.329404+02
2558fb20-2de1-4e57-a14e-58d0e41a66d2	30a68374-cbc8-484e-a243-2d989be29e9f	2019-08-12 18:12:52.351491+02	2019-08-12 18:12:52.351491+02
1c307199-353e-41ea-8bb9-80c5b63e6b09	49891538-ad68-4831-a8f8-bf3b27eefc3c	2019-08-12 18:12:52.377025+02	2019-08-12 18:12:52.377025+02
f77f3184-7e9f-4ed1-a555-8d7ff048cb9f	f814f11a-a0b4-4fc8-afb0-0a37292a3b24	2019-08-12 18:12:52.398919+02	2019-08-12 18:12:52.398919+02
1dd6bbc7-1a9a-4092-a2b6-ed5155dfeb54	d6274415-c034-4fba-a784-2d2e9a0def14	2019-08-12 18:12:52.420681+02	2019-08-12 18:12:52.420681+02
cb23b112-18a5-43fa-8cdb-f0fd47237afd	93d5950e-52b0-4ca4-8c35-b85b7e942d75	2019-08-12 18:12:52.441963+02	2019-08-12 18:12:52.441963+02
00abee6e-53c9-4fd6-becf-a694a7f84d8f	97f8bcd9-9837-4ffc-aff5-f7c0409d7b50	2019-08-12 18:12:52.463387+02	2019-08-12 18:12:52.463387+02
f3076280-25a1-41fd-bce0-d16c480b39d6	b98c5208-765f-4bfb-8147-885003f83a21	2019-08-12 18:12:52.483283+02	2019-08-12 18:12:52.483283+02
3a80642b-b5ed-4a36-995c-fc686e248581	ca306c69-2c51-4770-962e-a17d74eb0f6d	2019-08-12 18:12:52.499521+02	2019-08-12 18:12:52.499521+02
b3039fc5-0c8a-4af2-ae4b-2a7591cb0834	501ee93b-fc08-4fb5-8442-241f6627713b	2019-08-12 18:12:52.526317+02	2019-08-12 18:12:52.526317+02
97555558-92fd-4eeb-b05b-c0643d4546a2	690af2e0-4902-4795-93ed-c5290f9cbc9b	2019-08-12 18:12:52.5546+02	2019-08-12 18:12:52.5546+02
dbaf1aa1-4813-4d31-bacc-e8595c5eed9c	c8e58941-b481-48b5-82c8-2bb6bcf5edc1	2019-08-12 18:12:52.576443+02	2019-08-12 18:12:52.576443+02
c02c6398-1b0e-4c6c-889e-7f6db1c4192e	0b48a895-18e7-4fda-b4bb-5c72f7a542fe	2019-08-12 18:12:52.598012+02	2019-08-12 18:12:52.598012+02
c2f3b52e-5649-4230-95be-f29176adfbfa	8b0a99dd-eea2-4708-a1d5-0c5415f38a2f	2019-08-12 18:12:52.624136+02	2019-08-12 18:12:52.624136+02
3fcddd86-7e4b-4d7d-b12b-69ab73e7cdce	bd23fd98-f3de-4464-ac4f-303ece9677d4	2019-08-12 18:12:52.645223+02	2019-08-12 18:12:52.645223+02
9a879ee2-1e8a-4fdc-8c82-062ccd1f7ab3	ac85fbd1-870e-49fd-9694-2a1a0d820c20	2019-08-12 18:12:52.666754+02	2019-08-12 18:12:52.666754+02
f37f96e3-9629-4c67-b8ca-79c309056700	7f14455f-d525-4b9e-a868-851fd3e5fb3f	2019-08-12 18:12:52.685155+02	2019-08-12 18:12:52.685155+02
bb7ed69f-8e15-49c5-8aec-3fafaf872046	0c008dee-6457-45be-9aa0-7282c3cbc42b	2019-08-12 18:12:52.704716+02	2019-08-12 18:12:52.704716+02
bd2fc111-8073-48f7-94d0-36fe7c47e0c3	c72561e8-a6df-4cee-b144-b85ed0ca720c	2019-08-12 18:12:52.730646+02	2019-08-12 18:12:52.730646+02
b73ddb01-e384-44bf-aa31-d4a9b43b2494	63cb1da8-6606-4760-8e44-919a9485266c	2019-08-12 18:12:52.750929+02	2019-08-12 18:12:52.750929+02
417696d5-727b-4d0d-8687-3ec1357f006d	60637ecf-54ba-495b-8194-0d77baad23eb	2019-08-12 18:12:52.772268+02	2019-08-12 18:12:52.772268+02
e7a8d568-1c17-4f26-a068-8ed8fa9fae9e	60637ecf-54ba-495b-8194-0d77baad23eb	2019-08-12 18:12:52.792655+02	2019-08-12 18:12:52.792655+02
bbde93ce-9234-4331-bc1a-4c5522a2ec1f	1966ea84-c297-417a-bfda-2a3698e74efd	2019-08-12 18:12:52.813943+02	2019-08-12 18:12:52.813943+02
46fd9b2d-3ac1-47c6-be96-819e416de262	92d1760e-20f6-4842-8778-44b35fdf163b	2019-08-12 18:12:52.83344+02	2019-08-12 18:12:52.83344+02
2842d0e9-fbf1-4902-9a54-1b81f56bf735	50cd6ec9-37a6-4dbb-b2b6-8f4c4310961b	2019-08-12 18:12:52.855657+02	2019-08-12 18:12:52.855657+02
d9dac500-2085-464e-9a44-231a68c739fe	dc439da1-e568-4d1e-a3bf-2d706a397a95	2019-08-12 18:12:52.878018+02	2019-08-12 18:12:52.878018+02
13e31675-f5b4-4ad5-873f-5a280c8e2c8f	2005a45d-5b67-41e1-b477-ba5896c27bf8	2019-08-12 18:12:52.905503+02	2019-08-12 18:12:52.905503+02
6a414442-e163-44e7-b1c1-4475af75780a	fe2e6ab5-a3e4-49da-a3c9-8cbe371e96aa	2019-08-12 18:12:52.924858+02	2019-08-12 18:12:52.924858+02
a93aa0fa-6741-47ca-952c-704f06e139af	99376ed0-3a8c-4096-9075-a9423d8a95db	2019-08-12 18:12:52.945948+02	2019-08-12 18:12:52.945948+02
5153d778-f2e3-4a0c-aa1e-818ec4fe7c9c	f7b07d77-346c-467b-8deb-4b43f18acffd	2019-08-12 18:12:52.964483+02	2019-08-12 18:12:52.964483+02
79aa2ae5-eebc-484d-903a-1dd3d93cae09	2e36b235-3a31-4594-82a6-9018c473ae44	2019-08-12 18:12:52.982403+02	2019-08-12 18:12:52.982403+02
f7a9c4d2-9eb8-48c3-a482-1aa1300fa548	54c14d28-f1a9-4a70-9cfa-8102e99b9871	2019-08-12 18:12:53.004293+02	2019-08-12 18:12:53.004293+02
f4be121d-f03c-450f-b1e9-786aa681153a	74789559-c9c3-43c6-aef3-b89c16b2a479	2019-08-12 18:12:53.031368+02	2019-08-12 18:12:53.031368+02
29e4c768-b77e-4550-800d-ff667924c732	56306189-65b7-4202-8cf7-f8305c9d33a4	2019-08-12 18:12:53.052314+02	2019-08-12 18:12:53.052314+02
d875cf0e-1743-4db4-a01d-50c7bce93b0d	921b9d60-6f9b-465f-a5b6-bf5a6850ba09	2019-08-12 18:12:53.071162+02	2019-08-12 18:12:53.071162+02
a7337952-d9a4-425b-8ab6-0c42981f49a1	fcf20bce-54a7-42dd-9564-eaec80e4ffb2	2019-08-12 18:12:53.090538+02	2019-08-12 18:12:53.090538+02
b3ffdaca-8482-4d8d-bec9-86d2a17c6d0f	e9e96c2f-2da2-425c-9939-4457ee498875	2019-08-12 18:12:53.115353+02	2019-08-12 18:12:53.115353+02
aa8e722e-920c-49a6-bd97-b523ff741330	df2afc6c-0081-48da-8608-7e22e8942e15	2019-08-12 18:12:53.138236+02	2019-08-12 18:12:53.138236+02
6bef7606-a9bb-4790-8586-68ee35e33d31	8ecda564-c546-4531-aefe-3b53fd9adafb	2019-08-12 18:12:53.159554+02	2019-08-12 18:12:53.159554+02
175be24d-c6c6-45fe-a1f5-a26d930c04e7	655dd4db-579c-49e8-b519-79d23e341a05	2019-08-12 18:12:53.180031+02	2019-08-12 18:12:53.180031+02
4e65297d-b3a4-4224-bb52-f80074a48758	d99c8272-b32f-4f6d-a2fe-bfdf7141ace0	2019-08-12 18:12:53.200223+02	2019-08-12 18:12:53.200223+02
c6949df2-a93b-4705-9128-ef2af1f4352e	6291333c-7cfd-4811-9bdb-ea8b45caf015	2019-08-12 18:12:53.218034+02	2019-08-12 18:12:53.218034+02
61f32a05-39bb-4721-9327-ff7c468f6ac0	2b431f90-819d-4cce-8a81-bb31c1894065	2019-08-12 18:12:53.236031+02	2019-08-12 18:12:53.236031+02
3e5ec59a-4d1a-4586-8454-c18f19547def	c56c45a7-d01e-4b38-a0c7-6b3c5027e2b2	2019-08-12 18:12:53.249567+02	2019-08-12 18:12:53.249567+02
84ce5716-c484-4788-9c56-c3f9d2452120	c4d6a411-2035-41d7-9458-6cc41de06b5f	2019-08-12 18:12:53.267297+02	2019-08-12 18:12:53.267297+02
389e832d-0d97-4241-86aa-1b7a5c4c018f	c3aac68f-6e9e-4e95-bc8d-6e927bb995be	2019-08-12 18:12:53.287352+02	2019-08-12 18:12:53.287352+02
c445747d-8176-4d50-a02a-4a8d9377216f	4a9e9813-6cc3-4a95-8cb6-e0f22d5c2ee7	2019-08-12 18:12:53.30625+02	2019-08-12 18:12:53.30625+02
ab72581a-f2d0-455a-807a-0ec83e833f89	db26940d-98d3-4d0c-9c87-faa76fbd9899	2019-08-12 18:12:53.34325+02	2019-08-12 18:12:53.34325+02
4da19bc2-f6ff-422f-9d59-1ca04877595e	f78c6988-d08d-4ae0-a943-7d54b7c6b0ee	2019-08-12 18:12:53.361043+02	2019-08-12 18:12:53.361043+02
ef7f5e55-34bd-4ce7-b7d0-d98de33b0d56	c1ce19d4-4863-4827-9739-c218bb99d109	2019-08-12 18:12:53.38122+02	2019-08-12 18:12:53.38122+02
2348243a-3f7a-491c-9dc0-518f2f201fa5	30a68374-cbc8-484e-a243-2d989be29e9f	2019-08-12 18:12:53.409936+02	2019-08-12 18:12:53.409936+02
4830abb9-cdf9-4b67-9cd1-901a17020da8	f79dfef1-6670-4d7f-8444-581ed9cc99a0	2019-08-12 18:12:53.435213+02	2019-08-12 18:12:53.435213+02
48e0801b-0db2-4fd1-a988-6a5681b86b57	5351bda2-7a07-4d48-9641-6a71e4e1636f	2019-08-12 18:12:53.456569+02	2019-08-12 18:12:53.456569+02
7ad3d60f-7a79-42ad-944e-a7019c79fb7f	c0cfde94-136a-49df-bab3-7ae65c926212	2019-08-12 18:12:53.48237+02	2019-08-12 18:12:53.48237+02
7b20b5c9-cf23-4629-b072-ec2f33bcec55	0b48a895-18e7-4fda-b4bb-5c72f7a542fe	2019-08-12 18:12:53.50295+02	2019-08-12 18:12:53.50295+02
a2c8d89c-a883-4dae-bac8-1eb4ce5b4101	6ccdf27a-3f88-4f3b-bfff-b99cbec8b761	2019-08-12 18:12:53.533548+02	2019-08-12 18:12:53.533548+02
bab1c9f0-0f1f-4e47-9cd7-9966e7765423	08d9f086-5eef-471b-8533-c84769944001	2019-08-12 18:12:53.559185+02	2019-08-12 18:12:53.559185+02
f3359db6-6c01-4d02-b180-2637bbf97660	93d5950e-52b0-4ca4-8c35-b85b7e942d75	2019-08-12 18:12:53.583003+02	2019-08-12 18:12:53.583003+02
3a5636a9-416a-4f50-9c80-688cdb924b52	4a9e9813-6cc3-4a95-8cb6-e0f22d5c2ee7	2019-08-12 18:12:53.600893+02	2019-08-12 18:12:53.600893+02
c186c9c9-10a1-4ce6-a602-e66046447850	1d949128-f88e-481f-8bcc-d4f71ef1b5d0	2019-08-12 18:12:53.63308+02	2019-08-12 18:12:53.63308+02
134c1fa2-7a6d-4372-9e4a-d2761f67947e	6e0d2f3e-087e-4561-a80c-d907a13f9ab3	2019-08-12 18:12:53.655006+02	2019-08-12 18:12:53.655006+02
e9984f28-b8ec-4c45-af66-01e163715e40	b1168630-f11d-4f4a-af62-1f2624d1cb6b	2019-08-12 18:12:53.682361+02	2019-08-12 18:12:53.682361+02
ffee3baa-6cba-4ab0-bb41-ce2d4c6c6169	614ff2a0-37ec-436a-b0e4-4012d8ef7db1	2019-08-12 18:12:53.709136+02	2019-08-12 18:12:53.709136+02
ea0cc5c9-6cb4-403b-a331-594565256021	42c3fd05-cbff-4037-b893-7bcd3262f2b4	2019-08-12 18:12:53.729134+02	2019-08-12 18:12:53.729134+02
8cb56a97-476a-4e24-acaf-17eb98c82b06	903e7ea6-e317-4681-9f91-67faade8a5f7	2019-08-12 18:12:53.74835+02	2019-08-12 18:12:53.74835+02
3a719c34-790d-44e9-a9cf-3f660f62c551	40521a33-867e-4339-b3dd-9dcf5ca97a82	2019-08-12 18:12:53.768848+02	2019-08-12 18:12:53.768848+02
b64703c1-a048-4e19-82d2-9ad1cd8142a4	e6224e36-d071-41c6-9acd-e3dbafd88ef1	2019-08-12 18:12:53.789831+02	2019-08-12 18:12:53.789831+02
8ddd6219-befb-475c-8567-bcfb86bef2db	f814f11a-a0b4-4fc8-afb0-0a37292a3b24	2019-08-12 18:12:53.816019+02	2019-08-12 18:12:53.816019+02
ddc478e6-7b3b-4247-b5bd-c8077029e073	2e36b235-3a31-4594-82a6-9018c473ae44	2019-08-12 18:12:53.83389+02	2019-08-12 18:12:53.83389+02
85511217-f7d0-4a22-81bb-c131a81b22d3	04db5d07-6d59-4547-b6e3-017b13739045	2019-08-12 18:12:53.85313+02	2019-08-12 18:12:53.85313+02
95f86d77-4608-404c-91e8-6020033724ed	60637ecf-54ba-495b-8194-0d77baad23eb	2019-08-12 18:12:53.873066+02	2019-08-12 18:12:53.873066+02
c2da5867-e3c3-4aa5-981c-4d994cbb88fa	c4794375-566f-4d85-803b-c300dd6f91ee	2019-08-12 18:12:53.891339+02	2019-08-12 18:12:53.891339+02
7197b4bc-662d-485b-91d6-de0acf6ac828	7a63ecec-99f8-42d5-a560-307c5c4399e1	2019-08-12 18:12:53.914671+02	2019-08-12 18:12:53.914671+02
5cb989ac-4d27-4258-9542-dc53b17afeb4	8b9dd9e5-b296-4f2b-8e15-b11b1fc1a57a	2019-08-12 18:12:53.933397+02	2019-08-12 18:12:53.933397+02
746aabb8-50de-4ebe-930b-58107b8527e0	672f022b-de39-4839-a94a-200972655cdd	2019-08-12 18:12:53.957656+02	2019-08-12 18:12:53.957656+02
1463e4ca-6f90-4510-8459-d198a6713b44	7b64bdec-03f8-49bf-a7c7-ca9d2435e7d3	2019-08-12 18:12:53.985617+02	2019-08-12 18:12:53.985617+02
aa37fa99-d814-416f-aedf-4fe3fe074528	9a7d3b1d-04c7-4d37-bf2e-fe0a7b61cf98	2019-08-12 18:12:54.011166+02	2019-08-12 18:12:54.011166+02
92bd2516-7bf9-4b23-97de-ac36758f6bc3	b096b961-fb79-4ed7-b59d-2f9d6aa96c97	2019-08-12 18:12:54.031135+02	2019-08-12 18:12:54.031135+02
fb9d445b-3c2b-4cb6-a3b6-93663356088c	b6554bed-9958-42c9-acdf-5ddd1652260d	2019-08-12 18:12:54.055696+02	2019-08-12 18:12:54.055696+02
94983916-4e1e-4554-a9c5-2b99ffd2a70d	e54193bb-f58b-4f31-9b84-c6283a8d216d	2019-08-12 18:12:54.075546+02	2019-08-12 18:12:54.075546+02
d2d41235-8750-4251-af21-00d5c286ae6d	530524a6-4e1f-4204-9807-d77de748169d	2019-08-12 18:12:54.096238+02	2019-08-12 18:12:54.096238+02
96eaac66-a3c7-4032-bef0-6efa6a649ffb	c1ce19d4-4863-4827-9739-c218bb99d109	2019-08-12 18:12:54.117545+02	2019-08-12 18:12:54.117545+02
0ac4dfff-8a10-482d-80c2-ad7f9f9678eb	92726ab1-c247-4932-9d88-00f56f11693b	2019-08-12 18:12:54.139087+02	2019-08-12 18:12:54.139087+02
845a71fd-64dd-4a5b-bf67-900a1c680495	d8dab01b-e8ea-449e-b7d4-42fffa0dc884	2019-08-12 18:12:54.162862+02	2019-08-12 18:12:54.162862+02
\.


--
-- Data for Name: game_event; Type: TABLE DATA; Schema: indieco; Owner: engleek
--

COPY indieco.game_event (game_id, event_id, tags, created_at, updated_at) FROM stdin;
def4ddd9-a51a-495d-8334-9d3fbe189854	0ba79c87-2fed-4c5c-98ce-c7dddcd76057	\N	2019-08-12 18:12:49.729594+02	2019-08-12 18:12:49.729594+02
fa6ad040-70ef-44c0-a054-289001f724d5	0ba79c87-2fed-4c5c-98ce-c7dddcd76057	\N	2019-08-12 18:12:49.752159+02	2019-08-12 18:12:49.752159+02
fb80c726-e99f-45b5-b97f-3e8901119db2	0ba79c87-2fed-4c5c-98ce-c7dddcd76057	\N	2019-08-12 18:12:49.776177+02	2019-08-12 18:12:49.776177+02
f0a8ba14-6d6a-474b-8fa2-32205dc4e6a6	0ba79c87-2fed-4c5c-98ce-c7dddcd76057	\N	2019-08-12 18:12:49.804005+02	2019-08-12 18:12:49.804005+02
7dc705e3-31c6-4bbb-8fdd-fa78e475b387	0ba79c87-2fed-4c5c-98ce-c7dddcd76057	\N	2019-08-12 18:12:49.830046+02	2019-08-12 18:12:49.830046+02
14c7dce8-23ab-43e2-a31c-3c219497e3b5	0ba79c87-2fed-4c5c-98ce-c7dddcd76057	\N	2019-08-12 18:12:49.863269+02	2019-08-12 18:12:49.863269+02
8904f13c-0b74-4eb1-87f4-b356fa1e33e3	5e05978a-38fc-4b99-99f2-24f258acef3c	\N	2019-08-12 18:12:49.883805+02	2019-08-12 18:12:49.883805+02
751e4db0-88df-42eb-a95e-ef569e797a88	5e05978a-38fc-4b99-99f2-24f258acef3c	\N	2019-08-12 18:12:49.906837+02	2019-08-12 18:12:49.906837+02
aa042b65-94e4-4612-b315-98b67baea13c	5e05978a-38fc-4b99-99f2-24f258acef3c	\N	2019-08-12 18:12:49.930428+02	2019-08-12 18:12:49.930428+02
c28dcc12-8dce-4cda-b506-e065eee4bce9	5e05978a-38fc-4b99-99f2-24f258acef3c	\N	2019-08-12 18:12:49.951889+02	2019-08-12 18:12:49.951889+02
4087bb7d-9943-4f60-8ca2-a205ba621160	5e05978a-38fc-4b99-99f2-24f258acef3c	\N	2019-08-12 18:12:49.972173+02	2019-08-12 18:12:49.972173+02
fd7901b9-9339-4153-97e1-48070c788423	5e05978a-38fc-4b99-99f2-24f258acef3c	\N	2019-08-12 18:12:49.994485+02	2019-08-12 18:12:49.994485+02
b5bbeb3e-aa46-408a-901c-e7aa698defea	5e05978a-38fc-4b99-99f2-24f258acef3c	\N	2019-08-12 18:12:50.016227+02	2019-08-12 18:12:50.016227+02
0f51298b-7052-4e15-9408-f97b81cfd99c	5e05978a-38fc-4b99-99f2-24f258acef3c	\N	2019-08-12 18:12:50.038315+02	2019-08-12 18:12:50.038315+02
13ca782c-f6c0-4c66-b9a1-b0b5679ddb7b	5e05978a-38fc-4b99-99f2-24f258acef3c	\N	2019-08-12 18:12:50.060469+02	2019-08-12 18:12:50.060469+02
9690589f-fb5d-41cb-8b01-aee978f74d87	5e05978a-38fc-4b99-99f2-24f258acef3c	\N	2019-08-12 18:12:50.088864+02	2019-08-12 18:12:50.088864+02
3adc0d82-5bbb-4c07-94d3-ae7eed55efe7	5e05978a-38fc-4b99-99f2-24f258acef3c	\N	2019-08-12 18:12:50.118306+02	2019-08-12 18:12:50.118306+02
fcb10c9d-d6da-4426-a985-23b26acd2622	5e05978a-38fc-4b99-99f2-24f258acef3c	\N	2019-08-12 18:12:50.150209+02	2019-08-12 18:12:50.150209+02
daccd7a4-5c19-4585-8126-6ab5cc7e4d45	5e05978a-38fc-4b99-99f2-24f258acef3c	\N	2019-08-12 18:12:50.181191+02	2019-08-12 18:12:50.181191+02
ac50fe11-9302-43ce-b1fc-f6212ea637ef	5e05978a-38fc-4b99-99f2-24f258acef3c	\N	2019-08-12 18:12:50.209835+02	2019-08-12 18:12:50.209835+02
2f456f1c-bdf9-4e89-b1ea-5679f645f280	5e05978a-38fc-4b99-99f2-24f258acef3c	\N	2019-08-12 18:12:50.23267+02	2019-08-12 18:12:50.23267+02
c0b40323-7766-4d5d-a53e-63fc5f19840a	5e05978a-38fc-4b99-99f2-24f258acef3c	\N	2019-08-12 18:12:50.254005+02	2019-08-12 18:12:50.254005+02
95643a24-aee5-4661-a8fd-22eab7eb8b9d	5e05978a-38fc-4b99-99f2-24f258acef3c	\N	2019-08-12 18:12:50.277152+02	2019-08-12 18:12:50.277152+02
03a1fe5c-cec5-413b-a574-a4113b11f963	5e05978a-38fc-4b99-99f2-24f258acef3c	\N	2019-08-12 18:12:50.298563+02	2019-08-12 18:12:50.298563+02
8430358c-fcd9-4309-987f-a16f66e7ba28	5e05978a-38fc-4b99-99f2-24f258acef3c	\N	2019-08-12 18:12:50.319696+02	2019-08-12 18:12:50.319696+02
ff515266-00b0-4de8-bf9c-7a9eec37b630	5e05978a-38fc-4b99-99f2-24f258acef3c	\N	2019-08-12 18:12:50.344469+02	2019-08-12 18:12:50.344469+02
c1c833e4-92ff-490b-95b6-fb2ab8f5249b	5e05978a-38fc-4b99-99f2-24f258acef3c	\N	2019-08-12 18:12:50.364605+02	2019-08-12 18:12:50.364605+02
e9ecf33d-6fbb-4b58-b782-f31fa98d35f2	5e05978a-38fc-4b99-99f2-24f258acef3c	\N	2019-08-12 18:12:50.403765+02	2019-08-12 18:12:50.403765+02
b61e49a0-6916-4351-8a93-3751b60c52d6	5e05978a-38fc-4b99-99f2-24f258acef3c	\N	2019-08-12 18:12:50.443222+02	2019-08-12 18:12:50.443222+02
623a8c36-498c-43e4-b51d-4872bac82df3	5e05978a-38fc-4b99-99f2-24f258acef3c	\N	2019-08-12 18:12:50.465153+02	2019-08-12 18:12:50.465153+02
c522c2d9-cea9-4061-9393-452f61010ced	5e05978a-38fc-4b99-99f2-24f258acef3c	\N	2019-08-12 18:12:50.482068+02	2019-08-12 18:12:50.482068+02
c75777e4-cc6e-40dd-aa21-c50b1b09c7f3	5e05978a-38fc-4b99-99f2-24f258acef3c	\N	2019-08-12 18:12:50.502847+02	2019-08-12 18:12:50.502847+02
c75777e4-cc6e-40dd-aa21-c50b1b09c7f3	f26d5751-fb7a-4ff3-b8a4-fc6b28c33a2f	\N	2019-08-12 18:12:50.505917+02	2019-08-12 18:12:50.505917+02
d74670c4-611f-4dce-8721-4c08a2f0e821	5e05978a-38fc-4b99-99f2-24f258acef3c	\N	2019-08-12 18:12:50.53301+02	2019-08-12 18:12:50.53301+02
d74670c4-611f-4dce-8721-4c08a2f0e821	f26d5751-fb7a-4ff3-b8a4-fc6b28c33a2f	\N	2019-08-12 18:12:50.537302+02	2019-08-12 18:12:50.537302+02
cb832d9d-a032-4ed4-a381-ace5d3704783	5e05978a-38fc-4b99-99f2-24f258acef3c	\N	2019-08-12 18:12:50.565575+02	2019-08-12 18:12:50.565575+02
cb832d9d-a032-4ed4-a381-ace5d3704783	f26d5751-fb7a-4ff3-b8a4-fc6b28c33a2f	\N	2019-08-12 18:12:50.569028+02	2019-08-12 18:12:50.569028+02
97266237-7225-47bc-93e1-1ef3831391d4	5e05978a-38fc-4b99-99f2-24f258acef3c	\N	2019-08-12 18:12:50.591031+02	2019-08-12 18:12:50.591031+02
97266237-7225-47bc-93e1-1ef3831391d4	f26d5751-fb7a-4ff3-b8a4-fc6b28c33a2f	\N	2019-08-12 18:12:50.594153+02	2019-08-12 18:12:50.594153+02
b0ceb9d9-8604-4466-b127-49646e2462f5	7b8ff662-804f-42d4-85c7-539fd4adcac9	\N	2019-08-12 18:12:50.616832+02	2019-08-12 18:12:50.616832+02
c6709eb4-ea0d-4e74-9089-f6ebd851cc5f	7b8ff662-804f-42d4-85c7-539fd4adcac9	\N	2019-08-12 18:12:50.640166+02	2019-08-12 18:12:50.640166+02
9949f1a0-4112-4088-b354-aad1c9af169c	7b8ff662-804f-42d4-85c7-539fd4adcac9	\N	2019-08-12 18:12:50.664374+02	2019-08-12 18:12:50.664374+02
8b30ec8b-cc1e-4966-819e-97e0c2706261	7b8ff662-804f-42d4-85c7-539fd4adcac9	\N	2019-08-12 18:12:50.700318+02	2019-08-12 18:12:50.700318+02
f2865490-6bb7-4ce0-ad46-95928b56e5d9	7b8ff662-804f-42d4-85c7-539fd4adcac9	\N	2019-08-12 18:12:50.735269+02	2019-08-12 18:12:50.735269+02
e100c834-2358-44db-93d8-b329fecb4a5f	7b8ff662-804f-42d4-85c7-539fd4adcac9	\N	2019-08-12 18:12:50.75907+02	2019-08-12 18:12:50.75907+02
09c77b3b-d090-4d76-84c1-4afb240c8115	7b8ff662-804f-42d4-85c7-539fd4adcac9	\N	2019-08-12 18:12:50.785246+02	2019-08-12 18:12:50.785246+02
9eb0b39c-c285-4549-9796-65a08630ee30	7b8ff662-804f-42d4-85c7-539fd4adcac9	\N	2019-08-12 18:12:50.810824+02	2019-08-12 18:12:50.810824+02
a1e37f77-a8ef-4e2e-b51a-4e1932e12221	7b8ff662-804f-42d4-85c7-539fd4adcac9	\N	2019-08-12 18:12:50.835355+02	2019-08-12 18:12:50.835355+02
2cdb3d50-b6c1-413a-8104-97eed62afeca	7b8ff662-804f-42d4-85c7-539fd4adcac9	\N	2019-08-12 18:12:50.854613+02	2019-08-12 18:12:50.854613+02
7a295eb9-6d4a-4be3-aa05-c32c36e5fff9	7b8ff662-804f-42d4-85c7-539fd4adcac9	\N	2019-08-12 18:12:50.878524+02	2019-08-12 18:12:50.878524+02
220615fd-9082-4a1b-aae4-85f84ca1e7bf	7b8ff662-804f-42d4-85c7-539fd4adcac9	\N	2019-08-12 18:12:50.90467+02	2019-08-12 18:12:50.90467+02
05b086c5-aa7e-4435-970b-31c0c5e5f266	7b8ff662-804f-42d4-85c7-539fd4adcac9	\N	2019-08-12 18:12:50.930471+02	2019-08-12 18:12:50.930471+02
a7102533-5d0e-404d-a551-564be6355467	7b8ff662-804f-42d4-85c7-539fd4adcac9	\N	2019-08-12 18:12:50.949503+02	2019-08-12 18:12:50.949503+02
47825fe8-fa21-452a-9b9c-b560ca97ff0a	7b8ff662-804f-42d4-85c7-539fd4adcac9	\N	2019-08-12 18:12:50.969837+02	2019-08-12 18:12:50.969837+02
b5873e64-8be5-4cb8-84bc-c711f022f57d	7b8ff662-804f-42d4-85c7-539fd4adcac9	\N	2019-08-12 18:12:50.990485+02	2019-08-12 18:12:50.990485+02
6eefab16-f495-4ed9-9ff0-cc17495be38d	7b8ff662-804f-42d4-85c7-539fd4adcac9	\N	2019-08-12 18:12:51.014309+02	2019-08-12 18:12:51.014309+02
5ab8c783-18df-4b3b-8257-70ae4402163c	7b8ff662-804f-42d4-85c7-539fd4adcac9	\N	2019-08-12 18:12:51.034757+02	2019-08-12 18:12:51.034757+02
823a68a1-8522-4ea4-a8e5-9eef4d135c2f	7b8ff662-804f-42d4-85c7-539fd4adcac9	\N	2019-08-12 18:12:51.058023+02	2019-08-12 18:12:51.058023+02
f51913c2-9d65-4bad-b637-219a04b08ac9	7b8ff662-804f-42d4-85c7-539fd4adcac9	\N	2019-08-12 18:12:51.082557+02	2019-08-12 18:12:51.082557+02
49abda9f-fa1c-45f4-96f4-76aa11d87d59	7b8ff662-804f-42d4-85c7-539fd4adcac9	\N	2019-08-12 18:12:51.102835+02	2019-08-12 18:12:51.102835+02
486e779d-2add-454d-aa8f-9a375e468b66	7b8ff662-804f-42d4-85c7-539fd4adcac9	\N	2019-08-12 18:12:51.125048+02	2019-08-12 18:12:51.125048+02
3c480a01-a19d-4325-9b14-dadfc02d1b33	7b8ff662-804f-42d4-85c7-539fd4adcac9	\N	2019-08-12 18:12:51.152381+02	2019-08-12 18:12:51.152381+02
0f8882c5-a5df-498c-8196-1655932d7ed2	7b8ff662-804f-42d4-85c7-539fd4adcac9	\N	2019-08-12 18:12:51.181786+02	2019-08-12 18:12:51.181786+02
b19109b0-e321-45ae-8a48-da6c8f0c8bf5	7b8ff662-804f-42d4-85c7-539fd4adcac9	\N	2019-08-12 18:12:51.2123+02	2019-08-12 18:12:51.2123+02
dcb3d44f-cf3f-4274-8b25-5183b2120c98	7b8ff662-804f-42d4-85c7-539fd4adcac9	\N	2019-08-12 18:12:51.235828+02	2019-08-12 18:12:51.235828+02
a0b4ab1e-5d84-4df7-994d-b682927b13bb	7b8ff662-804f-42d4-85c7-539fd4adcac9	\N	2019-08-12 18:12:51.261392+02	2019-08-12 18:12:51.261392+02
65d18410-17f8-40b8-9e70-510575e5a836	7b8ff662-804f-42d4-85c7-539fd4adcac9	\N	2019-08-12 18:12:51.282473+02	2019-08-12 18:12:51.282473+02
8851f3da-770c-4384-a9e6-f6b353dfd0af	7b8ff662-804f-42d4-85c7-539fd4adcac9	\N	2019-08-12 18:12:51.302031+02	2019-08-12 18:12:51.302031+02
4ce38f16-7f62-410a-9c46-59f4620aa493	7b8ff662-804f-42d4-85c7-539fd4adcac9	\N	2019-08-12 18:12:51.321479+02	2019-08-12 18:12:51.321479+02
33b4e410-67c5-4b95-8c93-79e2b67bcd6b	7b8ff662-804f-42d4-85c7-539fd4adcac9	\N	2019-08-12 18:12:51.342936+02	2019-08-12 18:12:51.342936+02
f70aa32e-cef0-4c23-81d0-7be0db00e623	7b8ff662-804f-42d4-85c7-539fd4adcac9	\N	2019-08-12 18:12:51.363499+02	2019-08-12 18:12:51.363499+02
428f282c-ec88-48f3-9573-7c2256f3249d	7b8ff662-804f-42d4-85c7-539fd4adcac9	\N	2019-08-12 18:12:51.382688+02	2019-08-12 18:12:51.382688+02
f74a5150-2d7b-4a5b-a9b9-7d43f8c2e12b	7b8ff662-804f-42d4-85c7-539fd4adcac9	\N	2019-08-12 18:12:51.403445+02	2019-08-12 18:12:51.403445+02
f1cc0c19-20f2-4b75-be5a-658e3b5af0ad	7b8ff662-804f-42d4-85c7-539fd4adcac9	\N	2019-08-12 18:12:51.4312+02	2019-08-12 18:12:51.4312+02
b3edf284-b01f-4e4c-9797-67c51b5b9303	7b8ff662-804f-42d4-85c7-539fd4adcac9	\N	2019-08-12 18:12:51.451637+02	2019-08-12 18:12:51.451637+02
b3edf284-b01f-4e4c-9797-67c51b5b9303	b9303fb7-c6d6-4a2e-9e11-31b0ef2d0ead	\N	2019-08-12 18:12:51.455786+02	2019-08-12 18:12:51.455786+02
a9ebd2ff-bea8-435c-bf8d-b3dace2675a3	7b8ff662-804f-42d4-85c7-539fd4adcac9	\N	2019-08-12 18:12:51.479764+02	2019-08-12 18:12:51.479764+02
a9ebd2ff-bea8-435c-bf8d-b3dace2675a3	b9303fb7-c6d6-4a2e-9e11-31b0ef2d0ead	\N	2019-08-12 18:12:51.482854+02	2019-08-12 18:12:51.482854+02
ac945fa9-8e1b-43f9-8d3f-0f37d1997890	7b8ff662-804f-42d4-85c7-539fd4adcac9	\N	2019-08-12 18:12:51.503275+02	2019-08-12 18:12:51.503275+02
ac945fa9-8e1b-43f9-8d3f-0f37d1997890	b9303fb7-c6d6-4a2e-9e11-31b0ef2d0ead	\N	2019-08-12 18:12:51.509846+02	2019-08-12 18:12:51.509846+02
cdfe0de2-0ca7-4d06-83a9-6f04eddac402	7b8ff662-804f-42d4-85c7-539fd4adcac9	\N	2019-08-12 18:12:51.536763+02	2019-08-12 18:12:51.536763+02
cdfe0de2-0ca7-4d06-83a9-6f04eddac402	b9303fb7-c6d6-4a2e-9e11-31b0ef2d0ead	\N	2019-08-12 18:12:51.542082+02	2019-08-12 18:12:51.542082+02
4b785d98-2fe5-46f6-babf-35e589fc72fe	7b8ff662-804f-42d4-85c7-539fd4adcac9	\N	2019-08-12 18:12:51.56883+02	2019-08-12 18:12:51.56883+02
4b785d98-2fe5-46f6-babf-35e589fc72fe	b9303fb7-c6d6-4a2e-9e11-31b0ef2d0ead	\N	2019-08-12 18:12:51.572143+02	2019-08-12 18:12:51.572143+02
3a3c441b-5dca-46ee-9069-124f9813e540	841c5f40-6f0b-475f-916e-664ac68a8449	\N	2019-08-12 18:12:51.593374+02	2019-08-12 18:12:51.593374+02
ff62d9b5-b851-4efa-ada2-d60b3cd49912	841c5f40-6f0b-475f-916e-664ac68a8449	\N	2019-08-12 18:12:51.614798+02	2019-08-12 18:12:51.614798+02
708c65c3-4ece-4320-9d0b-569c20a12857	841c5f40-6f0b-475f-916e-664ac68a8449	\N	2019-08-12 18:12:51.639952+02	2019-08-12 18:12:51.639952+02
da501b57-1c84-4f63-88f9-eb4aec69402a	841c5f40-6f0b-475f-916e-664ac68a8449	\N	2019-08-12 18:12:51.661554+02	2019-08-12 18:12:51.661554+02
d64b6e14-6846-4611-9b2a-add681b13a25	841c5f40-6f0b-475f-916e-664ac68a8449	\N	2019-08-12 18:12:51.692933+02	2019-08-12 18:12:51.692933+02
dcf70616-910c-454c-aa9f-c426f9c4c685	841c5f40-6f0b-475f-916e-664ac68a8449	\N	2019-08-12 18:12:51.714016+02	2019-08-12 18:12:51.714016+02
aedadba3-6772-478d-bdfd-e9aeab019494	841c5f40-6f0b-475f-916e-664ac68a8449	\N	2019-08-12 18:12:51.73352+02	2019-08-12 18:12:51.73352+02
90c906e5-30e1-40fa-95a7-d40871824fd1	841c5f40-6f0b-475f-916e-664ac68a8449	\N	2019-08-12 18:12:51.755347+02	2019-08-12 18:12:51.755347+02
6c174d28-6483-4582-924a-e224fb957c11	841c5f40-6f0b-475f-916e-664ac68a8449	\N	2019-08-12 18:12:51.775892+02	2019-08-12 18:12:51.775892+02
118b735b-7a79-4a2a-8192-ce2726f7c3ea	841c5f40-6f0b-475f-916e-664ac68a8449	\N	2019-08-12 18:12:51.799169+02	2019-08-12 18:12:51.799169+02
98d1ce32-d452-4cbc-a0cc-3ea32b60e8e1	841c5f40-6f0b-475f-916e-664ac68a8449	\N	2019-08-12 18:12:51.821201+02	2019-08-12 18:12:51.821201+02
ff354e52-9246-497a-adcd-a4584832042f	841c5f40-6f0b-475f-916e-664ac68a8449	\N	2019-08-12 18:12:51.84224+02	2019-08-12 18:12:51.84224+02
fc9750c5-7c06-4ee1-8b97-7d64f9765fe8	841c5f40-6f0b-475f-916e-664ac68a8449	\N	2019-08-12 18:12:51.86139+02	2019-08-12 18:12:51.86139+02
aafc0b64-2a44-40f9-9929-0bffd0aae50a	841c5f40-6f0b-475f-916e-664ac68a8449	\N	2019-08-12 18:12:51.88086+02	2019-08-12 18:12:51.88086+02
d094f925-b191-4b8c-a144-d0f4a477a4e3	841c5f40-6f0b-475f-916e-664ac68a8449	\N	2019-08-12 18:12:51.89894+02	2019-08-12 18:12:51.89894+02
ac5fd6b8-56e1-4e3f-a5c7-0640d75372b6	841c5f40-6f0b-475f-916e-664ac68a8449	\N	2019-08-12 18:12:51.915532+02	2019-08-12 18:12:51.915532+02
4c449c2b-859d-4a3a-a5cf-3c9aeb8b8338	841c5f40-6f0b-475f-916e-664ac68a8449	\N	2019-08-12 18:12:51.954298+02	2019-08-12 18:12:51.954298+02
634474f2-ef55-4183-8c25-76634ade6da4	841c5f40-6f0b-475f-916e-664ac68a8449	\N	2019-08-12 18:12:51.974764+02	2019-08-12 18:12:51.974764+02
34b177ce-864b-40c4-8e8e-08acd0c50c58	841c5f40-6f0b-475f-916e-664ac68a8449	\N	2019-08-12 18:12:51.998267+02	2019-08-12 18:12:51.998267+02
bfa5a23e-9bff-4772-9b14-2d3e21373d74	841c5f40-6f0b-475f-916e-664ac68a8449	\N	2019-08-12 18:12:52.019524+02	2019-08-12 18:12:52.019524+02
dc08eace-e6ba-4f1b-a68e-c4010d194653	841c5f40-6f0b-475f-916e-664ac68a8449	\N	2019-08-12 18:12:52.040076+02	2019-08-12 18:12:52.040076+02
f026106c-81fc-4739-a042-da14e166507c	841c5f40-6f0b-475f-916e-664ac68a8449	\N	2019-08-12 18:12:52.063269+02	2019-08-12 18:12:52.063269+02
7ba8e228-7192-4b4d-8811-2a1143050898	841c5f40-6f0b-475f-916e-664ac68a8449	\N	2019-08-12 18:12:52.083786+02	2019-08-12 18:12:52.083786+02
f79a8fe9-7c06-49ca-a30e-9e36ac03c10d	841c5f40-6f0b-475f-916e-664ac68a8449	\N	2019-08-12 18:12:52.105022+02	2019-08-12 18:12:52.105022+02
ff885fa0-16c4-45b7-85fa-3223684ec94c	841c5f40-6f0b-475f-916e-664ac68a8449	\N	2019-08-12 18:12:52.130132+02	2019-08-12 18:12:52.130132+02
8524a346-ec11-41c1-9975-1ce7a00abef3	841c5f40-6f0b-475f-916e-664ac68a8449	\N	2019-08-12 18:12:52.154578+02	2019-08-12 18:12:52.154578+02
a64f91b4-0944-4435-b98b-aa44dfab716b	841c5f40-6f0b-475f-916e-664ac68a8449	\N	2019-08-12 18:12:52.178085+02	2019-08-12 18:12:52.178085+02
11cb745f-8502-4adf-a3e9-4b7d159916e4	841c5f40-6f0b-475f-916e-664ac68a8449	\N	2019-08-12 18:12:52.198278+02	2019-08-12 18:12:52.198278+02
45108157-fce4-4a4e-a185-817b0e1a2f72	841c5f40-6f0b-475f-916e-664ac68a8449	\N	2019-08-12 18:12:52.226901+02	2019-08-12 18:12:52.226901+02
bc423de3-c1ae-493a-91ca-136b063a5211	841c5f40-6f0b-475f-916e-664ac68a8449	\N	2019-08-12 18:12:52.248202+02	2019-08-12 18:12:52.248202+02
dafdc604-23fb-46cc-9fe4-73a39b5719ab	841c5f40-6f0b-475f-916e-664ac68a8449	\N	2019-08-12 18:12:52.279071+02	2019-08-12 18:12:52.279071+02
e6256530-80e5-4e07-b438-8d0869671e78	841c5f40-6f0b-475f-916e-664ac68a8449	\N	2019-08-12 18:12:52.301524+02	2019-08-12 18:12:52.301524+02
968b3488-2696-4470-a7c8-6ef5e7ece907	841c5f40-6f0b-475f-916e-664ac68a8449	\N	2019-08-12 18:12:52.322567+02	2019-08-12 18:12:52.322567+02
5fe4be5c-a05e-4053-96c9-17437ddf2b5f	841c5f40-6f0b-475f-916e-664ac68a8449	\N	2019-08-12 18:12:52.340929+02	2019-08-12 18:12:52.340929+02
5fe4be5c-a05e-4053-96c9-17437ddf2b5f	ba2258f7-11ba-4019-955d-723389a61e68	\N	2019-08-12 18:12:52.343858+02	2019-08-12 18:12:52.343858+02
2558fb20-2de1-4e57-a14e-58d0e41a66d2	841c5f40-6f0b-475f-916e-664ac68a8449	\N	2019-08-12 18:12:52.366289+02	2019-08-12 18:12:52.366289+02
2558fb20-2de1-4e57-a14e-58d0e41a66d2	ba2258f7-11ba-4019-955d-723389a61e68	\N	2019-08-12 18:12:52.370055+02	2019-08-12 18:12:52.370055+02
1c307199-353e-41ea-8bb9-80c5b63e6b09	841c5f40-6f0b-475f-916e-664ac68a8449	\N	2019-08-12 18:12:52.389512+02	2019-08-12 18:12:52.389512+02
1c307199-353e-41ea-8bb9-80c5b63e6b09	ba2258f7-11ba-4019-955d-723389a61e68	\N	2019-08-12 18:12:52.392818+02	2019-08-12 18:12:52.392818+02
f77f3184-7e9f-4ed1-a555-8d7ff048cb9f	570f14c6-1213-481a-9d92-e16f1655e354	\N	2019-08-12 18:12:52.413269+02	2019-08-12 18:12:52.413269+02
1dd6bbc7-1a9a-4092-a2b6-ed5155dfeb54	570f14c6-1213-481a-9d92-e16f1655e354	\N	2019-08-12 18:12:52.435179+02	2019-08-12 18:12:52.435179+02
cb23b112-18a5-43fa-8cdb-f0fd47237afd	570f14c6-1213-481a-9d92-e16f1655e354	\N	2019-08-12 18:12:52.455775+02	2019-08-12 18:12:52.455775+02
00abee6e-53c9-4fd6-becf-a694a7f84d8f	570f14c6-1213-481a-9d92-e16f1655e354	\N	2019-08-12 18:12:52.476307+02	2019-08-12 18:12:52.476307+02
f3076280-25a1-41fd-bce0-d16c480b39d6	570f14c6-1213-481a-9d92-e16f1655e354	\N	2019-08-12 18:12:52.491907+02	2019-08-12 18:12:52.491907+02
3a80642b-b5ed-4a36-995c-fc686e248581	570f14c6-1213-481a-9d92-e16f1655e354	\N	2019-08-12 18:12:52.519392+02	2019-08-12 18:12:52.519392+02
b3039fc5-0c8a-4af2-ae4b-2a7591cb0834	570f14c6-1213-481a-9d92-e16f1655e354	\N	2019-08-12 18:12:52.545397+02	2019-08-12 18:12:52.545397+02
97555558-92fd-4eeb-b05b-c0643d4546a2	570f14c6-1213-481a-9d92-e16f1655e354	\N	2019-08-12 18:12:52.569244+02	2019-08-12 18:12:52.569244+02
dbaf1aa1-4813-4d31-bacc-e8595c5eed9c	570f14c6-1213-481a-9d92-e16f1655e354	\N	2019-08-12 18:12:52.590235+02	2019-08-12 18:12:52.590235+02
c02c6398-1b0e-4c6c-889e-7f6db1c4192e	570f14c6-1213-481a-9d92-e16f1655e354	\N	2019-08-12 18:12:52.617513+02	2019-08-12 18:12:52.617513+02
c2f3b52e-5649-4230-95be-f29176adfbfa	570f14c6-1213-481a-9d92-e16f1655e354	\N	2019-08-12 18:12:52.636319+02	2019-08-12 18:12:52.636319+02
3fcddd86-7e4b-4d7d-b12b-69ab73e7cdce	570f14c6-1213-481a-9d92-e16f1655e354	\N	2019-08-12 18:12:52.659445+02	2019-08-12 18:12:52.659445+02
9a879ee2-1e8a-4fdc-8c82-062ccd1f7ab3	570f14c6-1213-481a-9d92-e16f1655e354	\N	2019-08-12 18:12:52.6791+02	2019-08-12 18:12:52.6791+02
f37f96e3-9629-4c67-b8ca-79c309056700	570f14c6-1213-481a-9d92-e16f1655e354	\N	2019-08-12 18:12:52.69787+02	2019-08-12 18:12:52.69787+02
bb7ed69f-8e15-49c5-8aec-3fafaf872046	570f14c6-1213-481a-9d92-e16f1655e354	\N	2019-08-12 18:12:52.723878+02	2019-08-12 18:12:52.723878+02
bd2fc111-8073-48f7-94d0-36fe7c47e0c3	570f14c6-1213-481a-9d92-e16f1655e354	\N	2019-08-12 18:12:52.743563+02	2019-08-12 18:12:52.743563+02
b73ddb01-e384-44bf-aa31-d4a9b43b2494	570f14c6-1213-481a-9d92-e16f1655e354	\N	2019-08-12 18:12:52.765167+02	2019-08-12 18:12:52.765167+02
417696d5-727b-4d0d-8687-3ec1357f006d	570f14c6-1213-481a-9d92-e16f1655e354	\N	2019-08-12 18:12:52.784296+02	2019-08-12 18:12:52.784296+02
e7a8d568-1c17-4f26-a068-8ed8fa9fae9e	570f14c6-1213-481a-9d92-e16f1655e354	\N	2019-08-12 18:12:52.805051+02	2019-08-12 18:12:52.805051+02
bbde93ce-9234-4331-bc1a-4c5522a2ec1f	570f14c6-1213-481a-9d92-e16f1655e354	\N	2019-08-12 18:12:52.826977+02	2019-08-12 18:12:52.826977+02
46fd9b2d-3ac1-47c6-be96-819e416de262	570f14c6-1213-481a-9d92-e16f1655e354	\N	2019-08-12 18:12:52.848792+02	2019-08-12 18:12:52.848792+02
2842d0e9-fbf1-4902-9a54-1b81f56bf735	570f14c6-1213-481a-9d92-e16f1655e354	\N	2019-08-12 18:12:52.871096+02	2019-08-12 18:12:52.871096+02
d9dac500-2085-464e-9a44-231a68c739fe	570f14c6-1213-481a-9d92-e16f1655e354	\N	2019-08-12 18:12:52.896731+02	2019-08-12 18:12:52.896731+02
13e31675-f5b4-4ad5-873f-5a280c8e2c8f	570f14c6-1213-481a-9d92-e16f1655e354	\N	2019-08-12 18:12:52.918652+02	2019-08-12 18:12:52.918652+02
6a414442-e163-44e7-b1c1-4475af75780a	570f14c6-1213-481a-9d92-e16f1655e354	\N	2019-08-12 18:12:52.938086+02	2019-08-12 18:12:52.938086+02
a93aa0fa-6741-47ca-952c-704f06e139af	570f14c6-1213-481a-9d92-e16f1655e354	\N	2019-08-12 18:12:52.957251+02	2019-08-12 18:12:52.957251+02
5153d778-f2e3-4a0c-aa1e-818ec4fe7c9c	570f14c6-1213-481a-9d92-e16f1655e354	\N	2019-08-12 18:12:52.976028+02	2019-08-12 18:12:52.976028+02
79aa2ae5-eebc-484d-903a-1dd3d93cae09	570f14c6-1213-481a-9d92-e16f1655e354	\N	2019-08-12 18:12:52.997858+02	2019-08-12 18:12:52.997858+02
f7a9c4d2-9eb8-48c3-a482-1aa1300fa548	570f14c6-1213-481a-9d92-e16f1655e354	\N	2019-08-12 18:12:53.023408+02	2019-08-12 18:12:53.023408+02
f4be121d-f03c-450f-b1e9-786aa681153a	570f14c6-1213-481a-9d92-e16f1655e354	\N	2019-08-12 18:12:53.046526+02	2019-08-12 18:12:53.046526+02
29e4c768-b77e-4550-800d-ff667924c732	570f14c6-1213-481a-9d92-e16f1655e354	\N	2019-08-12 18:12:53.065229+02	2019-08-12 18:12:53.065229+02
d875cf0e-1743-4db4-a01d-50c7bce93b0d	570f14c6-1213-481a-9d92-e16f1655e354	\N	2019-08-12 18:12:53.083454+02	2019-08-12 18:12:53.083454+02
a7337952-d9a4-425b-8ab6-0c42981f49a1	570f14c6-1213-481a-9d92-e16f1655e354	\N	2019-08-12 18:12:53.107964+02	2019-08-12 18:12:53.107964+02
b3ffdaca-8482-4d8d-bec9-86d2a17c6d0f	570f14c6-1213-481a-9d92-e16f1655e354	\N	2019-08-12 18:12:53.131198+02	2019-08-12 18:12:53.131198+02
aa8e722e-920c-49a6-bd97-b523ff741330	570f14c6-1213-481a-9d92-e16f1655e354	\N	2019-08-12 18:12:53.153305+02	2019-08-12 18:12:53.153305+02
6bef7606-a9bb-4790-8586-68ee35e33d31	570f14c6-1213-481a-9d92-e16f1655e354	\N	2019-08-12 18:12:53.172657+02	2019-08-12 18:12:53.172657+02
175be24d-c6c6-45fe-a1f5-a26d930c04e7	570f14c6-1213-481a-9d92-e16f1655e354	\N	2019-08-12 18:12:53.193732+02	2019-08-12 18:12:53.193732+02
4e65297d-b3a4-4224-bb52-f80074a48758	570f14c6-1213-481a-9d92-e16f1655e354	\N	2019-08-12 18:12:53.211528+02	2019-08-12 18:12:53.211528+02
c6949df2-a93b-4705-9128-ef2af1f4352e	570f14c6-1213-481a-9d92-e16f1655e354	\N	2019-08-12 18:12:53.229692+02	2019-08-12 18:12:53.229692+02
61f32a05-39bb-4721-9327-ff7c468f6ac0	570f14c6-1213-481a-9d92-e16f1655e354	\N	2019-08-12 18:12:53.243111+02	2019-08-12 18:12:53.243111+02
3e5ec59a-4d1a-4586-8454-c18f19547def	570f14c6-1213-481a-9d92-e16f1655e354	\N	2019-08-12 18:12:53.261135+02	2019-08-12 18:12:53.261135+02
84ce5716-c484-4788-9c56-c3f9d2452120	570f14c6-1213-481a-9d92-e16f1655e354	\N	2019-08-12 18:12:53.279346+02	2019-08-12 18:12:53.279346+02
389e832d-0d97-4241-86aa-1b7a5c4c018f	570f14c6-1213-481a-9d92-e16f1655e354	\N	2019-08-12 18:12:53.299905+02	2019-08-12 18:12:53.299905+02
c445747d-8176-4d50-a02a-4a8d9377216f	570f14c6-1213-481a-9d92-e16f1655e354	\N	2019-08-12 18:12:53.336107+02	2019-08-12 18:12:53.336107+02
ab72581a-f2d0-455a-807a-0ec83e833f89	570f14c6-1213-481a-9d92-e16f1655e354	\N	2019-08-12 18:12:53.355024+02	2019-08-12 18:12:53.355024+02
4da19bc2-f6ff-422f-9d59-1ca04877595e	570f14c6-1213-481a-9d92-e16f1655e354	\N	2019-08-12 18:12:53.373613+02	2019-08-12 18:12:53.373613+02
ef7f5e55-34bd-4ce7-b7d0-d98de33b0d56	570f14c6-1213-481a-9d92-e16f1655e354	\N	2019-08-12 18:12:53.397122+02	2019-08-12 18:12:53.397122+02
ef7f5e55-34bd-4ce7-b7d0-d98de33b0d56	ec9e4ed5-990e-45c1-b124-0316211fd711	\N	2019-08-12 18:12:53.400562+02	2019-08-12 18:12:53.400562+02
2348243a-3f7a-491c-9dc0-518f2f201fa5	570f14c6-1213-481a-9d92-e16f1655e354	\N	2019-08-12 18:12:53.424966+02	2019-08-12 18:12:53.424966+02
2348243a-3f7a-491c-9dc0-518f2f201fa5	ec9e4ed5-990e-45c1-b124-0316211fd711	\N	2019-08-12 18:12:53.428387+02	2019-08-12 18:12:53.428387+02
4830abb9-cdf9-4b67-9cd1-901a17020da8	7f34c787-14fb-46e1-b5d4-a1e675d4008c	\N	2019-08-12 18:12:53.449301+02	2019-08-12 18:12:53.449301+02
48e0801b-0db2-4fd1-a988-6a5681b86b57	7f34c787-14fb-46e1-b5d4-a1e675d4008c	\N	2019-08-12 18:12:53.475684+02	2019-08-12 18:12:53.475684+02
7ad3d60f-7a79-42ad-944e-a7019c79fb7f	7f34c787-14fb-46e1-b5d4-a1e675d4008c	\N	2019-08-12 18:12:53.495993+02	2019-08-12 18:12:53.495993+02
7b20b5c9-cf23-4629-b072-ec2f33bcec55	7f34c787-14fb-46e1-b5d4-a1e675d4008c	\N	2019-08-12 18:12:53.52602+02	2019-08-12 18:12:53.52602+02
a2c8d89c-a883-4dae-bac8-1eb4ce5b4101	7f34c787-14fb-46e1-b5d4-a1e675d4008c	\N	2019-08-12 18:12:53.552656+02	2019-08-12 18:12:53.552656+02
bab1c9f0-0f1f-4e47-9cd7-9966e7765423	7f34c787-14fb-46e1-b5d4-a1e675d4008c	\N	2019-08-12 18:12:53.576627+02	2019-08-12 18:12:53.576627+02
f3359db6-6c01-4d02-b180-2637bbf97660	7f34c787-14fb-46e1-b5d4-a1e675d4008c	\N	2019-08-12 18:12:53.594638+02	2019-08-12 18:12:53.594638+02
3a5636a9-416a-4f50-9c80-688cdb924b52	7f34c787-14fb-46e1-b5d4-a1e675d4008c	\N	2019-08-12 18:12:53.625921+02	2019-08-12 18:12:53.625921+02
c186c9c9-10a1-4ce6-a602-e66046447850	7f34c787-14fb-46e1-b5d4-a1e675d4008c	\N	2019-08-12 18:12:53.648713+02	2019-08-12 18:12:53.648713+02
134c1fa2-7a6d-4372-9e4a-d2761f67947e	7f34c787-14fb-46e1-b5d4-a1e675d4008c	\N	2019-08-12 18:12:53.674812+02	2019-08-12 18:12:53.674812+02
e9984f28-b8ec-4c45-af66-01e163715e40	7f34c787-14fb-46e1-b5d4-a1e675d4008c	\N	2019-08-12 18:12:53.701486+02	2019-08-12 18:12:53.701486+02
ffee3baa-6cba-4ab0-bb41-ce2d4c6c6169	7f34c787-14fb-46e1-b5d4-a1e675d4008c	\N	2019-08-12 18:12:53.720899+02	2019-08-12 18:12:53.720899+02
ea0cc5c9-6cb4-403b-a331-594565256021	7f34c787-14fb-46e1-b5d4-a1e675d4008c	\N	2019-08-12 18:12:53.741023+02	2019-08-12 18:12:53.741023+02
8cb56a97-476a-4e24-acaf-17eb98c82b06	7f34c787-14fb-46e1-b5d4-a1e675d4008c	\N	2019-08-12 18:12:53.762016+02	2019-08-12 18:12:53.762016+02
3a719c34-790d-44e9-a9cf-3f660f62c551	7f34c787-14fb-46e1-b5d4-a1e675d4008c	\N	2019-08-12 18:12:53.784098+02	2019-08-12 18:12:53.784098+02
b64703c1-a048-4e19-82d2-9ad1cd8142a4	7f34c787-14fb-46e1-b5d4-a1e675d4008c	\N	2019-08-12 18:12:53.808845+02	2019-08-12 18:12:53.808845+02
8ddd6219-befb-475c-8567-bcfb86bef2db	7f34c787-14fb-46e1-b5d4-a1e675d4008c	\N	2019-08-12 18:12:53.827442+02	2019-08-12 18:12:53.827442+02
ddc478e6-7b3b-4247-b5bd-c8077029e073	7f34c787-14fb-46e1-b5d4-a1e675d4008c	\N	2019-08-12 18:12:53.845648+02	2019-08-12 18:12:53.845648+02
85511217-f7d0-4a22-81bb-c131a81b22d3	7f34c787-14fb-46e1-b5d4-a1e675d4008c	\N	2019-08-12 18:12:53.867105+02	2019-08-12 18:12:53.867105+02
95f86d77-4608-404c-91e8-6020033724ed	7f34c787-14fb-46e1-b5d4-a1e675d4008c	\N	2019-08-12 18:12:53.884926+02	2019-08-12 18:12:53.884926+02
c2da5867-e3c3-4aa5-981c-4d994cbb88fa	7f34c787-14fb-46e1-b5d4-a1e675d4008c	\N	2019-08-12 18:12:53.907165+02	2019-08-12 18:12:53.907165+02
7197b4bc-662d-485b-91d6-de0acf6ac828	7f34c787-14fb-46e1-b5d4-a1e675d4008c	\N	2019-08-12 18:12:53.927343+02	2019-08-12 18:12:53.927343+02
5cb989ac-4d27-4258-9542-dc53b17afeb4	7f34c787-14fb-46e1-b5d4-a1e675d4008c	\N	2019-08-12 18:12:53.949683+02	2019-08-12 18:12:53.949683+02
746aabb8-50de-4ebe-930b-58107b8527e0	7f34c787-14fb-46e1-b5d4-a1e675d4008c	\N	2019-08-12 18:12:53.979121+02	2019-08-12 18:12:53.979121+02
1463e4ca-6f90-4510-8459-d198a6713b44	7f34c787-14fb-46e1-b5d4-a1e675d4008c	\N	2019-08-12 18:12:54.003798+02	2019-08-12 18:12:54.003798+02
aa37fa99-d814-416f-aedf-4fe3fe074528	7f34c787-14fb-46e1-b5d4-a1e675d4008c	\N	2019-08-12 18:12:54.025119+02	2019-08-12 18:12:54.025119+02
92bd2516-7bf9-4b23-97de-ac36758f6bc3	7f34c787-14fb-46e1-b5d4-a1e675d4008c	\N	2019-08-12 18:12:54.045573+02	2019-08-12 18:12:54.045573+02
fb9d445b-3c2b-4cb6-a3b6-93663356088c	7f34c787-14fb-46e1-b5d4-a1e675d4008c	\N	2019-08-12 18:12:54.06927+02	2019-08-12 18:12:54.06927+02
94983916-4e1e-4554-a9c5-2b99ffd2a70d	7f34c787-14fb-46e1-b5d4-a1e675d4008c	\N	2019-08-12 18:12:54.089246+02	2019-08-12 18:12:54.089246+02
d2d41235-8750-4251-af21-00d5c286ae6d	7f34c787-14fb-46e1-b5d4-a1e675d4008c	\N	2019-08-12 18:12:54.107346+02	2019-08-12 18:12:54.107346+02
d2d41235-8750-4251-af21-00d5c286ae6d	bff68afc-74ec-43ee-abca-bc5b8d38dc26	\N	2019-08-12 18:12:54.111473+02	2019-08-12 18:12:54.111473+02
96eaac66-a3c7-4032-bef0-6efa6a649ffb	7f34c787-14fb-46e1-b5d4-a1e675d4008c	\N	2019-08-12 18:12:54.129047+02	2019-08-12 18:12:54.129047+02
96eaac66-a3c7-4032-bef0-6efa6a649ffb	bff68afc-74ec-43ee-abca-bc5b8d38dc26	\N	2019-08-12 18:12:54.132022+02	2019-08-12 18:12:54.132022+02
0ac4dfff-8a10-482d-80c2-ad7f9f9678eb	7f34c787-14fb-46e1-b5d4-a1e675d4008c	\N	2019-08-12 18:12:54.152188+02	2019-08-12 18:12:54.152188+02
0ac4dfff-8a10-482d-80c2-ad7f9f9678eb	bff68afc-74ec-43ee-abca-bc5b8d38dc26	\N	2019-08-12 18:12:54.155225+02	2019-08-12 18:12:54.155225+02
845a71fd-64dd-4a5b-bf67-900a1c680495	7f34c787-14fb-46e1-b5d4-a1e675d4008c	\N	2019-08-12 18:12:54.17365+02	2019-08-12 18:12:54.17365+02
845a71fd-64dd-4a5b-bf67-900a1c680495	bff68afc-74ec-43ee-abca-bc5b8d38dc26	\N	2019-08-12 18:12:54.178051+02	2019-08-12 18:12:54.178051+02
\.


--
-- Data for Name: game_image; Type: TABLE DATA; Schema: indieco; Owner: engleek
--

COPY indieco.game_image (game_id, image_id, created_at, updated_at) FROM stdin;
00abee6e-53c9-4fd6-becf-a694a7f84d8f	e1001555-74f4-442e-8aa1-46ef40972305	2019-09-02 23:34:42.389002+02	2019-09-02 23:34:42.389002+02
00abee6e-53c9-4fd6-becf-a694a7f84d8f	da64f5b7-5042-449e-a667-ddc321b013e5	2019-09-02 23:42:28.568729+02	2019-09-02 23:42:28.568729+02
00abee6e-53c9-4fd6-becf-a694a7f84d8f	68aa5cc5-056c-4777-bd27-a4131dd67603	2019-09-02 23:43:16.715796+02	2019-09-02 23:43:16.715796+02
\.


--
-- Data for Name: tag; Type: TABLE DATA; Schema: indieco; Owner: engleek
--

COPY indieco.tag (id, name, created_at, updated_at) FROM stdin;
8e6195bf-8dbc-4aa1-ba0d-439ec5070977	party game	2019-08-12 18:12:49.005255+02	2019-08-12 18:12:49.005255+02
bf4757f9-c60e-4f88-8548-c8a095d0b580	solo	2019-08-12 18:12:49.011371+02	2019-08-12 18:12:49.011371+02
d59af43f-f631-466b-ab87-81c3671c9ae3	multi	2019-08-12 18:12:49.015218+02	2019-08-12 18:12:49.015218+02
b02ee214-528a-482f-9620-022fa02bc27b	online	2019-08-12 18:12:49.019177+02	2019-08-12 18:12:49.019177+02
f4f9f859-d505-41e0-9c52-69cb3ce57452	competition	2019-08-12 18:12:49.022724+02	2019-08-12 18:12:49.022724+02
c7b8026e-9c8b-4fb5-a872-ad87429a71cf	leap motion	2019-08-12 18:12:49.026391+02	2019-08-12 18:12:49.026391+02
8081d28f-7b39-40ef-87c3-69e5b8e02b21	course	2019-08-12 18:12:49.029998+02	2019-08-12 18:12:49.029998+02
3373d819-b185-4fe1-98c0-9185d671c2c9	aventure	2019-08-12 18:12:49.034054+02	2019-08-12 18:12:49.034054+02
6f197791-8264-4876-ad29-a5a7b4865169	shoot 'em up	2019-08-12 18:12:49.038314+02	2019-08-12 18:12:49.038314+02
c15183f2-ffd0-4e89-98a9-dcae383055ce	coop	2019-08-12 18:12:49.042452+02	2019-08-12 18:12:49.042452+02
c589192e-ad18-4aa5-a1a3-c5114787bd66	tower defense	2019-08-12 18:12:49.04669+02	2019-08-12 18:12:49.04669+02
c751694c-bac0-4255-8a4b-5ec6e74c4773	strategy	2019-08-12 18:12:49.050873+02	2019-08-12 18:12:49.050873+02
b114776e-a0c8-477c-acf2-5e24bab0056d	vr	2019-08-12 18:12:49.055775+02	2019-08-12 18:12:49.055775+02
8fa57492-c6c1-46a6-a91b-dfe7c0dd2827	puzzle	2019-08-12 18:12:49.059703+02	2019-08-12 18:12:49.059703+02
ae7e479d-6bed-4c00-8683-12d08a3ec1e5	platformer	2019-08-12 18:12:49.064493+02	2019-08-12 18:12:49.064493+02
03436113-73a3-41dd-9acd-f3d4b4a8a8e7	point'n'click	2019-08-12 18:12:49.068922+02	2019-08-12 18:12:49.068922+02
177cbe18-55fe-45f1-9ea5-44ed28fcdf1e	runner	2019-08-12 18:12:49.072647+02	2019-08-12 18:12:49.072647+02
2955583e-c12b-4906-bfb4-40d48647cfe7	action	2019-08-12 18:12:49.076599+02	2019-08-12 18:12:49.076599+02
45f638bd-a8a8-4fc7-bc45-34320557bc98	gamejam	2019-08-12 18:12:49.080812+02	2019-08-12 18:12:49.080812+02
9e29ead1-5ed1-40da-930d-5fea15bbf841	brawler	2019-08-12 18:12:49.086273+02	2019-08-12 18:12:49.086273+02
13e97505-d1f7-4d5e-a3da-f4057daf8d8d	rpg	2019-08-12 18:12:49.090707+02	2019-08-12 18:12:49.090707+02
42a6f3fc-137f-4ad8-9f68-be19832804db	arcade	2019-08-12 18:12:49.095223+02	2019-08-12 18:12:49.095223+02
ec819bcf-fc67-4c47-93a4-2a0b7f41a8e0	rogue-like	2019-08-12 18:12:49.099455+02	2019-08-12 18:12:49.099455+02
d4bd5a05-3543-46e9-b1a1-322045a77a3f	rogue like	2019-08-12 18:12:49.104433+02	2019-08-12 18:12:49.104433+02
04fdb3bb-5098-4945-badb-e6e8b46c7e05	mmorpg	2019-08-12 18:12:49.109355+02	2019-08-12 18:12:49.109355+02
7e2e9e42-9812-488a-9626-cf6df8911182	beat'em all	2019-08-12 18:12:49.113396+02	2019-08-12 18:12:49.113396+02
e2f89f09-7ea8-42af-9c3b-7784d1ab5559	jeu musical	2019-08-12 18:12:49.117996+02	2019-08-12 18:12:49.117996+02
0fa98fa0-6316-4856-9efa-a0f228d571f4	mini-game	2019-08-12 18:12:49.121802+02	2019-08-12 18:12:49.121802+02
81ae0925-22c6-46d7-a806-b592de52fed7	drama	2019-08-12 18:12:49.126462+02	2019-08-12 18:12:49.126462+02
1c48504b-19a0-4a6a-aee9-8a9a9fb11dac	combat	2019-08-12 18:12:49.130477+02	2019-08-12 18:12:49.130477+02
eee4a98c-444c-44f9-9910-8eb2887c6bb5	tablette	2019-08-12 18:12:49.13448+02	2019-08-12 18:12:49.13448+02
ea087811-a1d8-4fb3-b0e3-9204cbe83983	sport	2019-08-12 18:12:49.138687+02	2019-08-12 18:12:49.138687+02
8e8565f2-834c-4d36-8386-5433eac3b219	plaftormer	2019-08-12 18:12:49.144478+02	2019-08-12 18:12:49.144478+02
2c8e224f-f7ab-46e1-882f-7c37d4cc4d0f	gestion	2019-08-12 18:12:49.148935+02	2019-08-12 18:12:49.148935+02
8aae73e8-9c1d-4fe0-9fc1-4063460e5983	tps	2019-08-12 18:12:49.153176+02	2019-08-12 18:12:49.153176+02
72fd7369-7c86-4732-a799-ba4f744c9b38	village	2019-08-12 18:12:49.157227+02	2019-08-12 18:12:49.157227+02
73d56c7c-2821-49c6-a3db-603eb91c6c33	prototypes	2019-08-12 18:12:49.161083+02	2019-08-12 18:12:49.161083+02
b904c321-b7d0-4132-9cf6-7c41990dc91c	jeu de société	2019-08-12 18:12:49.165095+02	2019-08-12 18:12:49.165095+02
5ef2a9cd-3e57-4275-8094-b7faabf7ef5d	shoot’em up	2019-08-12 18:12:49.168695+02	2019-08-12 18:12:49.168695+02
3eee41fa-13a9-4291-8973-ed3624a8bb9b	pikmin-rogue	2019-08-12 18:12:49.172316+02	2019-08-12 18:12:49.172316+02
884c1988-698d-49e2-8120-a0bff211f434	battle	2019-08-12 18:12:49.175934+02	2019-08-12 18:12:49.175934+02
64bc8a2c-ac97-44a6-a7a2-34b2c94645b4	fps	2019-08-12 18:12:49.180114+02	2019-08-12 18:12:49.180114+02
13ec226d-1ad1-40f7-9e81-7e1fe47a4552	visual novel	2019-08-12 18:12:49.184002+02	2019-08-12 18:12:49.184002+02
\.


--
-- Data for Name: game_tag; Type: TABLE DATA; Schema: indieco; Owner: engleek
--

COPY indieco.game_tag (game_id, tag_id, created_at, updated_at) FROM stdin;
def4ddd9-a51a-495d-8334-9d3fbe189854	8e6195bf-8dbc-4aa1-ba0d-439ec5070977	2019-08-12 18:12:49.710658+02	2019-08-12 18:12:49.710658+02
def4ddd9-a51a-495d-8334-9d3fbe189854	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:49.714926+02	2019-08-12 18:12:49.714926+02
def4ddd9-a51a-495d-8334-9d3fbe189854	d59af43f-f631-466b-ab87-81c3671c9ae3	2019-08-12 18:12:49.718313+02	2019-08-12 18:12:49.718313+02
def4ddd9-a51a-495d-8334-9d3fbe189854	b02ee214-528a-482f-9620-022fa02bc27b	2019-08-12 18:12:49.721987+02	2019-08-12 18:12:49.721987+02
def4ddd9-a51a-495d-8334-9d3fbe189854	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:49.725635+02	2019-08-12 18:12:49.725635+02
fa6ad040-70ef-44c0-a054-289001f724d5	c7b8026e-9c8b-4fb5-a872-ad87429a71cf	2019-08-12 18:12:49.740949+02	2019-08-12 18:12:49.740949+02
fa6ad040-70ef-44c0-a054-289001f724d5	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:49.744629+02	2019-08-12 18:12:49.744629+02
fa6ad040-70ef-44c0-a054-289001f724d5	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:49.748292+02	2019-08-12 18:12:49.748292+02
fb80c726-e99f-45b5-b97f-3e8901119db2	8081d28f-7b39-40ef-87c3-69e5b8e02b21	2019-08-12 18:12:49.763881+02	2019-08-12 18:12:49.763881+02
fb80c726-e99f-45b5-b97f-3e8901119db2	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:49.767418+02	2019-08-12 18:12:49.767418+02
fb80c726-e99f-45b5-b97f-3e8901119db2	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:49.770801+02	2019-08-12 18:12:49.770801+02
f0a8ba14-6d6a-474b-8fa2-32205dc4e6a6	3373d819-b185-4fe1-98c0-9185d671c2c9	2019-08-12 18:12:49.790706+02	2019-08-12 18:12:49.790706+02
f0a8ba14-6d6a-474b-8fa2-32205dc4e6a6	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:49.795068+02	2019-08-12 18:12:49.795068+02
f0a8ba14-6d6a-474b-8fa2-32205dc4e6a6	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:49.798862+02	2019-08-12 18:12:49.798862+02
7dc705e3-31c6-4bbb-8fdd-fa78e475b387	6f197791-8264-4876-ad29-a5a7b4865169	2019-08-12 18:12:49.817058+02	2019-08-12 18:12:49.817058+02
7dc705e3-31c6-4bbb-8fdd-fa78e475b387	c7b8026e-9c8b-4fb5-a872-ad87429a71cf	2019-08-12 18:12:49.820335+02	2019-08-12 18:12:49.820335+02
7dc705e3-31c6-4bbb-8fdd-fa78e475b387	c15183f2-ffd0-4e89-98a9-dcae383055ce	2019-08-12 18:12:49.823764+02	2019-08-12 18:12:49.823764+02
7dc705e3-31c6-4bbb-8fdd-fa78e475b387	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:49.827111+02	2019-08-12 18:12:49.827111+02
14c7dce8-23ab-43e2-a31c-3c219497e3b5	c589192e-ad18-4aa5-a1a3-c5114787bd66	2019-08-12 18:12:49.842722+02	2019-08-12 18:12:49.842722+02
14c7dce8-23ab-43e2-a31c-3c219497e3b5	c751694c-bac0-4255-8a4b-5ec6e74c4773	2019-08-12 18:12:49.846428+02	2019-08-12 18:12:49.846428+02
14c7dce8-23ab-43e2-a31c-3c219497e3b5	c15183f2-ffd0-4e89-98a9-dcae383055ce	2019-08-12 18:12:49.849759+02	2019-08-12 18:12:49.849759+02
14c7dce8-23ab-43e2-a31c-3c219497e3b5	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:49.853173+02	2019-08-12 18:12:49.853173+02
14c7dce8-23ab-43e2-a31c-3c219497e3b5	d59af43f-f631-466b-ab87-81c3671c9ae3	2019-08-12 18:12:49.856062+02	2019-08-12 18:12:49.856062+02
14c7dce8-23ab-43e2-a31c-3c219497e3b5	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:49.859957+02	2019-08-12 18:12:49.859957+02
8904f13c-0b74-4eb1-87f4-b356fa1e33e3	b114776e-a0c8-477c-acf2-5e24bab0056d	2019-08-12 18:12:49.87354+02	2019-08-12 18:12:49.87354+02
8904f13c-0b74-4eb1-87f4-b356fa1e33e3	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:49.876616+02	2019-08-12 18:12:49.876616+02
8904f13c-0b74-4eb1-87f4-b356fa1e33e3	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:49.879761+02	2019-08-12 18:12:49.879761+02
751e4db0-88df-42eb-a95e-ef569e797a88	8fa57492-c6c1-46a6-a91b-dfe7c0dd2827	2019-08-12 18:12:49.895681+02	2019-08-12 18:12:49.895681+02
751e4db0-88df-42eb-a95e-ef569e797a88	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:49.899422+02	2019-08-12 18:12:49.899422+02
751e4db0-88df-42eb-a95e-ef569e797a88	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:49.90309+02	2019-08-12 18:12:49.90309+02
aa042b65-94e4-4612-b315-98b67baea13c	c589192e-ad18-4aa5-a1a3-c5114787bd66	2019-08-12 18:12:49.918631+02	2019-08-12 18:12:49.918631+02
aa042b65-94e4-4612-b315-98b67baea13c	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:49.921924+02	2019-08-12 18:12:49.921924+02
aa042b65-94e4-4612-b315-98b67baea13c	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:49.92582+02	2019-08-12 18:12:49.92582+02
c28dcc12-8dce-4cda-b506-e065eee4bce9	8fa57492-c6c1-46a6-a91b-dfe7c0dd2827	2019-08-12 18:12:49.942852+02	2019-08-12 18:12:49.942852+02
c28dcc12-8dce-4cda-b506-e065eee4bce9	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:49.946052+02	2019-08-12 18:12:49.946052+02
c28dcc12-8dce-4cda-b506-e065eee4bce9	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:49.949023+02	2019-08-12 18:12:49.949023+02
4087bb7d-9943-4f60-8ca2-a205ba621160	8081d28f-7b39-40ef-87c3-69e5b8e02b21	2019-08-12 18:12:49.962214+02	2019-08-12 18:12:49.962214+02
4087bb7d-9943-4f60-8ca2-a205ba621160	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:49.965794+02	2019-08-12 18:12:49.965794+02
4087bb7d-9943-4f60-8ca2-a205ba621160	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:49.96927+02	2019-08-12 18:12:49.96927+02
fd7901b9-9339-4153-97e1-48070c788423	ae7e479d-6bed-4c00-8683-12d08a3ec1e5	2019-08-12 18:12:49.983182+02	2019-08-12 18:12:49.983182+02
fd7901b9-9339-4153-97e1-48070c788423	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:49.986786+02	2019-08-12 18:12:49.986786+02
fd7901b9-9339-4153-97e1-48070c788423	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:49.990573+02	2019-08-12 18:12:49.990573+02
b5bbeb3e-aa46-408a-901c-e7aa698defea	6f197791-8264-4876-ad29-a5a7b4865169	2019-08-12 18:12:50.006072+02	2019-08-12 18:12:50.006072+02
b5bbeb3e-aa46-408a-901c-e7aa698defea	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:50.009882+02	2019-08-12 18:12:50.009882+02
b5bbeb3e-aa46-408a-901c-e7aa698defea	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:50.01327+02	2019-08-12 18:12:50.01327+02
0f51298b-7052-4e15-9408-f97b81cfd99c	c751694c-bac0-4255-8a4b-5ec6e74c4773	2019-08-12 18:12:50.027387+02	2019-08-12 18:12:50.027387+02
0f51298b-7052-4e15-9408-f97b81cfd99c	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:50.030747+02	2019-08-12 18:12:50.030747+02
0f51298b-7052-4e15-9408-f97b81cfd99c	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:50.03472+02	2019-08-12 18:12:50.03472+02
13ca782c-f6c0-4c66-b9a1-b0b5679ddb7b	3373d819-b185-4fe1-98c0-9185d671c2c9	2019-08-12 18:12:50.049876+02	2019-08-12 18:12:50.049876+02
13ca782c-f6c0-4c66-b9a1-b0b5679ddb7b	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:50.053501+02	2019-08-12 18:12:50.053501+02
13ca782c-f6c0-4c66-b9a1-b0b5679ddb7b	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:50.057011+02	2019-08-12 18:12:50.057011+02
9690589f-fb5d-41cb-8b01-aee978f74d87	03436113-73a3-41dd-9acd-f3d4b4a8a8e7	2019-08-12 18:12:50.074301+02	2019-08-12 18:12:50.074301+02
9690589f-fb5d-41cb-8b01-aee978f74d87	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:50.079944+02	2019-08-12 18:12:50.079944+02
9690589f-fb5d-41cb-8b01-aee978f74d87	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:50.084712+02	2019-08-12 18:12:50.084712+02
3adc0d82-5bbb-4c07-94d3-ae7eed55efe7	3373d819-b185-4fe1-98c0-9185d671c2c9	2019-08-12 18:12:50.106438+02	2019-08-12 18:12:50.106438+02
3adc0d82-5bbb-4c07-94d3-ae7eed55efe7	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:50.11094+02	2019-08-12 18:12:50.11094+02
3adc0d82-5bbb-4c07-94d3-ae7eed55efe7	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:50.114261+02	2019-08-12 18:12:50.114261+02
fcb10c9d-d6da-4426-a985-23b26acd2622	177cbe18-55fe-45f1-9ea5-44ed28fcdf1e	2019-08-12 18:12:50.136846+02	2019-08-12 18:12:50.136846+02
fcb10c9d-d6da-4426-a985-23b26acd2622	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:50.14234+02	2019-08-12 18:12:50.14234+02
fcb10c9d-d6da-4426-a985-23b26acd2622	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:50.146299+02	2019-08-12 18:12:50.146299+02
daccd7a4-5c19-4585-8126-6ab5cc7e4d45	2955583e-c12b-4906-bfb4-40d48647cfe7	2019-08-12 18:12:50.165973+02	2019-08-12 18:12:50.165973+02
daccd7a4-5c19-4585-8126-6ab5cc7e4d45	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:50.171401+02	2019-08-12 18:12:50.171401+02
daccd7a4-5c19-4585-8126-6ab5cc7e4d45	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:50.175946+02	2019-08-12 18:12:50.175946+02
ac50fe11-9302-43ce-b1fc-f6212ea637ef	3373d819-b185-4fe1-98c0-9185d671c2c9	2019-08-12 18:12:50.197023+02	2019-08-12 18:12:50.197023+02
ac50fe11-9302-43ce-b1fc-f6212ea637ef	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:50.201604+02	2019-08-12 18:12:50.201604+02
ac50fe11-9302-43ce-b1fc-f6212ea637ef	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:50.205006+02	2019-08-12 18:12:50.205006+02
2f456f1c-bdf9-4e89-b1ea-5679f645f280	8e6195bf-8dbc-4aa1-ba0d-439ec5070977	2019-08-12 18:12:50.222172+02	2019-08-12 18:12:50.222172+02
2f456f1c-bdf9-4e89-b1ea-5679f645f280	d59af43f-f631-466b-ab87-81c3671c9ae3	2019-08-12 18:12:50.225816+02	2019-08-12 18:12:50.225816+02
2f456f1c-bdf9-4e89-b1ea-5679f645f280	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:50.229278+02	2019-08-12 18:12:50.229278+02
c0b40323-7766-4d5d-a53e-63fc5f19840a	3373d819-b185-4fe1-98c0-9185d671c2c9	2019-08-12 18:12:50.244114+02	2019-08-12 18:12:50.244114+02
c0b40323-7766-4d5d-a53e-63fc5f19840a	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:50.247743+02	2019-08-12 18:12:50.247743+02
c0b40323-7766-4d5d-a53e-63fc5f19840a	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:50.250763+02	2019-08-12 18:12:50.250763+02
95643a24-aee5-4661-a8fd-22eab7eb8b9d	ae7e479d-6bed-4c00-8683-12d08a3ec1e5	2019-08-12 18:12:50.266141+02	2019-08-12 18:12:50.266141+02
95643a24-aee5-4661-a8fd-22eab7eb8b9d	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:50.270373+02	2019-08-12 18:12:50.270373+02
95643a24-aee5-4661-a8fd-22eab7eb8b9d	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:50.273756+02	2019-08-12 18:12:50.273756+02
03a1fe5c-cec5-413b-a574-a4113b11f963	03436113-73a3-41dd-9acd-f3d4b4a8a8e7	2019-08-12 18:12:50.287745+02	2019-08-12 18:12:50.287745+02
03a1fe5c-cec5-413b-a574-a4113b11f963	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:50.29119+02	2019-08-12 18:12:50.29119+02
03a1fe5c-cec5-413b-a574-a4113b11f963	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:50.295379+02	2019-08-12 18:12:50.295379+02
8430358c-fcd9-4309-987f-a16f66e7ba28	6f197791-8264-4876-ad29-a5a7b4865169	2019-08-12 18:12:50.309381+02	2019-08-12 18:12:50.309381+02
8430358c-fcd9-4309-987f-a16f66e7ba28	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:50.312612+02	2019-08-12 18:12:50.312612+02
8430358c-fcd9-4309-987f-a16f66e7ba28	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:50.316231+02	2019-08-12 18:12:50.316231+02
ff515266-00b0-4de8-bf9c-7a9eec37b630	b114776e-a0c8-477c-acf2-5e24bab0056d	2019-08-12 18:12:50.330636+02	2019-08-12 18:12:50.330636+02
ff515266-00b0-4de8-bf9c-7a9eec37b630	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:50.334414+02	2019-08-12 18:12:50.334414+02
ff515266-00b0-4de8-bf9c-7a9eec37b630	d59af43f-f631-466b-ab87-81c3671c9ae3	2019-08-12 18:12:50.337516+02	2019-08-12 18:12:50.337516+02
ff515266-00b0-4de8-bf9c-7a9eec37b630	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:50.340993+02	2019-08-12 18:12:50.340993+02
c1c833e4-92ff-490b-95b6-fb2ab8f5249b	ae7e479d-6bed-4c00-8683-12d08a3ec1e5	2019-08-12 18:12:50.354573+02	2019-08-12 18:12:50.354573+02
c1c833e4-92ff-490b-95b6-fb2ab8f5249b	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:50.357974+02	2019-08-12 18:12:50.357974+02
c1c833e4-92ff-490b-95b6-fb2ab8f5249b	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:50.360954+02	2019-08-12 18:12:50.360954+02
e9ecf33d-6fbb-4b58-b782-f31fa98d35f2	c751694c-bac0-4255-8a4b-5ec6e74c4773	2019-08-12 18:12:50.377317+02	2019-08-12 18:12:50.377317+02
e9ecf33d-6fbb-4b58-b782-f31fa98d35f2	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:50.380905+02	2019-08-12 18:12:50.380905+02
e9ecf33d-6fbb-4b58-b782-f31fa98d35f2	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:50.385157+02	2019-08-12 18:12:50.385157+02
b61e49a0-6916-4351-8a93-3751b60c52d6	c751694c-bac0-4255-8a4b-5ec6e74c4773	2019-08-12 18:12:50.421042+02	2019-08-12 18:12:50.421042+02
b61e49a0-6916-4351-8a93-3751b60c52d6	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:50.426094+02	2019-08-12 18:12:50.426094+02
b61e49a0-6916-4351-8a93-3751b60c52d6	d59af43f-f631-466b-ab87-81c3671c9ae3	2019-08-12 18:12:50.430201+02	2019-08-12 18:12:50.430201+02
b61e49a0-6916-4351-8a93-3751b60c52d6	b02ee214-528a-482f-9620-022fa02bc27b	2019-08-12 18:12:50.434833+02	2019-08-12 18:12:50.434833+02
b61e49a0-6916-4351-8a93-3751b60c52d6	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:50.439116+02	2019-08-12 18:12:50.439116+02
623a8c36-498c-43e4-b51d-4872bac82df3	8e6195bf-8dbc-4aa1-ba0d-439ec5070977	2019-08-12 18:12:50.453971+02	2019-08-12 18:12:50.453971+02
623a8c36-498c-43e4-b51d-4872bac82df3	d59af43f-f631-466b-ab87-81c3671c9ae3	2019-08-12 18:12:50.457746+02	2019-08-12 18:12:50.457746+02
623a8c36-498c-43e4-b51d-4872bac82df3	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:50.461833+02	2019-08-12 18:12:50.461833+02
c522c2d9-cea9-4061-9393-452f61010ced	d59af43f-f631-466b-ab87-81c3671c9ae3	2019-08-12 18:12:50.475951+02	2019-08-12 18:12:50.475951+02
c522c2d9-cea9-4061-9393-452f61010ced	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:50.479304+02	2019-08-12 18:12:50.479304+02
c75777e4-cc6e-40dd-aa21-c50b1b09c7f3	8fa57492-c6c1-46a6-a91b-dfe7c0dd2827	2019-08-12 18:12:50.492412+02	2019-08-12 18:12:50.492412+02
c75777e4-cc6e-40dd-aa21-c50b1b09c7f3	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:50.496019+02	2019-08-12 18:12:50.496019+02
c75777e4-cc6e-40dd-aa21-c50b1b09c7f3	45f638bd-a8a8-4fc7-bc45-34320557bc98	2019-08-12 18:12:50.4995+02	2019-08-12 18:12:50.4995+02
d74670c4-611f-4dce-8721-4c08a2f0e821	6f197791-8264-4876-ad29-a5a7b4865169	2019-08-12 18:12:50.517621+02	2019-08-12 18:12:50.517621+02
d74670c4-611f-4dce-8721-4c08a2f0e821	c15183f2-ffd0-4e89-98a9-dcae383055ce	2019-08-12 18:12:50.521263+02	2019-08-12 18:12:50.521263+02
d74670c4-611f-4dce-8721-4c08a2f0e821	d59af43f-f631-466b-ab87-81c3671c9ae3	2019-08-12 18:12:50.525253+02	2019-08-12 18:12:50.525253+02
d74670c4-611f-4dce-8721-4c08a2f0e821	45f638bd-a8a8-4fc7-bc45-34320557bc98	2019-08-12 18:12:50.528831+02	2019-08-12 18:12:50.528831+02
cb832d9d-a032-4ed4-a381-ace5d3704783	b114776e-a0c8-477c-acf2-5e24bab0056d	2019-08-12 18:12:50.550208+02	2019-08-12 18:12:50.550208+02
cb832d9d-a032-4ed4-a381-ace5d3704783	8fa57492-c6c1-46a6-a91b-dfe7c0dd2827	2019-08-12 18:12:50.553874+02	2019-08-12 18:12:50.553874+02
cb832d9d-a032-4ed4-a381-ace5d3704783	c15183f2-ffd0-4e89-98a9-dcae383055ce	2019-08-12 18:12:50.55741+02	2019-08-12 18:12:50.55741+02
cb832d9d-a032-4ed4-a381-ace5d3704783	45f638bd-a8a8-4fc7-bc45-34320557bc98	2019-08-12 18:12:50.561852+02	2019-08-12 18:12:50.561852+02
97266237-7225-47bc-93e1-1ef3831391d4	9e29ead1-5ed1-40da-930d-5fea15bbf841	2019-08-12 18:12:50.580488+02	2019-08-12 18:12:50.580488+02
97266237-7225-47bc-93e1-1ef3831391d4	d59af43f-f631-466b-ab87-81c3671c9ae3	2019-08-12 18:12:50.583729+02	2019-08-12 18:12:50.583729+02
97266237-7225-47bc-93e1-1ef3831391d4	45f638bd-a8a8-4fc7-bc45-34320557bc98	2019-08-12 18:12:50.587363+02	2019-08-12 18:12:50.587363+02
b0ceb9d9-8604-4466-b127-49646e2462f5	8e6195bf-8dbc-4aa1-ba0d-439ec5070977	2019-08-12 18:12:50.604837+02	2019-08-12 18:12:50.604837+02
b0ceb9d9-8604-4466-b127-49646e2462f5	d59af43f-f631-466b-ab87-81c3671c9ae3	2019-08-12 18:12:50.609339+02	2019-08-12 18:12:50.609339+02
b0ceb9d9-8604-4466-b127-49646e2462f5	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:50.613257+02	2019-08-12 18:12:50.613257+02
c6709eb4-ea0d-4e74-9089-f6ebd851cc5f	177cbe18-55fe-45f1-9ea5-44ed28fcdf1e	2019-08-12 18:12:50.62891+02	2019-08-12 18:12:50.62891+02
c6709eb4-ea0d-4e74-9089-f6ebd851cc5f	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:50.633119+02	2019-08-12 18:12:50.633119+02
c6709eb4-ea0d-4e74-9089-f6ebd851cc5f	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:50.636657+02	2019-08-12 18:12:50.636657+02
9949f1a0-4112-4088-b354-aad1c9af169c	b114776e-a0c8-477c-acf2-5e24bab0056d	2019-08-12 18:12:50.651288+02	2019-08-12 18:12:50.651288+02
9949f1a0-4112-4088-b354-aad1c9af169c	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:50.655689+02	2019-08-12 18:12:50.655689+02
9949f1a0-4112-4088-b354-aad1c9af169c	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:50.660618+02	2019-08-12 18:12:50.660618+02
8b30ec8b-cc1e-4966-819e-97e0c2706261	ae7e479d-6bed-4c00-8683-12d08a3ec1e5	2019-08-12 18:12:50.675344+02	2019-08-12 18:12:50.675344+02
8b30ec8b-cc1e-4966-819e-97e0c2706261	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:50.682668+02	2019-08-12 18:12:50.682668+02
8b30ec8b-cc1e-4966-819e-97e0c2706261	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:50.691197+02	2019-08-12 18:12:50.691197+02
f2865490-6bb7-4ce0-ad46-95928b56e5d9	13e97505-d1f7-4d5e-a3da-f4057daf8d8d	2019-08-12 18:12:50.720688+02	2019-08-12 18:12:50.720688+02
f2865490-6bb7-4ce0-ad46-95928b56e5d9	d59af43f-f631-466b-ab87-81c3671c9ae3	2019-08-12 18:12:50.725388+02	2019-08-12 18:12:50.725388+02
f2865490-6bb7-4ce0-ad46-95928b56e5d9	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:50.729583+02	2019-08-12 18:12:50.729583+02
e100c834-2358-44db-93d8-b329fecb4a5f	42a6f3fc-137f-4ad8-9f68-be19832804db	2019-08-12 18:12:50.748228+02	2019-08-12 18:12:50.748228+02
e100c834-2358-44db-93d8-b329fecb4a5f	d59af43f-f631-466b-ab87-81c3671c9ae3	2019-08-12 18:12:50.752231+02	2019-08-12 18:12:50.752231+02
e100c834-2358-44db-93d8-b329fecb4a5f	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:50.755805+02	2019-08-12 18:12:50.755805+02
09c77b3b-d090-4d76-84c1-4afb240c8115	c751694c-bac0-4255-8a4b-5ec6e74c4773	2019-08-12 18:12:50.769123+02	2019-08-12 18:12:50.769123+02
09c77b3b-d090-4d76-84c1-4afb240c8115	ec819bcf-fc67-4c47-93a4-2a0b7f41a8e0	2019-08-12 18:12:50.774411+02	2019-08-12 18:12:50.774411+02
09c77b3b-d090-4d76-84c1-4afb240c8115	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:50.778183+02	2019-08-12 18:12:50.778183+02
09c77b3b-d090-4d76-84c1-4afb240c8115	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:50.781719+02	2019-08-12 18:12:50.781719+02
9eb0b39c-c285-4549-9796-65a08630ee30	9e29ead1-5ed1-40da-930d-5fea15bbf841	2019-08-12 18:12:50.800225+02	2019-08-12 18:12:50.800225+02
9eb0b39c-c285-4549-9796-65a08630ee30	d59af43f-f631-466b-ab87-81c3671c9ae3	2019-08-12 18:12:50.803377+02	2019-08-12 18:12:50.803377+02
9eb0b39c-c285-4549-9796-65a08630ee30	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:50.807066+02	2019-08-12 18:12:50.807066+02
a1e37f77-a8ef-4e2e-b51a-4e1932e12221	6f197791-8264-4876-ad29-a5a7b4865169	2019-08-12 18:12:50.823506+02	2019-08-12 18:12:50.823506+02
a1e37f77-a8ef-4e2e-b51a-4e1932e12221	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:50.827627+02	2019-08-12 18:12:50.827627+02
a1e37f77-a8ef-4e2e-b51a-4e1932e12221	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:50.831104+02	2019-08-12 18:12:50.831104+02
2cdb3d50-b6c1-413a-8104-97eed62afeca	03436113-73a3-41dd-9acd-f3d4b4a8a8e7	2019-08-12 18:12:50.846247+02	2019-08-12 18:12:50.846247+02
2cdb3d50-b6c1-413a-8104-97eed62afeca	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:50.84921+02	2019-08-12 18:12:50.84921+02
2cdb3d50-b6c1-413a-8104-97eed62afeca	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:50.851907+02	2019-08-12 18:12:50.851907+02
7a295eb9-6d4a-4be3-aa05-c32c36e5fff9	8e6195bf-8dbc-4aa1-ba0d-439ec5070977	2019-08-12 18:12:50.864355+02	2019-08-12 18:12:50.864355+02
7a295eb9-6d4a-4be3-aa05-c32c36e5fff9	d59af43f-f631-466b-ab87-81c3671c9ae3	2019-08-12 18:12:50.868541+02	2019-08-12 18:12:50.868541+02
7a295eb9-6d4a-4be3-aa05-c32c36e5fff9	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:50.873035+02	2019-08-12 18:12:50.873035+02
220615fd-9082-4a1b-aae4-85f84ca1e7bf	3373d819-b185-4fe1-98c0-9185d671c2c9	2019-08-12 18:12:50.890984+02	2019-08-12 18:12:50.890984+02
220615fd-9082-4a1b-aae4-85f84ca1e7bf	8fa57492-c6c1-46a6-a91b-dfe7c0dd2827	2019-08-12 18:12:50.894943+02	2019-08-12 18:12:50.894943+02
220615fd-9082-4a1b-aae4-85f84ca1e7bf	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:50.898706+02	2019-08-12 18:12:50.898706+02
220615fd-9082-4a1b-aae4-85f84ca1e7bf	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:50.901699+02	2019-08-12 18:12:50.901699+02
05b086c5-aa7e-4435-970b-31c0c5e5f266	8e6195bf-8dbc-4aa1-ba0d-439ec5070977	2019-08-12 18:12:50.915652+02	2019-08-12 18:12:50.915652+02
05b086c5-aa7e-4435-970b-31c0c5e5f266	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:50.919523+02	2019-08-12 18:12:50.919523+02
05b086c5-aa7e-4435-970b-31c0c5e5f266	d59af43f-f631-466b-ab87-81c3671c9ae3	2019-08-12 18:12:50.922879+02	2019-08-12 18:12:50.922879+02
05b086c5-aa7e-4435-970b-31c0c5e5f266	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:50.926947+02	2019-08-12 18:12:50.926947+02
a7102533-5d0e-404d-a551-564be6355467	2955583e-c12b-4906-bfb4-40d48647cfe7	2019-08-12 18:12:50.940312+02	2019-08-12 18:12:50.940312+02
a7102533-5d0e-404d-a551-564be6355467	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:50.943601+02	2019-08-12 18:12:50.943601+02
a7102533-5d0e-404d-a551-564be6355467	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:50.946803+02	2019-08-12 18:12:50.946803+02
47825fe8-fa21-452a-9b9c-b560ca97ff0a	3373d819-b185-4fe1-98c0-9185d671c2c9	2019-08-12 18:12:50.959424+02	2019-08-12 18:12:50.959424+02
47825fe8-fa21-452a-9b9c-b560ca97ff0a	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:50.962635+02	2019-08-12 18:12:50.962635+02
47825fe8-fa21-452a-9b9c-b560ca97ff0a	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:50.966249+02	2019-08-12 18:12:50.966249+02
b5873e64-8be5-4cb8-84bc-c711f022f57d	6f197791-8264-4876-ad29-a5a7b4865169	2019-08-12 18:12:50.980986+02	2019-08-12 18:12:50.980986+02
b5873e64-8be5-4cb8-84bc-c711f022f57d	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:50.984202+02	2019-08-12 18:12:50.984202+02
b5873e64-8be5-4cb8-84bc-c711f022f57d	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:50.98713+02	2019-08-12 18:12:50.98713+02
6eefab16-f495-4ed9-9ff0-cc17495be38d	9e29ead1-5ed1-40da-930d-5fea15bbf841	2019-08-12 18:12:51.001307+02	2019-08-12 18:12:51.001307+02
6eefab16-f495-4ed9-9ff0-cc17495be38d	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:51.004619+02	2019-08-12 18:12:51.004619+02
6eefab16-f495-4ed9-9ff0-cc17495be38d	d59af43f-f631-466b-ab87-81c3671c9ae3	2019-08-12 18:12:51.007731+02	2019-08-12 18:12:51.007731+02
6eefab16-f495-4ed9-9ff0-cc17495be38d	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:51.011059+02	2019-08-12 18:12:51.011059+02
5ab8c783-18df-4b3b-8257-70ae4402163c	ae7e479d-6bed-4c00-8683-12d08a3ec1e5	2019-08-12 18:12:51.025011+02	2019-08-12 18:12:51.025011+02
5ab8c783-18df-4b3b-8257-70ae4402163c	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:51.028514+02	2019-08-12 18:12:51.028514+02
5ab8c783-18df-4b3b-8257-70ae4402163c	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:51.031729+02	2019-08-12 18:12:51.031729+02
823a68a1-8522-4ea4-a8e5-9eef4d135c2f	c751694c-bac0-4255-8a4b-5ec6e74c4773	2019-08-12 18:12:51.045017+02	2019-08-12 18:12:51.045017+02
823a68a1-8522-4ea4-a8e5-9eef4d135c2f	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:51.048619+02	2019-08-12 18:12:51.048619+02
823a68a1-8522-4ea4-a8e5-9eef4d135c2f	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:51.054248+02	2019-08-12 18:12:51.054248+02
f51913c2-9d65-4bad-b637-219a04b08ac9	3373d819-b185-4fe1-98c0-9185d671c2c9	2019-08-12 18:12:51.069924+02	2019-08-12 18:12:51.069924+02
f51913c2-9d65-4bad-b637-219a04b08ac9	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:51.073624+02	2019-08-12 18:12:51.073624+02
f51913c2-9d65-4bad-b637-219a04b08ac9	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:51.079167+02	2019-08-12 18:12:51.079167+02
49abda9f-fa1c-45f4-96f4-76aa11d87d59	3373d819-b185-4fe1-98c0-9185d671c2c9	2019-08-12 18:12:51.093637+02	2019-08-12 18:12:51.093637+02
49abda9f-fa1c-45f4-96f4-76aa11d87d59	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:51.096785+02	2019-08-12 18:12:51.096785+02
49abda9f-fa1c-45f4-96f4-76aa11d87d59	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:51.099931+02	2019-08-12 18:12:51.099931+02
486e779d-2add-454d-aa8f-9a375e468b66	6f197791-8264-4876-ad29-a5a7b4865169	2019-08-12 18:12:51.11434+02	2019-08-12 18:12:51.11434+02
486e779d-2add-454d-aa8f-9a375e468b66	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:51.117754+02	2019-08-12 18:12:51.117754+02
486e779d-2add-454d-aa8f-9a375e468b66	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:51.120825+02	2019-08-12 18:12:51.120825+02
3c480a01-a19d-4325-9b14-dadfc02d1b33	d4bd5a05-3543-46e9-b1a1-322045a77a3f	2019-08-12 18:12:51.136585+02	2019-08-12 18:12:51.136585+02
3c480a01-a19d-4325-9b14-dadfc02d1b33	c15183f2-ffd0-4e89-98a9-dcae383055ce	2019-08-12 18:12:51.139638+02	2019-08-12 18:12:51.139638+02
3c480a01-a19d-4325-9b14-dadfc02d1b33	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:51.142832+02	2019-08-12 18:12:51.142832+02
3c480a01-a19d-4325-9b14-dadfc02d1b33	d59af43f-f631-466b-ab87-81c3671c9ae3	2019-08-12 18:12:51.145897+02	2019-08-12 18:12:51.145897+02
3c480a01-a19d-4325-9b14-dadfc02d1b33	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:51.148953+02	2019-08-12 18:12:51.148953+02
0f8882c5-a5df-498c-8196-1655932d7ed2	6f197791-8264-4876-ad29-a5a7b4865169	2019-08-12 18:12:51.163969+02	2019-08-12 18:12:51.163969+02
0f8882c5-a5df-498c-8196-1655932d7ed2	ec819bcf-fc67-4c47-93a4-2a0b7f41a8e0	2019-08-12 18:12:51.168201+02	2019-08-12 18:12:51.168201+02
0f8882c5-a5df-498c-8196-1655932d7ed2	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:51.171606+02	2019-08-12 18:12:51.171606+02
0f8882c5-a5df-498c-8196-1655932d7ed2	d59af43f-f631-466b-ab87-81c3671c9ae3	2019-08-12 18:12:51.175202+02	2019-08-12 18:12:51.175202+02
0f8882c5-a5df-498c-8196-1655932d7ed2	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:51.178588+02	2019-08-12 18:12:51.178588+02
b19109b0-e321-45ae-8a48-da6c8f0c8bf5	04fdb3bb-5098-4945-badb-e6e8b46c7e05	2019-08-12 18:12:51.194775+02	2019-08-12 18:12:51.194775+02
b19109b0-e321-45ae-8a48-da6c8f0c8bf5	d59af43f-f631-466b-ab87-81c3671c9ae3	2019-08-12 18:12:51.198359+02	2019-08-12 18:12:51.198359+02
b19109b0-e321-45ae-8a48-da6c8f0c8bf5	b02ee214-528a-482f-9620-022fa02bc27b	2019-08-12 18:12:51.20303+02	2019-08-12 18:12:51.20303+02
b19109b0-e321-45ae-8a48-da6c8f0c8bf5	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:51.207679+02	2019-08-12 18:12:51.207679+02
dcb3d44f-cf3f-4274-8b25-5183b2120c98	7e2e9e42-9812-488a-9626-cf6df8911182	2019-08-12 18:12:51.223401+02	2019-08-12 18:12:51.223401+02
dcb3d44f-cf3f-4274-8b25-5183b2120c98	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:51.226867+02	2019-08-12 18:12:51.226867+02
dcb3d44f-cf3f-4274-8b25-5183b2120c98	d59af43f-f631-466b-ab87-81c3671c9ae3	2019-08-12 18:12:51.230184+02	2019-08-12 18:12:51.230184+02
dcb3d44f-cf3f-4274-8b25-5183b2120c98	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:51.233133+02	2019-08-12 18:12:51.233133+02
a0b4ab1e-5d84-4df7-994d-b682927b13bb	6f197791-8264-4876-ad29-a5a7b4865169	2019-08-12 18:12:51.247676+02	2019-08-12 18:12:51.247676+02
a0b4ab1e-5d84-4df7-994d-b682927b13bb	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:51.25346+02	2019-08-12 18:12:51.25346+02
a0b4ab1e-5d84-4df7-994d-b682927b13bb	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:51.257452+02	2019-08-12 18:12:51.257452+02
65d18410-17f8-40b8-9e70-510575e5a836	ae7e479d-6bed-4c00-8683-12d08a3ec1e5	2019-08-12 18:12:51.273058+02	2019-08-12 18:12:51.273058+02
65d18410-17f8-40b8-9e70-510575e5a836	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:51.276415+02	2019-08-12 18:12:51.276415+02
65d18410-17f8-40b8-9e70-510575e5a836	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:51.279543+02	2019-08-12 18:12:51.279543+02
8851f3da-770c-4384-a9e6-f6b353dfd0af	3373d819-b185-4fe1-98c0-9185d671c2c9	2019-08-12 18:12:51.292575+02	2019-08-12 18:12:51.292575+02
8851f3da-770c-4384-a9e6-f6b353dfd0af	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:51.295542+02	2019-08-12 18:12:51.295542+02
8851f3da-770c-4384-a9e6-f6b353dfd0af	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:51.29871+02	2019-08-12 18:12:51.29871+02
4ce38f16-7f62-410a-9c46-59f4620aa493	6f197791-8264-4876-ad29-a5a7b4865169	2019-08-12 18:12:51.312757+02	2019-08-12 18:12:51.312757+02
4ce38f16-7f62-410a-9c46-59f4620aa493	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:51.315627+02	2019-08-12 18:12:51.315627+02
4ce38f16-7f62-410a-9c46-59f4620aa493	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:51.318491+02	2019-08-12 18:12:51.318491+02
33b4e410-67c5-4b95-8c93-79e2b67bcd6b	c751694c-bac0-4255-8a4b-5ec6e74c4773	2019-08-12 18:12:51.332246+02	2019-08-12 18:12:51.332246+02
33b4e410-67c5-4b95-8c93-79e2b67bcd6b	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:51.335026+02	2019-08-12 18:12:51.335026+02
33b4e410-67c5-4b95-8c93-79e2b67bcd6b	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:51.337645+02	2019-08-12 18:12:51.337645+02
f70aa32e-cef0-4c23-81d0-7be0db00e623	e2f89f09-7ea8-42af-9c3b-7784d1ab5559	2019-08-12 18:12:51.353009+02	2019-08-12 18:12:51.353009+02
f70aa32e-cef0-4c23-81d0-7be0db00e623	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:51.356321+02	2019-08-12 18:12:51.356321+02
f70aa32e-cef0-4c23-81d0-7be0db00e623	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:51.360267+02	2019-08-12 18:12:51.360267+02
428f282c-ec88-48f3-9573-7c2256f3249d	ae7e479d-6bed-4c00-8683-12d08a3ec1e5	2019-08-12 18:12:51.372013+02	2019-08-12 18:12:51.372013+02
428f282c-ec88-48f3-9573-7c2256f3249d	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:51.375594+02	2019-08-12 18:12:51.375594+02
428f282c-ec88-48f3-9573-7c2256f3249d	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:51.379041+02	2019-08-12 18:12:51.379041+02
f74a5150-2d7b-4a5b-a9b9-7d43f8c2e12b	8fa57492-c6c1-46a6-a91b-dfe7c0dd2827	2019-08-12 18:12:51.392805+02	2019-08-12 18:12:51.392805+02
f74a5150-2d7b-4a5b-a9b9-7d43f8c2e12b	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:51.396341+02	2019-08-12 18:12:51.396341+02
f74a5150-2d7b-4a5b-a9b9-7d43f8c2e12b	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:51.40014+02	2019-08-12 18:12:51.40014+02
f1cc0c19-20f2-4b75-be5a-658e3b5af0ad	c751694c-bac0-4255-8a4b-5ec6e74c4773	2019-08-12 18:12:51.415219+02	2019-08-12 18:12:51.415219+02
f1cc0c19-20f2-4b75-be5a-658e3b5af0ad	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:51.418506+02	2019-08-12 18:12:51.418506+02
f1cc0c19-20f2-4b75-be5a-658e3b5af0ad	d59af43f-f631-466b-ab87-81c3671c9ae3	2019-08-12 18:12:51.421704+02	2019-08-12 18:12:51.421704+02
f1cc0c19-20f2-4b75-be5a-658e3b5af0ad	b02ee214-528a-482f-9620-022fa02bc27b	2019-08-12 18:12:51.425081+02	2019-08-12 18:12:51.425081+02
f1cc0c19-20f2-4b75-be5a-658e3b5af0ad	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:51.427908+02	2019-08-12 18:12:51.427908+02
b3edf284-b01f-4e4c-9797-67c51b5b9303	8e6195bf-8dbc-4aa1-ba0d-439ec5070977	2019-08-12 18:12:51.441365+02	2019-08-12 18:12:51.441365+02
b3edf284-b01f-4e4c-9797-67c51b5b9303	d59af43f-f631-466b-ab87-81c3671c9ae3	2019-08-12 18:12:51.444639+02	2019-08-12 18:12:51.444639+02
b3edf284-b01f-4e4c-9797-67c51b5b9303	45f638bd-a8a8-4fc7-bc45-34320557bc98	2019-08-12 18:12:51.448148+02	2019-08-12 18:12:51.448148+02
a9ebd2ff-bea8-435c-bf8d-b3dace2675a3	8fa57492-c6c1-46a6-a91b-dfe7c0dd2827	2019-08-12 18:12:51.466946+02	2019-08-12 18:12:51.466946+02
a9ebd2ff-bea8-435c-bf8d-b3dace2675a3	ae7e479d-6bed-4c00-8683-12d08a3ec1e5	2019-08-12 18:12:51.470259+02	2019-08-12 18:12:51.470259+02
a9ebd2ff-bea8-435c-bf8d-b3dace2675a3	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:51.473282+02	2019-08-12 18:12:51.473282+02
a9ebd2ff-bea8-435c-bf8d-b3dace2675a3	45f638bd-a8a8-4fc7-bc45-34320557bc98	2019-08-12 18:12:51.476962+02	2019-08-12 18:12:51.476962+02
ac945fa9-8e1b-43f9-8d3f-0f37d1997890	0fa98fa0-6316-4856-9efa-a0f228d571f4	2019-08-12 18:12:51.493044+02	2019-08-12 18:12:51.493044+02
ac945fa9-8e1b-43f9-8d3f-0f37d1997890	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:51.496288+02	2019-08-12 18:12:51.496288+02
ac945fa9-8e1b-43f9-8d3f-0f37d1997890	45f638bd-a8a8-4fc7-bc45-34320557bc98	2019-08-12 18:12:51.499617+02	2019-08-12 18:12:51.499617+02
cdfe0de2-0ca7-4d06-83a9-6f04eddac402	81ae0925-22c6-46d7-a806-b592de52fed7	2019-08-12 18:12:51.523875+02	2019-08-12 18:12:51.523875+02
cdfe0de2-0ca7-4d06-83a9-6f04eddac402	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:51.528157+02	2019-08-12 18:12:51.528157+02
cdfe0de2-0ca7-4d06-83a9-6f04eddac402	45f638bd-a8a8-4fc7-bc45-34320557bc98	2019-08-12 18:12:51.53253+02	2019-08-12 18:12:51.53253+02
4b785d98-2fe5-46f6-babf-35e589fc72fe	177cbe18-55fe-45f1-9ea5-44ed28fcdf1e	2019-08-12 18:12:51.553754+02	2019-08-12 18:12:51.553754+02
4b785d98-2fe5-46f6-babf-35e589fc72fe	6f197791-8264-4876-ad29-a5a7b4865169	2019-08-12 18:12:51.557172+02	2019-08-12 18:12:51.557172+02
4b785d98-2fe5-46f6-babf-35e589fc72fe	d59af43f-f631-466b-ab87-81c3671c9ae3	2019-08-12 18:12:51.560694+02	2019-08-12 18:12:51.560694+02
4b785d98-2fe5-46f6-babf-35e589fc72fe	45f638bd-a8a8-4fc7-bc45-34320557bc98	2019-08-12 18:12:51.564934+02	2019-08-12 18:12:51.564934+02
3a3c441b-5dca-46ee-9069-124f9813e540	1c48504b-19a0-4a6a-aee9-8a9a9fb11dac	2019-08-12 18:12:51.581676+02	2019-08-12 18:12:51.581676+02
3a3c441b-5dca-46ee-9069-124f9813e540	d59af43f-f631-466b-ab87-81c3671c9ae3	2019-08-12 18:12:51.585212+02	2019-08-12 18:12:51.585212+02
3a3c441b-5dca-46ee-9069-124f9813e540	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:51.589505+02	2019-08-12 18:12:51.589505+02
ff62d9b5-b851-4efa-ada2-d60b3cd49912	6f197791-8264-4876-ad29-a5a7b4865169	2019-08-12 18:12:51.604052+02	2019-08-12 18:12:51.604052+02
ff62d9b5-b851-4efa-ada2-d60b3cd49912	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:51.607716+02	2019-08-12 18:12:51.607716+02
ff62d9b5-b851-4efa-ada2-d60b3cd49912	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:51.611254+02	2019-08-12 18:12:51.611254+02
708c65c3-4ece-4320-9d0b-569c20a12857	8e6195bf-8dbc-4aa1-ba0d-439ec5070977	2019-08-12 18:12:51.626483+02	2019-08-12 18:12:51.626483+02
708c65c3-4ece-4320-9d0b-569c20a12857	d59af43f-f631-466b-ab87-81c3671c9ae3	2019-08-12 18:12:51.629733+02	2019-08-12 18:12:51.629733+02
708c65c3-4ece-4320-9d0b-569c20a12857	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:51.634395+02	2019-08-12 18:12:51.634395+02
da501b57-1c84-4f63-88f9-eb4aec69402a	42a6f3fc-137f-4ad8-9f68-be19832804db	2019-08-12 18:12:51.651748+02	2019-08-12 18:12:51.651748+02
da501b57-1c84-4f63-88f9-eb4aec69402a	d59af43f-f631-466b-ab87-81c3671c9ae3	2019-08-12 18:12:51.654734+02	2019-08-12 18:12:51.654734+02
da501b57-1c84-4f63-88f9-eb4aec69402a	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:51.658184+02	2019-08-12 18:12:51.658184+02
d64b6e14-6846-4611-9b2a-add681b13a25	6f197791-8264-4876-ad29-a5a7b4865169	2019-08-12 18:12:51.67276+02	2019-08-12 18:12:51.67276+02
d64b6e14-6846-4611-9b2a-add681b13a25	c15183f2-ffd0-4e89-98a9-dcae383055ce	2019-08-12 18:12:51.676336+02	2019-08-12 18:12:51.676336+02
d64b6e14-6846-4611-9b2a-add681b13a25	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:51.679782+02	2019-08-12 18:12:51.679782+02
d64b6e14-6846-4611-9b2a-add681b13a25	d59af43f-f631-466b-ab87-81c3671c9ae3	2019-08-12 18:12:51.684577+02	2019-08-12 18:12:51.684577+02
d64b6e14-6846-4611-9b2a-add681b13a25	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:51.688796+02	2019-08-12 18:12:51.688796+02
dcf70616-910c-454c-aa9f-c426f9c4c685	ae7e479d-6bed-4c00-8683-12d08a3ec1e5	2019-08-12 18:12:51.703905+02	2019-08-12 18:12:51.703905+02
dcf70616-910c-454c-aa9f-c426f9c4c685	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:51.707178+02	2019-08-12 18:12:51.707178+02
dcf70616-910c-454c-aa9f-c426f9c4c685	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:51.710807+02	2019-08-12 18:12:51.710807+02
aedadba3-6772-478d-bdfd-e9aeab019494	42a6f3fc-137f-4ad8-9f68-be19832804db	2019-08-12 18:12:51.723247+02	2019-08-12 18:12:51.723247+02
aedadba3-6772-478d-bdfd-e9aeab019494	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:51.72692+02	2019-08-12 18:12:51.72692+02
aedadba3-6772-478d-bdfd-e9aeab019494	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:51.730039+02	2019-08-12 18:12:51.730039+02
90c906e5-30e1-40fa-95a7-d40871824fd1	ae7e479d-6bed-4c00-8683-12d08a3ec1e5	2019-08-12 18:12:51.745028+02	2019-08-12 18:12:51.745028+02
90c906e5-30e1-40fa-95a7-d40871824fd1	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:51.748746+02	2019-08-12 18:12:51.748746+02
90c906e5-30e1-40fa-95a7-d40871824fd1	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:51.751974+02	2019-08-12 18:12:51.751974+02
6c174d28-6483-4582-924a-e224fb957c11	2955583e-c12b-4906-bfb4-40d48647cfe7	2019-08-12 18:12:51.767052+02	2019-08-12 18:12:51.767052+02
6c174d28-6483-4582-924a-e224fb957c11	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:51.769976+02	2019-08-12 18:12:51.769976+02
6c174d28-6483-4582-924a-e224fb957c11	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:51.772807+02	2019-08-12 18:12:51.772807+02
118b735b-7a79-4a2a-8192-ce2726f7c3ea	ae7e479d-6bed-4c00-8683-12d08a3ec1e5	2019-08-12 18:12:51.786493+02	2019-08-12 18:12:51.786493+02
118b735b-7a79-4a2a-8192-ce2726f7c3ea	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:51.792201+02	2019-08-12 18:12:51.792201+02
118b735b-7a79-4a2a-8192-ce2726f7c3ea	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:51.795667+02	2019-08-12 18:12:51.795667+02
98d1ce32-d452-4cbc-a0cc-3ea32b60e8e1	c751694c-bac0-4255-8a4b-5ec6e74c4773	2019-08-12 18:12:51.810971+02	2019-08-12 18:12:51.810971+02
98d1ce32-d452-4cbc-a0cc-3ea32b60e8e1	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:51.814589+02	2019-08-12 18:12:51.814589+02
98d1ce32-d452-4cbc-a0cc-3ea32b60e8e1	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:51.817688+02	2019-08-12 18:12:51.817688+02
ff354e52-9246-497a-adcd-a4584832042f	13e97505-d1f7-4d5e-a3da-f4057daf8d8d	2019-08-12 18:12:51.831306+02	2019-08-12 18:12:51.831306+02
ff354e52-9246-497a-adcd-a4584832042f	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:51.834686+02	2019-08-12 18:12:51.834686+02
ff354e52-9246-497a-adcd-a4584832042f	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:51.838063+02	2019-08-12 18:12:51.838063+02
fc9750c5-7c06-4ee1-8b97-7d64f9765fe8	b114776e-a0c8-477c-acf2-5e24bab0056d	2019-08-12 18:12:51.852771+02	2019-08-12 18:12:51.852771+02
fc9750c5-7c06-4ee1-8b97-7d64f9765fe8	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:51.855566+02	2019-08-12 18:12:51.855566+02
fc9750c5-7c06-4ee1-8b97-7d64f9765fe8	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:51.858621+02	2019-08-12 18:12:51.858621+02
aafc0b64-2a44-40f9-9929-0bffd0aae50a	3373d819-b185-4fe1-98c0-9185d671c2c9	2019-08-12 18:12:51.87032+02	2019-08-12 18:12:51.87032+02
aafc0b64-2a44-40f9-9929-0bffd0aae50a	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:51.873673+02	2019-08-12 18:12:51.873673+02
aafc0b64-2a44-40f9-9929-0bffd0aae50a	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:51.877171+02	2019-08-12 18:12:51.877171+02
d094f925-b191-4b8c-a144-d0f4a477a4e3	6f197791-8264-4876-ad29-a5a7b4865169	2019-08-12 18:12:51.892612+02	2019-08-12 18:12:51.892612+02
d094f925-b191-4b8c-a144-d0f4a477a4e3	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:51.895969+02	2019-08-12 18:12:51.895969+02
ac5fd6b8-56e1-4e3f-a5c7-0640d75372b6	6f197791-8264-4876-ad29-a5a7b4865169	2019-08-12 18:12:51.907701+02	2019-08-12 18:12:51.907701+02
ac5fd6b8-56e1-4e3f-a5c7-0640d75372b6	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:51.912406+02	2019-08-12 18:12:51.912406+02
4c449c2b-859d-4a3a-a5cf-3c9aeb8b8338	8fa57492-c6c1-46a6-a91b-dfe7c0dd2827	2019-08-12 18:12:51.943702+02	2019-08-12 18:12:51.943702+02
4c449c2b-859d-4a3a-a5cf-3c9aeb8b8338	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:51.947902+02	2019-08-12 18:12:51.947902+02
4c449c2b-859d-4a3a-a5cf-3c9aeb8b8338	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:51.951397+02	2019-08-12 18:12:51.951397+02
634474f2-ef55-4183-8c25-76634ade6da4	ae7e479d-6bed-4c00-8683-12d08a3ec1e5	2019-08-12 18:12:51.963921+02	2019-08-12 18:12:51.963921+02
634474f2-ef55-4183-8c25-76634ade6da4	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:51.967828+02	2019-08-12 18:12:51.967828+02
634474f2-ef55-4183-8c25-76634ade6da4	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:51.97093+02	2019-08-12 18:12:51.97093+02
34b177ce-864b-40c4-8e8e-08acd0c50c58	ae7e479d-6bed-4c00-8683-12d08a3ec1e5	2019-08-12 18:12:51.987336+02	2019-08-12 18:12:51.987336+02
34b177ce-864b-40c4-8e8e-08acd0c50c58	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:51.990801+02	2019-08-12 18:12:51.990801+02
34b177ce-864b-40c4-8e8e-08acd0c50c58	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:51.99445+02	2019-08-12 18:12:51.99445+02
bfa5a23e-9bff-4772-9b14-2d3e21373d74	6f197791-8264-4876-ad29-a5a7b4865169	2019-08-12 18:12:52.009197+02	2019-08-12 18:12:52.009197+02
bfa5a23e-9bff-4772-9b14-2d3e21373d74	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:52.012099+02	2019-08-12 18:12:52.012099+02
bfa5a23e-9bff-4772-9b14-2d3e21373d74	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:52.016036+02	2019-08-12 18:12:52.016036+02
dc08eace-e6ba-4f1b-a68e-c4010d194653	ec819bcf-fc67-4c47-93a4-2a0b7f41a8e0	2019-08-12 18:12:52.031163+02	2019-08-12 18:12:52.031163+02
dc08eace-e6ba-4f1b-a68e-c4010d194653	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:52.034249+02	2019-08-12 18:12:52.034249+02
dc08eace-e6ba-4f1b-a68e-c4010d194653	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:52.037113+02	2019-08-12 18:12:52.037113+02
f026106c-81fc-4739-a042-da14e166507c	ae7e479d-6bed-4c00-8683-12d08a3ec1e5	2019-08-12 18:12:52.050611+02	2019-08-12 18:12:52.050611+02
f026106c-81fc-4739-a042-da14e166507c	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:52.055536+02	2019-08-12 18:12:52.055536+02
f026106c-81fc-4739-a042-da14e166507c	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:52.059611+02	2019-08-12 18:12:52.059611+02
7ba8e228-7192-4b4d-8811-2a1143050898	8fa57492-c6c1-46a6-a91b-dfe7c0dd2827	2019-08-12 18:12:52.074568+02	2019-08-12 18:12:52.074568+02
7ba8e228-7192-4b4d-8811-2a1143050898	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:52.078118+02	2019-08-12 18:12:52.078118+02
7ba8e228-7192-4b4d-8811-2a1143050898	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:52.0811+02	2019-08-12 18:12:52.0811+02
f79a8fe9-7c06-49ca-a30e-9e36ac03c10d	8e6195bf-8dbc-4aa1-ba0d-439ec5070977	2019-08-12 18:12:52.093821+02	2019-08-12 18:12:52.093821+02
f79a8fe9-7c06-49ca-a30e-9e36ac03c10d	d59af43f-f631-466b-ab87-81c3671c9ae3	2019-08-12 18:12:52.097648+02	2019-08-12 18:12:52.097648+02
f79a8fe9-7c06-49ca-a30e-9e36ac03c10d	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:52.101715+02	2019-08-12 18:12:52.101715+02
ff885fa0-16c4-45b7-85fa-3223684ec94c	b114776e-a0c8-477c-acf2-5e24bab0056d	2019-08-12 18:12:52.116049+02	2019-08-12 18:12:52.116049+02
ff885fa0-16c4-45b7-85fa-3223684ec94c	eee4a98c-444c-44f9-9910-8eb2887c6bb5	2019-08-12 18:12:52.119926+02	2019-08-12 18:12:52.119926+02
ff885fa0-16c4-45b7-85fa-3223684ec94c	d59af43f-f631-466b-ab87-81c3671c9ae3	2019-08-12 18:12:52.123485+02	2019-08-12 18:12:52.123485+02
ff885fa0-16c4-45b7-85fa-3223684ec94c	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:52.12711+02	2019-08-12 18:12:52.12711+02
8524a346-ec11-41c1-9975-1ce7a00abef3	8e6195bf-8dbc-4aa1-ba0d-439ec5070977	2019-08-12 18:12:52.142545+02	2019-08-12 18:12:52.142545+02
8524a346-ec11-41c1-9975-1ce7a00abef3	d59af43f-f631-466b-ab87-81c3671c9ae3	2019-08-12 18:12:52.145983+02	2019-08-12 18:12:52.145983+02
8524a346-ec11-41c1-9975-1ce7a00abef3	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:52.149216+02	2019-08-12 18:12:52.149216+02
a64f91b4-0944-4435-b98b-aa44dfab716b	9e29ead1-5ed1-40da-930d-5fea15bbf841	2019-08-12 18:12:52.166057+02	2019-08-12 18:12:52.166057+02
a64f91b4-0944-4435-b98b-aa44dfab716b	d59af43f-f631-466b-ab87-81c3671c9ae3	2019-08-12 18:12:52.169787+02	2019-08-12 18:12:52.169787+02
a64f91b4-0944-4435-b98b-aa44dfab716b	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:52.173592+02	2019-08-12 18:12:52.173592+02
11cb745f-8502-4adf-a3e9-4b7d159916e4	9e29ead1-5ed1-40da-930d-5fea15bbf841	2019-08-12 18:12:52.188498+02	2019-08-12 18:12:52.188498+02
11cb745f-8502-4adf-a3e9-4b7d159916e4	d59af43f-f631-466b-ab87-81c3671c9ae3	2019-08-12 18:12:52.191789+02	2019-08-12 18:12:52.191789+02
11cb745f-8502-4adf-a3e9-4b7d159916e4	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:52.195052+02	2019-08-12 18:12:52.195052+02
45108157-fce4-4a4e-a185-817b0e1a2f72	d4bd5a05-3543-46e9-b1a1-322045a77a3f	2019-08-12 18:12:52.207588+02	2019-08-12 18:12:52.207588+02
45108157-fce4-4a4e-a185-817b0e1a2f72	c15183f2-ffd0-4e89-98a9-dcae383055ce	2019-08-12 18:12:52.211096+02	2019-08-12 18:12:52.211096+02
45108157-fce4-4a4e-a185-817b0e1a2f72	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:52.214873+02	2019-08-12 18:12:52.214873+02
45108157-fce4-4a4e-a185-817b0e1a2f72	d59af43f-f631-466b-ab87-81c3671c9ae3	2019-08-12 18:12:52.218465+02	2019-08-12 18:12:52.218465+02
45108157-fce4-4a4e-a185-817b0e1a2f72	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:52.222999+02	2019-08-12 18:12:52.222999+02
bc423de3-c1ae-493a-91ca-136b063a5211	9e29ead1-5ed1-40da-930d-5fea15bbf841	2019-08-12 18:12:52.23705+02	2019-08-12 18:12:52.23705+02
bc423de3-c1ae-493a-91ca-136b063a5211	d59af43f-f631-466b-ab87-81c3671c9ae3	2019-08-12 18:12:52.239863+02	2019-08-12 18:12:52.239863+02
bc423de3-c1ae-493a-91ca-136b063a5211	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:52.245372+02	2019-08-12 18:12:52.245372+02
dafdc604-23fb-46cc-9fe4-73a39b5719ab	c751694c-bac0-4255-8a4b-5ec6e74c4773	2019-08-12 18:12:52.259624+02	2019-08-12 18:12:52.259624+02
dafdc604-23fb-46cc-9fe4-73a39b5719ab	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:52.263148+02	2019-08-12 18:12:52.263148+02
dafdc604-23fb-46cc-9fe4-73a39b5719ab	d59af43f-f631-466b-ab87-81c3671c9ae3	2019-08-12 18:12:52.267004+02	2019-08-12 18:12:52.267004+02
dafdc604-23fb-46cc-9fe4-73a39b5719ab	b02ee214-528a-482f-9620-022fa02bc27b	2019-08-12 18:12:52.272032+02	2019-08-12 18:12:52.272032+02
dafdc604-23fb-46cc-9fe4-73a39b5719ab	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:52.275726+02	2019-08-12 18:12:52.275726+02
e6256530-80e5-4e07-b438-8d0869671e78	7e2e9e42-9812-488a-9626-cf6df8911182	2019-08-12 18:12:52.289306+02	2019-08-12 18:12:52.289306+02
e6256530-80e5-4e07-b438-8d0869671e78	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:52.292471+02	2019-08-12 18:12:52.292471+02
e6256530-80e5-4e07-b438-8d0869671e78	d59af43f-f631-466b-ab87-81c3671c9ae3	2019-08-12 18:12:52.295725+02	2019-08-12 18:12:52.295725+02
e6256530-80e5-4e07-b438-8d0869671e78	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:52.298652+02	2019-08-12 18:12:52.298652+02
968b3488-2696-4470-a7c8-6ef5e7ece907	13e97505-d1f7-4d5e-a3da-f4057daf8d8d	2019-08-12 18:12:52.313256+02	2019-08-12 18:12:52.313256+02
968b3488-2696-4470-a7c8-6ef5e7ece907	d59af43f-f631-466b-ab87-81c3671c9ae3	2019-08-12 18:12:52.316471+02	2019-08-12 18:12:52.316471+02
968b3488-2696-4470-a7c8-6ef5e7ece907	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:52.319603+02	2019-08-12 18:12:52.319603+02
5fe4be5c-a05e-4053-96c9-17437ddf2b5f	81ae0925-22c6-46d7-a806-b592de52fed7	2019-08-12 18:12:52.332908+02	2019-08-12 18:12:52.332908+02
5fe4be5c-a05e-4053-96c9-17437ddf2b5f	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:52.335501+02	2019-08-12 18:12:52.335501+02
5fe4be5c-a05e-4053-96c9-17437ddf2b5f	45f638bd-a8a8-4fc7-bc45-34320557bc98	2019-08-12 18:12:52.338124+02	2019-08-12 18:12:52.338124+02
2558fb20-2de1-4e57-a14e-58d0e41a66d2	8fa57492-c6c1-46a6-a91b-dfe7c0dd2827	2019-08-12 18:12:52.355252+02	2019-08-12 18:12:52.355252+02
2558fb20-2de1-4e57-a14e-58d0e41a66d2	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:52.358992+02	2019-08-12 18:12:52.358992+02
2558fb20-2de1-4e57-a14e-58d0e41a66d2	45f638bd-a8a8-4fc7-bc45-34320557bc98	2019-08-12 18:12:52.362758+02	2019-08-12 18:12:52.362758+02
1c307199-353e-41ea-8bb9-80c5b63e6b09	8fa57492-c6c1-46a6-a91b-dfe7c0dd2827	2019-08-12 18:12:52.380357+02	2019-08-12 18:12:52.380357+02
1c307199-353e-41ea-8bb9-80c5b63e6b09	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:52.3835+02	2019-08-12 18:12:52.3835+02
1c307199-353e-41ea-8bb9-80c5b63e6b09	45f638bd-a8a8-4fc7-bc45-34320557bc98	2019-08-12 18:12:52.386521+02	2019-08-12 18:12:52.386521+02
f77f3184-7e9f-4ed1-a555-8d7ff048cb9f	ae7e479d-6bed-4c00-8683-12d08a3ec1e5	2019-08-12 18:12:52.402084+02	2019-08-12 18:12:52.402084+02
f77f3184-7e9f-4ed1-a555-8d7ff048cb9f	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:52.405852+02	2019-08-12 18:12:52.405852+02
f77f3184-7e9f-4ed1-a555-8d7ff048cb9f	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:52.409627+02	2019-08-12 18:12:52.409627+02
1dd6bbc7-1a9a-4092-a2b6-ed5155dfeb54	13e97505-d1f7-4d5e-a3da-f4057daf8d8d	2019-08-12 18:12:52.424047+02	2019-08-12 18:12:52.424047+02
1dd6bbc7-1a9a-4092-a2b6-ed5155dfeb54	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:52.428478+02	2019-08-12 18:12:52.428478+02
1dd6bbc7-1a9a-4092-a2b6-ed5155dfeb54	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:52.432109+02	2019-08-12 18:12:52.432109+02
cb23b112-18a5-43fa-8cdb-f0fd47237afd	ae7e479d-6bed-4c00-8683-12d08a3ec1e5	2019-08-12 18:12:52.445778+02	2019-08-12 18:12:52.445778+02
cb23b112-18a5-43fa-8cdb-f0fd47237afd	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:52.449036+02	2019-08-12 18:12:52.449036+02
cb23b112-18a5-43fa-8cdb-f0fd47237afd	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:52.452389+02	2019-08-12 18:12:52.452389+02
00abee6e-53c9-4fd6-becf-a694a7f84d8f	8fa57492-c6c1-46a6-a91b-dfe7c0dd2827	2019-08-12 18:12:52.466544+02	2019-08-12 18:12:52.466544+02
00abee6e-53c9-4fd6-becf-a694a7f84d8f	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:52.469742+02	2019-08-12 18:12:52.469742+02
00abee6e-53c9-4fd6-becf-a694a7f84d8f	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:52.472723+02	2019-08-12 18:12:52.472723+02
f3076280-25a1-41fd-bce0-d16c480b39d6	8081d28f-7b39-40ef-87c3-69e5b8e02b21	2019-08-12 18:12:52.486163+02	2019-08-12 18:12:52.486163+02
f3076280-25a1-41fd-bce0-d16c480b39d6	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:52.488771+02	2019-08-12 18:12:52.488771+02
3a80642b-b5ed-4a36-995c-fc686e248581	ea087811-a1d8-4fb3-b0e3-9204cbe83983	2019-08-12 18:12:52.50252+02	2019-08-12 18:12:52.50252+02
3a80642b-b5ed-4a36-995c-fc686e248581	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:52.505437+02	2019-08-12 18:12:52.505437+02
3a80642b-b5ed-4a36-995c-fc686e248581	d59af43f-f631-466b-ab87-81c3671c9ae3	2019-08-12 18:12:52.509423+02	2019-08-12 18:12:52.509423+02
3a80642b-b5ed-4a36-995c-fc686e248581	b02ee214-528a-482f-9620-022fa02bc27b	2019-08-12 18:12:52.512626+02	2019-08-12 18:12:52.512626+02
3a80642b-b5ed-4a36-995c-fc686e248581	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:52.51582+02	2019-08-12 18:12:52.51582+02
b3039fc5-0c8a-4af2-ae4b-2a7591cb0834	8e8565f2-834c-4d36-8386-5433eac3b219	2019-08-12 18:12:52.529685+02	2019-08-12 18:12:52.529685+02
b3039fc5-0c8a-4af2-ae4b-2a7591cb0834	c15183f2-ffd0-4e89-98a9-dcae383055ce	2019-08-12 18:12:52.532633+02	2019-08-12 18:12:52.532633+02
b3039fc5-0c8a-4af2-ae4b-2a7591cb0834	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:52.535805+02	2019-08-12 18:12:52.535805+02
b3039fc5-0c8a-4af2-ae4b-2a7591cb0834	d59af43f-f631-466b-ab87-81c3671c9ae3	2019-08-12 18:12:52.538998+02	2019-08-12 18:12:52.538998+02
b3039fc5-0c8a-4af2-ae4b-2a7591cb0834	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:52.54193+02	2019-08-12 18:12:52.54193+02
97555558-92fd-4eeb-b05b-c0643d4546a2	6f197791-8264-4876-ad29-a5a7b4865169	2019-08-12 18:12:52.559204+02	2019-08-12 18:12:52.559204+02
97555558-92fd-4eeb-b05b-c0643d4546a2	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:52.562955+02	2019-08-12 18:12:52.562955+02
97555558-92fd-4eeb-b05b-c0643d4546a2	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:52.566241+02	2019-08-12 18:12:52.566241+02
dbaf1aa1-4813-4d31-bacc-e8595c5eed9c	2c8e224f-f7ab-46e1-882f-7c37d4cc4d0f	2019-08-12 18:12:52.581111+02	2019-08-12 18:12:52.581111+02
dbaf1aa1-4813-4d31-bacc-e8595c5eed9c	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:52.584276+02	2019-08-12 18:12:52.584276+02
dbaf1aa1-4813-4d31-bacc-e8595c5eed9c	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:52.587114+02	2019-08-12 18:12:52.587114+02
c02c6398-1b0e-4c6c-889e-7f6db1c4192e	13e97505-d1f7-4d5e-a3da-f4057daf8d8d	2019-08-12 18:12:52.601368+02	2019-08-12 18:12:52.601368+02
c02c6398-1b0e-4c6c-889e-7f6db1c4192e	ec819bcf-fc67-4c47-93a4-2a0b7f41a8e0	2019-08-12 18:12:52.605924+02	2019-08-12 18:12:52.605924+02
c02c6398-1b0e-4c6c-889e-7f6db1c4192e	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:52.609981+02	2019-08-12 18:12:52.609981+02
c02c6398-1b0e-4c6c-889e-7f6db1c4192e	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:52.614321+02	2019-08-12 18:12:52.614321+02
c2f3b52e-5649-4230-95be-f29176adfbfa	c751694c-bac0-4255-8a4b-5ec6e74c4773	2019-08-12 18:12:52.627253+02	2019-08-12 18:12:52.627253+02
c2f3b52e-5649-4230-95be-f29176adfbfa	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:52.630129+02	2019-08-12 18:12:52.630129+02
c2f3b52e-5649-4230-95be-f29176adfbfa	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:52.633093+02	2019-08-12 18:12:52.633093+02
3fcddd86-7e4b-4d7d-b12b-69ab73e7cdce	8aae73e8-9c1d-4fe0-9fc1-4063460e5983	2019-08-12 18:12:52.649085+02	2019-08-12 18:12:52.649085+02
3fcddd86-7e4b-4d7d-b12b-69ab73e7cdce	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:52.652345+02	2019-08-12 18:12:52.652345+02
3fcddd86-7e4b-4d7d-b12b-69ab73e7cdce	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:52.655877+02	2019-08-12 18:12:52.655877+02
9a879ee2-1e8a-4fdc-8c82-062ccd1f7ab3	8e6195bf-8dbc-4aa1-ba0d-439ec5070977	2019-08-12 18:12:52.669572+02	2019-08-12 18:12:52.669572+02
9a879ee2-1e8a-4fdc-8c82-062ccd1f7ab3	d59af43f-f631-466b-ab87-81c3671c9ae3	2019-08-12 18:12:52.672561+02	2019-08-12 18:12:52.672561+02
9a879ee2-1e8a-4fdc-8c82-062ccd1f7ab3	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:52.676123+02	2019-08-12 18:12:52.676123+02
f37f96e3-9629-4c67-b8ca-79c309056700	c751694c-bac0-4255-8a4b-5ec6e74c4773	2019-08-12 18:12:52.688131+02	2019-08-12 18:12:52.688131+02
f37f96e3-9629-4c67-b8ca-79c309056700	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:52.691303+02	2019-08-12 18:12:52.691303+02
f37f96e3-9629-4c67-b8ca-79c309056700	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:52.694728+02	2019-08-12 18:12:52.694728+02
bb7ed69f-8e15-49c5-8aec-3fafaf872046	13e97505-d1f7-4d5e-a3da-f4057daf8d8d	2019-08-12 18:12:52.708322+02	2019-08-12 18:12:52.708322+02
bb7ed69f-8e15-49c5-8aec-3fafaf872046	c751694c-bac0-4255-8a4b-5ec6e74c4773	2019-08-12 18:12:52.713408+02	2019-08-12 18:12:52.713408+02
bb7ed69f-8e15-49c5-8aec-3fafaf872046	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:52.716751+02	2019-08-12 18:12:52.716751+02
bb7ed69f-8e15-49c5-8aec-3fafaf872046	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:52.720569+02	2019-08-12 18:12:52.720569+02
bd2fc111-8073-48f7-94d0-36fe7c47e0c3	ae7e479d-6bed-4c00-8683-12d08a3ec1e5	2019-08-12 18:12:52.733538+02	2019-08-12 18:12:52.733538+02
bd2fc111-8073-48f7-94d0-36fe7c47e0c3	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:52.736689+02	2019-08-12 18:12:52.736689+02
bd2fc111-8073-48f7-94d0-36fe7c47e0c3	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:52.739859+02	2019-08-12 18:12:52.739859+02
b73ddb01-e384-44bf-aa31-d4a9b43b2494	ec819bcf-fc67-4c47-93a4-2a0b7f41a8e0	2019-08-12 18:12:52.754311+02	2019-08-12 18:12:52.754311+02
b73ddb01-e384-44bf-aa31-d4a9b43b2494	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:52.757843+02	2019-08-12 18:12:52.757843+02
b73ddb01-e384-44bf-aa31-d4a9b43b2494	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:52.761431+02	2019-08-12 18:12:52.761431+02
417696d5-727b-4d0d-8687-3ec1357f006d	c751694c-bac0-4255-8a4b-5ec6e74c4773	2019-08-12 18:12:52.775379+02	2019-08-12 18:12:52.775379+02
417696d5-727b-4d0d-8687-3ec1357f006d	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:52.778322+02	2019-08-12 18:12:52.778322+02
417696d5-727b-4d0d-8687-3ec1357f006d	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:52.781056+02	2019-08-12 18:12:52.781056+02
e7a8d568-1c17-4f26-a068-8ed8fa9fae9e	8fa57492-c6c1-46a6-a91b-dfe7c0dd2827	2019-08-12 18:12:52.79611+02	2019-08-12 18:12:52.79611+02
e7a8d568-1c17-4f26-a068-8ed8fa9fae9e	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:52.799308+02	2019-08-12 18:12:52.799308+02
e7a8d568-1c17-4f26-a068-8ed8fa9fae9e	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:52.802102+02	2019-08-12 18:12:52.802102+02
bbde93ce-9234-4331-bc1a-4c5522a2ec1f	8fa57492-c6c1-46a6-a91b-dfe7c0dd2827	2019-08-12 18:12:52.817699+02	2019-08-12 18:12:52.817699+02
bbde93ce-9234-4331-bc1a-4c5522a2ec1f	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:52.820716+02	2019-08-12 18:12:52.820716+02
bbde93ce-9234-4331-bc1a-4c5522a2ec1f	72fd7369-7c86-4732-a799-ba4f744c9b38	2019-08-12 18:12:52.823498+02	2019-08-12 18:12:52.823498+02
46fd9b2d-3ac1-47c6-be96-819e416de262	c15183f2-ffd0-4e89-98a9-dcae383055ce	2019-08-12 18:12:52.838325+02	2019-08-12 18:12:52.838325+02
46fd9b2d-3ac1-47c6-be96-819e416de262	d59af43f-f631-466b-ab87-81c3671c9ae3	2019-08-12 18:12:52.841715+02	2019-08-12 18:12:52.841715+02
46fd9b2d-3ac1-47c6-be96-819e416de262	72fd7369-7c86-4732-a799-ba4f744c9b38	2019-08-12 18:12:52.845362+02	2019-08-12 18:12:52.845362+02
2842d0e9-fbf1-4902-9a54-1b81f56bf735	ae7e479d-6bed-4c00-8683-12d08a3ec1e5	2019-08-12 18:12:52.858938+02	2019-08-12 18:12:52.858938+02
2842d0e9-fbf1-4902-9a54-1b81f56bf735	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:52.863443+02	2019-08-12 18:12:52.863443+02
2842d0e9-fbf1-4902-9a54-1b81f56bf735	72fd7369-7c86-4732-a799-ba4f744c9b38	2019-08-12 18:12:52.867815+02	2019-08-12 18:12:52.867815+02
d9dac500-2085-464e-9a44-231a68c739fe	ae7e479d-6bed-4c00-8683-12d08a3ec1e5	2019-08-12 18:12:52.883945+02	2019-08-12 18:12:52.883945+02
d9dac500-2085-464e-9a44-231a68c739fe	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:52.888267+02	2019-08-12 18:12:52.888267+02
d9dac500-2085-464e-9a44-231a68c739fe	72fd7369-7c86-4732-a799-ba4f744c9b38	2019-08-12 18:12:52.893273+02	2019-08-12 18:12:52.893273+02
13e31675-f5b4-4ad5-873f-5a280c8e2c8f	42a6f3fc-137f-4ad8-9f68-be19832804db	2019-08-12 18:12:52.909178+02	2019-08-12 18:12:52.909178+02
13e31675-f5b4-4ad5-873f-5a280c8e2c8f	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:52.912512+02	2019-08-12 18:12:52.912512+02
13e31675-f5b4-4ad5-873f-5a280c8e2c8f	72fd7369-7c86-4732-a799-ba4f744c9b38	2019-08-12 18:12:52.915572+02	2019-08-12 18:12:52.915572+02
6a414442-e163-44e7-b1c1-4475af75780a	ae7e479d-6bed-4c00-8683-12d08a3ec1e5	2019-08-12 18:12:52.927758+02	2019-08-12 18:12:52.927758+02
6a414442-e163-44e7-b1c1-4475af75780a	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:52.930471+02	2019-08-12 18:12:52.930471+02
6a414442-e163-44e7-b1c1-4475af75780a	72fd7369-7c86-4732-a799-ba4f744c9b38	2019-08-12 18:12:52.934154+02	2019-08-12 18:12:52.934154+02
a93aa0fa-6741-47ca-952c-704f06e139af	ae7e479d-6bed-4c00-8683-12d08a3ec1e5	2019-08-12 18:12:52.948872+02	2019-08-12 18:12:52.948872+02
a93aa0fa-6741-47ca-952c-704f06e139af	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:52.951514+02	2019-08-12 18:12:52.951514+02
a93aa0fa-6741-47ca-952c-704f06e139af	72fd7369-7c86-4732-a799-ba4f744c9b38	2019-08-12 18:12:52.954118+02	2019-08-12 18:12:52.954118+02
5153d778-f2e3-4a0c-aa1e-818ec4fe7c9c	9e29ead1-5ed1-40da-930d-5fea15bbf841	2019-08-12 18:12:52.96735+02	2019-08-12 18:12:52.96735+02
5153d778-f2e3-4a0c-aa1e-818ec4fe7c9c	d59af43f-f631-466b-ab87-81c3671c9ae3	2019-08-12 18:12:52.969953+02	2019-08-12 18:12:52.969953+02
5153d778-f2e3-4a0c-aa1e-818ec4fe7c9c	72fd7369-7c86-4732-a799-ba4f744c9b38	2019-08-12 18:12:52.972564+02	2019-08-12 18:12:52.972564+02
79aa2ae5-eebc-484d-903a-1dd3d93cae09	177cbe18-55fe-45f1-9ea5-44ed28fcdf1e	2019-08-12 18:12:52.985399+02	2019-08-12 18:12:52.985399+02
79aa2ae5-eebc-484d-903a-1dd3d93cae09	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:52.98831+02	2019-08-12 18:12:52.98831+02
79aa2ae5-eebc-484d-903a-1dd3d93cae09	b02ee214-528a-482f-9620-022fa02bc27b	2019-08-12 18:12:52.991625+02	2019-08-12 18:12:52.991625+02
79aa2ae5-eebc-484d-903a-1dd3d93cae09	72fd7369-7c86-4732-a799-ba4f744c9b38	2019-08-12 18:12:52.995094+02	2019-08-12 18:12:52.995094+02
f7a9c4d2-9eb8-48c3-a482-1aa1300fa548	ae7e479d-6bed-4c00-8683-12d08a3ec1e5	2019-08-12 18:12:53.008385+02	2019-08-12 18:12:53.008385+02
f7a9c4d2-9eb8-48c3-a482-1aa1300fa548	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:53.015137+02	2019-08-12 18:12:53.015137+02
f7a9c4d2-9eb8-48c3-a482-1aa1300fa548	72fd7369-7c86-4732-a799-ba4f744c9b38	2019-08-12 18:12:53.020049+02	2019-08-12 18:12:53.020049+02
f4be121d-f03c-450f-b1e9-786aa681153a	7e2e9e42-9812-488a-9626-cf6df8911182	2019-08-12 18:12:53.034498+02	2019-08-12 18:12:53.034498+02
f4be121d-f03c-450f-b1e9-786aa681153a	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:53.037531+02	2019-08-12 18:12:53.037531+02
f4be121d-f03c-450f-b1e9-786aa681153a	d59af43f-f631-466b-ab87-81c3671c9ae3	2019-08-12 18:12:53.04062+02	2019-08-12 18:12:53.04062+02
f4be121d-f03c-450f-b1e9-786aa681153a	72fd7369-7c86-4732-a799-ba4f744c9b38	2019-08-12 18:12:53.04392+02	2019-08-12 18:12:53.04392+02
29e4c768-b77e-4550-800d-ff667924c732	6f197791-8264-4876-ad29-a5a7b4865169	2019-08-12 18:12:53.055105+02	2019-08-12 18:12:53.055105+02
29e4c768-b77e-4550-800d-ff667924c732	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:53.058448+02	2019-08-12 18:12:53.058448+02
29e4c768-b77e-4550-800d-ff667924c732	72fd7369-7c86-4732-a799-ba4f744c9b38	2019-08-12 18:12:53.061489+02	2019-08-12 18:12:53.061489+02
d875cf0e-1743-4db4-a01d-50c7bce93b0d	c751694c-bac0-4255-8a4b-5ec6e74c4773	2019-08-12 18:12:53.074124+02	2019-08-12 18:12:53.074124+02
d875cf0e-1743-4db4-a01d-50c7bce93b0d	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:53.077279+02	2019-08-12 18:12:53.077279+02
d875cf0e-1743-4db4-a01d-50c7bce93b0d	72fd7369-7c86-4732-a799-ba4f744c9b38	2019-08-12 18:12:53.08025+02	2019-08-12 18:12:53.08025+02
a7337952-d9a4-425b-8ab6-0c42981f49a1	6f197791-8264-4876-ad29-a5a7b4865169	2019-08-12 18:12:53.096858+02	2019-08-12 18:12:53.096858+02
a7337952-d9a4-425b-8ab6-0c42981f49a1	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:53.100471+02	2019-08-12 18:12:53.100471+02
a7337952-d9a4-425b-8ab6-0c42981f49a1	72fd7369-7c86-4732-a799-ba4f744c9b38	2019-08-12 18:12:53.104518+02	2019-08-12 18:12:53.104518+02
b3ffdaca-8482-4d8d-bec9-86d2a17c6d0f	9e29ead1-5ed1-40da-930d-5fea15bbf841	2019-08-12 18:12:53.11896+02	2019-08-12 18:12:53.11896+02
b3ffdaca-8482-4d8d-bec9-86d2a17c6d0f	d59af43f-f631-466b-ab87-81c3671c9ae3	2019-08-12 18:12:53.12201+02	2019-08-12 18:12:53.12201+02
b3ffdaca-8482-4d8d-bec9-86d2a17c6d0f	72fd7369-7c86-4732-a799-ba4f744c9b38	2019-08-12 18:12:53.12621+02	2019-08-12 18:12:53.12621+02
aa8e722e-920c-49a6-bd97-b523ff741330	13e97505-d1f7-4d5e-a3da-f4057daf8d8d	2019-08-12 18:12:53.142238+02	2019-08-12 18:12:53.142238+02
aa8e722e-920c-49a6-bd97-b523ff741330	d59af43f-f631-466b-ab87-81c3671c9ae3	2019-08-12 18:12:53.146239+02	2019-08-12 18:12:53.146239+02
aa8e722e-920c-49a6-bd97-b523ff741330	72fd7369-7c86-4732-a799-ba4f744c9b38	2019-08-12 18:12:53.150111+02	2019-08-12 18:12:53.150111+02
6bef7606-a9bb-4790-8586-68ee35e33d31	2955583e-c12b-4906-bfb4-40d48647cfe7	2019-08-12 18:12:53.162316+02	2019-08-12 18:12:53.162316+02
6bef7606-a9bb-4790-8586-68ee35e33d31	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:53.166049+02	2019-08-12 18:12:53.166049+02
6bef7606-a9bb-4790-8586-68ee35e33d31	73d56c7c-2821-49c6-a3db-603eb91c6c33	2019-08-12 18:12:53.16891+02	2019-08-12 18:12:53.16891+02
175be24d-c6c6-45fe-a1f5-a26d930c04e7	8e6195bf-8dbc-4aa1-ba0d-439ec5070977	2019-08-12 18:12:53.18347+02	2019-08-12 18:12:53.18347+02
175be24d-c6c6-45fe-a1f5-a26d930c04e7	d59af43f-f631-466b-ab87-81c3671c9ae3	2019-08-12 18:12:53.1868+02	2019-08-12 18:12:53.1868+02
175be24d-c6c6-45fe-a1f5-a26d930c04e7	73d56c7c-2821-49c6-a3db-603eb91c6c33	2019-08-12 18:12:53.190318+02	2019-08-12 18:12:53.190318+02
4e65297d-b3a4-4224-bb52-f80074a48758	ae7e479d-6bed-4c00-8683-12d08a3ec1e5	2019-08-12 18:12:53.202935+02	2019-08-12 18:12:53.202935+02
4e65297d-b3a4-4224-bb52-f80074a48758	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:53.205598+02	2019-08-12 18:12:53.205598+02
4e65297d-b3a4-4224-bb52-f80074a48758	73d56c7c-2821-49c6-a3db-603eb91c6c33	2019-08-12 18:12:53.208537+02	2019-08-12 18:12:53.208537+02
c6949df2-a93b-4705-9128-ef2af1f4352e	b114776e-a0c8-477c-acf2-5e24bab0056d	2019-08-12 18:12:53.220965+02	2019-08-12 18:12:53.220965+02
c6949df2-a93b-4705-9128-ef2af1f4352e	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:53.223899+02	2019-08-12 18:12:53.223899+02
c6949df2-a93b-4705-9128-ef2af1f4352e	73d56c7c-2821-49c6-a3db-603eb91c6c33	2019-08-12 18:12:53.226838+02	2019-08-12 18:12:53.226838+02
61f32a05-39bb-4721-9327-ff7c468f6ac0	73d56c7c-2821-49c6-a3db-603eb91c6c33	2019-08-12 18:12:53.23931+02	2019-08-12 18:12:53.23931+02
3e5ec59a-4d1a-4586-8454-c18f19547def	6f197791-8264-4876-ad29-a5a7b4865169	2019-08-12 18:12:53.252763+02	2019-08-12 18:12:53.252763+02
3e5ec59a-4d1a-4586-8454-c18f19547def	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:53.255372+02	2019-08-12 18:12:53.255372+02
3e5ec59a-4d1a-4586-8454-c18f19547def	73d56c7c-2821-49c6-a3db-603eb91c6c33	2019-08-12 18:12:53.258406+02	2019-08-12 18:12:53.258406+02
84ce5716-c484-4788-9c56-c3f9d2452120	6f197791-8264-4876-ad29-a5a7b4865169	2019-08-12 18:12:53.270211+02	2019-08-12 18:12:53.270211+02
84ce5716-c484-4788-9c56-c3f9d2452120	d59af43f-f631-466b-ab87-81c3671c9ae3	2019-08-12 18:12:53.273112+02	2019-08-12 18:12:53.273112+02
84ce5716-c484-4788-9c56-c3f9d2452120	73d56c7c-2821-49c6-a3db-603eb91c6c33	2019-08-12 18:12:53.276263+02	2019-08-12 18:12:53.276263+02
389e832d-0d97-4241-86aa-1b7a5c4c018f	9e29ead1-5ed1-40da-930d-5fea15bbf841	2019-08-12 18:12:53.290485+02	2019-08-12 18:12:53.290485+02
389e832d-0d97-4241-86aa-1b7a5c4c018f	d59af43f-f631-466b-ab87-81c3671c9ae3	2019-08-12 18:12:53.294123+02	2019-08-12 18:12:53.294123+02
389e832d-0d97-4241-86aa-1b7a5c4c018f	73d56c7c-2821-49c6-a3db-603eb91c6c33	2019-08-12 18:12:53.297168+02	2019-08-12 18:12:53.297168+02
c445747d-8176-4d50-a02a-4a8d9377216f	ae7e479d-6bed-4c00-8683-12d08a3ec1e5	2019-08-12 18:12:53.309348+02	2019-08-12 18:12:53.309348+02
c445747d-8176-4d50-a02a-4a8d9377216f	8fa57492-c6c1-46a6-a91b-dfe7c0dd2827	2019-08-12 18:12:53.312055+02	2019-08-12 18:12:53.312055+02
c445747d-8176-4d50-a02a-4a8d9377216f	c15183f2-ffd0-4e89-98a9-dcae383055ce	2019-08-12 18:12:53.316395+02	2019-08-12 18:12:53.316395+02
c445747d-8176-4d50-a02a-4a8d9377216f	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:53.323999+02	2019-08-12 18:12:53.323999+02
c445747d-8176-4d50-a02a-4a8d9377216f	d59af43f-f631-466b-ab87-81c3671c9ae3	2019-08-12 18:12:53.329633+02	2019-08-12 18:12:53.329633+02
c445747d-8176-4d50-a02a-4a8d9377216f	73d56c7c-2821-49c6-a3db-603eb91c6c33	2019-08-12 18:12:53.332966+02	2019-08-12 18:12:53.332966+02
ab72581a-f2d0-455a-807a-0ec83e833f89	1c48504b-19a0-4a6a-aee9-8a9a9fb11dac	2019-08-12 18:12:53.346416+02	2019-08-12 18:12:53.346416+02
ab72581a-f2d0-455a-807a-0ec83e833f89	d59af43f-f631-466b-ab87-81c3671c9ae3	2019-08-12 18:12:53.349273+02	2019-08-12 18:12:53.349273+02
ab72581a-f2d0-455a-807a-0ec83e833f89	73d56c7c-2821-49c6-a3db-603eb91c6c33	2019-08-12 18:12:53.352452+02	2019-08-12 18:12:53.352452+02
4da19bc2-f6ff-422f-9d59-1ca04877595e	b904c321-b7d0-4132-9cf6-7c41990dc91c	2019-08-12 18:12:53.36426+02	2019-08-12 18:12:53.36426+02
4da19bc2-f6ff-422f-9d59-1ca04877595e	d59af43f-f631-466b-ab87-81c3671c9ae3	2019-08-12 18:12:53.367358+02	2019-08-12 18:12:53.367358+02
4da19bc2-f6ff-422f-9d59-1ca04877595e	73d56c7c-2821-49c6-a3db-603eb91c6c33	2019-08-12 18:12:53.370429+02	2019-08-12 18:12:53.370429+02
ef7f5e55-34bd-4ce7-b7d0-d98de33b0d56	8fa57492-c6c1-46a6-a91b-dfe7c0dd2827	2019-08-12 18:12:53.385139+02	2019-08-12 18:12:53.385139+02
ef7f5e55-34bd-4ce7-b7d0-d98de33b0d56	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:53.38827+02	2019-08-12 18:12:53.38827+02
ef7f5e55-34bd-4ce7-b7d0-d98de33b0d56	45f638bd-a8a8-4fc7-bc45-34320557bc98	2019-08-12 18:12:53.392523+02	2019-08-12 18:12:53.392523+02
2348243a-3f7a-491c-9dc0-518f2f201fa5	8fa57492-c6c1-46a6-a91b-dfe7c0dd2827	2019-08-12 18:12:53.413218+02	2019-08-12 18:12:53.413218+02
2348243a-3f7a-491c-9dc0-518f2f201fa5	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:53.416664+02	2019-08-12 18:12:53.416664+02
2348243a-3f7a-491c-9dc0-518f2f201fa5	45f638bd-a8a8-4fc7-bc45-34320557bc98	2019-08-12 18:12:53.421261+02	2019-08-12 18:12:53.421261+02
4830abb9-cdf9-4b67-9cd1-901a17020da8	5ef2a9cd-3e57-4275-8094-b7faabf7ef5d	2019-08-12 18:12:53.438295+02	2019-08-12 18:12:53.438295+02
4830abb9-cdf9-4b67-9cd1-901a17020da8	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:53.441965+02	2019-08-12 18:12:53.441965+02
4830abb9-cdf9-4b67-9cd1-901a17020da8	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:53.446264+02	2019-08-12 18:12:53.446264+02
48e0801b-0db2-4fd1-a988-6a5681b86b57	ec819bcf-fc67-4c47-93a4-2a0b7f41a8e0	2019-08-12 18:12:53.461407+02	2019-08-12 18:12:53.461407+02
48e0801b-0db2-4fd1-a988-6a5681b86b57	ae7e479d-6bed-4c00-8683-12d08a3ec1e5	2019-08-12 18:12:53.465181+02	2019-08-12 18:12:53.465181+02
48e0801b-0db2-4fd1-a988-6a5681b86b57	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:53.468736+02	2019-08-12 18:12:53.468736+02
48e0801b-0db2-4fd1-a988-6a5681b86b57	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:53.472011+02	2019-08-12 18:12:53.472011+02
7ad3d60f-7a79-42ad-944e-a7019c79fb7f	3eee41fa-13a9-4291-8973-ed3624a8bb9b	2019-08-12 18:12:53.485871+02	2019-08-12 18:12:53.485871+02
7ad3d60f-7a79-42ad-944e-a7019c79fb7f	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:53.489222+02	2019-08-12 18:12:53.489222+02
7ad3d60f-7a79-42ad-944e-a7019c79fb7f	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:53.492865+02	2019-08-12 18:12:53.492865+02
7b20b5c9-cf23-4629-b072-ec2f33bcec55	13e97505-d1f7-4d5e-a3da-f4057daf8d8d	2019-08-12 18:12:53.505711+02	2019-08-12 18:12:53.505711+02
7b20b5c9-cf23-4629-b072-ec2f33bcec55	c751694c-bac0-4255-8a4b-5ec6e74c4773	2019-08-12 18:12:53.5086+02	2019-08-12 18:12:53.5086+02
7b20b5c9-cf23-4629-b072-ec2f33bcec55	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:53.511898+02	2019-08-12 18:12:53.511898+02
7b20b5c9-cf23-4629-b072-ec2f33bcec55	d59af43f-f631-466b-ab87-81c3671c9ae3	2019-08-12 18:12:53.515272+02	2019-08-12 18:12:53.515272+02
7b20b5c9-cf23-4629-b072-ec2f33bcec55	b02ee214-528a-482f-9620-022fa02bc27b	2019-08-12 18:12:53.518567+02	2019-08-12 18:12:53.518567+02
7b20b5c9-cf23-4629-b072-ec2f33bcec55	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:53.522191+02	2019-08-12 18:12:53.522191+02
a2c8d89c-a883-4dae-bac8-1eb4ce5b4101	8fa57492-c6c1-46a6-a91b-dfe7c0dd2827	2019-08-12 18:12:53.537623+02	2019-08-12 18:12:53.537623+02
a2c8d89c-a883-4dae-bac8-1eb4ce5b4101	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:53.542519+02	2019-08-12 18:12:53.542519+02
a2c8d89c-a883-4dae-bac8-1eb4ce5b4101	d59af43f-f631-466b-ab87-81c3671c9ae3	2019-08-12 18:12:53.546198+02	2019-08-12 18:12:53.546198+02
a2c8d89c-a883-4dae-bac8-1eb4ce5b4101	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:53.549614+02	2019-08-12 18:12:53.549614+02
bab1c9f0-0f1f-4e47-9cd7-9966e7765423	ae7e479d-6bed-4c00-8683-12d08a3ec1e5	2019-08-12 18:12:53.562738+02	2019-08-12 18:12:53.562738+02
bab1c9f0-0f1f-4e47-9cd7-9966e7765423	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:53.565883+02	2019-08-12 18:12:53.565883+02
bab1c9f0-0f1f-4e47-9cd7-9966e7765423	d59af43f-f631-466b-ab87-81c3671c9ae3	2019-08-12 18:12:53.569413+02	2019-08-12 18:12:53.569413+02
bab1c9f0-0f1f-4e47-9cd7-9966e7765423	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:53.572832+02	2019-08-12 18:12:53.572832+02
f3359db6-6c01-4d02-b180-2637bbf97660	13e97505-d1f7-4d5e-a3da-f4057daf8d8d	2019-08-12 18:12:53.586003+02	2019-08-12 18:12:53.586003+02
f3359db6-6c01-4d02-b180-2637bbf97660	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:53.588931+02	2019-08-12 18:12:53.588931+02
f3359db6-6c01-4d02-b180-2637bbf97660	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:53.591894+02	2019-08-12 18:12:53.591894+02
3a5636a9-416a-4f50-9c80-688cdb924b52	ae7e479d-6bed-4c00-8683-12d08a3ec1e5	2019-08-12 18:12:53.6044+02	2019-08-12 18:12:53.6044+02
3a5636a9-416a-4f50-9c80-688cdb924b52	8fa57492-c6c1-46a6-a91b-dfe7c0dd2827	2019-08-12 18:12:53.608827+02	2019-08-12 18:12:53.608827+02
3a5636a9-416a-4f50-9c80-688cdb924b52	c15183f2-ffd0-4e89-98a9-dcae383055ce	2019-08-12 18:12:53.612449+02	2019-08-12 18:12:53.612449+02
3a5636a9-416a-4f50-9c80-688cdb924b52	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:53.61572+02	2019-08-12 18:12:53.61572+02
3a5636a9-416a-4f50-9c80-688cdb924b52	d59af43f-f631-466b-ab87-81c3671c9ae3	2019-08-12 18:12:53.6191+02	2019-08-12 18:12:53.6191+02
3a5636a9-416a-4f50-9c80-688cdb924b52	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:53.622249+02	2019-08-12 18:12:53.622249+02
c186c9c9-10a1-4ce6-a602-e66046447850	42a6f3fc-137f-4ad8-9f68-be19832804db	2019-08-12 18:12:53.636598+02	2019-08-12 18:12:53.636598+02
c186c9c9-10a1-4ce6-a602-e66046447850	2955583e-c12b-4906-bfb4-40d48647cfe7	2019-08-12 18:12:53.63951+02	2019-08-12 18:12:53.63951+02
c186c9c9-10a1-4ce6-a602-e66046447850	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:53.642504+02	2019-08-12 18:12:53.642504+02
c186c9c9-10a1-4ce6-a602-e66046447850	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:53.645462+02	2019-08-12 18:12:53.645462+02
134c1fa2-7a6d-4372-9e4a-d2761f67947e	ae7e479d-6bed-4c00-8683-12d08a3ec1e5	2019-08-12 18:12:53.658127+02	2019-08-12 18:12:53.658127+02
134c1fa2-7a6d-4372-9e4a-d2761f67947e	9e29ead1-5ed1-40da-930d-5fea15bbf841	2019-08-12 18:12:53.661403+02	2019-08-12 18:12:53.661403+02
134c1fa2-7a6d-4372-9e4a-d2761f67947e	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:53.664284+02	2019-08-12 18:12:53.664284+02
134c1fa2-7a6d-4372-9e4a-d2761f67947e	d59af43f-f631-466b-ab87-81c3671c9ae3	2019-08-12 18:12:53.667495+02	2019-08-12 18:12:53.667495+02
134c1fa2-7a6d-4372-9e4a-d2761f67947e	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:53.671128+02	2019-08-12 18:12:53.671128+02
e9984f28-b8ec-4c45-af66-01e163715e40	8e6195bf-8dbc-4aa1-ba0d-439ec5070977	2019-08-12 18:12:53.685189+02	2019-08-12 18:12:53.685189+02
e9984f28-b8ec-4c45-af66-01e163715e40	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:53.688228+02	2019-08-12 18:12:53.688228+02
e9984f28-b8ec-4c45-af66-01e163715e40	d59af43f-f631-466b-ab87-81c3671c9ae3	2019-08-12 18:12:53.691169+02	2019-08-12 18:12:53.691169+02
e9984f28-b8ec-4c45-af66-01e163715e40	b02ee214-528a-482f-9620-022fa02bc27b	2019-08-12 18:12:53.693959+02	2019-08-12 18:12:53.693959+02
e9984f28-b8ec-4c45-af66-01e163715e40	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:53.697821+02	2019-08-12 18:12:53.697821+02
ffee3baa-6cba-4ab0-bb41-ce2d4c6c6169	884c1988-698d-49e2-8120-a0bff211f434	2019-08-12 18:12:53.712267+02	2019-08-12 18:12:53.712267+02
ffee3baa-6cba-4ab0-bb41-ce2d4c6c6169	d59af43f-f631-466b-ab87-81c3671c9ae3	2019-08-12 18:12:53.715388+02	2019-08-12 18:12:53.715388+02
ffee3baa-6cba-4ab0-bb41-ce2d4c6c6169	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:53.718247+02	2019-08-12 18:12:53.718247+02
ea0cc5c9-6cb4-403b-a331-594565256021	2c8e224f-f7ab-46e1-882f-7c37d4cc4d0f	2019-08-12 18:12:53.73252+02	2019-08-12 18:12:53.73252+02
ea0cc5c9-6cb4-403b-a331-594565256021	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:53.735663+02	2019-08-12 18:12:53.735663+02
ea0cc5c9-6cb4-403b-a331-594565256021	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:53.738275+02	2019-08-12 18:12:53.738275+02
8cb56a97-476a-4e24-acaf-17eb98c82b06	8e6195bf-8dbc-4aa1-ba0d-439ec5070977	2019-08-12 18:12:53.751599+02	2019-08-12 18:12:53.751599+02
8cb56a97-476a-4e24-acaf-17eb98c82b06	d59af43f-f631-466b-ab87-81c3671c9ae3	2019-08-12 18:12:53.754732+02	2019-08-12 18:12:53.754732+02
8cb56a97-476a-4e24-acaf-17eb98c82b06	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:53.758275+02	2019-08-12 18:12:53.758275+02
3a719c34-790d-44e9-a9cf-3f660f62c551	13e97505-d1f7-4d5e-a3da-f4057daf8d8d	2019-08-12 18:12:53.771591+02	2019-08-12 18:12:53.771591+02
3a719c34-790d-44e9-a9cf-3f660f62c551	ec819bcf-fc67-4c47-93a4-2a0b7f41a8e0	2019-08-12 18:12:53.774651+02	2019-08-12 18:12:53.774651+02
3a719c34-790d-44e9-a9cf-3f660f62c551	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:53.777702+02	2019-08-12 18:12:53.777702+02
3a719c34-790d-44e9-a9cf-3f660f62c551	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:53.78124+02	2019-08-12 18:12:53.78124+02
b64703c1-a048-4e19-82d2-9ad1cd8142a4	64bc8a2c-ac97-44a6-a7a2-34b2c94645b4	2019-08-12 18:12:53.792864+02	2019-08-12 18:12:53.792864+02
b64703c1-a048-4e19-82d2-9ad1cd8142a4	c15183f2-ffd0-4e89-98a9-dcae383055ce	2019-08-12 18:12:53.795819+02	2019-08-12 18:12:53.795819+02
b64703c1-a048-4e19-82d2-9ad1cd8142a4	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:53.798943+02	2019-08-12 18:12:53.798943+02
b64703c1-a048-4e19-82d2-9ad1cd8142a4	d59af43f-f631-466b-ab87-81c3671c9ae3	2019-08-12 18:12:53.802074+02	2019-08-12 18:12:53.802074+02
b64703c1-a048-4e19-82d2-9ad1cd8142a4	f4f9f859-d505-41e0-9c52-69cb3ce57452	2019-08-12 18:12:53.805094+02	2019-08-12 18:12:53.805094+02
8ddd6219-befb-475c-8567-bcfb86bef2db	ae7e479d-6bed-4c00-8683-12d08a3ec1e5	2019-08-12 18:12:53.818832+02	2019-08-12 18:12:53.818832+02
8ddd6219-befb-475c-8567-bcfb86bef2db	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:53.821414+02	2019-08-12 18:12:53.821414+02
8ddd6219-befb-475c-8567-bcfb86bef2db	72fd7369-7c86-4732-a799-ba4f744c9b38	2019-08-12 18:12:53.824376+02	2019-08-12 18:12:53.824376+02
ddc478e6-7b3b-4247-b5bd-c8077029e073	ae7e479d-6bed-4c00-8683-12d08a3ec1e5	2019-08-12 18:12:53.836719+02	2019-08-12 18:12:53.836719+02
ddc478e6-7b3b-4247-b5bd-c8077029e073	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:53.83959+02	2019-08-12 18:12:53.83959+02
ddc478e6-7b3b-4247-b5bd-c8077029e073	72fd7369-7c86-4732-a799-ba4f744c9b38	2019-08-12 18:12:53.842713+02	2019-08-12 18:12:53.842713+02
85511217-f7d0-4a22-81bb-c131a81b22d3	8fa57492-c6c1-46a6-a91b-dfe7c0dd2827	2019-08-12 18:12:53.856623+02	2019-08-12 18:12:53.856623+02
85511217-f7d0-4a22-81bb-c131a81b22d3	d59af43f-f631-466b-ab87-81c3671c9ae3	2019-08-12 18:12:53.860607+02	2019-08-12 18:12:53.860607+02
85511217-f7d0-4a22-81bb-c131a81b22d3	72fd7369-7c86-4732-a799-ba4f744c9b38	2019-08-12 18:12:53.864077+02	2019-08-12 18:12:53.864077+02
95f86d77-4608-404c-91e8-6020033724ed	3373d819-b185-4fe1-98c0-9185d671c2c9	2019-08-12 18:12:53.876535+02	2019-08-12 18:12:53.876535+02
95f86d77-4608-404c-91e8-6020033724ed	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:53.879185+02	2019-08-12 18:12:53.879185+02
95f86d77-4608-404c-91e8-6020033724ed	72fd7369-7c86-4732-a799-ba4f744c9b38	2019-08-12 18:12:53.881962+02	2019-08-12 18:12:53.881962+02
c2da5867-e3c3-4aa5-981c-4d994cbb88fa	13ec226d-1ad1-40f7-9e81-7e1fe47a4552	2019-08-12 18:12:53.894593+02	2019-08-12 18:12:53.894593+02
c2da5867-e3c3-4aa5-981c-4d994cbb88fa	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:53.899285+02	2019-08-12 18:12:53.899285+02
c2da5867-e3c3-4aa5-981c-4d994cbb88fa	72fd7369-7c86-4732-a799-ba4f744c9b38	2019-08-12 18:12:53.90311+02	2019-08-12 18:12:53.90311+02
7197b4bc-662d-485b-91d6-de0acf6ac828	2c8e224f-f7ab-46e1-882f-7c37d4cc4d0f	2019-08-12 18:12:53.91838+02	2019-08-12 18:12:53.91838+02
7197b4bc-662d-485b-91d6-de0acf6ac828	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:53.921353+02	2019-08-12 18:12:53.921353+02
7197b4bc-662d-485b-91d6-de0acf6ac828	73d56c7c-2821-49c6-a3db-603eb91c6c33	2019-08-12 18:12:53.924438+02	2019-08-12 18:12:53.924438+02
5cb989ac-4d27-4258-9542-dc53b17afeb4	8fa57492-c6c1-46a6-a91b-dfe7c0dd2827	2019-08-12 18:12:53.936126+02	2019-08-12 18:12:53.936126+02
5cb989ac-4d27-4258-9542-dc53b17afeb4	3373d819-b185-4fe1-98c0-9185d671c2c9	2019-08-12 18:12:53.939601+02	2019-08-12 18:12:53.939601+02
5cb989ac-4d27-4258-9542-dc53b17afeb4	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:53.943145+02	2019-08-12 18:12:53.943145+02
5cb989ac-4d27-4258-9542-dc53b17afeb4	73d56c7c-2821-49c6-a3db-603eb91c6c33	2019-08-12 18:12:53.946334+02	2019-08-12 18:12:53.946334+02
746aabb8-50de-4ebe-930b-58107b8527e0	8fa57492-c6c1-46a6-a91b-dfe7c0dd2827	2019-08-12 18:12:53.961318+02	2019-08-12 18:12:53.961318+02
746aabb8-50de-4ebe-930b-58107b8527e0	ae7e479d-6bed-4c00-8683-12d08a3ec1e5	2019-08-12 18:12:53.965783+02	2019-08-12 18:12:53.965783+02
746aabb8-50de-4ebe-930b-58107b8527e0	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:53.968862+02	2019-08-12 18:12:53.968862+02
746aabb8-50de-4ebe-930b-58107b8527e0	d59af43f-f631-466b-ab87-81c3671c9ae3	2019-08-12 18:12:53.972778+02	2019-08-12 18:12:53.972778+02
746aabb8-50de-4ebe-930b-58107b8527e0	73d56c7c-2821-49c6-a3db-603eb91c6c33	2019-08-12 18:12:53.975914+02	2019-08-12 18:12:53.975914+02
1463e4ca-6f90-4510-8459-d198a6713b44	6f197791-8264-4876-ad29-a5a7b4865169	2019-08-12 18:12:53.989033+02	2019-08-12 18:12:53.989033+02
1463e4ca-6f90-4510-8459-d198a6713b44	ec819bcf-fc67-4c47-93a4-2a0b7f41a8e0	2019-08-12 18:12:53.992524+02	2019-08-12 18:12:53.992524+02
1463e4ca-6f90-4510-8459-d198a6713b44	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:53.996937+02	2019-08-12 18:12:53.996937+02
1463e4ca-6f90-4510-8459-d198a6713b44	73d56c7c-2821-49c6-a3db-603eb91c6c33	2019-08-12 18:12:54.000554+02	2019-08-12 18:12:54.000554+02
aa37fa99-d814-416f-aedf-4fe3fe074528	2955583e-c12b-4906-bfb4-40d48647cfe7	2019-08-12 18:12:54.014246+02	2019-08-12 18:12:54.014246+02
aa37fa99-d814-416f-aedf-4fe3fe074528	ae7e479d-6bed-4c00-8683-12d08a3ec1e5	2019-08-12 18:12:54.017098+02	2019-08-12 18:12:54.017098+02
aa37fa99-d814-416f-aedf-4fe3fe074528	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:54.019628+02	2019-08-12 18:12:54.019628+02
aa37fa99-d814-416f-aedf-4fe3fe074528	73d56c7c-2821-49c6-a3db-603eb91c6c33	2019-08-12 18:12:54.022179+02	2019-08-12 18:12:54.022179+02
92bd2516-7bf9-4b23-97de-ac36758f6bc3	6f197791-8264-4876-ad29-a5a7b4865169	2019-08-12 18:12:54.03497+02	2019-08-12 18:12:54.03497+02
92bd2516-7bf9-4b23-97de-ac36758f6bc3	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:54.038577+02	2019-08-12 18:12:54.038577+02
92bd2516-7bf9-4b23-97de-ac36758f6bc3	73d56c7c-2821-49c6-a3db-603eb91c6c33	2019-08-12 18:12:54.042254+02	2019-08-12 18:12:54.042254+02
fb9d445b-3c2b-4cb6-a3b6-93663356088c	b114776e-a0c8-477c-acf2-5e24bab0056d	2019-08-12 18:12:54.05955+02	2019-08-12 18:12:54.05955+02
fb9d445b-3c2b-4cb6-a3b6-93663356088c	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:54.062973+02	2019-08-12 18:12:54.062973+02
fb9d445b-3c2b-4cb6-a3b6-93663356088c	73d56c7c-2821-49c6-a3db-603eb91c6c33	2019-08-12 18:12:54.066285+02	2019-08-12 18:12:54.066285+02
94983916-4e1e-4554-a9c5-2b99ffd2a70d	2c8e224f-f7ab-46e1-882f-7c37d4cc4d0f	2019-08-12 18:12:54.078821+02	2019-08-12 18:12:54.078821+02
94983916-4e1e-4554-a9c5-2b99ffd2a70d	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:54.082143+02	2019-08-12 18:12:54.082143+02
94983916-4e1e-4554-a9c5-2b99ffd2a70d	73d56c7c-2821-49c6-a3db-603eb91c6c33	2019-08-12 18:12:54.085576+02	2019-08-12 18:12:54.085576+02
d2d41235-8750-4251-af21-00d5c286ae6d	c751694c-bac0-4255-8a4b-5ec6e74c4773	2019-08-12 18:12:54.099147+02	2019-08-12 18:12:54.099147+02
d2d41235-8750-4251-af21-00d5c286ae6d	d59af43f-f631-466b-ab87-81c3671c9ae3	2019-08-12 18:12:54.101835+02	2019-08-12 18:12:54.101835+02
d2d41235-8750-4251-af21-00d5c286ae6d	45f638bd-a8a8-4fc7-bc45-34320557bc98	2019-08-12 18:12:54.104388+02	2019-08-12 18:12:54.104388+02
96eaac66-a3c7-4032-bef0-6efa6a649ffb	ae7e479d-6bed-4c00-8683-12d08a3ec1e5	2019-08-12 18:12:54.120129+02	2019-08-12 18:12:54.120129+02
96eaac66-a3c7-4032-bef0-6efa6a649ffb	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:54.123194+02	2019-08-12 18:12:54.123194+02
96eaac66-a3c7-4032-bef0-6efa6a649ffb	45f638bd-a8a8-4fc7-bc45-34320557bc98	2019-08-12 18:12:54.126139+02	2019-08-12 18:12:54.126139+02
0ac4dfff-8a10-482d-80c2-ad7f9f9678eb	8fa57492-c6c1-46a6-a91b-dfe7c0dd2827	2019-08-12 18:12:54.142896+02	2019-08-12 18:12:54.142896+02
0ac4dfff-8a10-482d-80c2-ad7f9f9678eb	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:54.146157+02	2019-08-12 18:12:54.146157+02
0ac4dfff-8a10-482d-80c2-ad7f9f9678eb	45f638bd-a8a8-4fc7-bc45-34320557bc98	2019-08-12 18:12:54.149467+02	2019-08-12 18:12:54.149467+02
845a71fd-64dd-4a5b-bf67-900a1c680495	8fa57492-c6c1-46a6-a91b-dfe7c0dd2827	2019-08-12 18:12:54.165882+02	2019-08-12 18:12:54.165882+02
845a71fd-64dd-4a5b-bf67-900a1c680495	bf4757f9-c60e-4f88-8548-c8a095d0b580	2019-08-12 18:12:54.168464+02	2019-08-12 18:12:54.168464+02
845a71fd-64dd-4a5b-bf67-900a1c680495	45f638bd-a8a8-4fc7-bc45-34320557bc98	2019-08-12 18:12:54.170942+02	2019-08-12 18:12:54.170942+02
\.


--
-- Data for Name: person_account; Type: TABLE DATA; Schema: indieco_private; Owner: engleek
--

COPY indieco_private.person_account (person_id, email, password_hash, is_admin) FROM stdin;
\.


--
-- PostgreSQL database dump complete
--

