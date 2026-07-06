# Fix 1: Rename OauthButtons.tsx → OAuthButtons.tsx
$authPath = "components/auth"
if (Test-Path "$authPath/OauthButtons.tsx") {
    Rename-Item "$authPath/OauthButtons.tsx" "OAuthButtons.tsx"
    Write-Host "Renamed OauthButtons.tsx → OAuthButtons.tsx"
} else {
    Write-Host "Skipping: OauthButtons.tsx not found"
}

# Fix 2: Remove accidental space in workspaceId /grant folder
$workspaceGrantPath = "app/dashboard/workspace"
Get-ChildItem $workspaceGrantPath -Directory | ForEach-Object {
    if ($_.Name -match "\[workspaceId\] ") {
        $old = "$workspaceGrantPath/$($_.Name)/grant"
        $new = "$workspaceGrantPath/[workspaceId]/grant"

        if (Test-Path $old) {
            Rename-Item "$workspaceGrantPath/$($_.Name)" "[workspaceId]"
            Write-Host "Fixed workspaceId folder spacing"
        }
    }
}

# Fix 3: Rename SubmissionCheck.tsx → SubmissionChecklist.tsx
$submissionPath = "app/dashboard/workspace/[workspaceId]/grant/[grantId]/submission"
if (Test-Path "$submissionPath/SubmissionCheck.tsx") {
    Rename-Item "$submissionPath/SubmissionCheck.tsx" "SubmissionChecklist.tsx"
    Write-Host "Renamed SubmissionCheck.tsx → SubmissionChecklist.tsx"
} else {
    Write-Host "Skipping: SubmissionCheck.tsx not found"
}

# Fix 4: Fix missing slash in workspaceId/recommended folder
$recommendedPath = "app/dashboard/workspace"
Get-ChildItem $recommendedPath -Directory | ForEach-Object {
    if ($_.Name -match "\[workspaceId\]recommended") {
        $old = "$recommendedPath/$($_.Name)"
        $new = "$recommendedPath/[workspaceId]/recommended"

        Rename-Item $old $new
        Write-Host "Fixed workspaceId/recommended folder path"
    }
}

Write-Host "All known path issues processed."
