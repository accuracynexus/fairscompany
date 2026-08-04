// Product categories shown on /productos. Rich, code-defined content (product
// lines, materials, sizes, personalisation) plus a stable `key`.
//
// Photos live in src/img/catalogo/<key>/<linea>-<n>.webp and are indexed by
// src/lib/catalog.ts: each line in `productos` pulls its thumbnail from its
// `slug`, and `cover` names the line whose first photo represents the whole
// category. The admin panel can override the category image per `key` (stored
// in the category_images table); that override takes precedence.

export interface ProductLine {
  /** Matches the folder slug under src/img/catalogo/<category key>/. */
  slug: string;
  name: string;
}

export interface Category {
  key: string;
  tag: string;
  name: string;
  /** Slug of the product line whose first photo is the category cover. */
  cover: string;
  icon: string;
  description: string;
  productos: ProductLine[];
  material: string;
  colores: string;
  tallas: string;
  personalizacion: string[];
}

export const categories: Category[] = [
  {
    key: 'escolares',
    tag: 'Uniformes Escolares',
    name: 'Uniformes para Colegios e Instituciones Educativas',
    cover: 'uniformes-escolares',
    icon: '<path d="M21.42 10.92a1 1 0 0 0-.02-1.84L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.83l8.57 3.91a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>',
    description:
      'Confeccionamos uniformes escolares e institucionales para colegios, institutos y universidades, elaborados con materiales de alta calidad, resistentes y cómodos para el uso diario. Cada prenda se personaliza de acuerdo con la identidad de la institución, garantizando excelente presentación y durabilidad.',
    productos: [
      { slug: 'uniformes-escolares', name: 'Uniformes escolares' },
      { slug: 'buzos-deportivos', name: 'Buzos deportivos' },
      { slug: 'polos-institucionales', name: 'Polos institucionales' },
      { slug: 'camisas-escolares', name: 'Camisas escolares' },
      { slug: 'casacas-institucionales', name: 'Casacas institucionales' },
      { slug: 'chalecos', name: 'Chalecos' },
      { slug: 'pantalones-faldas', name: 'Pantalones y faldas escolares' },
    ],
    material: 'Drill, algodón, poliéster, felpa, taslán y telas según requerimiento.',
    colores: 'Personalizados según los colores institucionales.',
    tallas: 'Tallas escolares y adultos (XS, S, M, L, XL, XXL).',
    personalizacion: ['Bordado de logotipos', 'Estampado', 'Sublimado', 'Diseños exclusivos', 'Colores institucionales'],
  },
  {
    key: 'promocion',
    tag: 'Prendas de Promoción',
    name: 'Casacas y Poleras de Promoción',
    cover: 'casacas-promocion',
    icon: '<circle cx="12" cy="8" r="6"/><path d="M15.47 12.89 17 22l-5-3-5 3 1.53-9.11"/>',
    description:
      'Diseñamos y confeccionamos prendas de promoción personalizadas para colegios, institutos y universidades, desarrollando modelos exclusivos que representan la identidad y el espíritu de cada promoción. Utilizamos materiales de alta calidad y técnicas de personalización que garantizan excelente acabado, comodidad y durabilidad.',
    productos: [
      { slug: 'casacas-promocion', name: 'Casacas de promoción' },
      { slug: 'poleras-promocion', name: 'Poleras de promoción' },
      { slug: 'polos-promocion', name: 'Polos de promoción' },
      { slug: 'buzos-promocion', name: 'Buzos de promoción' },
      { slug: 'chalecos-promocion', name: 'Chalecos de promoción' },
    ],
    material: 'Franela, algodón, poliéster, felpa, french terry, taslán y materiales según el diseño solicitado.',
    colores: 'Personalizados de acuerdo con el diseño de cada promoción.',
    tallas: 'XS, S, M, L, XL, XXL y tallas especiales.',
    personalizacion: [
      'Bordado',
      'Sublimado',
      'Serigrafía',
      'DTF',
      'Vinil textil',
      'Nombres personalizados',
      'Logos y diseños exclusivos',
    ],
  },
  {
    key: 'corporativos',
    tag: 'Uniformes Corporativos',
    name: 'Uniformes Corporativos para Empresas',
    cover: 'casacas',
    icon: '<rect width="20" height="14" x="2" y="7" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
    description:
      'Diseñamos y confeccionamos uniformes empresariales que fortalecen la imagen profesional de cada organización, adaptándonos a diferentes sectores laborales.',
    productos: [
      { slug: 'polos-corporativos', name: 'Polos corporativos' },
      { slug: 'camisas', name: 'Camisas' },
      { slug: 'casacas', name: 'Casacas' },
      { slug: 'chalecos', name: 'Chalecos' },
      { slug: 'uniformes-administrativos', name: 'Uniformes administrativos' },
    ],
    material: 'Algodón, piqué, drill, oxford, poliéster y telas según requerimiento.',
    colores: 'Según identidad visual de cada empresa.',
    tallas: 'XS a XXL.',
    personalizacion: ['Bordado', 'Estampado', 'Logos corporativos', 'Diseños personalizados'],
  },
  {
    key: 'medicos',
    tag: 'Uniformes Médicos',
    name: 'Indumentaria para Hospitales y Clínicas',
    cover: 'uniformes-clinicos',
    icon: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.5 4.04 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/>',
    description:
      'Elaboramos uniformes médicos cómodos, funcionales y de alta calidad para profesionales de la salud, clínicas y hospitales.',
    productos: [
      { slug: 'scrubs', name: 'Scrubs médicos' },
      { slug: 'mandiles', name: 'Mandiles' },
      { slug: 'chaquetas-medicas', name: 'Chaquetas médicas' },
      { slug: 'uniformes-clinicos', name: 'Uniformes clínicos' },
      { slug: 'buzos-institucionales', name: 'Buzos corporativos e institucionales' },
      { slug: 'polos-institucionales', name: 'Polos institucionales' },
    ],
    material: 'Tela antifluido, microfibra, gabardina y telas especializadas.',
    colores: 'Amplia variedad de colores según requerimiento.',
    tallas: 'XS a XXL.',
    personalizacion: ['Bordado', 'Logos institucionales', 'Diseños personalizados'],
  },
  {
    key: 'industrial',
    tag: 'Ropa Industrial y EPP',
    name: 'Ropa Industrial y EPP para Empresas Mineras',
    cover: 'overoles',
    icon: '<path d="M2 18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1z"/><path d="M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5"/><path d="M4 15v-3a6 6 0 0 1 6-6"/><path d="M14 6a6 6 0 0 1 6 6v3"/>',
    description:
      'FAIR\'S COMPANY desarrolla uniformes especializados para la industria minera e industrial, elaborados con materiales resistentes y adecuados para trabajos de alta exigencia.',
    productos: [
      { slug: 'overoles', name: 'Overoles industriales' },
      { slug: 'camisas-industriales', name: 'Camisas industriales' },
      { slug: 'pantalones-industriales', name: 'Pantalones industriales' },
      { slug: 'polos-industriales', name: 'Polos industriales' },
      { slug: 'casacas-industriales', name: 'Casacas industriales' },
      { slug: 'chalecos-reflectivos', name: 'Chalecos reflectivos' },
      { slug: 'ropa-reflectiva', name: 'Ropa reflectiva' },
      { slug: 'antiflama', name: 'Uniformes antiflama' },
      { slug: 'antiacidos', name: 'Uniformes antiácidos' },
      { slug: 'arc-flash', name: 'Uniformes Arc Flash' },
    ],
    material: 'Drill industrial, telas antiflama, telas ignífugas y materiales especializados según requerimiento.',
    colores: 'Según imagen corporativa y normas de seguridad del cliente.',
    tallas: 'XS a XXXL.',
    personalizacion: ['Bordado', 'Logos', 'Cintas reflectivas', 'Diseños industriales'],
  },
  {
    key: 'automovilismo',
    tag: 'Competencias Automovilísticas',
    name: 'Uniformes para Competencias Automovilísticas',
    cover: 'uniformes-competencia',
    icon: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/>',
    description:
      'Confeccionamos prendas personalizadas para equipos automovilísticos utilizando materiales resistentes y especializados para brindar seguridad, comodidad e identidad al equipo.',
    productos: [
      { slug: 'uniformes-competencia', name: 'Uniformes de competencia' },
      { slug: 'casacas-equipos', name: 'Casacas para equipos' },
      { slug: 'camisas-polos', name: 'Camisas y polos' },
      { slug: 'chalecos', name: 'Chalecos' },
      { slug: 'accesorios', name: 'Accesorios' },
    ],
    material: 'Materiales resistentes y especializados según requerimiento.',
    colores: 'Personalizados según diseño del equipo.',
    tallas: 'XS a XXL.',
    personalizacion: ['Logos de patrocinadores', 'Diseños personalizados', 'Bordados', 'Estampados'],
  },
  {
    key: 'anfitrionas',
    tag: 'Anfitrionas y Promotoras',
    name: 'Uniformes para Anfitrionas y Promotoras',
    cover: 'anfitrionas',
    icon: '<path d="M9.94 15.5A2 2 0 0 0 8.5 14.06l-6.14-1.58a.5.5 0 0 1 0-.96L8.5 9.94A2 2 0 0 0 9.94 8.5l1.58-6.14a.5.5 0 0 1 .96 0L14.06 8.5A2 2 0 0 0 15.5 9.94l6.14 1.58a.5.5 0 0 1 0 .96L15.5 14.06a2 2 0 0 0-1.44 1.44l-1.58 6.14a.5.5 0 0 1-.96 0z"/>',
    description:
      'Diseñamos uniformes modernos y elegantes para eventos, ferias y activaciones de marca, fortaleciendo la imagen y presencia de cada empresa.',
    productos: [
      { slug: 'anfitrionas', name: 'Uniformes para anfitrionas' },
      { slug: 'promotoras', name: 'Uniformes para promotoras' },
      { slug: 'ferias', name: 'Uniformes para ferias y exposiciones' },
      { slug: 'btl', name: 'Uniformes para activaciones BTL y eventos' },
    ],
    material: 'Telas según diseño solicitado.',
    colores: 'Personalizados según campaña o marca.',
    tallas: 'XS a XL.',
    personalizacion: ['Diseños exclusivos', 'Logos', 'Acabados personalizados'],
  },
  {
    key: 'hoteles',
    tag: 'Hoteles y Resorts',
    name: 'Uniformes para Hoteles y Resorts',
    cover: 'recepcion',
    icon: '<path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/>',
    description:
      'FAIR\'S COMPANY desarrolla uniformes elegantes y funcionales para el sector hotelero, diseñados para transmitir profesionalismo, orden y una excelente imagen frente a los clientes. Elaboramos prendas adaptadas a las diferentes áreas de atención y operación de hoteles, resorts y establecimientos turísticos.',
    productos: [
      { slug: 'recepcion', name: 'Uniformes para recepción' },
      { slug: 'administrativos', name: 'Uniformes administrativos' },
      { slug: 'housekeeping', name: 'Uniformes para housekeeping' },
      { slug: 'mantenimiento', name: 'Uniformes para mantenimiento' },
      { slug: 'atencion-cliente', name: 'Uniformes para atención al cliente' },
      { slug: 'cocina-servicio', name: 'Uniformes para cocina y servicio' },
    ],
    material: 'Drill, gabardina, oxford, poliéster, algodón y telas según diseño y requerimiento del cliente.',
    colores: 'Personalizados según la identidad visual del hotel o establecimiento.',
    tallas: 'XS, S, M, L, XL, XXL y tallas especiales.',
    personalizacion: [
      'Bordado de logos',
      'Diseños exclusivos',
      'Aplicación de colores institucionales',
      'Detalles personalizados según área de trabajo',
    ],
  },
  {
    key: 'restaurantes',
    tag: 'Restaurantes y Bares',
    name: 'Uniformes para Restaurantes, Bares y Discotecas',
    cover: 'chaquetas-chef',
    icon: '<path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/><line x1="6" x2="18" y1="17" y2="17"/>',
    description:
      'Confeccionamos uniformes profesionales para el sector gastronómico y entretenimiento, combinando comodidad, funcionalidad y diseño. Nuestras prendas están adaptadas a las necesidades de chefs, bartenders, mozos y personal de atención, permitiendo una excelente presentación e identidad del establecimiento.',
    productos: [
      { slug: 'chaquetas-chef', name: 'Chaquetas de chef' },
      { slug: 'mandiles', name: 'Mandiles gastronómicos' },
      { slug: 'cocina', name: 'Uniformes para cocina' },
      { slug: 'mozos', name: 'Uniformes para mozos' },
      { slug: 'bartenders', name: 'Uniformes para bartenders' },
      { slug: 'polos-camisas', name: 'Polos y camisas personalizadas' },
      { slug: 'chalecos', name: 'Chalecos' },
    ],
    material: 'Gabardina, drill, algodón, poliéster, tela antifluido y materiales según requerimiento.',
    colores: 'Personalizados según la imagen del restaurante, bar o discoteca.',
    tallas: 'XS, S, M, L, XL, XXL.',
    personalizacion: [
      'Bordado',
      'Estampado',
      'Logos del establecimiento',
      'Diseños personalizados',
      'Combinación de colores institucionales',
    ],
  },
  {
    key: 'merchandising',
    tag: 'Publicidad y Merchandising',
    name: 'Artículos Publicitarios y Merchandising Corporativo',
    cover: 'polos-publicitarios',
    icon: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/>',
    description:
      'FAIR\'S COMPANY ofrece soluciones de merchandising personalizado para empresas, instituciones y eventos, creando productos que fortalecen la presencia de marca y generan mayor reconocimiento corporativo.',
    productos: [
      { slug: 'polos-publicitarios', name: 'Polos publicitarios' },
      { slug: 'gorras', name: 'Gorras' },
      { slug: 'tomatodos', name: 'Tomatodos' },
      { slug: 'mochilas', name: 'Mochilas' },
      { slug: 'bolsos', name: 'Bolsos' },
      { slug: 'lanyards', name: 'Lanyards' },
      { slug: 'promocionales', name: 'Artículos promocionales personalizados' },
    ],
    material: 'Algodón, poliéster, nylon y materiales promocionales diversos según el tipo de producto.',
    colores: 'Personalizados según la identidad visual de cada marca.',
    tallas: 'Polos: XS a XXL. Otros artículos: según modelo.',
    personalizacion: ['Serigrafía', 'Sublimado', 'DTF', 'Bordado', 'Impresión UV', 'Grabado láser'],
  },
];
