# Project Shift – Roadmap

Roadmap určuje pořadí práce. Nejde o seznam funkcí, které se mají implementovat současně.

## Aktuální fáze – ověření základní hry

Cíl: zjistit, zda je vkládání z hran na desce 5×5 s 10 typy kamenů čitelné, ovladatelné a dostatečně strategické.

### Nejbližší milník

Provést řízený test na iPhonu 13 mini a zaznamenat:

- zda lze spolehlivě zahájit tah ze všech povolených hran;
- zda se tahy omylem nespouštějí nebo neruší;
- zda je vždy jasné, kdo je na tahu a který kámen se použije;
- délku partie v tazích a minutách;
- četnost kombinací a kaskád;
- zda 10 typů umožňuje plánování, nebo hru zbytečně brzdí.

Milník je hotový až po zapsání výsledku do `DeveloperJournal.md` a rozhodnutí, co změnit jako další jediný krok.

## Následující fáze – volba základních pravidel

Teprve podle výsledků mobilních partií rozhodnout:

- finálního kandidáta velikosti desky;
- počet typů kamenů;
- samostatnou nebo společnou frontu;
- povolené vstupní hrany;
- počet počátečních bodů;
- tempo animací;
- pravidlo bodování překřížených sestav.

## Stabilizace prototypu

Po výběru pravidel:

- odstranit nepotřebné testovací větve z běžného herního rozhraní;
- doplnit opakovatelné automatické testy herní logiky;
- opravit zjištěné chyby ovládání;
- zjednodušit a vyčistit CSS i JavaScript bez změny gameplaye.

## Hra proti AI

AI se začne navrhovat až po stabilizaci pravidel a ovládání. Jinak bychom učili nebo programovali soupeře pro hru, jejíž pravidla se stále mění.

První AI má sloužit k testování a nabízet předvídatelnou základní obtížnost, ne simulovat hotový matchmaking.

## Pozdější vývoj

- finální vizuální identita a zvuky;
- postavy a reakce mimo hrací plochu;
- hra na samostatných zařízeních;
- online multiplayer a matchmaking;
- účty, kosmetika a monetizace;
- příprava vydání.
