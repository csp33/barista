import { Coffee } from '@/domain/coffee/Coffee';
import { UserProfile } from '@/domain/user/UserProfile';
import { ExtractionFeedback, TasteProfile } from '@/domain/recipe/ExtractionFeedback';
import { SageTemperatureSetting } from '@/domain/equipment/EspressoMachine';

export const INITIAL_PROFILES: UserProfile[] = [
  new UserProfile({
    id: 'carlos',
    name: 'Carlos',
    role: 'admin',
    language: 'es',
    activeCoffeeId: 'coffee-nomad-worka',
    grinderId: 'df64-gen-2',
    machineId: 'sage-barista-touch-impress',
  }),
];

export const INITIAL_COFFEES: Coffee[] = [
  new Coffee({
    id: 'coffee-nomad-worka',
    roaster: 'Nomad Coffee',
    name: 'Worka Sakaro',
    originCountry: 'Ethiopia',
    region: 'Gedeb, Yirgacheffe',
    producer: 'Mijane Woresa',
    altitudeMasl: 2050,
    variety: 'Kurume, Wolisho',
    process: 'washed',
    roastLevel: 'light',
    tastingNotes: ['White Peach', 'Jasmine', 'Bergamot', 'Lime'],
    sourceUrl: 'https://nomadcoffee.es/products/worka-sakaro',
    imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&auto=format&fit=crop&q=80',
    recommendedRestDays: 18,
    status: 'active',
  }),
  new Coffee({
    id: 'coffee-sanjorge-dutra',
    roaster: 'San Jorge Coffee',
    name: 'Fazenda Dutra',
    originCountry: 'Brazil',
    region: 'Matas de Minas',
    producer: 'Walter Dutra',
    altitudeMasl: 1250,
    variety: 'Red Catuai',
    process: 'natural',
    roastLevel: 'medium',
    tastingNotes: ['Milk Chocolate', 'Roasted Hazelnut', 'Caramel'],
    sourceUrl: 'https://sanjorge.coffee/products/fazenda-dutra',
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
    recommendedRestDays: 8,
    status: 'active',
  }),
  new Coffee({
    id: 'coffee-rightside-elparaiso',
    roaster: 'Right Side Coffee',
    name: 'El Paraiso 92',
    originCountry: 'Colombia',
    region: 'Cauca',
    producer: 'Wilton Benitez',
    altitudeMasl: 1950,
    variety: 'Castillo',
    process: 'anaerobic',
    roastLevel: 'medium_light',
    tastingNotes: ['Tropical Fruit', 'Passionfruit', 'Vanilla cream'],
    sourceUrl: 'https://rightsidecoffee.com/products/el-paraiso-92',
    imageUrl: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800&auto=format&fit=crop&q=80',
    recommendedRestDays: 12,
    status: 'history',
  }),
  new Coffee({
    id: 'coffee-elcriollo-malabar',
    roaster: 'Cafés el Criollo',
    name: 'India Malabar Monsooned',
    originCountry: 'India',
    region: 'Malabar Coast',
    altitudeMasl: 1200,
    variety: 'Kent, Catimor',
    process: 'washed',
    roastLevel: 'medium',
    tastingNotes: ['Cereal', 'Spices', 'Cedar', 'Dark Cocoa'],
    sourceUrl: 'https://cafeselcriollo.com/producto/cafe-india/',
    imageUrl: 'https://cafeselcriollo.com/wp-content/uploads/2020/10/Cafe-india.webp',
    recommendedRestDays: 14,
    status: 'active',
  }),
];

function daysAgoAt(base: Date, daysAgo: number, hour: number, minute: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, minute, 0, 0);
  return d;
}

