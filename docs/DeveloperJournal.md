# Project Shift – Developer Journal

## 5.–11. 7. 2026

- Založena struktura projektu a první deska 5×5.
- Implementován původní posun řádků a sloupců.
- Ověřena detekce vodorovných a svislých kombinací.
- Doplněno společné mazání, gravitace a animace pádu.
- Přidán debug panel a reset desky.

## 12.–14. 7. 2026

- Původní posun byl nahrazen vkládáním kamenů z hran.
- Po kombinacích zůstávají prázdná pole bez náhodného doplňování.
- Doplněny kaskády, střídání dvou hráčů a příchozí fronty.
- Vznikla Laboratoř pro desky 4×4 až 6×6, různé počty typů a rychlosti animací.
- Testovány varianty s 5, 7 a 9 typy kamenů.

## 15. 7. 2026

- Přidán převod skóre mezi hráči a stav vítězství.
- Rozšířen testovací rozsah až na 15 typů; kameny dostaly symboly.
- Ovládání samostatnými šipkami bylo nahrazeno tažením krajního kamene.
- Přidána volitelná společná fronta, vkládání odspodu a nastavení velikosti front.
- Repozitář byl stažen z GitHubu a jeho současná logika prošla 21 614 automatickými kontrolami bez nalezené chyby.
- Náhodná simulace ukázala, že výchozích 15 typů vytváří kombinace příliš zřídka; tato hodnota zůstává jen laboratorním extrémem.
- Výchozí test byl změněn na desku 5×5 a 10 typů kamenů.
- Obnoveny a sjednoceny projektové dokumenty odstraněné v dřívějším commitu.

## Další krok

Odehrát nejméně pět řízených partií na iPhonu 13 mini s výchozí variantou 5×5 / 10 typů a zapsat délku, počet tahů, problémy s tažením a čitelnost.
