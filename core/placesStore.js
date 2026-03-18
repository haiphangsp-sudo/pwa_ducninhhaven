
export let PLACES = {};
export let PLACE_UI = {};

export async function loadPlaces() {
    const res = await fetch("/data/places.json", { cache: "no-cache" }).then(res => res.json());
    const data = await res.json();
    PLACES = data.places || {};
    PLACE_UI = data.ui || {};
};

