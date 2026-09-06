export class ProviderNotConfiguredError extends Error {
  readonly code = 'PROVIDER_NOT_CONFIGURED';

  constructor(message = 'No production flight provider is configured') {
    super(message);
    this.name = 'ProviderNotConfiguredError';
  }
}

export class ProviderConfigurationError extends Error {
  readonly code = 'PROVIDER_CONFIGURATION_ERROR';

  constructor(message: string) {
    super(message);
    this.name = 'ProviderConfigurationError';
  }
}
