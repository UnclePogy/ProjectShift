# Changelog

V tomto souboru jsou zaznamenány významné změny projektu Project Shift.

## Unreleased

### Přidáno

- Mobilní konfigurace viewportu a podpora safe area pro iPhone.
- Automatické sbalení Laboratoře na malém displeji.
- Kameny odlišené barvou i symbolem.
- Testovací rozsah 4 až 15 typů kamenů.
- Testovací nastavení 1 až 15 počátečních bodů.
- Volitelná společná fronta pro oba hráče.
- Výrazný centrální indikátor aktivního hráče.
- Tlačítko pro obnovení výchozího nastavení Laboratoře.
- Tažení krajního kamene směrem dovnitř desky bez samostatných vstupních šipek.
- Volitelný test vkládání odspodu.
- Nastavitelná velikost kamenů fronty, symbolů a rozestupů fronty.
- Obnovené a aktualizované dokumenty GDD, Constitution, Roadmap, TODO, History a Developer Journal.

### Změněno

- Výchozí testovací konfigurace používá desku 5×5 a 10 typů kamenů.
- Výchozí fronta obsahuje dvě položky a její kameny mají 110 % velikosti kamenů na desce.
- Deska na mobilu využívá větší část dostupné šířky.
- Laboratoř je připnutá ke spodní hraně obrazovky.
- Mazání kombinací a pády kamenů se spouštějí dávkově ve stejném animačním snímku.
- Dokumentace byla sjednocena se současnou mechanikou vkládání, prázdných polí, kaskád a skóre.

### Opraveno

- Počáteční deska se generuje bez hotových vodorovných nebo svislých kombinací tří a více kamenů.
- Během ovládání hry a Laboratoře se neoznačuje text ani neposouvá stránka.

## v0.5.0 – 15. 7. 2026

### Přidáno

- Skóre reprezentované 14 ikonami, po 7 na každé straně.
- Převod 1, 2 nebo 3 bodů za sestavu délky 3, 4 nebo 5.
- Bodování kaskád.
- Zobrazení vítěze bez automatického restartu.
- Možnost skrýt nebo zobrazit skóre v Laboratoři.
- Rychlosti animací 100, 250, 500, 1000 a 1500 ms.
- Jednotné časování animací v JavaScriptu a CSS.

## v0.4.0 – 14. 7. 2026

### Přidáno

- Laboratoř pro rychlé porovnávání herních variant.
- Desky 4×4, 5×5 a 6×6.
- Nastavitelný počet typů kamenů a délka fronty.
- Nastavitelná rychlost animací.
- Možnost zapnout nebo vypnout vkládání shora.
- Tlačítko **Použít a resetovat**.

## v0.3.2 – 14. 7. 2026

### Změněno

- Testovací deska změněna na 4×4 s pěti typy kamenů.
- Zachováno střídání hráčů, samostatné fronty a vkládání zleva, zprava a shora.

## v0.3.1 – 13. 7. 2026

### Přidáno

- Střídání dvou hráčů po dokončení tahu včetně kaskád.
- Samostatná fronta tří viditelných kamenů pro každého hráče.
- Zvýraznění aktivního hráče a aktuálního příchozího kamene.
- Reset desky, hráčů a front.

## v0.3.0 – 13. 7. 2026

### Přidáno

- Vkládání kamenů zleva, zprava a shora.
- Nahrazení rotace řádků a sloupců mechanikou vkládání.
- Trvalá prázdná pole po odstranění kombinací.
- Gravitace po každém tahu.
- Automatické vyhodnocování kaskád.

## v0.2.0 – 12. 7. 2026

### Přidáno

- Hledání vodorovných a svislých kombinací.
- Odstraňování kombinací.
- Gravitace kamenů.
- Animace odstranění a pádu.
- Debug panel a reset desky.

## v0.1.0 – 11. 7. 2026

### Přidáno

- Základní struktura projektu a Git repozitář.
- První hrací plocha 5×5.
- Původní posun řádků a sloupců.
- První projektová dokumentace.
