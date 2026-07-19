/**
 * The provider registry is the single extension point of the framework. New
 * providers are added by registering an instance; nothing else in the system
 * needs to change. The registry is immutable-by-convention after bootstrap.
 */

import type { IntegrationCategory, ProviderDescriptor } from '@invincible/types';

import type { BaseProvider } from './provider';

export class ProviderRegistry {
  private readonly providers = new Map<string, BaseProvider>();

  /** Register a provider. Throws on duplicate ids to catch wiring mistakes. */
  register(provider: BaseProvider): this {
    const id = provider.descriptor.id;
    if (this.providers.has(id)) {
      throw new Error(`Provider "${id}" is already registered.`);
    }
    this.providers.set(id, provider);
    return this;
  }

  /** Register many providers at once. */
  registerAll(providers: readonly BaseProvider[]): this {
    for (const provider of providers) this.register(provider);
    return this;
  }

  has(id: string): boolean {
    return this.providers.has(id);
  }

  /** Get a provider or throw if unknown. */
  get(id: string): BaseProvider {
    const provider = this.providers.get(id);
    if (!provider) throw new Error(`Unknown integration provider "${id}".`);
    return provider;
  }

  /** Get a provider or undefined. */
  find(id: string): BaseProvider | undefined {
    return this.providers.get(id);
  }

  list(): BaseProvider[] {
    return [...this.providers.values()];
  }

  listByCategory(category: IntegrationCategory): BaseProvider[] {
    return this.list().filter((p) => p.descriptor.category === category);
  }

  /** Public, secret-free catalog for the UI. */
  descriptors(): ProviderDescriptor[] {
    return this.list().map((p) => p.descriptor);
  }
}
