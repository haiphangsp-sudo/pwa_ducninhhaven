// core/dispatcher.js
//Event map (pure logic).
import { dispatch } from "./events.js";

export function actionSelectCategory(category){
  dispatch("SELECT_CATEGORY",{category});
}

export function actionAddToCart(data){
  dispatch("ADD_TO_CART",data);
}

export function actionSendCart(){
  dispatch("SEND_CART");
}

export function actionSendInstant(data){
  dispatch("SEND_INSTANT",data);
}