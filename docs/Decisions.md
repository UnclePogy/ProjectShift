# Project Shift – Decisions

Tento soubor zaznamenává rozhodnutí, která určují aktuální prototyp. Označení **testuje se** znamená, že funkce je implementovaná, ale nemusí se stát finálním pravidlem.

## Platná rozhodnutí

### #009 – Směry kombinací

Kombinace se vyhodnocují vodorovně i svisle.

**Stav:** potvrzeno

### #010 – Minimální kombinace

Kombinaci tvoří nejméně tři stejné kameny v souvislé řadě.

**Stav:** potvrzeno

### #014 – Sjednocení polí kombinací

Při jednom vyhodnocení se každé zasažené pole odstraní pouze jednou, i když patří do vodorovné i svislé kombinace.

**Stav:** potvrzeno

### #020 – Prázdná pole bez náhodného doplnění

Po odstranění kombinace kameny spadnou dolů. Nové náhodné kameny se shora nedoplňují a vzniklá prázdná pole zůstávají součástí herního stavu.

**Stav:** potvrzeno

### #021 – Vkládání z hran

Hráč vloží jeden příchozí kámen ze zvolené hrany. Posun končí v prvním prázdném poli. Pokud žádné není, kámen na protější straně vypadne. Kameny se nikdy neotáčejí dokola.

Zleva a zprava lze vkládat vždy. Vkládání shora je výchozí testovací směr a vkládání odspodu je volitelná testovací varianta.

**Stav:** testuje se

### #022 – Tažení krajního kamene

Tah začíná přímo na krajním kameni desky, nikoli na samostatné šipce nebo vstupním bodu. Myš i dotyk používají Pointer Events. Tah se provede po puštění a překročení prahu 24 px; kratší tažení se zruší.

**Stav:** testuje se

### #023 – Rychlost animací

Výchozí délka animace je 500 ms. Laboratoř umožňuje 100, 250, 500, 1000 a 1500 ms. Finální hodnota se určí mobilním testem čitelnosti a tempa.

**Stav:** testuje se

### #024 – Dva hráči a fronty

Hráči se střídají až po dokončení gravitace a všech kaskád. Výchozí varianta používá dvě viditelné položky a samostatnou frontu pro každého hráče. Společná fronta je dostupná pouze jako testovací možnost.

**Stav:** testuje se

### #027 – Převod skóre

Oba hráči začínají se stejným počtem bodů, výchozí hodnota je 7. Za každou sestavu se od soupeře převede `délka sestavy − 2` bodů. Kaskády bodují stejně. Vítězí hráč, který získá všechny body ve hře; automatický restart se neprovádí.

**Stav:** testuje se

### #028 – Volitelné zobrazení skóre

Laboratoř může skóre skrýt bez změny pravidel nebo interního stavu bodů.

**Stav:** testuje se

### #030 – Jednotné časování

Změna délky animace se současně promítne do časování JavaScriptu i CSS.

**Stav:** potvrzeno pro prototyp

### #031 – Výchozí test 5×5 a 10 typů

Výchozí prototyp používá desku 5×5 a 10 typů kamenů. Důvodem je hledání kompromisu mezi čitelností, plánováním a četností kombinací. Laboratoř nadále umožňuje desky 4×4 až 6×6 a 4 až 15 typů.

Deset typů není potvrzené finální pravidlo. Varianta musí projít měřením délky partií a četnosti smysluplných tahů.

**Stav:** testuje se

### #032 – Překřížené sestavy

Vodorovná a svislá sestava se pro skóre aktuálně počítají samostatně. Jejich společné pole se vymaže pouze jednou. Toto chování odpovídá současnému kódu, ale jeho dopad na hráčský zážitek ještě není potvrzen.

**Stav:** testuje se

### #033 – Laboratoř není finální UI

Laboratoř slouží k porovnávání variant. Přítomnost nastavení v Laboratoři neznamená, že daná možnost patří do finální hry.

**Stav:** potvrzeno

## Nahrazená rozhodnutí

Následující výroky již nepopisují aktuální hru:

- **#008:** původní posun celého řádku nebo sloupce byl nahrazen vkládáním z hran.
- **#011:** náhodné nahrazování odstraněných kamenů bylo nahrazeno trvalými prázdnými poli.
- **#012 a #016:** odklad řetězových kombinací byl nahrazen plnými kaskádami po gravitaci.
- **#018:** doplňování nových kamenů shora bylo nahrazeno rozhodnutím #020.
- **#025:** výchozích 9 typů bylo po testu nahrazeno rozhodnutím #031.
- **Pokus s 15 typy:** zůstává dostupný v Laboratoři, ale není výchozím nastavením.
- **#029:** fronta už nemá přesně stejnou velikost jako deska; aktuální výchozí hodnota je 110 % a je nastavitelná.
