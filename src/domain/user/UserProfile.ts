export type UserRole = 'admin' | 'user';

export interface UserProfileProps {
  id: string;
  name: string;
  role?: UserRole;
  language?: 'es' | 'en';
  activeCoffeeId?: string | null;
  grinderId?: string;
  machineId?: string;
  avatar?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class UserProfile {
  readonly id: string;
  readonly name: string;
  readonly role: UserRole;
  readonly language: 'es' | 'en';
  readonly activeCoffeeId: string | null;
  readonly grinderId: string;
  readonly machineId: string;
  readonly avatar: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: UserProfileProps) {
    if (!props.id || props.id.trim().length === 0) {
      throw new Error('User ID is required');
    }
    if (!props.name || props.name.trim().length === 0) {
      throw new Error('User name is required');
    }

    this.id = props.id.trim().toLowerCase();
    this.name = props.name.trim();
    this.role = props.role ?? 'user';
    this.language = props.language ?? 'es';
    this.activeCoffeeId = props.activeCoffeeId ?? null;
    this.grinderId = props.grinderId ?? 'df64-gen-2';
    this.machineId = props.machineId ?? 'sage-barista-touch-impress';
    this.avatar = props.avatar ?? this.name.slice(0, 2).toUpperCase();
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  withRole(role: UserRole): UserProfile {
    return new UserProfile({
      ...this,
      role,
      updatedAt: new Date(),
    });
  }

  withLanguage(language: 'es' | 'en'): UserProfile {
    return new UserProfile({
      ...this,
      language,
      updatedAt: new Date(),
    });
  }

  withActiveCoffee(activeCoffeeId: string | null): UserProfile {
    return new UserProfile({
      ...this,
      activeCoffeeId,
      updatedAt: new Date(),
    });
  }

  withEquipment(grinderId: string, machineId: string): UserProfile {
    return new UserProfile({
      ...this,
      grinderId,
      machineId,
      updatedAt: new Date(),
    });
  }

  update(patch: Partial<UserProfileProps>): UserProfile {
    return new UserProfile({
      id: this.id,
      name: patch.name !== undefined ? patch.name : this.name,
      role: patch.role !== undefined ? patch.role : this.role,
      language: patch.language !== undefined ? patch.language : this.language,
      activeCoffeeId:
        patch.activeCoffeeId !== undefined ? patch.activeCoffeeId : this.activeCoffeeId,
      grinderId: patch.grinderId !== undefined ? patch.grinderId : this.grinderId,
      machineId: patch.machineId !== undefined ? patch.machineId : this.machineId,
      avatar: patch.avatar !== undefined ? patch.avatar : this.avatar,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    });
  }
}
