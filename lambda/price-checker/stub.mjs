// Test-only stand-in for the Lambda's runtime deps (firebase-admin, @aws-sdk), which aren't
// installed at the repo root. The price parsing tests never call them.
export const initializeApp = () => {};
export const cert = () => {};
export const getApps = () => [];
export const getFirestore = () => {};
export class SSMClient {}
export class GetParameterCommand {}
