# Project Shift – History

## Základ projektu

Project Shift vzniká jako malá logická hra. Cílem je budovat funkční, rychlý a udržitelný prototyp, nikoli jednorázový experiment.

## Dosavadní rozhodnutí

- Hrací plocha má velikost 5 × 5.
- Tah posouvá celý řádek o jedno pole doprava nebo celý sloupec o jedno pole dolů.
- Kliknutí posouvá řádek; Shift + kliknutí posouvá sloupec.
- Základní movement systém je uzavřený a potvrzený.
- Kombinace budeme hledat vodorovně i svisle.
- Kombinaci tvoří alespoň tři stejné kameny v souvislé řadě; hranici v testovací fázi ověříme a případně upravíme.
- Kameny z nalezené kombinace se v prvním prototypu nahradí náhodnými novými barvami. Fyziku pádu zatím nepřidáváme.
- Vyhodnocujeme pouze kombinaci vzniklou hráčovým tahem. Nově doplněné kameny zatím řetězové kombinace nespouštějí.
- Další mechaniky přidáváme po malých krocích, vždy s jasným účelem pro hráče.

## Vývojový způsob

Projekt používá Git a GitHub. Kód nepřidáváme ve velkých celcích: nejdřív si ujasníme mechaniku, pak připravíme malou změnu, vysvětlíme ji, otestujeme a až poté pokračujeme.
