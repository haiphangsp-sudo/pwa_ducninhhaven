export let MENU = {};

export async function loadMenu(){

  try{
    const res = await fetch("/data/menu.json",{
      cache:"no-store"
    });

    if(!res.ok) throw new Error("Menu load failed");

    MENU = await res.json();

  }catch(err){
    console.error("MENU ERROR:",err);
    MENU = {};
  }
}