# Project Shift Simulator

Samostatná bezgrafická laboratoř. Produkční soubory v `/js` nemění ani nenačítá.

## Spuštění v prohlížeči

Otevři projekt přes Live Server a přejdi na:

`/simulator/runner.html`

Pro první kontrolu použij 100 až 1 000 her. Defensive agent je výrazně pomalejší než Random.

## Spuštění v terminálu

```bash
cd simulator
npm test
npm run simulate -- 1000 12345 random random
```

Parametry CLI: počet her, seed, agent hráče 1, agent hráče 2.

Dostupní agenti: `random`, `greedy`, `defensive`.

## Omezení první verze

- Simulátor měří matematický průběh hry, ne zábavnost.
- Pravidla jsou samostatnou implementací; paritní testy s produkční hrou je nutné dále rozšiřovat.
- MCTS zatím není součástí této verze.

## Měření kvality rozhodování

Každý tah se navíc hodnotí podle okamžitého výsledku všech legálních možností. Výstup `decisionQuality` obsahuje zejména:

- průměrný počet legálních tahů,
- průměrný počet bodových a nulových tahů,
- podíl bodových tahů,
- počet tahů se stejnou nejlepší hodnotou,
- počet téměř nejlepších tahů (nejvýše o 1 bod horších),
- počet různých okamžitých hodnot tahů,
- jak často agent vybral okamžitě nejlepší tah,
- průměrnou okamžitou ztrátu (`regret`) proti nejlepšímu dostupnému tahu.

Jde o taktickou metriku jednoho tahu. Neříká, který tah je strategicky nejlepší několik tahů dopředu. Pro tento účel bude později sloužit MCTS.

---

# Game Balance Lab – parametrické ligy

Tato verze přidává nad původní headless engine samostatnou vrstvu pro automatické testování pravidel.
Produkční soubory hry se nemění.

## Nové části

- `agent-profiles.js` – základní archetypy a generátor 20 profilů (DNA agentů).
- `parametric-agent.js` – jednotná hodnoticí funkce s nastavitelnými vahami.
- `position-evaluation.js` – okamžitý zisk, soupeřova odpověď a jednoduchý poziční potenciál.
- `agent-registry.js` – registr starých i nových agentů.
- `league.js` – round-robin liga, střídání pořadí a interní Elo.
- `experiment-matrix.js` – automatické kombinování desek, symbolů, front a směrů.
- `batch-runner.js` – dávkový běh, ukládání výsledků a pokračování po přerušení.
- `configs/*.json` – experimenty se nastavují bez úprav JavaScriptu.

## Bezpečný první test

V terminálu otevři složku `simulator` a spusť:

```bash
npm test
node batch-runner.js ./configs/smoke-test.json
```

Výsledky vzniknou v:

```text
simulation-results/balance-lab-smoke/
```

## Široký screening

```bash
npm run league
```

Konfigurace je v `configs/screening.json`. Tento běh je velký. Před spuštěním doporučujeme snížit `gamesPerOrder` na 5–10 a ověřit výkon počítače.

## Kandidátní test 7–9 symbolů a 20 agentů

```bash
npm run candidates
```

Tento běh je výrazně náročnější. Konfigurace je v `configs/candidates-7-9.json`.

## Checkpointy

Každá konfigurace se ukládá jako samostatný JSON do `runs/`. Při dalším spuštění s `"resume": true` se již dokončené konfigurace přeskočí.

## Omezení této verze

Poziční potenciál je první, záměrně jednoduchá heuristika. Počítá sousední dvojice a téměř hotové trojice. Není to MCTS ani důkaz zábavnosti. Slouží k vytvoření rozdílných herních stylů a k odhalování dominance nebo patových matchupů.

## Grafické ovládání Balance Lab v2

Spusť projekt přes Live Server a otevři:

`/simulator/lab.html`

Všechny běžné experimenty lze nastavit a spustit bez Terminálu a bez úpravy JSON. Výpočty běží ve Web Workeru, takže stránka zůstává ovladatelná. Průběžně dokončené konfigurace se ukládají do localStorage prohlížeče. Výsledky lze exportovat jako JSON nebo CSV.

## Balance Score

Browserový Game Balance Lab automaticky hodnotí dokončené konfigurace. Výchozí skóre používá:

- 50 %: podíl dokončených her,
- 30 %: vzdálenost od cílového počtu tahů,
- 20 %: odchylku úspěšnosti prvního hráče od 50 %.

Váhy, cílový počet tahů a penalizaci lze změnit přímo v panelu Balance Score. Hodnoty se ukládají lokálně v prohlížeči a váhy se při výpočtu normalizují.
