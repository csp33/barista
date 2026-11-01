import { Coffee } from '../coffee/Coffee';
import { Grinder } from '../equipment/Grinder';
import { EspressoMachine, SageTemperatureSetting } from '../equipment/EspressoMachine';
import { Recipe } from './Recipe';
import { ExtractionFeedback } from './ExtractionFeedback';

export class RecipeCalculator {
  static calculateInitial(
    coffee: Coffee,
    grinder: Grinder,
    machine: EspressoMachine,
    userId: string,
    customDoseGrams?: number
  ): Recipe {
    if (!userId || userId.trim().length === 0) {
      throw new Error('UserId is required to calculate recipe');
    }

    const coffeeNameLower = coffee.name.toLowerCase();
    const isMonsooned =
      coffeeNameLower.includes('monsooned') ||
      coffeeNameLower.includes('malabar') ||
      (coffee.originCountry.toLowerCase().includes('india') && coffeeNameLower.includes('monsoon'));

    let doseGrams = customDoseGrams ?? machine.standardDoseGrams;
    if (isMonsooned) {
      if (customDoseGrams) doseGrams = Math.max(12, customDoseGrams - 1.5);
      else if (machine.portafilterSizeMm <= 51) doseGrams = 13.5;
      else if (machine.portafilterSizeMm <= 54) doseGrams = 16.5;
      else doseGrams = 17.5;
    } else if (coffee.roastLevel === 'light' || (coffee.altitudeMasl && coffee.altitudeMasl >= 1800)) {
      if (customDoseGrams) doseGrams = customDoseGrams;
      else if (machine.portafilterSizeMm <= 51) doseGrams = 15.0;
      else if (machine.portafilterSizeMm <= 54) doseGrams = 18.0;
      else doseGrams = 19.5;
    } else if (coffee.roastLevel === 'medium_dark' || coffee.roastLevel === 'dark') {
      if (customDoseGrams) doseGrams = Math.max(12, customDoseGrams - 1.0);
      else if (machine.portafilterSizeMm <= 51) doseGrams = 14.0;
      else if (machine.portafilterSizeMm <= 54) doseGrams = 17.0;
      else doseGrams = 18.0;
    }

    const { ratioMultiplier, ratio, temperature } = this.getRoastParams(coffee);
    const yieldGrams = Math.round(doseGrams * ratioMultiplier);

    let grindSetting = grinder.defaultEspressoBaseline;
    const dialStep = grinder.maxDial <= 10 ? 0.2 : 1.0;

    if (isMonsooned) {
      grindSetting = this.roundToHalfStep(grinder.defaultEspressoBaseline * 0.46);
    } else {
      if (coffee.roastLevel === 'light') grindSetting -= dialStep * 2;
      else if (coffee.roastLevel === 'medium_light') grindSetting -= dialStep;
      else if (coffee.roastLevel === 'medium_dark') grindSetting += dialStep;
      else if (coffee.roastLevel === 'dark') grindSetting += dialStep * 2;

      if (['natural', 'anaerobic', 'honey', 'experimental'].includes(coffee.process)) {
        grindSetting += dialStep * 0.5;
      }
      if (coffee.altitudeMasl && coffee.altitudeMasl >= 1800) {
        grindSetting -= dialStep;
      }
    }

    grindSetting = this.roundToHalfStep(
      Math.max(grinder.minDial, Math.min(grinder.maxDial, grindSetting))
    );

    const notes = [
      `Tuned for ${coffee.roaster} - ${coffee.name} on ${grinder.brand} & ${machine.brand}`,
      `Ideal rest window: ${coffee.recommendedRestDays} days after roast`,
    ];

    if (isMonsooned) {
      notes.push('Monsooned Malabar: baja densidad y grano expandido: dosis adaptada');
    }

    return new Recipe({
      id: `recipe-${userId}-${coffee.id}`,
      coffeeId: coffee.id,
      userId,
      grinderId: grinder.id,
      machineId: machine.id,
      doseGrams,
      yieldGrams,
      ratio,
      grindSetting,
      machineTemperature: temperature,
      targetTimeSeconds: 28,
      recommendedRestDays: coffee.recommendedRestDays,
      notes,
    });
  }

  static adjustFromFeedback(
    currentRecipe: Recipe,
    feedback: ExtractionFeedback,
    grinder?: Grinder
  ): Recipe {
    let nextGrind = feedback.actualGrindSetting;
    let nextTemp = currentRecipe.machineTemperature;
    let nextYield = feedback.actualYieldGrams;
    const notes = [...currentRecipe.notes];
    const dialStep = grinder && grinder.maxDial <= 10 ? 0.2 : 0.5;
    const minDial = grinder ? grinder.minDial : 0;
    const maxDial = grinder ? grinder.maxDial : 90;

    switch (feedback.tasteProfile) {
      case 'sour':
        nextGrind = Math.max(minDial, nextGrind - dialStep);
        nextTemp = this.raiseTemperature(nextTemp);
        nextYield += 2;
        notes.push('Adjusted: finer grind & slightly higher ratio to eliminate sourness');
        break;
      case 'bitter':
      case 'astringent':
        nextGrind = Math.min(maxDial, nextGrind + dialStep);
        nextTemp = this.lowerTemperature(nextTemp);
        nextYield = Math.max(20, nextYield - 2);
        notes.push('Adjusted: coarser grind & lower yield to tame bitterness');
        break;
      case 'channeled':
        if (feedback.actualTimeSeconds > 32) {
          nextGrind = Math.min(maxDial, nextGrind + dialStep);
          notes.push(`Choking & pressure crack: grind +${dialStep} coarser and distribute with WDT`);
        } else {
          nextGrind = Math.max(minDial, nextGrind - dialStep);
          notes.push(`Fast channeling: grind -${dialStep} finer and de-clump with WDT`);
        }
        break;
      case 'balanced':
        notes.push(`Dialed-in sweet spot confirmed at #${feedback.actualGrindSetting}`);
        break;
    }

    const ratio = `1:${(nextYield / currentRecipe.doseGrams).toFixed(1)}`;

    return new Recipe({
      ...currentRecipe,
      id: currentRecipe.id,
      grindSetting: this.roundToHalfStep(nextGrind),
      yieldGrams: Math.round(nextYield),
      machineTemperature: nextTemp,
      ratio,
      notes,
    });
  }

  private static roundToHalfStep(value: number): number {
    return Math.round(value * 2) / 2;
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
