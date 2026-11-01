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
    const doseGrams = machine.standardDoseGrams;
    const { yieldGrams, ratio, temperature } = this.getRoastParams(coffee);

    let grindSetting = grinder.defaultEspressoBaseline; // Base 12.0

    const coffeeNameLower = coffee.name.toLowerCase();
    const isMonsooned =
      coffeeNameLower.includes('monsooned') ||
      coffeeNameLower.includes('malabar') ||
      coffee.originCountry.toLowerCase().includes('india') && coffeeNameLower.includes('monsoon');

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
      notes.push('Monsooned Malabar: low bean density requires fine grind (5-6) for 9 bar');
    } else if (coffee.process === 'natural' || coffee.process === 'anaerobic') {
      notes.push('Naturals produce fines: grind slightly coarser to prevent stalling');
    }

    if (machine.hasAssistedTamping) {
      notes.push('Use WDT to de-clump before pulling the Impress tamp lever');
    }

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
        nextGrind += 0.5;
        notes.push('Channelling detected: ensure thorough WDT distribution');
        break;
      case 'balanced':
        notes.push(`Dialed-in sweet spot confirmed at DF64 #${feedback.actualGrindSetting}`);
        break;
    }

    const ratio = `1:${(nextYield / currentRecipe.doseGrams).toFixed(1)}`;

    return new Recipe({
      ...currentRecipe,
      id: `recipe-${currentRecipe.coffeeId}-${Date.now()}`,
      grindSetting: Number(nextGrind.toFixed(1)),
      yieldGrams: Math.round(nextYield),
      machineTemperature: nextTemp,
      ratio,
      notes,
    });
  }

  private static getRoastParams(coffee: Coffee): {
    yieldGrams: number;
    ratio: string;
    temperature: SageTemperatureSetting;
  } {
    switch (coffee.roastLevel) {
      case 'light':
        return { yieldGrams: 41, ratio: '1:2.3', temperature: 'very_high' };
      case 'medium_light':
        return { yieldGrams: 39, ratio: '1:2.2', temperature: 'high' };
      case 'medium':
        return { yieldGrams: 36, ratio: '1:2.0', temperature: 'normal' };
      case 'medium_dark':
      case 'dark':
        return { yieldGrams: 32, ratio: '1:1.8', temperature: 'low' };
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
