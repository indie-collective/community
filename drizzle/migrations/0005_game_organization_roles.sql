-- One row per role, so a studio can be both a game's developer and its
-- publisher (#335): the primary key gains `role`.
--
-- SQLite can't change a primary key, so the table is rebuilt. The search
-- view and its triggers (0004) read it and would break the rebuild, so they
-- are dropped first and recreated as they were (the table's own triggers go
-- with the old table). The search index is unchanged: the rows are the same.
DROP TRIGGER games_search_insert;--> statement-breakpoint
DROP TRIGGER games_search_update;--> statement-breakpoint
DROP TRIGGER games_search_delete;--> statement-breakpoint
DROP TRIGGER organizations_search_insert;--> statement-breakpoint
DROP TRIGGER organizations_search_update;--> statement-breakpoint
DROP TRIGGER organizations_search_delete;--> statement-breakpoint
DROP TRIGGER events_search_insert;--> statement-breakpoint
DROP TRIGGER events_search_update;--> statement-breakpoint
DROP TRIGGER events_search_delete;--> statement-breakpoint
DROP TRIGGER game_tags_search_insert;--> statement-breakpoint
DROP TRIGGER game_tags_search_delete;--> statement-breakpoint
DROP TRIGGER tags_search_update;--> statement-breakpoint
DROP TRIGGER game_events_search_insert;--> statement-breakpoint
DROP TRIGGER game_events_search_delete;--> statement-breakpoint
DROP TRIGGER organization_events_search_insert;--> statement-breakpoint
DROP TRIGGER organization_events_search_delete;--> statement-breakpoint
DROP VIEW search_documents;--> statement-breakpoint
CREATE TABLE `__new_game_organizations` (
	`game_id` text NOT NULL,
	`organization_id` text NOT NULL,
	`role` text DEFAULT 'developer' NOT NULL,
	`created_at` integer NOT NULL,
	PRIMARY KEY(`game_id`, `organization_id`, `role`),
	FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "game_organizations_role" CHECK("role" in ('developer', 'co_developer', 'publisher', 'porting', 'support'))
);
--> statement-breakpoint
INSERT INTO `__new_game_organizations`("game_id", "organization_id", "role", "created_at") SELECT "game_id", "organization_id", "role", "created_at" FROM `game_organizations`;--> statement-breakpoint
DROP TABLE `game_organizations`;--> statement-breakpoint
ALTER TABLE `__new_game_organizations` RENAME TO `game_organizations`;--> statement-breakpoint
CREATE INDEX `game_organizations_organization_id` ON `game_organizations` (`organization_id`);--> statement-breakpoint
CREATE VIEW search_documents AS
WITH countries (code, names) AS (
  VALUES
    ('AC', 'Ascension Island Île de l’Ascension'),
    ('AD', 'Andorra Andorre'),
    ('AE', 'United Arab Emirates Émirats arabes unis'),
    ('AF', 'Afghanistan'),
    ('AG', 'Antigua & Barbuda Antigua-et-Barbuda'),
    ('AI', 'Anguilla'),
    ('AL', 'Albania Albanie'),
    ('AM', 'Armenia Arménie'),
    ('AN', 'Curaçao'),
    ('AO', 'Angola'),
    ('AQ', 'Antarctica Antarctique'),
    ('AR', 'Argentina Argentine'),
    ('AS', 'American Samoa Samoa américaines'),
    ('AT', 'Austria Autriche'),
    ('AU', 'Australia Australie'),
    ('AW', 'Aruba'),
    ('AX', 'Åland Islands Îles Åland'),
    ('AZ', 'Azerbaijan Azerbaïdjan'),
    ('BA', 'Bosnia & Herzegovina Bosnie-Herzégovine'),
    ('BB', 'Barbados Barbade'),
    ('BD', 'Bangladesh'),
    ('BE', 'Belgium Belgique'),
    ('BF', 'Burkina Faso'),
    ('BG', 'Bulgaria Bulgarie'),
    ('BH', 'Bahrain Bahreïn'),
    ('BI', 'Burundi'),
    ('BJ', 'Benin Bénin'),
    ('BL', 'St. Barthélemy Saint-Barthélemy'),
    ('BM', 'Bermuda Bermudes'),
    ('BN', 'Brunei'),
    ('BO', 'Bolivia Bolivie'),
    ('BQ', 'Caribbean Netherlands Pays-Bas caribéens'),
    ('BR', 'Brazil Brésil'),
    ('BS', 'Bahamas'),
    ('BT', 'Bhutan Bhoutan'),
    ('BU', 'Myanmar (Burma) Myanmar (Birmanie)'),
    ('BV', 'Bouvet Island Île Bouvet'),
    ('BW', 'Botswana'),
    ('BY', 'Belarus Biélorussie'),
    ('BZ', 'Belize'),
    ('CA', 'Canada'),
    ('CC', 'Cocos (Keeling) Islands Îles Cocos'),
    ('CD', 'Congo - Kinshasa Congo-Kinshasa'),
    ('CF', 'Central African Republic République centrafricaine'),
    ('CG', 'Congo - Brazzaville Congo-Brazzaville'),
    ('CH', 'Switzerland Suisse'),
    ('CI', 'Côte d’Ivoire'),
    ('CK', 'Cook Islands Îles Cook'),
    ('CL', 'Chile Chili'),
    ('CM', 'Cameroon Cameroun'),
    ('CN', 'China Chine'),
    ('CO', 'Colombia Colombie'),
    ('CP', 'Clipperton Island Île Clipperton'),
    ('CQ', 'Sark Sercq'),
    ('CR', 'Costa Rica'),
    ('CS', 'Serbia Serbie'),
    ('CU', 'Cuba'),
    ('CV', 'Cape Verde Cap-Vert'),
    ('CW', 'Curaçao'),
    ('CX', 'Christmas Island Île Christmas'),
    ('CY', 'Cyprus Chypre'),
    ('CZ', 'Czechia Tchéquie'),
    ('DD', 'Germany Allemagne'),
    ('DE', 'Germany Allemagne'),
    ('DG', 'Diego Garcia'),
    ('DJ', 'Djibouti'),
    ('DK', 'Denmark Danemark'),
    ('DM', 'Dominica Dominique'),
    ('DO', 'Dominican Republic République dominicaine'),
    ('DY', 'Benin Bénin'),
    ('DZ', 'Algeria Algérie'),
    ('EA', 'Ceuta & Melilla Ceuta et Melilla'),
    ('EC', 'Ecuador Équateur'),
    ('EE', 'Estonia Estonie'),
    ('EG', 'Egypt Égypte'),
    ('EH', 'Western Sahara Sahara occidental'),
    ('ER', 'Eritrea Érythrée'),
    ('ES', 'Spain Espagne'),
    ('ET', 'Ethiopia Éthiopie'),
    ('FI', 'Finland Finlande'),
    ('FJ', 'Fiji Fidji'),
    ('FK', 'Falkland Islands Îles Malouines'),
    ('FM', 'Micronesia Micronésie'),
    ('FO', 'Faroe Islands Îles Féroé'),
    ('FR', 'France'),
    ('FX', 'France'),
    ('GA', 'Gabon'),
    ('GB', 'United Kingdom Royaume-Uni'),
    ('GD', 'Grenada Grenade'),
    ('GE', 'Georgia Géorgie'),
    ('GF', 'French Guiana Guyane française'),
    ('GG', 'Guernsey Guernesey'),
    ('GH', 'Ghana'),
    ('GI', 'Gibraltar'),
    ('GL', 'Greenland Groenland'),
    ('GM', 'Gambia Gambie'),
    ('GN', 'Guinea Guinée'),
    ('GP', 'Guadeloupe'),
    ('GQ', 'Equatorial Guinea Guinée équatoriale'),
    ('GR', 'Greece Grèce'),
    ('GS', 'South Georgia & South Sandwich Islands Géorgie du Sud-et-les Îles Sandwich du Sud'),
    ('GT', 'Guatemala'),
    ('GU', 'Guam'),
    ('GW', 'Guinea-Bissau Guinée-Bissau'),
    ('GY', 'Guyana'),
    ('HK', 'Hong Kong SAR China R.A.S. chinoise de Hong Kong'),
    ('HM', 'Heard & McDonald Islands Îles Heard-et-MacDonald'),
    ('HN', 'Honduras'),
    ('HR', 'Croatia Croatie'),
    ('HT', 'Haiti Haïti'),
    ('HU', 'Hungary Hongrie'),
    ('HV', 'Burkina Faso'),
    ('IC', 'Canary Islands Îles Canaries'),
    ('ID', 'Indonesia Indonésie'),
    ('IE', 'Ireland Irlande'),
    ('IL', 'Israel Israël'),
    ('IM', 'Isle of Man Île de Man'),
    ('IN', 'India Inde'),
    ('IO', 'British Indian Ocean Territory Territoire britannique de l’océan Indien'),
    ('IQ', 'Iraq Irak'),
    ('IR', 'Iran'),
    ('IS', 'Iceland Islande'),
    ('IT', 'Italy Italie'),
    ('JE', 'Jersey'),
    ('JM', 'Jamaica Jamaïque'),
    ('JO', 'Jordan Jordanie'),
    ('JP', 'Japan Japon'),
    ('KE', 'Kenya'),
    ('KG', 'Kyrgyzstan Kirghizstan'),
    ('KH', 'Cambodia Cambodge'),
    ('KI', 'Kiribati'),
    ('KM', 'Comoros Comores'),
    ('KN', 'St. Kitts & Nevis Saint-Christophe-et-Niévès'),
    ('KP', 'North Korea Corée du Nord'),
    ('KR', 'South Korea Corée du Sud'),
    ('KW', 'Kuwait Koweït'),
    ('KY', 'Cayman Islands Îles Caïmans'),
    ('KZ', 'Kazakhstan'),
    ('LA', 'Laos'),
    ('LB', 'Lebanon Liban'),
    ('LC', 'St. Lucia Sainte-Lucie'),
    ('LI', 'Liechtenstein'),
    ('LK', 'Sri Lanka'),
    ('LR', 'Liberia'),
    ('LS', 'Lesotho'),
    ('LT', 'Lithuania Lituanie'),
    ('LU', 'Luxembourg'),
    ('LV', 'Latvia Lettonie'),
    ('LY', 'Libya Libye'),
    ('MA', 'Morocco Maroc'),
    ('MC', 'Monaco'),
    ('MD', 'Moldova Moldavie'),
    ('ME', 'Montenegro Monténégro'),
    ('MF', 'St. Martin Saint-Martin'),
    ('MG', 'Madagascar'),
    ('MH', 'Marshall Islands Îles Marshall'),
    ('MK', 'North Macedonia Macédoine du Nord'),
    ('ML', 'Mali'),
    ('MM', 'Myanmar (Burma) Myanmar (Birmanie)'),
    ('MN', 'Mongolia Mongolie'),
    ('MO', 'Macao SAR China R.A.S. chinoise de Macao'),
    ('MP', 'Northern Mariana Islands Îles Mariannes du Nord'),
    ('MQ', 'Martinique'),
    ('MR', 'Mauritania Mauritanie'),
    ('MS', 'Montserrat'),
    ('MT', 'Malta Malte'),
    ('MU', 'Mauritius Maurice'),
    ('MV', 'Maldives'),
    ('MW', 'Malawi'),
    ('MX', 'Mexico Mexique'),
    ('MY', 'Malaysia Malaisie'),
    ('MZ', 'Mozambique'),
    ('NA', 'Namibia Namibie'),
    ('NC', 'New Caledonia Nouvelle-Calédonie'),
    ('NE', 'Niger'),
    ('NF', 'Norfolk Island Île Norfolk'),
    ('NG', 'Nigeria'),
    ('NH', 'Vanuatu'),
    ('NI', 'Nicaragua'),
    ('NL', 'Netherlands Pays-Bas'),
    ('NO', 'Norway Norvège'),
    ('NP', 'Nepal Népal'),
    ('NR', 'Nauru'),
    ('NU', 'Niue'),
    ('NZ', 'New Zealand Nouvelle-Zélande'),
    ('OM', 'Oman'),
    ('PA', 'Panama'),
    ('PE', 'Peru Pérou'),
    ('PF', 'French Polynesia Polynésie française'),
    ('PG', 'Papua New Guinea Papouasie-Nouvelle-Guinée'),
    ('PH', 'Philippines'),
    ('PK', 'Pakistan'),
    ('PL', 'Poland Pologne'),
    ('PM', 'St. Pierre & Miquelon Saint-Pierre-et-Miquelon'),
    ('PN', 'Pitcairn Islands Îles Pitcairn'),
    ('PR', 'Puerto Rico Porto Rico'),
    ('PS', 'Palestinian Territories Territoires palestiniens'),
    ('PT', 'Portugal'),
    ('PW', 'Palau Palaos'),
    ('PY', 'Paraguay'),
    ('QA', 'Qatar'),
    ('RE', 'Réunion La Réunion'),
    ('RH', 'Zimbabwe'),
    ('RO', 'Romania Roumanie'),
    ('RS', 'Serbia Serbie'),
    ('RU', 'Russia Russie'),
    ('RW', 'Rwanda'),
    ('SA', 'Saudi Arabia Arabie saoudite'),
    ('SB', 'Solomon Islands Îles Salomon'),
    ('SC', 'Seychelles'),
    ('SD', 'Sudan Soudan'),
    ('SE', 'Sweden Suède'),
    ('SG', 'Singapore Singapour'),
    ('SH', 'St. Helena Sainte-Hélène'),
    ('SI', 'Slovenia Slovénie'),
    ('SJ', 'Svalbard & Jan Mayen Svalbard et Jan Mayen'),
    ('SK', 'Slovakia Slovaquie'),
    ('SL', 'Sierra Leone'),
    ('SM', 'San Marino Saint-Marin'),
    ('SN', 'Senegal Sénégal'),
    ('SO', 'Somalia Somalie'),
    ('SR', 'Suriname'),
    ('SS', 'South Sudan Soudan du Sud'),
    ('ST', 'São Tomé & Príncipe Sao Tomé-et-Principe'),
    ('SU', 'Russia Russie'),
    ('SV', 'El Salvador Salvador'),
    ('SX', 'Sint Maarten Saint-Martin (partie néerlandaise)'),
    ('SY', 'Syria Syrie'),
    ('SZ', 'Eswatini'),
    ('TA', 'Tristan da Cunha'),
    ('TC', 'Turks & Caicos Islands Îles Turques-et-Caïques'),
    ('TD', 'Chad Tchad'),
    ('TF', 'French Southern Territories Terres australes françaises'),
    ('TG', 'Togo'),
    ('TH', 'Thailand Thaïlande'),
    ('TJ', 'Tajikistan Tadjikistan'),
    ('TK', 'Tokelau'),
    ('TL', 'Timor-Leste Timor oriental'),
    ('TM', 'Turkmenistan Turkménistan'),
    ('TN', 'Tunisia Tunisie'),
    ('TO', 'Tonga'),
    ('TP', 'Timor-Leste Timor oriental'),
    ('TR', 'Türkiye Turquie'),
    ('TT', 'Trinidad & Tobago Trinité-et-Tobago'),
    ('TV', 'Tuvalu'),
    ('TW', 'Taiwan Taïwan'),
    ('TZ', 'Tanzania Tanzanie'),
    ('UA', 'Ukraine'),
    ('UG', 'Uganda Ouganda'),
    ('UK', 'United Kingdom Royaume-Uni'),
    ('UM', 'U.S. Outlying Islands Îles mineures éloignées des États-Unis'),
    ('US', 'United States États-Unis'),
    ('UY', 'Uruguay'),
    ('UZ', 'Uzbekistan Ouzbékistan'),
    ('VA', 'Vatican City État de la Cité du Vatican'),
    ('VC', 'St. Vincent & Grenadines Saint-Vincent-et-les Grenadines'),
    ('VD', 'Vietnam Viêt Nam'),
    ('VE', 'Venezuela'),
    ('VG', 'British Virgin Islands Îles Vierges britanniques'),
    ('VI', 'U.S. Virgin Islands Îles Vierges des États-Unis'),
    ('VN', 'Vietnam Viêt Nam'),
    ('VU', 'Vanuatu'),
    ('WF', 'Wallis & Futuna Wallis-et-Futuna'),
    ('WS', 'Samoa'),
    ('XK', 'Kosovo'),
    ('YD', 'Yemen Yémen'),
    ('YE', 'Yemen Yémen'),
    ('YT', 'Mayotte'),
    ('YU', 'Serbia Serbie'),
    ('ZA', 'South Africa Afrique du Sud'),
    ('ZM', 'Zambia Zambie'),
    ('ZR', 'Congo - Kinshasa Congo-Kinshasa'),
    ('ZW', 'Zimbabwe')
)
SELECT
  'game' AS kind,
  g.id AS record_id,
  g.name AS name,
  (SELECT group_concat(o.name, ' ') FROM game_organizations go
    JOIN organizations o ON o.id = go.organization_id
    WHERE go.game_id = g.id AND o.deleted_at IS NULL) AS related,
  NULL AS place,
  (SELECT group_concat(t.name, ' ') FROM game_tags gt
    JOIN tags t ON t.id = gt.tag_id
    WHERE gt.game_id = g.id) AS tags,
  g.about AS about
FROM games g
WHERE g.deleted_at IS NULL
UNION ALL
SELECT
  o.type,
  o.id,
  o.name,
  (SELECT group_concat(g.name, ' ') FROM game_organizations go
    JOIN games g ON g.id = go.game_id
    WHERE go.organization_id = o.id AND g.deleted_at IS NULL),
  trim(coalesce(o.city, '') || ' ' || coalesce(o.region, '') || ' ' ||
    coalesce((SELECT names FROM countries WHERE code = o.country_code), '')),
  NULL,
  o.about
FROM organizations o
WHERE o.deleted_at IS NULL
UNION ALL
SELECT
  'event',
  e.id,
  e.name,
  trim(coalesce((SELECT group_concat(g.name, ' ') FROM game_events ge
      JOIN games g ON g.id = ge.game_id
      WHERE ge.event_id = e.id AND g.deleted_at IS NULL), '') || ' ' ||
    coalesce((SELECT group_concat(o.name, ' ') FROM organization_events oe
      JOIN organizations o ON o.id = oe.organization_id
      WHERE oe.event_id = e.id AND o.deleted_at IS NULL), '')),
  trim(coalesce(e.city, '') || ' ' || coalesce(e.region, '') || ' ' ||
    coalesce((SELECT names FROM countries WHERE code = e.country_code), '')),
  NULL,
  e.about
FROM events e
WHERE e.deleted_at IS NULL;
--> statement-breakpoint
CREATE TRIGGER games_search_insert AFTER INSERT ON games
BEGIN
  DELETE FROM search_index WHERE record_id IN (NEW.id);
  INSERT INTO search_index (kind, record_id, name, related, place, tags, about)
    SELECT * FROM search_documents WHERE record_id IN (NEW.id);
END;
--> statement-breakpoint
CREATE TRIGGER games_search_update AFTER UPDATE OF name, about, deleted_at ON games
BEGIN
  DELETE FROM search_index WHERE record_id IN (NEW.id);
  INSERT INTO search_index (kind, record_id, name, related, place, tags, about)
    SELECT * FROM search_documents WHERE record_id IN (NEW.id);
  DELETE FROM search_index WHERE record_id IN (SELECT organization_id FROM game_organizations WHERE game_id = NEW.id);
  INSERT INTO search_index (kind, record_id, name, related, place, tags, about)
    SELECT * FROM search_documents WHERE record_id IN (SELECT organization_id FROM game_organizations WHERE game_id = NEW.id);
  DELETE FROM search_index WHERE record_id IN (SELECT event_id FROM game_events WHERE game_id = NEW.id);
  INSERT INTO search_index (kind, record_id, name, related, place, tags, about)
    SELECT * FROM search_documents WHERE record_id IN (SELECT event_id FROM game_events WHERE game_id = NEW.id);
END;
--> statement-breakpoint
CREATE TRIGGER games_search_delete AFTER DELETE ON games
BEGIN
  DELETE FROM search_index WHERE record_id = OLD.id;
END;
--> statement-breakpoint
CREATE TRIGGER organizations_search_insert AFTER INSERT ON organizations
BEGIN
  DELETE FROM search_index WHERE record_id IN (NEW.id);
  INSERT INTO search_index (kind, record_id, name, related, place, tags, about)
    SELECT * FROM search_documents WHERE record_id IN (NEW.id);
END;
--> statement-breakpoint
CREATE TRIGGER organizations_search_update AFTER UPDATE OF type, name, about, city, region, country_code, deleted_at ON organizations
BEGIN
  DELETE FROM search_index WHERE record_id IN (NEW.id);
  INSERT INTO search_index (kind, record_id, name, related, place, tags, about)
    SELECT * FROM search_documents WHERE record_id IN (NEW.id);
  DELETE FROM search_index WHERE record_id IN (SELECT game_id FROM game_organizations WHERE organization_id = NEW.id);
  INSERT INTO search_index (kind, record_id, name, related, place, tags, about)
    SELECT * FROM search_documents WHERE record_id IN (SELECT game_id FROM game_organizations WHERE organization_id = NEW.id);
  DELETE FROM search_index WHERE record_id IN (SELECT event_id FROM organization_events WHERE organization_id = NEW.id);
  INSERT INTO search_index (kind, record_id, name, related, place, tags, about)
    SELECT * FROM search_documents WHERE record_id IN (SELECT event_id FROM organization_events WHERE organization_id = NEW.id);
END;
--> statement-breakpoint
CREATE TRIGGER organizations_search_delete AFTER DELETE ON organizations
BEGIN
  DELETE FROM search_index WHERE record_id = OLD.id;
END;
--> statement-breakpoint
CREATE TRIGGER events_search_insert AFTER INSERT ON events
BEGIN
  DELETE FROM search_index WHERE record_id IN (NEW.id);
  INSERT INTO search_index (kind, record_id, name, related, place, tags, about)
    SELECT * FROM search_documents WHERE record_id IN (NEW.id);
END;
--> statement-breakpoint
CREATE TRIGGER events_search_update AFTER UPDATE OF name, about, city, region, country_code, deleted_at ON events
BEGIN
  DELETE FROM search_index WHERE record_id IN (NEW.id);
  INSERT INTO search_index (kind, record_id, name, related, place, tags, about)
    SELECT * FROM search_documents WHERE record_id IN (NEW.id);
END;
--> statement-breakpoint
CREATE TRIGGER events_search_delete AFTER DELETE ON events
BEGIN
  DELETE FROM search_index WHERE record_id = OLD.id;
END;
--> statement-breakpoint
CREATE TRIGGER game_organizations_search_insert AFTER INSERT ON game_organizations
BEGIN
  DELETE FROM search_index WHERE record_id IN (NEW.game_id, NEW.organization_id);
  INSERT INTO search_index (kind, record_id, name, related, place, tags, about)
    SELECT * FROM search_documents WHERE record_id IN (NEW.game_id, NEW.organization_id);
END;
--> statement-breakpoint
CREATE TRIGGER game_organizations_search_delete AFTER DELETE ON game_organizations
BEGIN
  DELETE FROM search_index WHERE record_id IN (OLD.game_id, OLD.organization_id);
  INSERT INTO search_index (kind, record_id, name, related, place, tags, about)
    SELECT * FROM search_documents WHERE record_id IN (OLD.game_id, OLD.organization_id);
END;
--> statement-breakpoint
CREATE TRIGGER game_tags_search_insert AFTER INSERT ON game_tags
BEGIN
  DELETE FROM search_index WHERE record_id IN (NEW.game_id);
  INSERT INTO search_index (kind, record_id, name, related, place, tags, about)
    SELECT * FROM search_documents WHERE record_id IN (NEW.game_id);
END;
--> statement-breakpoint
CREATE TRIGGER game_tags_search_delete AFTER DELETE ON game_tags
BEGIN
  DELETE FROM search_index WHERE record_id IN (OLD.game_id);
  INSERT INTO search_index (kind, record_id, name, related, place, tags, about)
    SELECT * FROM search_documents WHERE record_id IN (OLD.game_id);
END;
--> statement-breakpoint
CREATE TRIGGER tags_search_update AFTER UPDATE OF name ON tags
BEGIN
  DELETE FROM search_index WHERE record_id IN (SELECT game_id FROM game_tags WHERE tag_id = NEW.id);
  INSERT INTO search_index (kind, record_id, name, related, place, tags, about)
    SELECT * FROM search_documents WHERE record_id IN (SELECT game_id FROM game_tags WHERE tag_id = NEW.id);
END;
--> statement-breakpoint
CREATE TRIGGER game_events_search_insert AFTER INSERT ON game_events
BEGIN
  DELETE FROM search_index WHERE record_id IN (NEW.event_id);
  INSERT INTO search_index (kind, record_id, name, related, place, tags, about)
    SELECT * FROM search_documents WHERE record_id IN (NEW.event_id);
END;
--> statement-breakpoint
CREATE TRIGGER game_events_search_delete AFTER DELETE ON game_events
BEGIN
  DELETE FROM search_index WHERE record_id IN (OLD.event_id);
  INSERT INTO search_index (kind, record_id, name, related, place, tags, about)
    SELECT * FROM search_documents WHERE record_id IN (OLD.event_id);
END;
--> statement-breakpoint
CREATE TRIGGER organization_events_search_insert AFTER INSERT ON organization_events
BEGIN
  DELETE FROM search_index WHERE record_id IN (NEW.event_id);
  INSERT INTO search_index (kind, record_id, name, related, place, tags, about)
    SELECT * FROM search_documents WHERE record_id IN (NEW.event_id);
END;
--> statement-breakpoint
CREATE TRIGGER organization_events_search_delete AFTER DELETE ON organization_events
BEGIN
  DELETE FROM search_index WHERE record_id IN (OLD.event_id);
  INSERT INTO search_index (kind, record_id, name, related, place, tags, about)
    SELECT * FROM search_documents WHERE record_id IN (OLD.event_id);
END;
