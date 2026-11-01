import { Coffee } from '../coffee/Coffee';
import { Recipe } from './Recipe';
import { EspressoMachine } from '../equipment/EspressoMachine';

export interface RecipeRationale {
  doseWhy: { es: string; en: string };
  grindWhy: { es: string; en: string };
  tempWhy: { es: string; en: string };
  ratioWhy: { es: string; en: string };
  restWhy: { es: string; en: string };
}

export class RecipeExplainer {
  static explain(coffee: Coffee, recipe: Recipe, machine?: EspressoMachine): RecipeRationale {
    const nameLower = coffee.name.toLowerCase();
    const isMonsooned =
      nameLower.includes('monsooned') ||
      nameLower.includes('malabar') ||
      (coffee.originCountry.toLowerCase().includes('india') && nameLower.includes('monsoon'));

    const basketDesc = machine ? `de ${machine.portafilterSizeMm}mm` : 'del portafiltro';
    const basketDescEn = machine ? `${machine.portafilterSizeMm}mm` : 'portafilter';

    // 1. Dose rationale
    let doseWhy = {
      es: `Dosis estándar de ${recipe.doseGrams}g calibrada para la cesta ${basketDesc}: garantiza el espacio libre (headspace) de 1.5-2mm para una saturación homogénea de la pastilla.`,
      en: `Standard ${recipe.doseGrams}g dose calibrated for the ${basketDescEn} basket: ensures ideal 1.5-2mm headspace for homogeneous puck saturation.`,
    };

    if (isMonsooned) {
      doseWhy = {
        es: `Grano monsonado poroso y de baja densidad celular: al estar hinchado ocupa mayor volumen. Dosis reducida a ${recipe.doseGrams}g para no saturar la cesta ${basketDesc} y evitar rozar la ducha.`,
        en: `Monsooned beans have expanded porous cell structure and lower density: dose reduced to ${recipe.doseGrams}g to avoid overfilling the ${basketDescEn} basket and keep shower screen clearance.`,
      };
    } else if (coffee.roastLevel === 'light' || (coffee.altitudeMasl && coffee.altitudeMasl >= 1800)) {
      doseWhy = {
        es: `Grano denso de alta dureza (${coffee.roastLevel === 'light' ? 'tueste claro' : `${coffee.altitudeMasl}m`}): ocupa menor volumen. Dosis aumentada a ${recipe.doseGrams}g para llenar la cesta ${basketDesc} y ofrecer resistencia al flujo.`,
        en: `Dense hard beans (${coffee.roastLevel === 'light' ? 'light roast' : `${coffee.altitudeMasl}m`}): lower volume per gram. Dose increased to ${recipe.doseGrams}g to achieve proper basket fill in ${basketDescEn} and build extraction resistance.`,
      };
    } else if (coffee.roastLevel === 'medium_dark' || coffee.roastLevel === 'dark') {
      doseWhy = {
        es: `Tueste más desarrollado con expansión celular: granos menos densos y más voluminosos. Dosis ajustada a ${recipe.doseGrams}g para respetar el espacio de expansión (headspace) en la cesta ${basketDesc}.`,
        en: `Developed roast with expanded cell structure: less dense and more voluminous. Dose adjusted to ${recipe.doseGrams}g to preserve proper puck expansion headspace in ${basketDescEn} basket.`,
      };
    }

    // 2. Grind rationale
    let grindWhy = {
      es: `Molienda media #${recipe.grindSetting} calibrada para balancear la extracción, resaltando el dulzor natural y evitando amargor.`,
      en: `Medium grind #${recipe.grindSetting} calibrated to balance extraction, highlighting natural sweetness and avoiding bitterness.`,
    };

    if (isMonsooned) {
      grindWhy = {
        es: `Grano monsonado poroso y de baja densidad celular: requiere molienda muy fina (#${recipe.grindSetting}) para compactar la pastilla en la cesta del portafiltro y permitir que la bomba alcance 9 bares sin canalizar.`,
        en: `Monsooned beans have expanded porous cell structure: fine grind (#${recipe.grindSetting}) creates necessary puck resistance in the portafilter basket for 9 bar extraction without channeling.`,
      };
    } else if (coffee.originCountry.toLowerCase().includes('brazil') || coffee.originCountry.toLowerCase().includes('brasil')) {
      grindWhy = {
        es: `Origen Brasil (${coffee.process}): genera mayor cantidad de finos. El dial #${recipe.grindSetting} (rango 10-15) previene amargor y resalta notas dulces a chocolate y frutos secos.`,
        en: `Brazil origin (${coffee.process}): produces more micro-fines. Grind #${recipe.grindSetting} (range 10-15) prevents harsh bitterness and brings out sweet chocolate and nutty notes.`,
      };
    } else if (coffee.altitudeMasl && coffee.altitudeMasl >= 1800) {
      grindWhy = {
        es: `Grano denso de gran altura (${coffee.altitudeMasl}m): molienda fina (#${recipe.grindSetting}) para aumentar la superficie de contacto y extraer la acidez brillante y notas complejas.`,
        en: `High-altitude dense beans (${coffee.altitudeMasl}m): finer grind (#${recipe.grindSetting}) maximizes contact surface to extract bright acidity and complex floral notes.`,
      };
    } else if (coffee.process === 'natural' || coffee.process === 'anaerobic') {
      grindWhy = {
        es: `Proceso ${coffee.process}: genera mayor proporción de finos al moler. La molienda #${recipe.grindSetting} previene sobre-extracción y astringencia en taza.`,
        en: `${coffee.process} process produces more micro-fines. Grind #${recipe.grindSetting} prevents over-extraction and astringency.`,
      };
    }

    // 3. Temperature rationale
    let tempWhy = {
      es: `Temperatura estándar (93°C): punto de equilibrio térmico ideal para tuestes medios para extraer cuerpo sin quemar compuestos delicados.`,
      en: `Normal temperature (93°C): optimal thermal balance for medium roasts to extract rich body without burning delicate compounds.`,
    };

    if (recipe.machineTemperature === 'very_high') {
      tempWhy = {
        es: `Temperatura Muy Alta (96°C): necesaria para disolver los azúcares densos de tuestes claros de especialidad y redondear la acidez sin que resulte punzante.`,
        en: `Very High temperature (96°C): dissolves dense sugars in light specialty roasts to balance acidity and bring out sweet complexity.`,
      };
    } else if (recipe.machineTemperature === 'high') {
      tempWhy = {
        es: `Temperatura Alta (95°C): temperatura enérgica para cafés de tueste medio-claro que realza la frutosidad y cuerpo sedoso.`,
        en: `High temperature (95°C): elevated temp for medium-light roasts to enhance fruit notes and silky texture.`,
      };
    } else if (recipe.machineTemperature === 'low') {
      tempWhy = {
        es: `Temperatura Baja (90°C): modera la velocidad de extracción en tuestes oscuros evitando sabores a ceniza o quemado.`,
        en: `Low temperature (90°C): gentle extraction for darker roasts to prevent harsh ashy bitterness.`,
      };
    }

    // 4. Ratio rationale
    const ratioWhy =
      recipe.ratio === '1:2.3' || recipe.ratio === '1:2.2'
        ? {
            es: `Ratio alargado (${recipe.ratio}, ${recipe.doseGrams}g ➔ ${recipe.yieldGrams}g): estira la extracción para equilibrar la acidez viva en taza.`,
            en: `Extended ratio (${recipe.ratio}, ${recipe.doseGrams}g ➔ ${recipe.yieldGrams}g): stretches extraction to balance vibrant acidity in the cup.`,
          }
        : {
            es: `Ratio clásico (${recipe.ratio}, ${recipe.doseGrams}g ➔ ${recipe.yieldGrams}g): máxima concentración, cuerpo aterciopelado y crema espesa.`,
            en: `Classic ratio (${recipe.ratio}, ${recipe.doseGrams}g ➔ ${recipe.yieldGrams}g): maximum concentration, velvety body and dense crema.`,
          };

    // 5. Rest days rationale
    const restWhy = {
      es: `Reposo óptimo (${coffee.recommendedRestDays} días): permite la desgasificación del CO2 acumulado tras el tueste para evitar canalización y sabor carbónico.`,
      en: `Optimal rest (${coffee.recommendedRestDays} days): allows degassing of CO2 from roasting to prevent channeling and carbonated taste.`,
    };

    return { doseWhy, grindWhy, tempWhy, ratioWhy, restWhy };
  }
}
