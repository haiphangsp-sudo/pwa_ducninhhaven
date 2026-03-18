

const places = {
  place: {
    rooms: {
      Olive: { label: { vi: "Phòng Olive", en: "Olive Room" } },
      Juniper: { label: { vi: "Phòng Juniper", en: "Juniper Room" } },
      Cloud: { label: { vi: "Phòng Cloud", en: "Cloud Room" } }
    },

    tables: {
      T1: { label: { vi: "Bàn T1", en: "Table T1" } },
      T2: { label: { vi: "Bàn T2", en: "Table T2" } },
      T3: { label: { vi: "Bàn T3", en: "Table T3" } }
    },

    areas: {
      Courtyard: { label: { vi: "Sân giếng", en: "Courtyard" } },
      Pergola: { label: { vi: "Giàn Pergola", en: "Pergola" } },
      Lounge: { label: { vi: "Phòng chờ", en: "Lounge" } },
      Dining: { label: { vi: "Phòng ăn", en: "Dining room" } },
      Garden: { label: { vi: "Vườn", en: "Garden" } }
    }

  },
  mode: {
    room: ["room", "area", "table"],
    area: ["area", "table"],
    table: ["table"]
  }
}
export const PLACES = {
  room: places.place.rooms,
  table: places.place.tables,
  area: places.place.areas
}
export const PLACE_RULES = {
  room: places.mode.room,
  area: places.mode.room,
  table: places.mode.room
};

