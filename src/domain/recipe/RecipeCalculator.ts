import { Coffee } from '../coffee/Coffee';
import { Grinder } from '../equipment/Grinder';
import {
  EspressoMachine,
  SageTemperatureSetting,
  stepTemperature,
} from '../equipment/EspressoMachine';
import { Recipe } from './Recipe';
import { ExtractionFeedback } from './ExtractionFeedback';
import { CalibratedPeer, GrindCalibrationLearner } from './GrindCalibrationLearner';

export class RecipeCalculator {
  static calculateInitial(
    coffee: Coffee,
    grinder: Grinder,
    machine: EspressoMachine,
    userId: string,
    customDoseGrams?: number,
    peers?: CalibratedPeer[]
  ): Recipe {
    if (!userId || userId.trim().length === 0) {
      throw new Error('UserId is required to calculate recipe');
    }

    const isMonsooned = GrindCalibrationLearner.isMonsooned(coffee);

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
    const { grindSetting, learnedFromPeers } = GrindCalibrationLearner.calibrateGrind(
      coffee,
      grinder,
      peers
    );

    const notes = [
      `Tuned for ${coffee.roaster} - ${coffee.name} on ${grinder.brand} & ${machine.brand}`,
      `Ideal rest window: ${coffee.recommendedRestDays} days after roast`,
    ];

    if (learnedFromPeers) {
      notes.push(`Grind #${grindSetting} calibrated from your dialed-in peer coffees`);
    }
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
    grinder?: Grinder,
    machine?: EspressoMachine
  ): Recipe {
    let nextGrind = feedback.actualGrindSetting;
    let nextTemp = feedback.actualTemperature ?? currentRecipe.machineTemperature;
    let nextYield = feedback.actualYieldGrams;
    const notes = [...currentRecipe.notes];
    const dialStep = grinder && grinder.maxDial <= 10 ? 0.2 : 0.5;
    const minDial = grinder ? grinder.minDial : 0;
    const maxDial = grinder ? grinder.maxDial : 90;
    const availableTemps = machine?.availableTemperatures;
    const targetYield = currentRecipe.yieldGrams || 36;
    const targetTime = currentRecipe.targetTimeSeconds || 28;
    const actualYield = Math.max(1, feedback.actualYieldGrams);
    const actualTime = Math.max(1, feedback.actualTimeSeconds);
    const flowRatio = (actualYield / targetYield) * (targetTime / actualTime);
    const fastStep = dialStep * (flowRatio < 1.5 ? 1 : Math.min(10, Math.round(flowRatio)));
    const slowRatio = 1 / flowRatio;
    const slowStep = dialStep * (slowRatio < 1.5 ? 1 : Math.min(8, Math.round(slowRatio)));

    switch (feedback.tasteProfile) {
      case 'sour':
        nextGrind = Math.max(minDial, nextGrind - fastStep);
        nextTemp = stepTemperature(nextTemp, 1, availableTemps);
        nextYield = flowRatio >= 1.5 && actualYield > targetYield ? targetYield : nextYield + 2;
        notes.push(`Adjusted: finer grind (-${fastStep}), temp ${nextTemp} & ratio tuned to eliminate sourness`);
        break;
      case 'bitter':
      case 'astringent':
        nextGrind = Math.min(maxDial, nextGrind + slowStep);
        nextTemp = stepTemperature(nextTemp, -1, availableTemps);
        nextYield = Math.max(20, (slowRatio >= 1.5 && actualYield < targetYield ? targetYield : nextYield) - 2);
        notes.push(`Adjusted: coarser grind (+${slowStep}), temp ${nextTemp} & lower yield to tame bitterness`);
        break;
      case 'channeled':
        if (feedback.actualTimeSeconds > 32) {
          nextGrind = Math.min(maxDial, nextGrind + slowStep);
          notes.push(`Choking & pressure crack: grind +${slowStep} coarser and distribute with WDT`);
        } else {
          nextGrind = Math.max(minDial, nextGrind - fastStep);
          notes.push(`Fast channeling: grind -${fastStep} finer and de-clump with WDT`);
        }
        break;
      case 'balanced':
        notes.push(`Dialed-in sweet spot confirmed at #${feedback.actualGrindSetting} (${nextTemp})`);
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
      aiRationale: undefined,
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
        return { ratioMultiplier: 2.3, ratio: '1:2.3', temperature: 'hot_3' };
      case 'medium_light':
        return { ratioMultiplier: 2.2, ratio: '1:2.2', temperature: 'hot_2' };
      case 'medium':
        return { ratioMultiplier: 2.0, ratio: '1:2.0', temperature: 'normal' };
      case 'medium_dark':
        return { ratioMultiplier: 1.8, ratio: '1:1.8', temperature: 'cold_1' };
      case 'dark':
        return { ratioMultiplier: 1.8, ratio: '1:1.8', temperature: 'cold_2' };
    }
  }
}
