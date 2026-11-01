import { Coffee } from '@/core/domain/coffee/Coffee';
import { Recipe, AiRationale } from '@/core/domain/recipe/Recipe';
import { ExtractionFeedback } from '@/core/domain/recipe/ExtractionFeedback';

export interface CoffeeSommelierPort {
  generateStory(coffee: Coffee): Promise<string>;
  diagnoseExtraction(feedback: ExtractionFeedback, coffee: Coffee): Promise<string>;
  generateRationale(coffee: Coffee, recipe: Recipe): Promise<AiRationale>;
}
