import path from 'node:path';

export function resolveInteractiveSource(options, environment, rootDir) {
  // A local environment override must outrank the registry default for CI and linked worktrees.
  const localRepo = options.interactiveRepo ?? environment.UI_STYLE_KIT_INTERACTIVE_REPO;
  const interactiveSpec = options.interactiveSpec ?? environment.UI_STYLE_KIT_INTERACTIVE_SPEC ?? null;

  return {
    interactiveSpec,
    interactiveRepo: interactiveSpec
      ? null
      : path.resolve(localRepo ?? path.join(rootDir, '..', 'Interactive-Surface-CSS'))
  };
}
