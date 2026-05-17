# Content Replacement Scope Report

- agentId: `content_replacement_dry_run_loop`
- domainId: `content`
- scopeId: `content_trend_to_video_no_upload_dry_run`
- pipelineRunId: `ctv-replacement-scope-001`
- status: `ok`
- inputSnapshotHash: `sha256:24e3e3720b4a479b1600706ffd8eb2dd2da6d6a6a0e62249cafb3ce8f7b29565`

## What this replaces

This scoped loop replaces the manual first pass of turning a public trend idea into a safe no-upload content package: plan, script, storyboard, validation report, legal report, and review-only publish proposal.

It does **not** replace final creative judgment, copyright acceptance, upload, publishing, external posting, or paid provider usage.

## Generated package

- topic: AI agent workflow trend
- audience: Korean tech founders
- platform: youtube_shorts
- trendScore: 0.82
- dryRun: true
- youtubeUploadEnabled: false
- validationPassed: true
- legalPassed: true
- allowedNextAction: review_only

## Bounded local actions

- `content_trend_package_analysis` (low): Convert a public trend seed into target audience, angle, platform, and risk notes.
  - replaces: manually turning a trend idea into a first-pass content plan.
  - output: `runtime/content-replacement-scope-report.md`
- `content_script_storyboard_package` (low): Generate script, storyboard, and non-publishable video placeholder artifacts.
  - replaces: manually drafting the first script/storyboard package before creative review.
  - output: `runtime/content-replacement-bounded-actions.json`
- `content_publish_gate_verification` (low): Verify upload/publish remains blocked and create a review-only publish proposal.
  - replaces: manually checking that no external posting happens before approval.
  - output: `runtime/content-replacement-scope-verification.json`

## Safety boundary

- Public-safe trend seed only.
- No private raw data or secrets.
- No YouTube credentials.
- No upload, publish, external posting, deploy, payment, or destructive operation.
- Publish proposal is review-only and human-gated.

Verification artifact: `runtime/content-replacement-scope-verification.json`
