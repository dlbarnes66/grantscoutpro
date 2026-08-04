#!/bin/bash

echo "Fixing all routes that still use { params }..."

grep -R "export async function" src/app/api -n | grep "{ params }" | cut -d: -f1 | sort -u | while read file; do
  echo "Fixing $file"

  # Ensure NextRequest is imported
  sed -i '' 's/import { NextResponse } from "next\/server";/import { NextRequest, NextResponse } from "next\/server";/' "$file"

  # Replace GET signature
  sed -i '' 's/export async function GET(req: Request, { params }: any)/export async function GET(req: NextRequest, context: { params: Promise<any> })/' "$file"
  sed -i '' 's/export async function GET(req, { params })/export async function GET(req: NextRequest, context: { params: Promise<any> })/' "$file"
  sed -i '' 's/export async function GET(_req, { params })/export async function GET(req: NextRequest, context: { params: Promise<any> })/' "$file"

  # Replace POST signature
  sed -i '' 's/export async function POST(req: Request, { params }: any)/export async function POST(req: NextRequest, context: { params: Promise<any> })/' "$file"
  sed -i '' 's/export async function POST(req, { params })/export async function POST(req: NextRequest, context: { params: Promise<any> })/' "$file"

  # Replace PUT/DELETE similarly if present
  sed -i '' 's/export async function PUT(req: Request, { params }: any)/export async function PUT(req: NextRequest, context: { params: Promise<any> })/' "$file"
  sed -i '' 's/export async function PUT(req, { params })/export async function PUT(req: NextRequest, context: { params: Promise<any> })/' "$file"

  sed -i '' 's/export async function DELETE(req: Request, { params }: any)/export async function DELETE(req: NextRequest, context: { params: Promise<any> })/' "$file"
  sed -i '' 's/export async function DELETE(req, { params })/export async function DELETE(req: NextRequest, context: { params: Promise<any> })/' "$file"

  # Replace param extraction
  sed -i '' 's/const { grantId } = params;/const { grantId } = await context.params;/' "$file"
  sed -i '' 's/const { workspaceId } = params;/const { workspaceId } = await context.params;/' "$file"
  sed -i '' 's/const { documentId } = params;/const { documentId } = await context.params;/' "$file"
  sed -i '' 's/const { grantTemp } = params;/const { grantTemp } = await context.params;/' "$file"
  sed -i '' 's/const { applicationId } = params;/const { applicationId } = await context.params;/' "$file"
  sed -i '' 's/const { narrativeId } = params;/const { narrativeId } = await context.params;/' "$file"
  sed -i '' 's/const { jobId } = params;/const { jobId } = await context.params;/' "$file"
  sed -i '' 's/const { memberId } = params;/const { memberId } = await context.params;/' "$file"
  sed -i '' 's/const { searchId } = params;/const { searchId } = await context.params;/' "$file"
  sed -i '' 's/const { docId } = params;/const { docId } = await context.params;/' "$file"
done

echo "All { params } routes updated."
