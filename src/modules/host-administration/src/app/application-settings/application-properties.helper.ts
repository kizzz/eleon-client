import { ClientApplicationDto, ClientApplicationPropertyDto } from '@eleon/sites-management-proxy';

/**
 * Gets a string property value by key from the application.
 */
export function getStringProperty(
  app: ClientApplicationDto,
  key: string
): string | undefined {
  return app.properties?.find(p => p.key === key)?.value;
}

/**
 * Sets or updates a string property in the application.
 */
export function setStringProperty(
  app: ClientApplicationDto,
  key: string,
  value: string
): void {
  if (!app.properties) {
    app.properties = [];
  }

  const existing = app.properties.find(p => p.key === key);

  if (existing) {
    existing.value = value;
  } else {
    app.properties.push({ key, value });
  }
}

/**
 * Gets a boolean property value by key from the application.
 */
export function getBooleanProperty(
  app: ClientApplicationDto,
  key: string
): boolean {
  const prop = app.properties?.find(p => p.key === key);
  return prop?.value === 'true';
}

/**
 * Sets or updates a boolean property in the application.
 */
export function setBooleanProperty(
  app: ClientApplicationDto,
  key: string,
  value: boolean
): void {
  if (!app.properties) {
    app.properties = [];
  }

  const stringValue = value.toString();
  const existing = app.properties.find(p => p.key === key);

  if (existing) {
    existing.value = stringValue;
  } else {
    app.properties.push({ key, value: stringValue });
  }
}
