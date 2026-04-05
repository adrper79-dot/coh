-- Add product images for store (Harlem Renaissance & Black wellness aesthetic)
-- Run this after seeding initial products

BEGIN;

-- Update products with images (assuming they already exist from seed)
UPDATE products 
SET images = JSONB_BUILD_ARRAY(
  JSONB_BUILD_OBJECT(
    'url', '/images/products/cipher-workbook.jpg',
    'alt', 'The Cipher of Healing: A Workbook - Guided journal for trauma recovery',
    'isPrimary', true
  )
)
WHERE slug = 'cipher-healing-workbook';

UPDATE products 
SET images = JSONB_BUILD_ARRAY(
  JSONB_BUILD_OBJECT(
    'url', '/images/products/legacy-journal.jpg',
    'alt', 'The Legacy Letter: Guided Journal - Leather-bound reflection journal',
    'isPrimary', true
  )
)
WHERE slug = 'legacy-letter-journal';

UPDATE products 
SET images = JSONB_BUILD_ARRAY(
  JSONB_BUILD_OBJECT(
    'url', '/images/products/trigger-tracker.jpg',
    'alt', 'The Trigger Tracker: Mobile App - Real-time healing progress tracker',
    'isPrimary', true
  )
)
WHERE slug = 'trigger-tracker-app';

UPDATE products 
SET images = JSONB_BUILD_ARRAY(
  JSONB_BUILD_OBJECT(
    'url', '/images/products/resilience-bundle.jpg',
    'alt', '90-Day Resilience Challenge Bundle - Complete healing package',
    'isPrimary', true
  )
)
WHERE slug = 'resilience-bundle';

COMMIT;
