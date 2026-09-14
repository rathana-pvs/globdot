INSERT OR IGNORE INTO editorial_users (id, auth_id, email, display_name, role) VALUES
  (1, 'globdot-system', 'editor@globdot.com', 'Globdot Editorial Desk', 'administrator'),
  (2, 'local-preview-editor', 'seedy@sites.test', 'Local Preview Editor', 'administrator');

INSERT OR IGNORE INTO authors (id, slug, name, role_title, bio) VALUES
  (1, 'maya-chen', 'Maya Chen', 'Global Affairs Editor', 'Maya reports on diplomacy, alliances and the changing balance of power.'),
  (2, 'daniel-okafor', 'Daniel Okafor', 'Technology Correspondent', 'Daniel covers digital infrastructure, artificial intelligence and public policy.'),
  (3, 'sofia-reyes', 'Sofia Reyes', 'Climate Correspondent', 'Sofia reports on climate adaptation, energy and cities.'),
  (4, 'globdot-desk', 'Globdot News Desk', 'Newsroom', 'Breaking news and verified updates from Globdot editors worldwide.');

INSERT OR IGNORE INTO sections (id, slug, name, description, color, sort_order) VALUES
  (1, 'world', 'World', 'Events, diplomacy and ideas shaping the world.', '#2457ff', 10),
  (2, 'politics', 'Politics', 'Power, elections and public institutions.', '#6f42c1', 20),
  (3, 'business', 'Business', 'Markets, companies and the global economy.', '#11795b', 30),
  (4, 'technology', 'Technology', 'Technology, science and digital power.', '#2457ff', 40),
  (5, 'climate', 'Climate', 'Climate, energy and a changing planet.', '#16835f', 50),
  (6, 'culture', 'Culture', 'Arts, identity and the way we live.', '#b64077', 60),
  (7, 'security', 'Conflict & Security', 'Conflict, defense and human security.', '#c33a31', 70),
  (8, 'analysis', 'Analysis', 'Context and expert interpretation.', '#9a6500', 80),
  (9, 'video', 'Video', 'Visual reporting and documentaries.', '#101318', 90);

INSERT OR IGNORE INTO regions (id, slug, name, sort_order) VALUES
  (1, 'africa', 'Africa', 10), (2, 'americas', 'Americas', 20),
  (3, 'asia', 'Asia', 30), (4, 'europe', 'Europe', 40),
  (5, 'middle-east', 'Middle East', 50), (6, 'oceania', 'Oceania', 60);

INSERT OR IGNORE INTO topics (id, slug, name) VALUES
  (1, 'global-order', 'Global order'), (2, 'digital-infrastructure', 'Digital infrastructure'),
  (3, 'urban-heat', 'Urban heat'), (4, 'elections', 'Elections'),
  (5, 'interest-rates', 'Interest rates'), (6, 'cultural-heritage', 'Cultural heritage');

INSERT OR IGNORE INTO articles
  (id, slug, title, standfirst, body_json, status, story_type, section_id, created_by_id, is_breaking, is_featured, homepage_slot, read_time_minutes, dateline, key_points_json, published_at)
