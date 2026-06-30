-- Seed the 10 products shown in the storefront.
-- slug values match the data-add="<slug>" hooks in app/storefront-body.html.
insert into public.products (slug, name, description, price_cents, category, badge, fitment, sort) values
  ('ambient-strip-kit',    'Interior Ambient Strip Kit',        '16M colour, app + music sync. 5-min peel-and-stick install, any car.',                  3899,  'lighting',     'Hot',        'Universal',                0),
  ('radar-detector',       'Long-Range Radar Detector',         '360° detection, GPS auto-learn, OLED display. All Canadian bands.',                     7999,  'electronics',  'Bestseller', 'Universal',                1),
  ('wireless-carplay',     'Wireless CarPlay + Android Auto',   'One dongle converts any wired OEM system. Pair once, auto-connects every drive.',       5999,  'connectivity', 'Top Pick',   'Any wired OEM system',     2),
  ('ambient-door-panel',   'OEM Ambient Light Door Panel',      'Full replacement panel with integrated gradient LED. Looks completely factory-fitted.', 24999, 'lighting',     'Upgrade',    'BMW · Audi · Mercedes',    3),
  ('smart-display-fob',    'Universal Smart Display Fob',       'Internal module swap for any OEM remote. OLED touchscreen, custom logo engraving.',      9999,  'keys',         'New',        'Any OEM remote',           4),
  ('puddle-projectors',    'Animated Puddle Light Projectors',  'AMG One, M Power, Porsche or custom moving logo projection on ground.',                  6499,  'lighting',     'New',        'Universal · per pair',     5),
  ('bmw-display-key',      'BMW OLED Display Key',              'G20 / G80 / G82 series. Live screen shows lock status, battery, animations.',           12999, 'keys',         'Premium',    'G20 / G80 / G82',          6),
  ('m4cs-taillights',      'M4 CS Style Taillights',            'CSL laser-look sequential taillights for M3 G80 / 3 Series G20. Plug & play.',          69999, 'exterior',     'Exclusive',  'M3 G80 / 3 Series G20',    7),
  ('taillights-g20',       'CSL Laser Style Taillights — 3 Series G20', 'Matching CSL look, full LED, direct fit for the 3 Series G20.',                 64999, 'exterior',     null,         '3 Series G20',             8),
  ('mercedes-display-key', 'Mercedes Display Smart Key',        'Touchscreen fob with ambient-matched LED ring. C / E / S / GLE class.',                 13999, 'keys',         null,         'C / E / S / GLE class',    9)
on conflict (slug) do nothing;
