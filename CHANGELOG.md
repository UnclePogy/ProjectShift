# CHANGELOG

V tomto souboru jsou zaznamenány všechny významné změny projektu **Project Shift**.

---

## v0.5.0 — 15. 7. 2026

### Přidáno

- Skóre reprezentované 14 ikonami (7 pro každého hráče).
- Kombinace 3 / 4 / 5 převádí 1 / 2 / 3 ikony.
- Do skóre se započítávají i kaskády.
- Po získání všech ikon se zobrazí vítěz bez automatického restartu.
- Možnost skrýt nebo zobrazit skóre v Laboratoři.
- Příchozí kameny mají stejnou velikost jako kameny na hrací ploše.
- Nové rychlosti animací: 100 ms, 250 ms, 500 ms, 1000 ms a 1500 ms.
- Herní logika i CSS používají jednotné časování animací.

---

## v0.4.0 — 14. 7. 2026

### Přidáno

- Laboratoř pro testování herních mechanik.
- Přepínání velikosti hrací plochy (4×4, 5×5 a 6×6).
- Přepínání počtu typů kamenů (4 až 7).
- Přepínání délky fronty příchozích kamenů (1, 3 nebo 5).
- Přepínání rychlosti animací.
- Možnost zapnout nebo vypnout vkládání shora.
- Tlačítko **Použít a resetovat**, které vytvoří novou hru podle aktuálního nastavení.

---

## v0.3.2 — 14. 7. 2026

### Změněno

- Hrací plocha změněna z 5×5 na 4×4.
- Počet typů kamenů vrácen ze 7 na 5 kvůli lepší přehlednosti.
- Zachováno střídání hráčů, samostatné fronty i vkládání zleva, zprava a shora.

---

## v0.3.1 — 13. 7. 2026

### Přidáno

- Střídání dvou hráčů po dokončení celého tahu včetně kaskád.
- Samostatná fronta tří viditelných příchozích kamenů pro každého hráče.
- Zvýraznění hráče na tahu.
- Zvýraznění aktuálního příchozího kamene.
- Barevné vstupní šipky podle aktuálního kamene hráče na tahu.
- Debug reset obnovuje hrací plochu, aktivního hráče i obě fronty kamenů.

### Změněno

- Pro experimentální testování byl počet typů kamenů zvýšen z 5 na 7.

---

## v0.3.0 — 13. 7. 2026

### Přidáno

- Nová mechanika vkládání kamenů zleva, zprava a shora.
- Nahrazení rotace řádků a sloupců mechanikou vkládání.
- Prázdná pole po odstranění kombinací zůstávají zachována.
- Gravitace se aplikuje po každém tahu.
- Automatické vyhodnocování kaskád až do jejich ukončení.

---

## v0.2.0 — 12. 7. 2026

### Přidáno

- Vyhledávání vodorovných a svislých kombinací.
- Odstraňování nalezených kombinací.
- Gravitace kamenů po odstranění kombinací.
- Animace odstranění, objevení a pádu kamenů.
- Debug panel pro testování.
- Reset hrací plochy.

---

## v0.1.0 — 11. 7. 2026

### Přidáno

- Založení projektu Project Shift.
- Základní struktura projektu.
- Git a GitHub repozitář.
- Hrací plocha 5×5.
- Posun řádků.
- Posun sloupců.
- První dokumentace projektu (GDD, Roadmap, Constitution, README).