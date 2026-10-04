// Spike: the tables the game page reads, in Drizzle's SQLite schema.
import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

const ts = (name) => integer(name, { mode: 'timestamp_ms' });

export const image = sqliteTable('image', { id: text('id').primaryKey(), image_file: text('image_file', { mode: 'json' }), created_at: ts('created_at'), updated_at: ts('updated_at') });
export const location = sqliteTable('location', { id: text('id').primaryKey(), city: text('city'), region: text('region'), country_code: text('country_code'), latitude: integer('latitude'), longitude: integer('longitude') });
export const tag = sqliteTable('tag', { id: text('id').primaryKey(), name: text('name').notNull().unique() });
export const game = sqliteTable('game', { id: text('id').primaryKey(), name: text('name').notNull(), about: text('about'), site: text('site'), igdb_slug: text('igdb_slug'), deleted: integer('deleted', { mode: 'boolean' }).default(false), created_at: ts('created_at'), updated_at: ts('updated_at') });
export const entity = sqliteTable('entity', { id: text('id').primaryKey(), type: text('type', { enum: ['studio', 'association'] }), name: text('name').notNull(), about: text('about'), logo_id: text('logo_id'), location_id: text('location_id') });
export const event = sqliteTable('event', { id: text('id').primaryKey(), name: text('name').notNull(), starts_at: ts('starts_at'), ends_at: ts('ends_at'), cover_id: text('cover_id'), location_id: text('location_id') });
export const game_tag = sqliteTable('game_tag', { game_id: text('game_id'), tag_id: text('tag_id') }, (t) => [primaryKey({ columns: [t.game_id, t.tag_id] })]);
export const game_image = sqliteTable('game_image', { game_id: text('game_id'), image_id: text('image_id') }, (t) => [primaryKey({ columns: [t.game_id, t.image_id] })]);
export const game_entity = sqliteTable('game_entity', { game_id: text('game_id'), entity_id: text('entity_id'), role: text('role') }, (t) => [primaryKey({ columns: [t.game_id, t.entity_id] })]);
export const game_event = sqliteTable('game_event', { game_id: text('game_id'), event_id: text('event_id') }, (t) => [primaryKey({ columns: [t.game_id, t.event_id] })]);

export const gameRelations = relations(game, ({ many }) => ({ game_tag: many(game_tag), game_image: many(game_image), game_entity: many(game_entity), game_event: many(game_event) }));
export const gameTagRelations = relations(game_tag, ({ one }) => ({ game: one(game, { fields: [game_tag.game_id], references: [game.id] }), tag: one(tag, { fields: [game_tag.tag_id], references: [tag.id] }) }));
export const gameImageRelations = relations(game_image, ({ one }) => ({ game: one(game, { fields: [game_image.game_id], references: [game.id] }), image: one(image, { fields: [game_image.image_id], references: [image.id] }) }));
export const gameEntityRelations = relations(game_entity, ({ one }) => ({ game: one(game, { fields: [game_entity.game_id], references: [game.id] }), entity: one(entity, { fields: [game_entity.entity_id], references: [entity.id] }) }));
export const gameEventRelations = relations(game_event, ({ one }) => ({ game: one(game, { fields: [game_event.game_id], references: [game.id] }), event: one(event, { fields: [game_event.event_id], references: [event.id] }) }));
export const entityRelations = relations(entity, ({ one }) => ({ logo: one(image, { fields: [entity.logo_id], references: [image.id] }), location: one(location, { fields: [entity.location_id], references: [location.id] }) }));
export const eventRelations = relations(event, ({ one }) => ({ cover: one(image, { fields: [event.cover_id], references: [image.id] }), location: one(location, { fields: [event.location_id], references: [location.id] }) }));
