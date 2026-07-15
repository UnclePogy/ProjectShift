# Project Shift – History

## Začátek projektu

Project Shift vznikl jako jednoduchý prototyp logické hry na desce 5×5. První verze posouvala celé řádky a sloupce kliknutím. Tento systém posloužil k ověření mřížky a detekce kombinací, ale později byl nahrazen vkládáním kamenů z hran.

## Vývoj základní mechaniky

Postupně byly doplněny:

- vodorovné a svislé kombinace tří a více kamenů;
- společné odstranění nalezených polí;
- gravitace a animovaný pád;
- kaskády;
- prázdná pole bez náhodného doplňování;
- vkládání zleva, zprava a shora;
- střídání dvou hráčů a samostatné příchozí fronty;
- převod skóre mezi hráči a konec partie.

## Laboratoř

Protože nebylo rozumné rozhodovat velikost desky, počet kamenů a tempo pouze pocitem, vznikla Laboratoř. Umožňuje rychle měnit testovací konfiguraci bez přepisování kódu.

Během testů se vystřídaly například varianty:

- 4×4 s 5 typy;
- 4×4 se 7 nebo 9 typy;
- extrémní test až s 15 typy;
- různé délky fronty a animací;
- samostatná a společná fronta;
- volitelné vkládání odspodu.

Přítomnost varianty v Laboratoři neznamená její schválení pro finální hru.

## Změna ovládání

Samostatné vstupní šipky byly odstraněny. Aktuální prototyp zahajuje tah tažením krajního kamene směrem dovnitř. Cílem je zvětšit herní prvky na malém telefonu a omezit vizuální nepořádek kolem desky.

## Aktuální stav – 15. 7. 2026

Výchozí testovací konfigurace je deska 5×5 s 10 typy kamenů. Hra je funkční jako lokální prototyp pro dva střídající se hráče. Probíhá ověřování čitelnosti, ovládání a délky partie; finální pravidla zatím nejsou uzavřena.

Při kontrole GitHubu bylo zjištěno, že commit `7e8c7b9` odstranil několik projektových dokumentů a zbývající dokumentace si odporovala. Dokumenty byly proto obnoveny a sjednoceny s aktuálním kódem před pokračováním další mechanikou.
