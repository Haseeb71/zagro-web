export async function register() {
  // Do not seed here on Amplify — Lambda cold-start + Mongo seed crashes SSR.
  // Admin/categories seed on first API boot in server/app.js
  return;
}
