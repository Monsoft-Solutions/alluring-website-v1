-- #276: repair lead attribution already stored in contact_submission.
--
-- Run AFTER migration 0055 (it adds gbraid, wbraid, gad_campaign_id).
-- Every value comes from the lead's own landing_page URL, which was saved
-- verbatim, so nothing is invented:
--   1. Google click ids (gclid/gbraid/wbraid) and gad_campaignid that the
--      old sanitizer threw away because utm_medium held unexpanded tokens.
--   2. utm_* values holding tokens the ad platform never expanded: Google's
--      `cpc{ifvideo:video}{ifshopping:shopping}`, `{campaignname}`, and
--      Meta's `{{site_source_name}}`, `{{adset.name}}`.
-- fbclid is NOT restored: dropping organic Instagram fbclids is intended.
-- CRM/N8N copies are not touched; they keep what was sent at the time.
--
-- Idempotent: only fills NULLs and only strips `{...}` / `{{...}}` tokens.

BEGIN;

-- 1. Click ids and campaign id from the landing URL (first occurrence).
UPDATE contact_submission
SET gclid = coalesce(gclid, substring(landing_page from '[?&]gclid=([^&#]+)')),
    gbraid = coalesce(gbraid, substring(landing_page from '[?&]gbraid=([^&#]+)')),
    wbraid = coalesce(wbraid, substring(landing_page from '[?&]wbraid=([^&#]+)')),
    gad_campaign_id = coalesce(gad_campaign_id, substring(landing_page from '[?&]gad_campaignid=([0-9]+)'))
WHERE landing_page ~ '[?&](gclid|gbraid|wbraid|gad_campaignid)='
  AND (
    (gclid IS NULL AND landing_page ~ '[?&]gclid=')
    OR (gbraid IS NULL AND landing_page ~ '[?&]gbraid=')
    OR (wbraid IS NULL AND landing_page ~ '[?&]wbraid=')
    OR (gad_campaign_id IS NULL AND landing_page ~ '[?&]gad_campaignid=')
  );

-- 2. Strip unexpanded tokens; an empty result becomes NULL.
UPDATE contact_submission
SET utm_source   = nullif(btrim(regexp_replace(utm_source,   '\{+[^{}]*\}+', '', 'g')), ''),
    utm_medium   = nullif(btrim(regexp_replace(utm_medium,   '\{+[^{}]*\}+', '', 'g')), ''),
    utm_campaign = nullif(btrim(regexp_replace(utm_campaign, '\{+[^{}]*\}+', '', 'g')), ''),
    utm_content  = nullif(btrim(regexp_replace(utm_content,  '\{+[^{}]*\}+', '', 'g')), ''),
    utm_term     = nullif(btrim(regexp_replace(utm_term,     '\{+[^{}]*\}+', '', 'g')), '')
WHERE concat_ws(' ', utm_source, utm_medium, utm_campaign, utm_content, utm_term) ~ '[{}]';

-- 2b. A medium that was only tokens: the URL's second, clean copy says cpc.
UPDATE contact_submission
SET utm_medium = 'cpc'
WHERE utm_medium IS NULL
  AND lower(utm_source) = 'google'
  AND landing_page ~ '[?&]utm_medium=cpc(&|$)';

-- Check before COMMIT.
SELECT count(*) FILTER (WHERE gclid IS NOT NULL)  AS gclid,
       count(*) FILTER (WHERE gbraid IS NOT NULL) AS gbraid,
       count(*) FILTER (WHERE wbraid IS NOT NULL) AS wbraid,
       count(*) FILTER (WHERE gad_campaign_id IS NOT NULL) AS gad_campaign_id,
       count(*) FILTER (WHERE concat_ws(' ', utm_source, utm_medium, utm_campaign, utm_content, utm_term) ~ '\{') AS still_tokens
FROM contact_submission;

COMMIT;
