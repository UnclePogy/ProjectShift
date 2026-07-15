#008

Základní movement systém je uzavřen.

Řádky a sloupce se posouvají o 1.

Stav: 🟢 potvrzeno

#019

Pád kamenů je animovaný krátkým plynulým pohybem. Rychlost je pro prototyp vyhovující.

Stav: 🟢 potvrzeno

#018

Po vymazání kombinace kameny v každém sloupci padají dolů a nově vytvořené kameny vstupují shora.

Stav: 🟢 potvrzeno

#015

Překřížené kombinace zatím nesjednocujeme. Jejich chování ověříme při vizuálním testu mazání kamenů a teprve potom potvrdíme finální pravidlo.

Stav: 🟡 čeká na test

#016

Řetězové kombinace zatím nevyhodnocujeme. Přidáme je až společně s gravitací kamenů, aby pro hráče působily přirozeně.

Stav: 🟢 potvrzeno

#017

Animace vymazání kombinace a objevení nových kamenů je otestovaná. Délka animace je pro prototyp vyhovující.

Stav: 🟢 potvrzeno

#014

Funkce findMatches() vrací všechny kameny z vodorovných i svislých kombinací. Výsledek byl ověřen v prohlížeči.

Stav: 🟢 potvrzeno

#013

Detekce vodorovných i svislých kombinací je samostatně ověřena v prohlížeči.

Stav: 🟢 potvrzeno

#011

Kameny z kombinace se pro první prototyp nahradí náhodnými novými barvami. Fyziku pádu zatím neřešíme.

Stav: 🟡 testovací pravidlo

#012

V prvním prototypu vyhodnocujeme jen kombinaci vytvořenou hráčovým tahem. Náhodně doplněné kameny zatím řetězovou kombinaci nespouštějí.

Stav: 🟡 testovací pravidlo

#010

Kombinaci tvoří alespoň 3 stejné kameny v souvislé vodorovné nebo svislé řadě. Hranici ověříme během testování.

Stav: 🟢 potvrzeno

#009

Kombinace se vyhodnocují vodorovně i svisle.

Stav: 🟢 potvrzeno

#020

Po odstranění kombinace se náhodné kameny automaticky nedoplňují. Kameny spadnou dolů a vzniklá prázdná pole zůstávají součástí herního stavu.

Stav: 🟢 potvrzeno

#021

Hráč vkládá nový kámen zleva nebo zprava do řádku, případně shora do sloupce. Posouvají se pouze kameny mezi vstupem a prvním prázdným polem. Prázdné pole se zaplní a neposouvá se dál. Pokud řada žádné prázdné pole nemá, kámen na opačném konci vypadne a zmizí. Kameny se nikdy neotáčejí dokola.

Stav: 🟡 testuje se

#022

Vkládání se ovládá tažením vstupního bodu směrem do desky. Stejný systém používá myš i dotyk prostřednictvím Pointer Events. Dokud hráč drží tlačítko myši nebo prst, herní stav se nemění. Tah se provede až po puštění po překročení minimální vzdálenosti. Při návratu před práh se tah zruší.

Stav: 🟡 testuje se

#023

Animace mazání, pádu a kaskád zůstávají v prototypu dočasně nastavené na 500 ms, protože kratší hodnoty byly při současném testování hůře čitelné. Finální rychlost se určí při pozdějším ladění UX.

Stav: 🟡 testovací nastavení

#024

Prototyp používá dva střídající se hráče. Každý hráč má vlastní nezávislou frontu dvou viditelných příchozích kamenů. První kámen ve frontě je aktuálně použitelný, po tahu se spotřebuje a na konec fronty se doplní nový náhodný kámen. Hráč se vystřídá až po dokončení gravitace, odstranění kombinací a všech kaskád. Vstupní šipky vždy zobrazují barvu aktuálního kamene hráče na tahu.

Stav: 🟡 testuje se


#025

Prototyp dočasně používá 9 typů kamenů. Cílem testu je dále snížit četnost náhodných kombinací a lépe oddělit plánované tahy od náhody. Použitá paleta má devět výrazně odlišných barev. Výsledek se vyhodnotí podle délky partie, četnosti kombinací a čitelnosti na telefonu.

Stav: 🟡 testuje se


## Decision: testovací varianta 4×4 s pěti typy kamenů

**Stav:** Testuje se

Hrací deska se dočasně mění z 5×5 na 4×4 a počet typů kamenů ze 7 na 5.

**Důvod:** Sedm barev bylo při testování špatně rozlišitelných. Menší deska má ověřit, zda kombinace 4×4 + 5 typů kamenů nabídne lepší čitelnost a tempo hry bez příliš rychlého vyprazdňování pole.

#026

Do debug panelu byla přidána Laboratoř pro rychlé porovnávání variant. Velikost desky, počet typů kamenů a délka fronty se použijí po potvrzení a resetu. Rychlost animací a povolení horního vkládání lze měnit okamžitě během testování.

Stav: 🟡 testuje se

#027

Každý hráč začíná se 7 ikonami. Za každou vytvořenou sestavu se ikony přesouvají od soupeře k hráči, který tah provedl. Sestava 3 převádí 1 ikonu, sestava 4 převádí 2 ikony a sestava 5 převádí 3 ikony. Kaskády se započítávají stejně. Po získání všech 14 ikon se zobrazí vítěz a partie zůstane na obrazovce do ručního resetu.

Stav: 🟡 testuje se

#028

Laboratoř může skrýt nebo zobrazit vizuální skóre bez změny samotných pravidel skórování.

Stav: 🟡 testuje se

#029

Příchozí kameny ve frontě se zobrazují ve stejné velikosti jako kameny na hrací desce, aby byly lépe čitelné na telefonu i počítači.

Stav: 🟡 testuje se

#030

Laboratoř umožňuje testovat délku animací 100, 250, 500, 1000 a 1500 ms. Změna rychlosti se aplikuje okamžitě na časování JavaScriptu i CSS animace.

Stav: 🟡 testuje se
