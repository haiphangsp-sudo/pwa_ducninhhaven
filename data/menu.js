// data/menu.js
//Model menu chuẩn: category → item → option → rule hiển thị.

export const MENU = {
  intro:{
    label:{vi:"Giới thiệu",en:"Introduction"},
    modes:["room","table"],
    type:"article",
    items:{
      article_1:{
        label:{vi:"tieu de 1",en:"hello"},
        content:{vi:"noi dung 1",en:"noi dung one"}
      },
      article_2:{
        label:{vi:"tieu de 2",en:"abc"},
        content:{vi:"noi dung 2",en:"dfg"}
      }
    }
  },

  food:{
    label:{vi:"Bữa ăn",en:"Food"},
    modes:["room","table"],
    type:"cart",
    items:{

      breakfast:{
        label:{vi:"Bữa sáng",en:"Breakfast"},
        options:["default"],
        defaultOption:"default",
        active:true
      }

    }
  },

  drink:{
    label:{vi:"Thức uống",en:"Drinks"},
    modes:["room","table"],
    type:"cart",
    items:{

      coffee:{
        label:{vi:"Cà phê",en:"Coffee"},
        options:["hot","iced"],
        defaultOption:"hot",
        active:true
      },

      tea:{
        label:{vi:"Trà",en:"Tea"},
        options:["hot"],
        defaultOption:"hot",
        active:true
      }

    }
  },

  service:{
    label:{vi:"Dịch vụ phòng",en:"Room service"},
    modes:["room"],
    type:"instant",
    items:{

      cleaning:{
        label:{vi:"Dọn phòng",en:"Housekeeping"},
        active:true
      },

      footbath:{
        label:{vi:"Ngâm chân",en:"Foot bath"},
        active:true
      }

    }
  },

  help:{
    label:{vi:"Hỗ trợ",en:"Assistance"},
    modes:["room"],
    type:"instant",
    items:{

      support:{
        label:{vi:"Gọi lễ tân",en:"Contact reception"},
        active:true
      }

    }
  }

};