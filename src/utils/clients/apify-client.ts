import { ApifyClient } from "apify-client";

export const apify = new ApifyClient({
  token: process.env.APIFY_API_KEY,
});
