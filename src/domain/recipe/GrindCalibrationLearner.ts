import { Coffee, RoastLevel } from '../coffee/Coffee';
import { Grinder } from '../equipment/Grinder';
import { Recipe } from './Recipe';

export interface CalibratedPeer {
  coffee: Coffee;
  recipe: Recipe;
  hasFeedback?: boolean;
}

const ROAST_ORDER: RoastLevel[] = ['light', 'medium_light', 'medium', 'medium_dark', 'dark'];
const FRUITY_PROCESSES = ['natural', 'anaerobic', 'honey', 'experimental'];

export class GrindCalibrationLearner {
  static isMonsooned(coffee: Coffee): boolean {
    const nameLower = coffee.name.toLowerCase();
    return (
      nameLower.includes('monsooned') ||
      nameLower.includes('malabar') ||
      (coffee.originCountry.toLowerCase().includes('india') && nameLower.includes('monsoon'))
    );
  }

  static calculateTheoreticalGrind(coffee: Coffee, grinder: Grinder): number {
    let grindSetting = grinder.defaultEspressoBaseline;
    const dialStep = grinder.maxDial <= 10 ? 0.2 : 1.0;

    if (this.isMonsooned(coffee)) {
      grindSetting = this.roundToHalfStep(grinder.defaultEspressoBaseline * 0.46);
    } else {
      if (coffee.roastLevel === 'light') grindSetting -= dialStep * 2;
      else if (coffee.roastLevel === 'medium_light') grindSetting -= dialStep;
      else if (coffee.roastLevel === 'medium_dark') grindSetting += dialStep;
      else if (coffee.roastLevel === 'dark') grindSetting += dialStep * 2;

      if (FRUITY_PROCESSES.includes(coffee.process)) {
        grindSetting += dialStep * 0.5;
      }
      if (coffee.altitudeMasl && coffee.altitudeMasl >= 1800) {
        grindSetting -= dialStep;
      }
    }

    return this.roundToHalfStep(
      Math.max(grinder.minDial, Math.min(grinder.maxDial, grindSetting))
    );
  }

  static calibrateGrind(
    targetCoffee: Coffee,
    grinder: Grinder,
    peers?: CalibratedPeer[]
  ): { grindSetting: number; learnedFromPeers: boolean } {
    const targetTheoretical = this.calculateTheoreticalGrind(targetCoffee, grinder);
    if (!peers || peers.length === 0) {
      return { grindSetting: targetTheoretical, learnedFromPeers: false };
    }

    const targetMonsooned = this.isMonsooned(targetCoffee);
    let weightedOffsetSum = 0;
    let totalWeight = 0;

    for (const peer of peers) {
      if (peer.coffee.id === targetCoffee.id) continue;
      if (peer.recipe.grinderId !== grinder.id) continue;
      if (this.isMonsooned(peer.coffee) !== targetMonsooned) continue;

      const peerTheoretical = this.calculateTheoreticalGrind(peer.coffee, grinder);
      const offset = peer.recipe.grindSetting - peerTheoretical;
      const isCalibrated = Boolean(peer.hasFeedback) || Math.abs(offset) >= 0.5;
      if (!isCalibrated) continue;

      const weight = this.computeSimilarityWeight(targetCoffee, peer.coffee, Boolean(peer.hasFeedback));
      weightedOffsetSum += weight * offset;
      totalWeight += weight;
    }

    if (totalWeight === 0) {
      return { grindSetting: targetTheoretical, learnedFromPeers: false };
    }

    const learnedOffset = weightedOffsetSum / totalWeight;
    const calibrated = this.roundToHalfStep(
      Math.max(grinder.minDial, Math.min(grinder.maxDial, targetTheoretical + learnedOffset))
    );

    return {
      grindSetting: calibrated,
      learnedFromPeers: Math.abs(calibrated - targetTheoretical) >= 0.5,
    };
  }

  private static computeSimilarityWeight(target: Coffee, peer: Coffee, hasFeedback: boolean): number {
    let weight = 1.0;

    const roastDiff = Math.abs(
      ROAST_ORDER.indexOf(target.roastLevel) - ROAST_ORDER.indexOf(peer.roastLevel)
    );
    if (roastDiff === 0) weight += 3.0;
    else if (roastDiff === 1) weight += 1.5;

    if (target.process === peer.process) weight += 2.5;
    else if (FRUITY_PROCESSES.includes(target.process) && FRUITY_PROCESSES.includes(peer.process)) {
      weight += 1.0;
    }

    if (this.normalizeOrigin(target.originCountry) === this.normalizeOrigin(peer.originCountry)) {
      weight += 2.5;
    }

    if (target.altitudeMasl && peer.altitudeMasl && Math.abs(target.altitudeMasl - peer.altitudeMasl) <= 300) {
      weight += 1.0;
    }

    return hasFeedback ? weight * 1.25 : weight;
  }

  private static normalizeOrigin(origin: string): string {
    const clean = origin.trim().toLowerCase();
    if (clean === 'brasil' || clean === 'brazil') return 'brazil';
    if (clean === 'etiopía' || clean === 'etiopia' || clean === 'ethiopia') return 'ethiopia';
    if (clean === 'kenia' || clean === 'kenya') return 'kenya';
    return clean;
  }

  private static roundToHalfStep(value: number): number {
    return Math.round(value * 2) / 2;
  }
}
