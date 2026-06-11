update public.cards
set
  name = 'Grünes Herz',
  description = '+18 Leben.'
where id = 'green-heart';

update public.cards
set name = 'Glücksstern'
where id = 'lucky-star';

update public.cards
set description = 'Fügt in Runde 1 Extraschaden zu.'
where id = 'opening-boom';

update public.cards
set description = 'Heilt einmalig, wenn das Emoji unter 35% Leben fällt.'
where id = 'panic-snack';

update public.characters
set name = 'Küken'
where id = 'b1000001-0000-4000-8000-000000000001';

update public.characters
set name = 'Löwi'
where id = 'b1000006-0000-4000-8000-000000000006';
