# Changelog

## v0.5.0

- Přidáno skóre reprezentované 14 přesouvatelnými ikonami, po 7 na každé straně.
- Kombinace 3/4/5 převádí 1/2/3 ikony; započítávají se i kaskády.
- Po získání všech ikon se zobrazí vítěz bez automatického restartu.
- Zobrazení skóre lze v Laboratoři okamžitě skrýt nebo zobrazit.
- Příchozí kameny ve frontě mají stejnou velikost jako kameny na desce.
- Laboratoř nově nabízí animace 100, 250, 500, 1000 a 1500 ms.
- CSS animace používají stejnou délku jako herní časování.

## v0.4.0

- Přidána Laboratoř v debug panelu.
- Lze testovat desky 4×4, 5×5 a 6×6.
- Lze měnit 4 až 7 typů kamenů.
- Lze měnit délku fronty na 1, 3 nebo 5 kamenů.
- Rychlost animací lze přepínat mezi 100, 250 a 500 ms.
- Horní vkládání lze zapnout nebo vypnout během hry.
- Změny rozměru, symbolů a fronty se použijí tlačítkem „Použít a resetovat“.

## v0.3.2

- Změněna hrací deska z 5×5 na 4×4.
- Počet typů kamenů vrácen ze 7 na 5 kvůli lepší barevné čitelnosti.
- Zachováno střídání hráčů, samostatné fronty a vkládání zleva, zprava a shora.

Všechny významné změny projektu Project Shift budou zaznamenány v tomto souboru.

Formát vychází z principů Keep a Changelog.

## [Unreleased]

### Added

- Střídání dvou hráčů po dokončení celého tahu včetně kaskád.
- Samostatná fronta tří viditelných příchozích kamenů pro každého hráče.
- Zvýraznění aktivního hráče a aktuálního kamene.

### Changed

- Počet typů kamenů byl pro test zvýšen z 5 na 7.
- Barva vstupních šipek se řídí aktuálním kamenem hráče na tahu.
- Debug reset obnoví desku, aktivního hráče i obě fronty kamenů.
