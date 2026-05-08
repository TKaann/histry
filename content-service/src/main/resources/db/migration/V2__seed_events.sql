-- V2__seed_events.sql
-- Seed data: 7 günlük örnek olay (2026 yılı için etiketlenmiş)
-- display_date = ne zaman gösterilecek | event_year = tarihsel yıl (tahmin oyununun cevabı)

INSERT INTO events (id, display_date, event_year, location_name, latitude, longitude)
VALUES
  ('a1000000-0000-0000-0000-000000000001', '2026-01-01', 1804, 'Port-au-Prince, Haiti',            18.5392, -72.3352),
  ('a1000000-0000-0000-0000-000000000002', '2026-02-14', 1876, 'Boston, Massachusetts, USA',       42.3601, -71.0589),
  ('a1000000-0000-0000-0000-000000000003', '2026-03-12', 1930, 'Ahmedabad, Hindistan',             23.0225,  72.5714),
  ('a1000000-0000-0000-0000-000000000004', '2026-05-06', 1937, 'Lakehurst, New Jersey, USA',       40.0326, -74.3321),
  ('a1000000-0000-0000-0000-000000000005', '2026-07-20', 1969, 'Ay, Sakinlik Denizi',               0.6741,  23.4730),
  ('a1000000-0000-0000-0000-000000000006', '2026-10-29', 1923, 'Ankara, Türkiye',                  39.9334,  32.8597),
  ('a1000000-0000-0000-0000-000000000007', '2026-12-17', 1903, 'Kitty Hawk, North Carolina, USA',  36.0832, -75.7129);

-- Türkçe çeviriler
INSERT INTO event_translations (event_id, locale, title, description) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'tr',
   'Haiti Bağımsızlığını İlan Etti',
   'Haiti, Fransız sömürge yönetimine karşı sürdürdüğü ayaklanmanın ardından bağımsızlığını ilan etti ve tarihin ilk başarılı köle devriminin ürünü olarak dünyanın ilk siyahi cumhuriyeti haline geldi.'),

  ('a1000000-0000-0000-0000-000000000002', 'tr',
   'Alexander Graham Bell Telefon Patentini Aldı',
   'Alexander Graham Bell, telefon için patent başvurusunu yaptı ve birkaç saat sonra rakibi Elisha Gray da benzer bir başvuruda bulundu. Tarihin en tartışmalı patent yarışlarından biri olarak kabul edilen bu süreç, Bell''in adını iletişim tarihine yazdırdı.'),

  ('a1000000-0000-0000-0000-000000000003', 'tr',
   'Gandhi''nin Tuz Yürüyüşü Başladı',
   'Mahatma Gandhi, İngiliz tuz tekeline karşı protesto amacıyla Ahmedabad''dan Dandi sahiline doğru 388 kilometrelik yürüyüşe çıktı. Bu sivil itaatsizlik eylemi, Hindistan bağımsızlık hareketinin dönüm noktalarından biri oldu.'),

  ('a1000000-0000-0000-0000-000000000004', 'tr',
   'Hindenburg Felaketi',
   'Alman yolcu hava gemisi LZ 129 Hindenburg, New Jersey''deki Lakehurst Deniz Hava İstasyonu''na iniş yaparken alev aldı. 36 kişinin hayatını kaybettiği bu trajik olay, ticari zeplin uçuşlarının sonunu getirdi ve tarihsel bir dönüm noktası oldu.'),

  ('a1000000-0000-0000-0000-000000000005', 'tr',
   'İnsanlık İlk Kez Ay''a Ayak Bastı',
   'Apollo 11 misyonunun astronotu Neil Armstrong, Ay''ın yüzeyine ilk adımını atarak tarihe geçti. "Bu, bir insan için küçük bir adım ama insanlık için büyük bir sıçramadır" sözleriyle dünyaya seslendi. Buzz Aldrin da kısa süre sonra yüzeye indi.'),

  ('a1000000-0000-0000-0000-000000000006', 'tr',
   'Türkiye Cumhuriyeti İlan Edildi',
   'Türkiye Büyük Millet Meclisi, Osmanlı İmparatorluğu''nun ardından kurulan yeni devletin cumhuriyet olduğunu ilan etti. Mustafa Kemal Atatürk, Türkiye''nin ilk cumhurbaşkanı seçildi ve modern Türkiye''nin temelleri atıldı.'),

  ('a1000000-0000-0000-0000-000000000007', 'tr',
   'Wright Kardeşler İlk Motorlu Uçuşu Gerçekleştirdi',
   'Orville ve Wilbur Wright, Kuzey Carolina''nın Kitty Hawk kasabasında dünyanın ilk kontrollü, motorlu ve sürdürülebilir ağır hava aracı uçuşunu başarıyla tamamladı. Bu an, havacılık tarihinin başlangıç noktası kabul edilir.');

-- English translations
INSERT INTO event_translations (event_id, locale, title, description) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'en',
   'Haiti Declares Independence',
   'Haiti declared its independence following a successful slave rebellion against French colonial rule, becoming the first black republic and the first country born from a slave revolution in world history.'),

  ('a1000000-0000-0000-0000-000000000002', 'en',
   'Alexander Graham Bell Patents the Telephone',
   'Alexander Graham Bell filed his patent application for the telephone just hours before his rival Elisha Gray submitted a similar claim. Considered one of history''s most contested patent races, this moment etched Bell''s name into the history of communication.'),

  ('a1000000-0000-0000-0000-000000000003', 'en',
   'Gandhi''s Salt March Begins',
   'Mahatma Gandhi set out from Ahmedabad toward the Dandi coast on a 388-kilometer march to protest the British salt monopoly. This act of civil disobedience became one of the defining moments of the Indian independence movement.'),

  ('a1000000-0000-0000-0000-000000000004', 'en',
   'The Hindenburg Disaster',
   'The German passenger airship LZ 129 Hindenburg caught fire while attempting to dock at Lakehurst Naval Air Station in New Jersey. The crash killed 36 people and marked the end of the commercial airship era.'),

  ('a1000000-0000-0000-0000-000000000005', 'en',
   'Humanity Sets Foot on the Moon',
   'Apollo 11 astronaut Neil Armstrong became the first human to walk on the Moon''s surface. He famously declared, "That''s one small step for man, one giant leap for mankind." Buzz Aldrin followed shortly after.'),

  ('a1000000-0000-0000-0000-000000000006', 'en',
   'Republic of Turkey Proclaimed',
   'The Grand National Assembly of Turkey declared the new state a republic following the collapse of the Ottoman Empire. Mustafa Kemal Atatürk was elected as Turkey''s first president, laying the foundations of modern Turkey.'),

  ('a1000000-0000-0000-0000-000000000007', 'en',
   'Wright Brothers Complete First Powered Flight',
   'Orville and Wilbur Wright successfully completed the world''s first controlled, powered, and sustained heavier-than-air aircraft flight at Kitty Hawk, North Carolina. This moment marks the beginning of aviation history.');
