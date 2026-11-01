import { CoffeeSommelierPort } from '@/core/application/ports/out/CoffeeSommelierPort';
import { Coffee } from '@/core/domain/coffee/Coffee';
import { Recipe, AiRationale } from '@/core/domain/recipe/Recipe';
import { RecipeExplainer } from '@/core/domain/recipe/RecipeExplainer';
import { ExtractionFeedback } from '@/core/domain/recipe/ExtractionFeedback';
import { Logger } from '../logger/Logger';

export class OpenAiSommelierAdapter implements CoffeeSommelierPort {
  private apiKey = process.env.OPENAI_API_KEY;

  async generateStory(coffee: Coffee): Promise<string> {
    if (!this.apiKey) {
      return this.fallbackStory(coffee);
    }

    try {
      const prompt = `Escribe una breve crónica editorial de sommelier (máximo 60 palabras en español) sobre este café de especialidad para un barista doméstico:
Tostador: ${coffee.roaster}
Café: ${coffee.name}
Origen: ${coffee.originCountry} ${coffee.region ? `(${coffee.region})` : ''}
Altitud: ${coffee.altitudeMasl || 'Media'} msnm
Proceso: ${coffee.process}
Varietal: ${coffee.variety}
Notas: ${coffee.tastingNotes.join(', ')}

Enfócate en el terroir, qué esperar en la taza de espresso y su momento ideal (solo o con leche). Tono elegante, sin clichés ni rodeos.`;

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 150,
          temperature: 0.7,
        }),
        signal: AbortSignal.timeout(8000),
      });

      if (!res.ok) return this.fallbackStory(coffee);
      const json = await res.json();
      return json.choices[0]?.message?.content?.trim() || this.fallbackStory(coffee);
    } catch (err) {
      Logger.error('AI_SOMMELIER', 'Error generating sommelier story', err);
      return this.fallbackStory(coffee);
    }
  }

  async diagnoseExtraction(feedback: ExtractionFeedback, coffee: Coffee): Promise<string> {
    if (!this.apiKey) {
      return this.fallbackDiagnosis(feedback);
    }

    try {
      const prompt = `Como maestro barista de especialidad, diagnostica en 1-2 frases concretas este tiro:
Café: ${coffee.name} (${coffee.process}, tueste ${coffee.roastLevel})
Dosis: ${feedback.actualDoseGrams}g -> Salida: ${feedback.actualYieldGrams}g en ${feedback.actualTimeSeconds}s
Molienda: #${feedback.actualGrindSetting}
Sensación en taza: ${feedback.tasteProfile}
Notas del usuario: "${feedback.userNotes || 'Ninguna'}"

Da una explicación física breve de lo ocurrido y la acción correctora exacta.`;

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 120,
          temperature: 0.3,
        }),
        signal: AbortSignal.timeout(8000),
      });

      if (!res.ok) return this.fallbackDiagnosis(feedback);
      const json = await res.json();
      return json.choices[0]?.message?.content?.trim() || this.fallbackDiagnosis(feedback);
    } catch (err) {
      Logger.error('AI_SOMMELIER', 'Error diagnosing extraction', err);
      return this.fallbackDiagnosis(feedback);
    }
  }

  async generateRationale(coffee: Coffee, recipe: Recipe): Promise<AiRationale> {
    if (!this.apiKey) return this.fallbackRationale(coffee, recipe);
    try {
      const prompt = `Como maestro barista de especialidad, fundamenta en JSON este ajuste técnico:
Café: ${coffee.name} (${coffee.roaster}, ${coffee.originCountry}, ${coffee.process}, ${coffee.roastLevel})
Ajuste: Molienda #${recipe.grindSetting}, Temperatura ${recipe.machineTemperature}, Ratio ${recipe.ratio} (${recipe.doseGrams}g -> ${recipe.yieldGrams}g), Reposo ${coffee.recommendedRestDays}d.
Devuelve un JSON con claves exactas: grindWhy, tempWhy, ratioWhy, restWhy. Cada una una frase técnica y convincente en español.`;

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
          max_tokens: 280,
          temperature: 0.3,
        }),
        signal: AbortSignal.timeout(8000),
      });

      if (!res.ok) return this.fallbackRationale(coffee, recipe);
      const json = await res.json();
      const parsed = JSON.parse(json.choices[0]?.message?.content || '{}');
      if (parsed.grindWhy && parsed.tempWhy && parsed.ratioWhy && parsed.restWhy) {
        return parsed as AiRationale;
      }
      return this.fallbackRationale(coffee, recipe);
    } catch (err) {
      Logger.error('AI_SOMMELIER', 'Error generating recipe rationale', err);
      return this.fallbackRationale(coffee, recipe);
    }
  }

  private fallbackRationale(coffee: Coffee, recipe: Recipe): AiRationale {
    const r = RecipeExplainer.explain(coffee, recipe);
    return {
      grindWhy: r.grindWhy.es,
      tempWhy: r.tempWhy.es,
      ratioWhy: r.ratioWhy.es,
      restWhy: r.restWhy.es,
    };
  }

  private fallbackStory(coffee: Coffee): string {
    const notesStr = coffee.tastingNotes.length > 0 ? coffee.tastingNotes.join(', ') : 'dulzor caramelizado';
    return `Cultivado en los terruños de ${coffee.originCountry}, este ${coffee.variety} con proceso ${coffee.process} destaca en espresso por un cuerpo estructurado y notas a ${notesStr}. Ideal para degustar solo o como base de un flat white sedoso.`;
  }

  private fallbackDiagnosis(feedback: ExtractionFeedback): string {
    if (feedback.tasteProfile === 'sour') {
      return `Sub-extracción por flujo excesivo (${feedback.actualTimeSeconds}s): los ácidos orgánicos no se han compensado con los azúcares. Recomendado moler más fino y subir la temperatura.`;
    }
    if (feedback.tasteProfile === 'bitter') {
      return `Sobre-extracción: el contacto prolongado ha extraído taninos amargos. Ajusta el dial a un punto más grueso y reduce el rendimiento a 1:2.0.`;
    }
    if (feedback.tasteProfile === 'channeled') {
      return `Canalización periférica en la cesta del portafiltro: deshaz grumos con agujas WDT y prensa a nivel para un sellado homogéneo.`;
    }
    return `Tiro en el punto dulce: balance perfecto entre acidez viva, cuerpo cremoso y final prolongado. ¡Receta confirmada!`;
  }
}
