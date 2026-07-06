@echo off
echo ============================================
echo FIXING GRANTSCOUT PRO ROUTING + FILE ISSUES
echo ============================================

REM --- Fix 1: Rename OauthButtons.tsx → OAuthButtons.tsx
if exist components\auth\OauthButtons.tsx (
    ren components\auth\OauthButtons.tsx OAuthButtons.tsx
    echo Renamed OauthButtons.tsx → OAuthButtons.tsx
) else (
    echo OauthButtons.tsx not found (already fixed?)
)

REM --- Fix 2: Fix incorrect folder: [workspaceId]recommended → [workspaceId]\recommended
if exist app\dashboard\workspace\[workspaceId]recommended (
    echo Fixing folder: [workspaceId]recommended
    ren app\dashboard\workspace\[workspaceId]recommended recommended
)

REM --- Fix 3: Fix accidental space in folder: [workspaceId] /grant
if exist "app\dashboard\workspace\[workspaceId] \grant" (
    echo Fixing folder with accidental space
    ren "app\dashboard\workspace\[workspaceId] " "[workspaceId]"
)

REM --- Fix 4: Create missing SubmissionChecklist.tsx
if not exist app\dashboard\workspace\[workspaceId]\grant\[grantId]\submission\SubmissionChecklist.tsx (
    echo Creating SubmissionChecklist.tsx
    echo export default function SubmissionChecklist(){return <div>Checklist Placeholder</div>;} > app\dashboard\workspace\[workspaceId]\grant\[grantId]\submission\SubmissionChecklist.tsx
)

REM --- Fix 5: Create missing dynamic route page.tsx files

REM Narratives
if not exist app\narratives\[narrativeId]\page.tsx (
    echo Creating narratives page.tsx
    echo export default function Page({params}){return <div>Narrative {params.narrativeId}</div>;} > app\narratives\[narrativeId]\page.tsx
)

REM Renewal
if not exist app\renewal\[renewalId]\page.tsx (
    echo Creating renewal page.tsx
    echo export default function Page({params}){return <div>Renewal {params.renewalId}</div>;} > app\renewal\[renewalId]\page.tsx
)

REM Reporting
if not exist app\reporting\[reportId]\page.tsx (
    echo Creating reporting page.tsx
    echo export default function Page({params}){return <div>Reporting {params.reportId}</div>;} > app\reporting\[reportId]\page.tsx
)

REM Review
if not exist app\review\[reviewId]\page.tsx (
    echo Creating review page.tsx
    echo export default function Page({params}){return <div>Review {params.reviewId}</div>;} > app\review\[reviewId]\page.tsx
)

REM Submission
if not exist app\submission\[submissionId]\page.tsx (
    echo Creating submission page.tsx
    echo export default function Page({params}){return <div>Submission {params.submissionId}</div>;} > app\submission\[submissionId]\page.tsx
)

echo ============================================
echo ALL FIXES APPLIED SUCCESSFULLY
echo ============================================
pause
