#!/bin/bash

MAPPING_FILE="scripts/rename-slugs.json"

if [ ! -f "$MAPPING_FILE" ]; then
  echo "Mapping file not found: $MAPPING_FILE"
  exit 1
fi

# Read JSON keys (paths) and values (new slugs)
paths=$(jq -r 'keys[]' "$MAPPING_FILE")

for oldPath in $paths; do
  newSlug=$(jq -r --arg key "$oldPath" '.[$key]' "$MAPPING_FILE")

  # Extract directory path (everything before /[id])
  dirPath=$(dirname "$oldPath")

  # Full old folder path
  oldFolder="$oldPath"

  # Full new folder path
  newFolder="$dirPath/$newSlug"

  if [ -d "$oldFolder" ]; then
    echo "Renaming: $oldFolder → $newFolder"
    mv "$oldFolder" "$newFolder"
  else
    echo "Skipping (not found): $oldFolder"
  fi
done

echo "Slug rename complete."
