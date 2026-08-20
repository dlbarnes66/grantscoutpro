export function buildWorkspacePrompt({
  workspaceId,
  documentId,
  header,
  body,
}) {
  return `
Workspace Document AI

Workspace: ${workspaceId}
Document: ${documentId}

${header}

${body}
`;
}
