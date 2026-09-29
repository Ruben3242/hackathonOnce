import type { Color, DiagramaCanonico, Highlight, PieceKind, Square } from "../../lib/b8/types";

function p(square: Square, kind: PieceKind, color: Color) {
  return { square, kind, color };
}

function h(square: Square, color: Highlight["color"]) {
  return { square, color };
}

export const TABLERO_1: DiagramaCanonico = {
  id: "tablero-1",
  title: "Tablero 1 · libro de ajedrez, posición inicial con resaltes",
  pieces: [
    p("e1", "R", "white"),
    p("d1", "D", "white"),
    p("a1", "T", "white"),
    p("h1", "T", "white"),
    p("c3", "C", "white"),
    p("f3", "C", "white"),
    p("c4", "A", "white"),
    p("g3", "A", "white"),
    p("a2", "P", "white"),
    p("b2", "P", "white"),
    p("c2", "P", "white"),
    p("d3", "P", "white"),
    p("e4", "P", "white"),
    p("f2", "P", "white"),
    p("g2", "P", "white"),
    p("h2", "P", "white"),
    p("e8", "R", "black"),
    p("d8", "D", "black"),
    p("a8", "T", "black"),
    p("h8", "T", "black"),
    p("c6", "C", "black"),
    p("f6", "C", "black"),
    p("c5", "A", "black"),
    p("c8", "A", "black"),
    p("a7", "P", "black"),
    p("b7", "P", "black"),
    p("c7", "P", "black"),
    p("d6", "P", "black"),
    p("e5", "P", "black"),
    p("f7", "P", "black"),
    p("g5", "P", "black"),
    p("h6", "P", "black"),
  ],
  highlights: [h("g3", "yellow"), h("h4", "yellow")],
  arrows: [],
};

export const TABLERO_2: DiagramaCanonico = {
  id: "tablero-2",
  title: "Tablero 2 · libro de ajedrez, con flecha y resaltes amarillos",
  pieces: [
    p("e1", "R", "white"),
    p("d1", "D", "white"),
    p("a1", "T", "white"),
    p("h1", "T", "white"),
    p("c3", "C", "white"),
    p("f1", "A", "white"),
    p("f4", "A", "white"),
    p("a2", "P", "white"),
    p("b2", "P", "white"),
    p("c2", "P", "white"),
    p("e4", "P", "white"),
    p("f2", "P", "white"),
    p("g2", "P", "white"),
    p("h2", "P", "white"),
    p("e8", "R", "black"),
    p("d8", "D", "black"),
    p("a8", "T", "black"),
    p("h8", "T", "black"),
    p("g4", "C", "black"),
    p("c8", "A", "black"),
    p("f8", "A", "black"),
    p("a7", "P", "black"),
    p("b7", "P", "black"),
    p("d6", "P", "black"),
    p("e5", "P", "black"),
    p("f7", "P", "black"),
    p("g7", "P", "black"),
    p("h7", "P", "black"),
  ],
  highlights: [h("d1", "yellow"), h("d4", "yellow")],
  arrows: [{ from: "d4", to: "d1" }],
};

export const TABLERO_3: DiagramaCanonico = {
  id: "tablero-3",
  title: "Tablero 3 · libro de ajedrez, flecha en h",
  pieces: [
    p("e1", "R", "white"),
    p("d1", "D", "white"),
    p("a1", "T", "white"),
    p("h1", "T", "white"),
    p("b1", "C", "white"),
    p("f3", "C", "white"),
    p("f1", "A", "white"),
    p("g5", "A", "white"),
    p("a2", "P", "white"),
    p("b2", "P", "white"),
    p("c4", "P", "white"),
    p("d4", "P", "white"),
    p("e2", "P", "white"),
    p("f2", "P", "white"),
    p("g2", "P", "white"),
    p("h2", "P", "white"),
    p("e8", "R", "black"),
    p("d8", "D", "black"),
    p("a8", "T", "black"),
    p("h8", "T", "black"),
    p("b8", "C", "black"),
    p("f6", "C", "black"),
    p("c8", "A", "black"),
    p("f8", "A", "black"),
    p("a7", "P", "black"),
    p("b7", "P", "black"),
    p("c7", "P", "black"),
    p("d7", "P", "black"),
    p("e6", "P", "black"),
    p("f5", "P", "black"),
    p("g7", "P", "black"),
    p("h6", "P", "black"),
  ],
  highlights: [h("h7", "yellow"), h("h6", "yellow")],
  arrows: [{ from: "h7", to: "h6" }],
};

