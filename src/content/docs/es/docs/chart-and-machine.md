---
title: Los archivos de guía y máquina
description: Cada campo de tu guía, cómo describe el archivo de máquina tu lavadora y tu plancha, y cómo deciden las reglas de mezcla qué puede compartir tambor.
---

Un único objeto JSON lo describe todo: tu lavadora y tu plancha bajo
`machine`, y una entrada por cada montón de ropa bajo `chart`. Tanto la CLI
como la subida de la aplicación web aceptan exactamente esta forma — es lo
que valida `parseConfig` de
[`@washy-washy/core`](https://github.com/alrayyes/washy-washy-core).

```json
{
  "machine": { "washer": { "..." }, "iron": { "..." } },
  "chart": [{ "clothing_type": "..." }]
}
```

## La guía

Cada entrada bajo `chart` es un montón:

| Campo             | Qué contiene                                                              |
| ----------------- | ------------------------------------------------------------------------- |
| `clothing_type`   | Cómo llamas al montón — es el título de la tarjeta                        |
| `detergent`       | Qué detergente y cuánto                                                   |
| `fabric_softener` | `yes` o `no`                                                              |
| `temperature`     | Una temperatura que ofrece tu máquina                                     |
| `spin`            | Una velocidad de centrifugado que ofrece tu máquina                       |
| `duration`        | Aproximadamente cuánto dura, como `~H:MM`                                 |
| `program`         | Una posición del dial, escrita exactamente como en el panel               |
| `options`         | Botones de opción, separados por barras verticales; vacío si no hay       |
| `ironing`         | `yes` o `no` — si se plancha o no                                         |
| `ironing_notes`   | Texto libre: cómo plancharlo, o por qué no. A menudo vacío                |
| `iron_setting`    | Una posición del termostato. Vacío cuando `ironing` es `no`               |
| `drying`          | Texto libre: cómo secarlo                                                 |
| `colour_group`    | `white`, `colour`, `dark`, `sport` o `any`                                |
| `mix_tags`        | Separado por barras: `lint-shedder`, `lint-magnet`, `dye-bleeder`, `solo` |
| `notes`           | Cualquier otra cosa que valga la pena saber                               |

Todo valor de cara a la máquina — `program`, `temperature`, `spin`,
`options`, `iron_setting` — se comprueba contra lo que ofrece tu propia
`machine`, así que una errata falla señalando la fila y la columna concretas
en lugar de producir una tarjeta que te diga que gires el dial hacia un
punto que no existe.

## La máquina

`machine.washer` enumera las etiquetas del dial en su orden físico, además
de las temperaturas, velocidades de centrifugado y botones de opción que
ofrece la pantalla. `machine.iron` enumera las posiciones del termostato,
de más fría a más caliente. Copia cada etiqueta exactamente como está
impresa delante de ti, en el idioma que sea — aquí nunca se traduce la
etiqueta de un panel, porque una guía que tienes que volver a traducir de
pie frente a la máquina es peor que no tener guía.

El orden de `washer.programs` es estructural: la primera entrada es la
posición de apagado, dibujada a las doce en punto, y el ángulo de cada
marca siguiente depende de su posición en la lista. Omitir una no solo la
elimina — desplaza el ángulo de todas las que vienen después.

El propio editor [`/config/machine`](https://washy-washy.ryankes.eu/config/machine/)
de la aplicación web escribe esta misma forma — reordenar ahí la lista de
programas hace exactamente lo mismo que reordenar el array JSON:

<img class="theme-shot" data-variant="light" src="/docs/media/es/machine-editor-light.png" alt="La tabla de velocidades de centrifugado, botones y ajustes de plancha del editor de máquina" />
<img class="theme-shot" data-variant="dark" src="/docs/media/es/machine-editor-dark.png" alt="La tabla de velocidades de centrifugado, botones y ajustes de plancha del editor de máquina" />

```json
{
  "washer": {
    "name": "Generic front loader",
    "capacity": "1–8 kg",
    "programs": ["Off", "Cottons", "Delicates / Silk", "Wool"],
    "temperatures": ["cold", "20", "30", "40", "60", "90"],
    "spins": ["0", "400", "600", "800", "1200", "1400"],
    "options": ["Speed", "Eco", "Easy Iron", "Extra Rinse"]
  },
  "iron": {
    "name": "Generic steam iron",
    "settings": [
      {
        "key": "min",
        "dots": "",
        "label": "MIN",
        "detail": "no heat",
        "steam": false
      },
      {
        "key": "3",
        "dots": "•••",
        "label": "•••",
        "detail": "cotton, linen · 200 °C",
        "steam": true
      }
    ]
  }
}
```

## Qué puede lavarse junto

Dos montones solo pueden compartir tambor cuando se cumple todo esto,
comprobado en orden — el primero que falla es el motivo que mostraría una
matriz de compatibilidad:

1. Ninguno está etiquetado `solo`.
2. Si alguno es `lint-shedder`, el otro también tiene que serlo.
3. Su `colour_group` coincide (`any` coincide con todo).
4. `program`, `temperature`, `spin` y el conjunto de `options` son idénticos.

Los montones se fusionan en una sola tarjeta, compartiendo un único dibujo
de dial, cuando todo lo que ajustas físicamente coincide: programa,
temperatura, centrifugado, opciones, si lleva suavizante o no, y hacia
dónde apunta el termostato de la plancha. Los campos de texto libre
(`detergent`, `drying`, `notes`) se dejan deliberadamente fuera de esa
comprobación — dos montones pueden querer detergentes distintos y aun así
compartir tarjeta, y la tarjeta lista ambas líneas junto al montón al que
pertenecen.
