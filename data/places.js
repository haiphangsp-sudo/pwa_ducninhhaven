import raw from "./places.json";

export const PLACE_UI = raw.ui || {};

export const PLACES = raw.places || {
  room: {},
  area: {},
  table: {}
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