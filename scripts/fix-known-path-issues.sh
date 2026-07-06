#!/bin/bash

echo "=== Fixing known path issues ==="

# Fix 1: Rename OauthButtons.tsx → OAuthButtons.tsx
if [ -f "components/auth/OauthButtons.tsx" ]; then
  mv components/auth/OauthButtons.tsx components/auth/OAuthButtons.tsx
  echo "Renamed OauthButtons.tsx → OAuthButtons.tsx"
else
  echo "Skipping: OauthButtons.tsx not found"
fi

# Fix 2: Remove accidental space in workspaceId /grant folder
find app/dashboard/workspace -type d -name "*[workspaceId] *" | while read folder; do
  clean="app/dashboard/workspace/[workspaceId]"
  mv "$folder" "$clean"
  echo "Fixed workspaceId folder spacing"
done

# Fix 3: Rename SubmissionCheck.tsx → SubmissionChecklist.tsx
if [ -f "app/dashboard/workspace/[workspaceId]/grant/[grantId]/submission/SubmissionCheck.tsx" ]; then
  mv app/dashboard/workspace/[workspaceId]/grant/[grantId]/submission/SubmissionCheck.tsx \
     app/dashboard/workspace/[workspaceId]/grant/[grantId]/submission/SubmissionChecklist.tsx
  echo "Renamed SubmissionCheck.tsx → SubmissionChecklist.tsx"
else
  echo "Skipping: SubmissionCheck.tsx not found"
fi

# Fix 4: Fix missing slash in workspaceId/recommended folder
find app/dashboard/workspace -type d -name "*[workspaceId]recommended" | while read folder; do
  new="app/dashboard/workspace/[workspaceId]/recommended"
  mv "$folder" "$new"
  echo "Fixed workspaceId/recommended folder path"
done

echo "=== All known path issues processed ==="
