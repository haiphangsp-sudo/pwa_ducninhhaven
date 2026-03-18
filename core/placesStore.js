
export let PLACES = {};
export let PLACE_UI = {};

export async function loadPlaces() {
    const data = await fetch("/data/places.json", { cache: "no-store" }).then(res => res.json());
    PLACES = data.places || {};
    PLACE_UI = data.ui || {};
};

export function getAllowedPlaceTypes(mode = "table") {
  return PLACE_UI[mode] || ["table"];
}

export function getPlaceTypeById(placeId) {
  if (!placeId) return null;

  if (PLACES.room?.[placeId]) return "room";
  if (PLACES.area?.[placeId]) return "area";
  if (PLACES.table?.[placeId]) return "table";

  return null;
}

export function resolvePlaceFromData(placeId) {
  const type = getPlaceTypeById(placeId);
  if (!type) return null;

  return {
    id: placeId,
    type,
    ...PLACES[type][placeId]
  };
}