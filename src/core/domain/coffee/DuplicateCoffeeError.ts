export class DuplicateCoffeeError extends Error {
  readonly roaster: string;
  readonly coffeeName: string;

  constructor(roaster: string, coffeeName: string) {
    super(`Coffee "${coffeeName}" by "${roaster}" already exists in stash`);
    this.name = 'DuplicateCoffeeError';
    this.roaster = roaster;
    this.coffeeName = coffeeName;
  }
}
