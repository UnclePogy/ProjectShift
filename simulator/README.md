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
