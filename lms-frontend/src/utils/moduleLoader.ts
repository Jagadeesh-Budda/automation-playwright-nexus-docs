const moduleCache: Record<string, any> = {};

/**
 * Loads a module content file dynamically.
 * Caches in memory to prevent duplicate requests.
 */
export async function loadModule(moduleFile: string): Promise<any> {
  if (!moduleFile) return null;
  
  if (moduleCache[moduleFile]) {
    return moduleCache[moduleFile];
  }

  try {
    const data = await import(`../data/modules/${moduleFile}.json`);
    moduleCache[moduleFile] = data.default || data;
    return moduleCache[moduleFile];
  } catch (err) {
    console.error(`Failed to load module content for file: ${moduleFile}`, err);
    throw err;
  }
}

/**
 * Prefetches a module content file in the background and stores it in the cache.
 */
export function prefetchModule(moduleFile: string): void {
  if (!moduleFile || moduleCache[moduleFile]) return;

  import(`../data/modules/${moduleFile}.json`)
    .then((data) => {
      moduleCache[moduleFile] = data.default || data;
    })
    .catch(() => {
      // Fail silently for prefetching
    });
}
