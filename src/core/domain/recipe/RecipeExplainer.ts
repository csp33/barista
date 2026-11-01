import { Coffee } from '../coffee/Coffee';
import { Recipe } from './Recipe';

export interface RecipeRationale {
  grindWhy: { es: string; en: string };
  tempWhy: { es: string; en: string };
  ratioWhy: { es: string; en: string };
  restWhy: { es: string; en: string };
}

export class RecipeExplainer {
  static explain(coffee: Coffee, recipe: Recipe): RecipeRationale {
    const nameLower = coffee.name.toLowerCase();
    const isMonsooned =
      nameLower.includes('monsooned') ||
      nameLower.includes('malabar') ||
      (coffee.originCountry.toLowerCase().includes('india') && nameLower.includes('monsoon'));

    // 1. Grind rationale
    let grindWhy = {
      es: `Molienda media #${recipe.grindSetting} calibrada para balancear la extracción, resaltando el dulzor natural y evitando amargor.`,
      en: `Medium grind #${recipe.grindSetting} calibrated to balance extraction, highlighting natural sweetness and avoiding bitterness.`,
    };

    if (isMonsooned) {
      grindWhy = {
        es: `Grano monsonado poroso y de baja densidad celular: requiere molienda muy fina (#${recipe.grindSetting}) para compactar la pastilla en la cesta de 54mm y permitir que la bomba alcance 9 bares sin canalizar.`,
        en: `Monsooned beans have expanded porous cell structure: fine grind (#${recipe.grindSetting}) creates necessary puck resistance in the 54mm basket for 9 bar extraction without channeling.`,
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

    // 2. Temperature rationale
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

    // 3. Ratio rationale
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

    // 4. Rest days rationale
    const restWhy = {
      es: `Reposo óptimo (${coffee.recommendedRestDays} días): permite la desgasificación del CO2 acumulado tras el tueste para evitar canalización y sabor carbónico.`,
      en: `Optimal rest (${coffee.recommendedRestDays} days): allows degassing of CO2 from roasting to prevent channeling and carbonated taste.`,
    };

    return { grindWhy, tempWhy, ratioWhy, restWhy };
  }
}