export const TABLERO_4: DiagramaCanonico = {
  id: "tablero-4",
  title: "Tablero 4 · final de peones",
  pieces: [
    p("h1", "R", "white"),
    p("a4", "P", "white"),
    p("b3", "P", "white"),
    p("c2", "P", "white"),
    p("f3", "P", "white"),
    p("g4", "P", "white"),
    p("h3", "P", "white"),
    p("a8", "R", "black"),
    p("a7", "P", "black"),
    p("b6", "P", "black"),
    p("f4", "P", "black"),
    p("g5", "P", "black"),
    p("h4", "P", "black"),
  ],
  highlights: [],
  arrows: [],
};

export const TABLERO_5: DiagramaCanonico = {
  id: "tablero-5",
  title: "Tablero 5 · resaltes amarillo y rojo, tres flechas",
  pieces: [
    p("g1", "R", "white"),
    p("d3", "D", "white"),
    p("c1", "T", "white"),
    p("d2", "C", "white"),
    p("h5", "C", "white"),
    p("c3", "A", "white"),
    p("c4", "P", "white"),
    p("d5", "P", "white"),
    p("e4", "P", "white"),
    p("g2", "P", "white"),
    p("h3", "P", "white"),
    p("g8", "R", "black"),
    p("b8", "D", "black"),
    p("a2", "T", "black"),
    p("b6", "T", "black"),
    p("d6", "A", "black"),
    p("d7", "A", "black"),
    p("c5", "P", "black"),
    p("e5", "P", "black"),
    p("f6", "P", "black"),
    p("f7", "P", "black"),
    p("h6", "P", "black"),
  ],
  highlights: [h("g3", "yellow"), h("h5", "yellow"), h("f6", "red")],
  arrows: [
    { from: "c1", to: "f1" },
    { from: "d3", to: "g3" },
    { from: "h5", to: "f6" },
  ],
};

export const TABLERO_6: DiagramaCanonico = {
  id: "tablero-6",
  title: "Tablero 6 · caballo en d2 con tres flechas",
  pieces: [
    p("g1", "R", "white"),
    p("d1", "D", "white"),
    p("a1", "T", "white"),
    p("e1", "T", "white"),
    p("d2", "C", "white"),
    p("f3", "C", "white"),
    p("c1", "A", "white"),
    p("c2", "A", "white"),
    p("b4", "P", "white"),
    p("c3", "P", "white"),
    p("d5", "P", "white"),
    p("e4", "P", "white"),
    p("f2", "P", "white"),
    p("g2", "P", "white"),
    p("h3", "P", "white"),
    p("g8", "R", "black"),
    p("c7", "D", "black"),
    p("b8", "T", "black"),
    p("f8", "T", "black"),
    p("b7", "C", "black"),
    p("f6", "C", "black"),
    p("c8", "A", "black"),
    p("e7", "A", "black"),
    p("b5", "P", "black"),
    p("c5", "P", "black"),
    p("d6", "P", "black"),
    p("e5", "P", "black"),
    p("f7", "P", "black"),
    p("g7", "P", "black"),
    p("h7", "P", "black"),
  ],
  highlights: [h("b7", "yellow"), h("d8", "yellow"), h("c1", "red")],
  arrows: [
    { from: "d2", to: "b1" },
    { from: "d2", to: "b3" },
    { from: "d2", to: "f1" },
  ],
};

