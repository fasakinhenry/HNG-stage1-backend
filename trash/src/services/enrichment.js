/**
 * Fetches data from all three external APIs in parallel
 * and returns structured, validated results.
 */

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP error ${res.status} from ${url}`);
  }
  return res.json();
}

function classifyAgeGroup(age) {
  if (age >= 0 && age <= 12) return "child";
  if (age >= 13 && age <= 19) return "teenager";
  if (age >= 20 && age <= 59) return "adult";
  return "senior";
}

async function enrichName(name) {
  // Call all three APIs in parallel
  const [genderData, agifyData, nationalizeData] = await Promise.all([
    fetchJSON(`https://api.genderize.io?name=${encodeURIComponent(name)}`),
    fetchJSON(`https://api.agify.io?name=${encodeURIComponent(name)}`),
    fetchJSON(`https://api.nationalize.io?name=${encodeURIComponent(name)}`),
  ]);

  // --- Validate Genderize ---
  if (!genderData.gender || genderData.count === 0) {
    const err = new Error("Genderize returned an invalid response");
    err.status = 502;
    err.api = "Genderize";
    throw err;
  }

  // --- Validate Agify ---
  if (genderData.age === null || agifyData.age === null || agifyData.age === undefined) {
    const err = new Error("Agify returned an invalid response");
    err.status = 502;
    err.api = "Agify";
    throw err;
  }

  // --- Validate Nationalize ---
  if (
    !nationalizeData.country ||
    !Array.isArray(nationalizeData.country) ||
    nationalizeData.country.length === 0
  ) {
    const err = new Error("Nationalize returned an invalid response");
    err.status = 502;
    err.api = "Nationalize";
    throw err;
  }

  // Pick country with highest probability
  const topCountry = nationalizeData.country.reduce((best, current) =>
    current.probability > best.probability ? current : best
  );

  return {
    gender: genderData.gender,
    gender_probability: genderData.probability,
    sample_size: genderData.count,
    age: agifyData.age,
    age_group: classifyAgeGroup(agifyData.age),
    country_id: topCountry.country_id,
    country_probability: topCountry.probability,
  };
}

module.exports = { enrichName };
