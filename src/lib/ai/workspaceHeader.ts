// Name of the request header the proxy uses to tell route handlers which
// workspace a request has been verified for. No imports on purpose: the
// proxy and the AI code both read this constant.
export const WORKSPACE_SCOPE_HEADER = "x-gsp-workspace-id";