export const DIAGRAMAS: DiagramaCanonico[] = [
  TABLERO_1,
  TABLERO_2,
  TABLERO_3,
  TABLERO_4,
  TABLERO_5,
  TABLERO_6,
];

export function getDiagrama(id: string): DiagramaCanonico | undefined {
  return DIAGRAMAS.find((d) => d.id === id);
}

export const GOLD_BRAILLE: Record<string, string> = {
  "tablero-1": `Tablero:
Blancas: Re⠂ Dd⠂ Ta⠂ Th⠂ Cc⠒ Cf⠒ Ac⠲ Ag⠒ a⠆ b⠆ c⠆ d⠒ e⠲ f⠆ g⠆ h⠆
Negras: Re⠦ Dd⠦ Ta⠦ Th⠦ Cc⠖ Cf⠖ Ac⠢ Ac⠦ a⠶ b⠶ c⠶ d⠖ e⠢ f⠶ g⠢ h⠖
)Resaltadas en amarillo las casillas g⠒ y h⠲(`,
  "tablero-2": `Tablero:
Blancas: Re⠂ Dd⠂ Ta⠂ Th⠂ Cc⠒ Af⠂ Af⠲ a⠆ b⠆ c⠆ e⠲ f⠆ g⠆ h⠆
Negras: Re⠦ Dd⠦ Ta⠦ Th⠦ Cg⠲ Ac⠦ Af⠦ a⠶ b⠶ d⠖ e⠢ f⠶ g⠶ h⠶
)Resaltadas en amarillo las casillas d⠂ y d⠲(
d⠲¬⠒⠕¬d⠂`,
  "tablero-3": `Tablero:
Blancas: Re⠂ Dd⠂ Ta⠂ Th⠂ Cb⠂ Cf⠒ Af⠂ Ag⠢ a⠆ b⠆ c⠲ d⠲ e⠆ f⠆ g⠆ h⠆
Negras: Re⠦ Dd⠦ Ta⠦ Th⠦ Cb⠦ Cf⠖ Ac⠦ Af⠦ a⠶ b⠶ c⠶ d⠶ e⠖ f⠢ g⠶ h⠖
)Resaltadas en amarillo las casillas h⠶ y h⠖(
h⠶¬⠒⠕¬h⠖`,
  "tablero-4": `Tablero:
Blancas: Rh⠂ a⠲ b⠒ c⠆ f⠒ g⠲ h⠒
Negras: Ra⠦ a⠶ b⠖ f⠲ g⠢ h⠲`,
  "tablero-5": `Tablero:
Blancas: Rg⠂ Dd⠒ Tc⠂ Cd⠆ Ch⠢ Ac⠒ c⠲ d⠢ e⠲ g⠆ h⠒
Negras: Rg⠦ Db⠦ Ta⠆ Tb⠖ Ad⠖ Ad⠶ c⠢ e⠢ f⠖ f⠶ h⠖
)Resaltadas en amarillo las casillas g⠒ y h⠢ y, en rojo, la casilla f⠖(
c⠂¬⠒⠕¬f⠂
d⠒¬⠒⠕¬g⠒
h⠢¬⠒⠕¬f⠖`,
  "tablero-6": `Tablero:
Blancas: Rg⠂ Dd⠂ Ta⠂ Te⠂ Cd⠆ Cf⠒ Ac⠂ Ac⠆ b⠲ c⠒ d⠢ e⠲ f⠆ g⠆ h⠒
Negras: Rg⠦ Dc⠶ Tb⠦ Tf⠦ Cb⠶ Cf⠖ Ac⠦ Ae⠶ b⠢ c⠢ d⠖ e⠢ f⠶ g⠶ h⠶
)Resaltadas en amarillo las casillas b⠶ y d⠦ y, en rojo, la casilla c⠂(
d⠆¬⠒⠕¬b⠂
d⠆¬⠒⠕¬b⠒
d⠆¬⠒⠕¬f⠂`,
};