VALUES
  (1, 'new-world-order-negotiated-real-time', 'A new world order is being negotiated in real time', 'Alliances are shifting, economic blocs are hardening and middle powers are demanding a larger voice.', '{"paragraphs":["The world’s diplomatic architecture is changing through dozens of negotiations rather than a single dramatic break. Governments are recalculating which partnerships offer security, market access and technological independence.","Middle powers have become decisive. Countries that once aligned predictably with one bloc are now building overlapping relationships, choosing different partners for defense, energy, trade and digital infrastructure.","The result is not a simple return to rival camps. It is a denser and less predictable system in which regional organizations, private technology companies and commodity producers can shape outcomes once reserved for major capitals.","For citizens, these shifts will be felt through prices, migration rules, energy security and the technology available in everyday life. The negotiations may appear distant, but their consequences will be local."],"version":1}', 'published', 'analysis', 1, 1, 1, 1, 'lead', 8, 'WASHINGTON', '["Middle powers are gaining influence","Economic and security alliances are separating","Global decisions will increasingly have local consequences"]', '2026-09-14T06:30:00Z'),
  (2, 'race-resilient-global-internet', 'The quiet race to build a more resilient global internet', 'New routes, new satellites and a fresh contest over who controls the world’s connections.', '{"paragraphs":["Governments and network operators are investing in new undersea cables, low-orbit satellites and regional data centers after years of disruption exposed fragile digital routes.","Resilience is only part of the story. The owners of this infrastructure can influence cost, access and the rules governing how information crosses borders.","Engineers argue that redundancy makes the internet safer. Policy experts warn that a more divided physical network could accelerate political fragmentation online."],"version":1}', 'published', 'explainer', 4, 1, 0, 1, 'secondary', 5, 'SINGAPORE', '["Infrastructure ownership is becoming strategic","New routes reduce single points of failure","Resilience and fragmentation may grow together"]', '2026-09-14T05:55:00Z'),
  (3, 'cities-redesign-streets-extreme-heat', 'Cities are redesigning streets for an era of extreme heat', 'From shade corridors to reflective roads, local experiments are becoming national policy.', '{"paragraphs":["City planners are treating extreme heat as a design problem, combining trees, shade structures, water access and reflective materials to cool the places where people walk and wait.","The most effective projects begin in neighborhoods with the fewest trees and the greatest health risks. Researchers say small design changes can reduce exposure during the hottest hours.","National governments are now studying those local experiments as they prepare standards for schools, transit systems and public housing."],"version":1}', 'published', 'news', 5, 1, 0, 1, 'secondary', 5, 'MADRID', '["Heat adaptation is moving into street design","Vulnerable neighborhoods are being prioritized","Local trials are informing national standards"]', '2026-09-14T05:20:00Z'),
  (4, 'coalition-talks-decisive-week', 'Coalition talks enter a decisive week after a fragmented vote', 'Party leaders face a narrowing path to government after voters delivered no clear majority.', '{"paragraphs":["Negotiators returned to parliament with three possible coalitions still on the table and sharp disagreements over budgets, migration and constitutional reform.","The president has asked party leaders to demonstrate a stable majority before the end of the week. Another election remains possible if the talks fail."],"version":1}', 'published', 'news', 2, 1, 0, 0, NULL, 4, 'BRUSSELS', '[]', '2026-09-14T04:42:00Z'),
  (5, 'markets-rate-cuts-slower-growth', 'Markets weigh a new cycle of rate cuts and slower growth', 'Investors welcomed softer inflation while questioning what weaker demand signals for jobs and company earnings.', '{"paragraphs":["Bond markets moved after new inflation data strengthened expectations that major central banks could reduce borrowing costs.","Equity investors were more cautious. Lower rates may support valuations, but the economic reports also showed slower hiring and softer consumer demand."],"version":1}', 'published', 'analysis', 3, 1, 0, 0, NULL, 4, 'LONDON', '[]', '2026-09-14T04:18:00Z'),
  (6, 'museums-returning-contested-objects', 'The museums returning contested objects—and rewriting their labels', 'Restitution agreements are changing collections, relationships and the stories museums tell about acquisition.', '{"paragraphs":["A new generation of restitution agreements goes beyond transferring ownership. Museums and communities are negotiating research access, long-term loans and shared authority over how objects are described.","Curators say rewritten labels can reveal the people and power structures omitted from older accounts, even when an object remains in the same gallery."],"version":1}', 'published', 'news', 6, 1, 0, 0, NULL, 5, 'LONDON', '[]', '2026-09-14T03:55:00Z'),
  (7, 'regional-trade-corridor-opens', 'A regional trade corridor opens with ambitious promises and difficult questions', 'The route could cut delivery times, but border systems and local infrastructure will determine who benefits.', '{"paragraphs":["The first freight convoy completed the new route after years of negotiations among customs agencies, port operators and regional governments.","Businesses expect faster deliveries, while communities along the corridor want firm commitments on jobs, safety and environmental protection."],"version":1}', 'published', 'news', 3, 1, 0, 0, NULL, 4, 'NAIROBI', '[]', '2026-09-14T03:15:00Z'),
  (8, 'ceasefire-talks-humanitarian-access', 'Ceasefire talks focus on humanitarian access as mediators narrow the gaps', 'Negotiators report progress on aid deliveries while the most difficult security guarantees remain unresolved.', '{"paragraphs":["Mediators said the latest round produced a working proposal for aid routes and medical evacuations, though no final agreement has been signed.","Families displaced by the fighting remain cautious after earlier pauses collapsed. Relief agencies say access must be predictable rather than negotiated convoy by convoy."],"version":1}', 'published', 'news', 7, 1, 0, 0, NULL, 4, 'GENEVA', '[]', '2026-09-14T02:40:00Z');

INSERT OR IGNORE INTO article_authors (article_id, author_id, position) VALUES
  (1,1,0),(2,2,0),(3,3,0),(4,4,0),(5,4,0),(6,4,0),(7,4,0),(8,4,0);
INSERT OR IGNORE INTO article_regions (article_id, region_id, is_primary) VALUES
  (1,2,1),(1,4,0),(1,3,0),(2,3,1),(3,4,1),(4,4,1),(5,4,1),(6,4,1),(7,1,1),(8,5,1);
INSERT OR IGNORE INTO article_topics (article_id, topic_id) VALUES (1,1),(2,2),(3,3),(4,4),(5,5),(6,6);

INSERT OR IGNORE INTO live_blogs (id, slug, title, summary, status, section_id, created_by_id, started_at) VALUES
  (1, 'global-diplomacy-summit', 'Global diplomacy summit: leaders meet for emergency talks', 'Verified updates and analysis from our correspondents as negotiations develop.', 'live', 1, 1, '2026-09-14T05:00:00Z');
INSERT OR IGNORE INTO live_updates (id, live_blog_id, author_id, headline, body_json, is_pinned, published_at) VALUES
  (1,1,4,'Opening session concludes','{"paragraphs":["Delegations have left the opening session. Negotiators are expected to resume in smaller working groups focused on security and trade."],"version":1}',1,'2026-09-14T07:05:00Z'),
  (2,1,1,'What to watch in the next round','{"paragraphs":["The central question is whether leaders can agree on a timetable before discussing enforcement. Several delegations want the two issues negotiated together."],"version":1}',0,'2026-09-14T06:28:00Z'),
  (3,1,4,'Draft communiqué circulates','{"paragraphs":["A preliminary text calls for continued talks and immediate humanitarian coordination. It does not yet include binding commitments."],"version":1}',0,'2026-09-14T05:44:00Z');

INSERT OR IGNORE INTO navigation_items (label, href, location, sort_order) VALUES
  ('World','/section/world','primary',10),('Politics','/section/politics','primary',20),('Business','/section/business','primary',30),
  ('Technology','/section/technology','primary',40),('Climate','/section/climate','primary',50),('Culture','/section/culture','primary',60),
  ('Security','/section/security','primary',70),('Analysis','/section/analysis','primary',80),('Video','/section/video','primary',90);

PRAGMA optimize;
