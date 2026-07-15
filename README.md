# Project Shift

Project Shift je testovací prototyp tahové logické hry pro dva hráče na jedné hrací ploše. Hráči vkládají kameny z okrajů desky, vytvářejí kombinace a převádějí soupeřovy body na svou stranu.

Aktuální výchozí test používá:

- desku 5×5;
- 10 typů kamenů;
- dvě viditelné příchozí položky pro každého hráče;
- vkládání zleva, zprava a shora;
- 7 bodů na každé straně;
- animace dlouhé 500 ms.

Všechny tyto hodnoty jsou testovací, ne finální.

## Spuštění

Projekt nepoužívá sestavení ani externí knihovny. Otevři složku ve VS Code, spusť Live Server a načti `index.html`.

## Ovládání

Tah začíná na krajním kameni desky. Táhni jej směrem dovnitř a po překročení minimální vzdálenosti pusť. Krátké tažení se zruší bez změny hry.

Laboratoř umožňuje porovnávat testovací varianty. Nastavení, která mění pravidla nebo obsah hry, se použijí tlačítkem **Použít a resetovat**.

## Test na telefonu přes lokální Wi-Fi

1. Připoj Mac i telefon ke stejné Wi-Fi.
2. Otevři projekt ve VS Code a spusť Live Server.
3. Na telefonu otevři v Safari adresu `http://IP_ADRESA_MACU:5500`.
4. Ověř tažení z povolených hran, čitelnost front, označení hráče na tahu a stabilitu stránky.

Lokální IP Macu najdeš v Nastavení systému → Wi-Fi → Podrobnosti → TCP/IP.

## Dokumentace

- `docs/ProjectConstitution.md` určuje zásady projektu.
- `docs/GDD.md` popisuje aktuální podobu hry.
- `docs/Decisions.md` zaznamenává platná i nahrazená rozhodnutí.
- `docs/Roadmap.md` určuje pořadí dalších fází.
- `docs/TODO.md` obsahuje nejbližší konkrétní práci.
- `CHANGELOG.md` eviduje provedené změny.

Pokud si dokumenty odporují, aktuální stav hry se nejprve ověří v kódu a rozpor se musí opravit v dokumentaci před další větší mechanikou.
