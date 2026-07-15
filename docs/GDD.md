# Project Shift – Game Design Document

## Stav dokumentu

Tento dokument popisuje aktuální stav testovacího prototypu. Výchozí hodnoty nejsou finální pravidla; slouží k řízenému testování.

## Herní záměr

Project Shift je tahová logická hra pro dva hráče na jedné desce. Hráč má vidět důsledek svého rozhodnutí, plánovat s pomocí příchozí fronty a současně ovlivňovat možnosti soupeře.

Požadovaný zážitek:

- krátké a srozumitelné tahy;
- rozhodování důležitější než náhoda;
- možnost obratu až do konce partie;
- čitelné ovládání bez samostatných šipek kolem desky;
- animace, které vysvětlují výsledek tahu, ale nezdržují.

## Aktuální výchozí konfigurace

| Nastavení | Výchozí hodnota | Rozsah v Laboratoři |
|---|---:|---:|
| Velikost desky | 5×5 | 4×4, 5×5, 6×6 |
| Počet typů kamenů | 10 | 4–15 |
| Délka fronty | 2 | 1, 2, 3, 5 |
| Počáteční body hráče | 7 | 1–15 |
| Fronta | samostatná pro každého | samostatná / společná |
| Vkládání zleva a zprava | zapnuto | vždy zapnuto |
| Vkládání shora | zapnuto | zapnuto / vypnuto |
| Vkládání odspodu | vypnuto | zapnuto / vypnuto |
| Délka animace | 500 ms | 100, 250, 500, 1000, 1500 ms |
| Velikost kamenů ve frontě | 110 % kamene na desce | 100–200 % |
| Velikost symbolů | 120 % | 100–200 % |
| Rozestup fronty | 10 px | 0–30 px |

## Začátek partie

- Deska se zaplní náhodnými kameny z aktivní palety.
- Generátor zabrání hotové vodorovné nebo svislé kombinaci tří a více kamenů.
- Začíná Hráč 1.
- Každý hráč dostane svou frontu, pokud není v Laboratoři zvolena společná fronta.
- Oba hráči začínají se stejným počtem bodů.

## Průběh tahu

1. Aktivní hráč začne táhnout krajní kámen směrem dovnitř desky.
2. Po puštění nad prahem 24 px se použije první kámen aktivní fronty.
3. Kameny se posunou od zvolené hrany k prvnímu prázdnému poli.
4. Pokud v dané řadě nebo sloupci žádné prázdné pole není, protější krajní kámen vypadne a zmizí.
5. Na desku se aplikuje gravitace směrem dolů.
6. Vyhodnotí se všechny vodorovné a svislé kombinace.
7. Kombinace se odstraní, kameny spadnou a případné kaskády se opakovaně vyhodnotí.
8. Po skončení všech animací a kaskád se hráči vystřídají.

I tah bez kombinace spotřebuje příchozí kámen a předá hru soupeři.

## Vkládání kamenů

- Zleva a zprava lze vkládat vždy.
- Horní a spodní směr lze samostatně testovat v Laboratoři.
- Posun se zastaví v nejbližším prázdném poli ve směru od vstupu.
- Kameny se neotáčejí dokola.
- Vypadlý kámen se nevrací do fronty ani do skóre.

## Kombinace a kaskády

- Kombinaci tvoří nejméně tři stejné kameny v souvislé vodorovné nebo svislé řadě.
- Všechny kombinace ve stejném vyhodnocení se odstraní současně.
- Překřížené řady se pro skóre počítají jako dvě samostatné sestavy; společné pole se odstraní pouze jednou.
- Po odstranění se nevytvářejí náhodné náhradní kameny. Prázdná pole zůstávají součástí hry.
- Nová kombinace vzniklá pádem je kaskáda a boduje stejně jako první kombinace.

## Skóre a konec hry

Odměna za jednu souvislou sestavu má v aktuálním kódu vzorec:

`počet převedených bodů = délka sestavy − 2`

| Délka sestavy | Převedené body |
|---:|---:|
| 3 | 1 |
| 4 | 2 |
| 5 | 3 |
| 6 | 4 |

Body se převádějí od soupeře k aktivnímu hráči. Nelze převést více bodů, než soupeři zbývá. Při výchozím nastavení je ve hře celkem 14 bodů a vítězí hráč, který získá všech 14.

Po vítězství hra zůstane na obrazovce a čeká na ruční reset.

## Fronty kamenů

- První kámen fronty je aktuálně použitelný.
- Po platném tahu se odstraní a na konec fronty se náhodně přidá nový kámen.
- Ve výchozí variantě má každý hráč vlastní nezávislou frontu.
- Společná fronta je pouze testovací možnost.

## Ovládání a čitelnost

- Myš i dotyk používají Pointer Events.
- Herní stav se během držení nemění; tah se provede až po puštění.
- Krátké tažení se zruší.
- Během tažení se zvýrazní zdrojový kámen a cílový řádek nebo sloupec.
- Aktivní hráč je označen panelem i centrálním bannerem.
- Kameny se odlišují barvou i symbolem.
- Laboratoř je na malém displeji po načtení sbalená.

## Laboratoř

Laboratoř je vývojový nástroj, nikoli součást finálního herního rozhraní.

Okamžitě se mění:

- délka animace;
- zobrazení skóre;
- velikost kamenů fronty;
- velikost symbolů;
- rozestup fronty.

Po stisknutí **Použít a resetovat** se mění:

- velikost desky;
- počet typů kamenů;
- délka a typ fronty;
- počáteční skóre;
- povolení horního a spodního vkládání.

## Zatím nerozhodnuto

- finální velikost desky a počet typů kamenů;
- samostatná nebo společná fronta;
- finální počet bodů;
- vkládání shora a odspodu;
- výsledná rychlost animací;
- pravidlo pro odměnu překřížených sestav;
- časový limit tahu a partie;
- podoba hry proti AI.

## Mimo současný prototyp

- online multiplayer a matchmaking;
- AI soupeř;
- účty, postup a odměny;
- monetizace;
- finální grafika, postavy, zvuky a rozsáhlé animace.
