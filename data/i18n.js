// data/i18n.js
//Toàn bộ chữ hiển thị cho khách.
export const STRINGS = {

  context_room:{
    vi:"Phòng",
    en:"Room"
  },
  context_table:{
    vi:"Bàn",
    en:"Table"
  },

  sending:{
    vi:"Đang gửi yêu cầu…",
    en:"Sending request…"
  },

  received:{
    vi:"Chúng tôi đã nhận yêu cầu",
    en:"We’ve received your request"
  },

  connection_lost:{
    vi:"Mất kết nối. Yêu cầu sẽ được gửi sớm",
    en:"Connection lost. We’ll deliver your request shortly"
  },

  unable_send:{
    vi:"Không thể gửi. Vui lòng thử lại",
    en:"Unable to send. Please try again"
  },

  add_to_order:{
    vi:"Thêm vào yêu cầu",
    en:"Add to order"
  },

  order:{
    vi:"Gửi",
    en:"Order"
  }

};

let currentLang = "vi";

export function setLanguage(lang){
  currentLang = lang==="en" ? "en" : "vi";
}

export function t(key){
  return STRINGS[key]?.[currentLang] || key;
}