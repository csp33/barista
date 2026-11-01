import { Coffee } from '../coffee/Coffee';
import { DF64_GEN_2, Grinder } from '../equipment/Grinder';
import {
  SAGE_BARISTA_TOUCH_IMPRESS,
  EspressoMachine,
  SageTemperatureSetting,
} from '../equipment/EspressoMachine';
import { Recipe } from './Recipe';
import { ExtractionFeedback } from './ExtractionFeedback';

export class RecipeCalculator {
  static calculateInitial(
    coffee: Coffee,
    grinder: Grinder = DF64_GEN_2,
    machine: EspressoMachine = SAGE_BARISTA_TOUCH_IMPRESS
  ): Recipe {
    const coffeeNameLower = coffee.name.toLowerCase();
    const isMonsooned =
      coffeeNameLower.includes('monsooned') ||
      coffeeNameLower.includes('malabar') ||
      (coffee.originCountry.toLowerCase().includes('india') && coffeeNameLower.includes('monsoon'));

    // Dynamic dose based on bean density & roast level in 54mm basket
    let doseGrams = machine.standardDoseGrams; // 18.0 base
    if (isMonsooned) {
      doseGrams = 16.5; // Monsooned beans expand heavily; 16.5g gives optimal headspace
    } else if (coffee.roastLevel === 'light' || (coffee.altitudeMasl && coffee.altitudeMasl >= 1800)) {
      doseGrams = 18.5; // Dense beans occupy less volume; 18.5g fills 54mm basket
    } else if (coffee.roastLevel === 'medium_dark' || coffee.roastLevel === 'dark') {
      doseGrams = 17.0; // Dark roasts expand; 17g prevents contact with shower screen
    }

    const { ratioMultiplier, ratio, temperature } = this.getRoastParams(coffee);
    const yieldGrams = Math.round(doseGrams * ratioMultiplier);

    let grindSetting = grinder.defaultEspressoBaseline; // Base 12.0

    if (isMonsooned) {
      // Monsooned coffees expand and lose density; require grinding much finer
      grindSetting = 5.5;
    } else {
      // Adjust for roast level
      if (coffee.roastLevel === 'light') grindSetting -= 2.0;
      else if (coffee.roastLevel === 'medium_light') grindSetting -= 1.0;
      else if (coffee.roastLevel === 'medium_dark') grindSetting += 1.0;
      else if (coffee.roastLevel === 'dark') grindSetting += 2.0;

      // Adjust for processing method (naturals & anaerobics produce more fines)
      if (['natural', 'anaerobic', 'honey', 'experimental'].includes(coffee.process)) {
        grindSetting += 0.5;
      }

      // High altitude beans (>1800m) are very dense
      if (coffee.altitudeMasl && coffee.altitudeMasl >= 1800) {
        grindSetting -= 1.0;
      }
    }

    const notes = [
      `Initial recipe tuned for ${coffee.roaster} - ${coffee.name}`,
      `Ideal rest window: ${coffee.recommendedRestDays} days after roast`,
    ];

    if (isMonsooned) {
      notes.push('Monsooned Malabar: baja densidad y grano expandido: dosis reducida a 16.5g y molienda fina para 9 bar');
    } else if (coffee.process === 'natural' || coffee.process === 'anaerobic') {
      notes.push('Naturals produce fines: grind slightly coarser to prevent stalling');
    }

    notes.push('Tamp manual: desapelmazar con agujas WDT y prensar a nivel con tamper manual para sellar la cesta de 54mm');

    return new Recipe({
      id: `recipe-${coffee.id}`,
      coffeeId: coffee.id,
      grinderId: grinder.id,
      machineId: machine.id,
      doseGrams,
      yieldGrams,
      ratio,
      grindSetting: Number(grindSetting.toFixed(1)),
      machineTemperature: temperature,
      targetTimeSeconds: 28,
      recommendedRestDays: coffee.recommendedRestDays,
      notes,
    });
  }

  static adjustFromFeedback(currentRecipe: Recipe, feedback: ExtractionFeedback): Recipe {
    let nextGrind = feedback.actualGrindSetting;
    let nextTemp = currentRecipe.machineTemperature;
    let nextYield = feedback.actualYieldGrams;
    const notes = [...currentRecipe.notes];

    switch (feedback.tasteProfile) {
      case 'sour':
        nextGrind = Math.max(0, nextGrind - 0.5);
        nextTemp = this.raiseTemperature(nextTemp);
        nextYield += 2;
        notes.push('Adjusted: finer grind & slightly higher ratio to eliminate sourness');
        break;
      case 'bitter':
      case 'astringent':
        nextGrind += 0.5;
        nextTemp = this.lowerTemperature(nextTemp);
        nextYield = Math.max(20, nextYield - 2);
        notes.push('Adjusted: coarser grind & lower yield to tame bitterness');
        break;
      case 'channeled':
        if (feedback.actualTimeSeconds > 32) {
          nextGrind += 0.5;
          notes.push('Choking & pressure crack: grind +0.5 coarser and distribute with WDT');
        } else {
          nextGrind = Math.max(0, nextGrind - 0.5);
          notes.push('Fast channeling / low resistance: grind -0.5 finer and de-clump with WDT');
        }
        break;
      case 'balanced':
        notes.push(`Dialed-in sweet spot confirmed at DF64 #${feedback.actualGrindSetting}`);
        break;
    }

    const ratio = `1:${(nextYield / currentRecipe.doseGrams).toFixed(1)}`;

    return new Recipe({
      ...currentRecipe,
      id: `recipe-${currentRecipe.coffeeId}`,
      grindSetting: Number(nextGrind.toFixed(1)),
      yieldGrams: Math.round(nextYield),
      machineTemperature: nextTemp,
      ratio,
      notes,
    });
  }

  private static getRoastParams(coffee: Coffee): {
    ratioMultiplier: number;
    ratio: string;
    temperature: SageTemperatureSetting;
  } {
    switch (coffee.roastLevel) {
      case 'light':
        return { ratioMultiplier: 2.3, ratio: '1:2.3', temperature: 'very_high' };
      case 'medium_light':
        return { ratioMultiplier: 2.2, ratio: '1:2.2', temperature: 'high' };
      case 'medium':
        return { ratioMultiplier: 2.0, ratio: '1:2.0', temperature: 'normal' };
      case 'medium_dark':
      case 'dark':
        return { ratioMultiplier: 1.8, ratio: '1:1.8', temperature: 'low' };
    }
  }

  private static raiseTemperature(t: SageTemperatureSetting): SageTemperatureSetting {
    if (t === 'low') return 'normal';
    if (t === 'normal') return 'high';
    return 'very_high';
  }

  private static lowerTemperature(t: SageTemperatureSetting): SageTemperatureSetting {
    if (t === 'very_high') return 'high';
    if (t === 'high') return 'normal';
    return 'low';
  }
}
