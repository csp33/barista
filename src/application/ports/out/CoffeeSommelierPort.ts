import { Coffee } from '@/domain/coffee/Coffee';
import { Recipe, AiRationale } from '@/domain/recipe/Recipe';
import { ExtractionFeedback } from '@/domain/recipe/ExtractionFeedback';

export interface CoffeeSommelierPort {
  generateStory(coffee: Coffee): Promise<string>;
  diagnoseExtraction(feedback: ExtractionFeedback, coffee: Coffee): Promise<string>;
  generateRationale(coffee: Coffee, recipe: Recipe): Promise<AiRationale>;
}
