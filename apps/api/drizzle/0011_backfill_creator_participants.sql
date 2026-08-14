-- Creators now count toward max_participants and appear in the participant list,
-- so every existing event needs a participant row for its creator.
INSERT INTO "event_participants" ("event_id", "user_id", "status", "joined_at")
SELECT "e"."id", "e"."creator_id", 'confirmed', "e"."created_at"
FROM "events" "e"
WHERE NOT EXISTS (
  SELECT 1
  FROM "event_participants" "p"
  WHERE "p"."event_id" = "e"."id"
    AND "p"."user_id" = "e"."creator_id"
);