export function buildInitialFeedbacks(now: Date = new Date()): ExtractionFeedback[] {
  const rows: [string, string, number, number, number, number, SageTemperatureSetting, TasteProfile, number, number, number, string, string?][] = [
    ['fb-seed-1', 'recipe-carlos-coffee-nomad-worka', 10.5, 18.0, 40, 24, 'hot_1', 'sour', 0, 8, 15, 'Acidez cítrica un poco punzante al principio, falta dulzor.', 'Sub-extracción ligera por paso rápido (24s). Baja 0.5 puntos en el DF64.'],
    ['fb-seed-2', 'recipe-carlos-coffee-nomad-worka', 9.5, 18.0, 42, 29, 'hot_1', 'balanced', 0, 11, 40, 'Melocotón blanco y jazmín súper limpios, cuerpo sedoso.', 'Punto dulce clavado en #9.5 con ratio 1:2.3 para lavado etíope.'],
    ['fb-seed-3', 'recipe-carlos-coffee-sanjorge-dutra', 12.5, 18.0, 36, 28, 'normal', 'balanced', 0, 16, 10, 'Chocolate con leche y avellana tostada, crema densa.', 'Extracción equilibrada 1:2 ideal para natural brasileño.'],
    ['fb-seed-4', 'recipe-carlos-coffee-sanjorge-dutra', 11.5, 18.5, 38, 34, 'normal', 'bitter', 1, 8, 30, 'Final seco y demasiado tostado al final del trago.', 'Sobre-extracción (34s). Abre molienda a #12.5 y mantén dosis en 18.0g.'],
    ['fb-seed-5', 'recipe-carlos-coffee-sanjorge-dutra', 12.5, 18.0, 36, 27, 'normal', 'balanced', 1, 15, 20, 'Caramelo redondo y cero amargor tras subir a #12.5.', 'Ajuste confirmado: flujo continuo y dulzor óptimo.'],
    ['fb-seed-6', 'recipe-carlos-coffee-rightside-elparaiso', 10.5, 18.0, 40, 28, 'cold_1', 'balanced', 2, 9, 5, 'Explosión de maracuyá y crema de vainilla, textura jugosa.', 'Temperatura Frío 1 (92°C) protege los ésteres tropicales del proceso anaeróbico.'],
    ['fb-seed-7', 'recipe-carlos-coffee-elcriollo-malabar', 6.5, 18.0, 34, 22, 'normal', 'channeled', 3, 8, 45, 'Chorros laterales en el portafiltro naked, faltó WDT más profundo.', 'Canalización evidente: esmera distribución WDT y baja a #5.5.'],
    ['fb-seed-8', 'recipe-carlos-coffee-elcriollo-malabar', 5.5, 17.5, 35, 29, 'normal', 'balanced', 3, 13, 15, 'Cacao puro, cedro y especias dulces con crema tigreada brutal.', 'God Shot de perfil clásico especiado.'],
    ['fb-seed-9', 'recipe-carlos-coffee-nomad-worka', 9.5, 18.0, 42, 30, 'hot_1', 'balanced', 5, 9, 10, 'Bergamota y lima dulce en el postgusto, súper limpio.'],
    ['fb-seed-10', 'recipe-carlos-coffee-rightside-elparaiso', 10.0, 18.0, 39, 31, 'cold_1', 'balanced', 5, 12, 0, 'Doble espresso de media mañana con notas de fruta de la pasión.'],
    ['fb-seed-11', 'recipe-carlos-coffee-sanjorge-dutra', 12.5, 18.0, 36, 27, 'normal', 'balanced', 7, 8, 0, 'Taza achocolatada perfecta para empezar el día.'],
  ];

  return rows.map(([id, recipeId, actualGrindSetting, actualDoseGrams, actualYieldGrams, actualTimeSeconds, actualTemperature, tasteProfile, daysAgo, hour, min, userNotes, aiDiagnosis]) =>
    new ExtractionFeedback({
      id,
      recipeId,
      userId: 'carlos',
      actualGrindSetting,
      actualDoseGrams,
      actualYieldGrams,
      actualTimeSeconds,
      actualTemperature,
      tasteProfile,
      userNotes,
      aiDiagnosis,
      createdAt: daysAgoAt(now, daysAgo, hour, min),
    })
  );
}
