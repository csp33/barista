import { CoffeeSommelierPort } from '@/core/application/ports/out/CoffeeSommelierPort';
import { Coffee } from '@/core/domain/coffee/Coffee';
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
      return this.fallbackDiagnosis(feedback, coffee);
    }

    try {
      const prompt = `Como maestro barista de especialidad para molino DF64 y cafetera Sage 54mm, diagnostica en 1-2 frases concretas este tiro:
Café: ${coffee.name} (${coffee.process}, tueste ${coffee.roastLevel})
Dosis: ${feedback.actualDoseGrams}g -> Salida: ${feedback.actualYieldGrams}g en ${feedback.actualTimeSeconds}s
Molienda DF64: #${feedback.actualGrindSetting}
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

      if (!res.ok) return this.fallbackDiagnosis(feedback, coffee);
      const json = await res.json();
      return json.choices[0]?.message?.content?.trim() || this.fallbackDiagnosis(feedback, coffee);
    } catch (err) {
      Logger.error('AI_SOMMELIER', 'Error diagnosing extraction', err);
      return this.fallbackDiagnosis(feedback, coffee);
    }
  }

  private fallbackStory(coffee: Coffee): string {
    const notesStr = coffee.tastingNotes.length > 0 ? coffee.tastingNotes.join(', ') : 'dulzor caramelizado';
    return `Cultivado en los terruños de ${coffee.originCountry}, este ${coffee.variety} con proceso ${coffee.process} destaca en espresso por un cuerpo estructurado y notas a ${notesStr}. Ideal para degustar solo o como base de un flat white sedoso.`;
  }

  private fallbackDiagnosis(feedback: ExtractionFeedback, coffee: Coffee): string {
    if (feedback.tasteProfile === 'sour') {
      return `Sub-extracción por flujo excesivo (${feedback.actualTimeSeconds}s): los ácidos orgánicos no se han compensado con los azúcares. Recomendado moler 0.5 puntos más fino en DF64 y subir temperatura Sage.`;
    }
    if (feedback.tasteProfile === 'bitter') {
      return `Sobre-extracción: el contacto prolongado ha extraído taninos amargos. Ajusta el dial DF64 +0.5 más grueso y reduce el rendimiento a 1:2.0.`;
    }
    if (feedback.tasteProfile === 'channeled') {
      return `Canalización periférica en la cesta de 54mm: deshaz grumos con WDT antes de accionar la palanca Impress para un sellado homogéneo.`;
    }
    return `Tiro en el punto dulce: balance perfecto entre acidez viva, cuerpo cremoso y final prolongado. ¡Receta confirmada!`;
  }
}
