Write-Host "=== SCANNING REPO FOR PATH ISSUES ==="

# 1. Find accidental spaces in folder names
Write-Host "`nChecking for folders with accidental spaces..."
Get-ChildItem -Recurse -Directory | Where-Object { $_.Name -match "\s" } | ForEach-Object {
    Write-Host "SPACE FOUND: $($_.FullName)"
}

# 2. Find folders with trailing spaces
Write-Host "`nChecking for trailing spaces..."
Get-ChildItem -Recurse -Directory | Where-Object { $_.Name -match "\s$" } | ForEach-Object {
    Write-Host "TRAILING SPACE: $($_.FullName)"
}

# 3. Find folders with missing slashes (e.g., workspaceIdrecommended)
Write-Host "`nChecking for missing slashes..."
Get-ChildItem -Recurse -Directory | Where-Object { $_.Name -match "`\(⁠workspaceId\)`recommended" } | ForEach-Object {
    Write-Host "MISSING SLASH: $($_.FullName)"
}

# 4. Find dynamic route folders with wrong casing
Write-Host "`nChecking for casing mismatches..."
Get-ChildItem -Recurse -Directory | Where-Object { $_.Name -match "\[.*\]" } | ForEach-Object {
    if ($_.Name -cmatch "[A-Z]") {
        Write-Host "UPPERCASE SLUG: $($_.FullName)"
    }
}

# 5. Find any remaining [id] folders
Write-Host "`nChecking for leftover [id] folders..."
Get-ChildItem -Recurse -Directory | Where-Object { $_.Name -eq "[id]" } | ForEach-Object {
    Write-Host "LEFTOVER [id]: $($_.FullName)"
}

# 6. Find imports pointing to missing files
Write-Host "`nChecking for missing imports..."
Get-ChildItem -Recurse -Include *.tsx,*.ts | ForEach-Object {
    $content = Get-Content $_.FullName
    foreach ($line in $content) {
        if ($line -match "import .* from ['""](.+)['""]") {
            $path = $Matches[1]

            # Skip node_modules imports
            if ($path -match "^[^\.@]") { continue }

            # Resolve relative paths
            if ($path.StartsWith(".")) {
                $resolved = Resolve-Path -ErrorAction SilentlyContinue "$($_.DirectoryName)/$path*"
                if (-not $resolved) {
                    Write-Host "MISSING IMPORT: $($_.FullName) → $path"
                }
            }
        }
    }
}

Write-Host "`n=== SCAN COMPLETE ==="
