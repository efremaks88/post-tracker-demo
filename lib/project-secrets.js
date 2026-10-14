/**
 * Project credential boundary.
 *
 * Legacy project dossiers may contain credentials. They stay in the database
 * until a separate migration is approved, but the shared application API must
 * never return, accept or overwrite them.
 */

const SENSITIVE_KEY = /^(?:login|username|user|password|passwd|pwd|passphrase|secret|token|api[_-]?key|access[_-]?key|private[_-]?key|client[_-]?secret|credentials?)$/i;
const ACCESS_CREDENTIAL_KEY = /^(?:login|username|user|password|passwd|pwd|passphrase|secret|token|api[_-]?key|access[_-]?key|private[_-]?key|client[_-]?secret|credentials?)$/i;

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function clone(value) {
  if (Array.isArray(value)) return value.map(clone);
  if (isObject(value)) {
    const result = {};
    for (const [key, item] of Object.entries(value)) result[key] = clone(item);
    return result;
  }
  return value;
}

function hasMeaningfulValue(value) {
  if (value === null || value === undefined || value === '') return false;
  if (Array.isArray(value)) return value.some(hasMeaningfulValue);
  if (isObject(value)) return Object.values(value).some(hasMeaningfulValue);
  return true;
}

function accessContainsCredential(access) {
  if (!isObject(access)) return hasMeaningfulValue(access);
  return Object.entries(access).some(function(entry) {
    const key = entry[0];
    const value = entry[1];
    if (ACCESS_CREDENTIAL_KEY.test(key)) return hasMeaningfulValue(value);
    if (Array.isArray(value)) return value.some(accessContainsCredential);
    if (isObject(value)) return accessContainsCredential(value);
    return false;
  });
}

function sanitizeAccesses(accesses) {
  if (!Array.isArray(accesses)) return [];
  return accesses.map(function(access) {
    const safe = {};
    if (isObject(access)) {
      if (typeof access.id === 'string') safe.id = access.id;
      if (typeof access.label === 'string') safe.label = access.label;
      if (typeof access.name === 'string' && !safe.label) safe.label = access.name;
    }
    if (accessContainsCredential(access)) safe.credentialsStored = true;
    return safe;
  }).filter(function(access) {
    return access.id || access.label || access.credentialsStored;
  });
}

function sanitizeNode(value) {
  if (Array.isArray(value)) return value.map(sanitizeNode);
  if (!isObject(value)) return value;
  const safe = {};
  for (const [key, item] of Object.entries(value)) {
    if (key === 'accesses') {
      safe.accesses = sanitizeAccesses(item);
    } else if (!SENSITIVE_KEY.test(key)) {
      safe[key] = sanitizeNode(item);
    }
  }
  return safe;
}

function sanitizeProjectForClient(project) {
  if (!isObject(project)) return project;
  const safe = clone(project);
  safe.dossier = sanitizeNode(isObject(project.dossier) ? project.dossier : {});
  return safe;
}

function sanitizeProjectsForClient(projects) {
  return Array.isArray(projects) ? projects.map(sanitizeProjectForClient) : [];
}

function containsSensitiveNode(value, inAccesses) {
  if (Array.isArray(value)) return value.some(function(item) { return containsSensitiveNode(item, inAccesses); });
  if (!isObject(value)) return false;
  return Object.entries(value).some(function(entry) {
    const key = entry[0];
    const item = entry[1];
    const isCredentialKey = inAccesses ? ACCESS_CREDENTIAL_KEY.test(key) : SENSITIVE_KEY.test(key);
    if (isCredentialKey && hasMeaningfulValue(item)) return true;
    return containsSensitiveNode(item, inAccesses || key === 'accesses');
  });
}

function containsSensitiveProjectInput(project) {
  return isObject(project) && containsSensitiveNode(project.dossier, false);
}

function mergePreservingSecrets(existing, incoming, inAccesses) {
  if (inAccesses) {
    return existing === undefined ? sanitizeNode(incoming) : clone(existing);
  }
  if (Array.isArray(incoming)) {
    return incoming.map(function(item, index) {
      const oldItem = Array.isArray(existing) ? existing[index] : undefined;
      return mergePreservingSecrets(oldItem, item, false);
    });
  }
  if (!isObject(incoming)) return incoming;

  const oldObject = isObject(existing) ? existing : {};
  const result = {};
  for (const [key, item] of Object.entries(incoming)) {
    if (key === 'accesses') {
      result.accesses = mergePreservingSecrets(oldObject.accesses, item, true);
    } else if (!SENSITIVE_KEY.test(key)) {
      result[key] = mergePreservingSecrets(oldObject[key], item, false);
    }
  }
  for (const [key, item] of Object.entries(oldObject)) {
    if (SENSITIVE_KEY.test(key) && hasMeaningfulValue(item)) result[key] = clone(item);
  }
  if (!Object.prototype.hasOwnProperty.call(incoming, 'accesses') &&
      Object.prototype.hasOwnProperty.call(oldObject, 'accesses')) {
    result.accesses = clone(oldObject.accesses);
  }
  return result;
}

function mergeDossierPreservingSecrets(existing, incoming) {
  return mergePreservingSecrets(
    isObject(existing) ? existing : {},
    isObject(incoming) ? incoming : {},
    false
  );
}

module.exports = {
  containsSensitiveProjectInput,
  mergeDossierPreservingSecrets,
  sanitizeProjectForClient,
  sanitizeProjectsForClient,
};
