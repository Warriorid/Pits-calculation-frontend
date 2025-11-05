import { Material } from "./materialsApi";

export const MATERIALS_MOCK: Material[] = [
  {
    id: 1,
    title: "Песок строительный",
    coefficient: 1.15,
    image_url: "",
    description: "Мелкозернистый песок для строительных работ. Идеально подходит для приготовления бетонных смесей и штукатурных работ.",
    is_deleted: false
  },
  {
    id: 2,
    title: "Щебень гранитный",
    coefficient: 1.32,
    image_url: "",
    description: "Гранитный щебень фракции 5-20 мм. Высокая прочность и морозостойкость. Применяется в дорожном строительстве и производстве бетона.",
    is_deleted: false
  },
  {
    id: 3,
    title: "Глина",
    coefficient: 1.43,
    image_url: "",
    description: "Жирная глина для керамических изделий и гидроизоляции. Обладает высокой пластичностью и водоудерживающей способностью.",
    is_deleted: false
  },
  {
    id: 4,
    title: "Супесь",
    coefficient: 1.27,
    image_url: "",
    description: "Песчано-глинистая почва с содержанием глины до 10%. Используется в качестве основания под фундаменты и в дорожном строительстве.",
    is_deleted: false
  },
  {
    id: 5,
    title: "Торф",
    coefficient: 1.65,
    image_url: "",
    description: "Верховой торф с высокой степенью разложения. Применяется в сельском хозяйстве и для производства удобрений.",
    is_deleted: false
  },
  {
    id: 6,
    title: "Суглинок",
    coefficient: 1.38,
    image_url: "",
    description: "Глинистая почва с содержанием песка. Подходит для обратной засыпки и планировочных работ.",
    is_deleted: false
  }
];