/**
 * Icon name alias map for migration.
 *
 * Maps old getAppIcon('name') strings to new CiComponentName exports.
 * Use this during Phase 3 migration to find the correct component for each icon reference.
 *
 * Format: { 'old-name': 'CiNewName' }
 *
 * All names map directly (kebab-case → PascalCase with Ci prefix) unless noted.
 */
export const iconAliases = {
  // Direct 1:1 mappings (name → CiPascalName)
  // These all follow the pattern: getAppIcon('edit') → CiEdit

  // Special cases / notes:
  // - 'google_docs' → CiGoogleDocs (underscore converted)
  // - 'google_drive' → CiGoogleDrive (underscore converted)
  // - 'character_creator' → CiCharacterCreator (underscore converted)
  // - '3b' → Ci3b (starts with number — valid JS but unusual)

  // File-type icons (these are NOT in the main set, they're in /file-icons/):
  // .psd, .ai, .blend, etc. are handled by getIcon() not getAppIcon()
  // BUT some file-type icons ARE in the outline set: aep, afdesign, afphoto, etc.
  // These were designer-created for the type picker (iconData.json) and export panel.
};

/**
 * Icons from iconData.json (the 35 collection-type icons users can pick).
 * All exist in the main icon set.
 */
export const typeIcons = [
  'generic',
  'bezier',
  'bone',
  'boxes',
  'brain',
  'brick',
  'brush',
  'camera',
  'clapboard',
  'code-bracket',
  'cube',
  'diamond',
  'drum',
  'extension',
  'film-reel',
  'film-strip',
  'gamepad',
  'jigsaw',
  'lamp',
  'layers',
  'masks',
  'music',
  'mystery-ball',
  'node-graph',
  'palette',
  'parameters',
  'shapes',
  'skull',
  'sparkles',
  'stall',
  'storefront',
  'texture',
  'tree',
  'video-camera',
  'workflow-arrow',
];
