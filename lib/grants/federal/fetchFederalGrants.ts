import axios from "axios";

export async function fetchFederalGrants() {
  const url =
    "https://www.grants.gov/grantsws/rest/opportunities/search?keyword=&oppStatuses=forecasted,posted";

  const res = await axios.get(url);

  if (!res.data?.opportunities) return [];

  return res.data.opportunities;
}
