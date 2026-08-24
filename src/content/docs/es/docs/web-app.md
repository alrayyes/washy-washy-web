---
title: Usar la aplicación web
description: Los filtros de la página principal, qué persiste entre visitas, y cómo se relaciona subir una configuración con el ejemplo incluido.
---

La aplicación web está publicada en
[washy-washy.ryankes.eu](https://washy-washy.ryankes.eu). Lee los mismos
[archivos de guía y máquina](/es/docs/chart-and-machine/) que la CLI, pero
mostrados como una página en vez de un PDF.

## Configuración incluida frente a activa

La página principal (`/`) viene con una guía y una máquina de ejemplo
inventadas — los mismos datos ficticios que muestra el propio README de la
CLI. Eso es lo que ve alguien que visita por primera vez, y es a lo que
vuelve cada página cuando no hay ninguna otra activa.

Subir una configuración la reemplaza. El botón "Upload config" de la
cabecera — presente en todas las páginas — y la sección más completa de
subida/descarga en [`/config`](https://washy-washy.ryankes.eu/config/)
aceptan ambos el mismo archivo JSON `{ machine, chart }` (ver
[los archivos de guía y máquina](/es/docs/chart-and-machine/)), lo validan, y
lo guardan en el `localStorage` del navegador. A partir de ahí, cada página
lee esa configuración en lugar de la incluida, hasta que la borres.

Editar en `/config` o en [`/config/machine`](https://washy-washy.ryankes.eu/config/machine/)
funciona igual: guardar escribe la configuración editada en el mismo
almacenamiento. Nada de esto se envía a un servidor — una configuración
nunca sale de tu navegador, y un navegador distinto o borrar los datos del
sitio vuelve a empezar con el ejemplo incluido.

`/config` también tiene un enlace de descarga, que escribe la configuración
activa en ese momento — la incluida o una personalizada — de vuelta en el
mismo formato JSON que subirías. Ese es el recorrido de ida y vuelta para
editar una copia en otro sitio, o para pasarle tu configuración a otra
persona.

<img class="theme-shot" data-variant="light" src="/docs/media/es/config-chart-cards-light.png" alt="La página de configuración: resumen de máquina de solo lectura, controles de subida/descarga, y cada montón como una tarjeta editable" />
<img class="theme-shot" data-variant="dark" src="/docs/media/es/config-chart-cards-dark.png" alt="La página de configuración: resumen de máquina de solo lectura, controles de subida/descarga, y cada montón como una tarjeta editable" />

## Alternar tema

La cabecera también tiene un interruptor claro/oscuro, junto a "Upload
config" en todas las páginas. Si lo dejas tal cual, el sitio sigue el ajuste
`prefers-color-scheme` de tu sistema operativo o navegador, igual que antes
de que existiera esto. Al hacer clic se fija una elección explícita en su
lugar, guardada en `localStorage`, que a partir de entonces prevalece sobre
ese ajuste del sistema en todas las páginas y en cada visita futura — hasta
que vuelvas a hacer clic. Es un interruptor de dos estados, no un selector:
no hay una opción aparte de "volver al sistema".

## Navegación por teclado

El sitio también responde a un puñado de atajos al estilo vim, montados una
sola vez en la cabecera para que funcionen en todas las páginas — esta
documentación incluida:

- `j` y `k` desplazan la página hacia abajo y hacia arriba.
- `g` `g` (pulsa `g` dos veces) salta al principio.
- `G` (mayúscula-g) salta al final.
- `/` enfoca el campo de búsqueda propio de la página — la búsqueda de
  montones de la página principal, por ejemplo — sin escribir una barra
  dentro de él.
- `?` (mayúscula-?) abre una ventana de ayuda con todos estos atajos; `Esc`
  o un clic fuera de ella la cierra de nuevo.

La misma ventana también se abre desde el botón `?` de la cabecera, para
quien use un ratón o un lector de pantalla en vez del teclado. Ninguno de
estos atajos se activa mientras escribes en un campo de texto, un área de
texto, un desplegable o cualquier otro elemento editable — escribir con
normalidad siempre gana.

## Filtros

La página principal filtra por el corte que quieras (guía completa, solo
lavado, solo planchado) y por una búsqueda de montones en texto libre, más
un desplegable "Advanced" — cerrado por defecto — para filtrar por un
programa, temperatura o centrifugado exactos, y una búsqueda de detergente.
Todos estrechan la misma lista; un montón tiene que coincidir con todos los
filtros activos para mostrarse.

Los selectores de programa, temperatura y centrifugado solo ofrecen valores
que dejarían al menos un montón visible, dada la búsqueda de montones y lo
que ya hayas elegido en Advanced — así que no puedes elegir una combinación
que te deje con una guía vacía. Las listas se actualizan en vivo a medida
que cambias otros filtros, y si a un campo no le queda nada que pudiera
coincidir, se desactiva en lugar de mostrar opciones vacías.

Los filtros persisten en `localStorage` entre visitas, igual que una
configuración. Una vista filtrada también se puede compartir: la barra de
direcciones lleva `cut`, `pile`, `program`, `temperature`, `spin` y
`detergent` como parámetros de consulta, y una URL que lleve cualquiera de
ellos prevalece siempre sobre lo que se guardó de una visita anterior — ver
Compartir más abajo para el botón que entrega esa URL.

<img class="theme-shot" data-variant="light" src="/docs/media/es/sheet-filters-light.png" alt="Los filtros Advanced abiertos, con solo lavado seleccionado" />
<img class="theme-shot" data-variant="dark" src="/docs/media/es/sheet-filters-dark.png" alt="Los filtros Advanced abiertos, con solo lavado seleccionado" />

## Compartir

Junto a los botones de descarga de PDF está **Share this view**, que envía
la URL actual de la página tal cual — filtros incluidos, ya que la barra de
direcciones ya los lleva como parámetros de consulta (ver Filtros más
arriba), así que no hay nada extra que empaquetar.

Si tienes una máquina o guía personalizada activa (ver
[Configuración incluida frente a activa](#configuración-incluida-frente-a-activa)),
el enlace también lleva toda esa configuración, añadida como un fragmento
`#config=` comprimido. Quien lo abra obtiene tu máquina y guía exactas, no
solo tus filtros — incluso en un navegador que nunca ha tocado tu
`localStorage`. Tampoco toca ningún servidor: un fragmento nunca se envía
por la red, así que el enlace en sí sigue siendo la transferencia completa,
igual que un archivo de configuración subido. En cuanto la página lo ha
leído y guardado, borra el fragmento de la barra de direcciones — si
recargas o compartes de nuevo desde ahí, obtienes la URL corta normal del
sitio, no el enlace de un solo uso. Un enlace dañado o editado a mano
muestra el mismo error acotado a fila/columna que una subida de
configuración inválida, y la página vuelve a lo que ya estuviera activo en
vez de romperse. Cuando no hay nada personalizado activo, el enlace es
igual que antes — solo filtros.

Primero intenta el panel de compartir nativo del navegador
(`navigator.share` — Mensajes, WhatsApp, AirDrop, lo que ofrezca el
sistema), y solo recurre a copiar la URL al portapapeles — mostrando
"Copied!" igual que hace el propio botón Copy link de una tarjeta — cuando
esa API no está disponible, o cuando está disponible pero falla de verdad.
Cancelar el panel de compartir no cuenta como eso: es simplemente rechazar
ese método concreto, así que no pasa nada más y no se copia nada a tus
espaldas.

## Exportar a PDF

La página principal tiene dos botones de descarga, ambos acotados a lo que
esté filtrado en pantalla en ese momento y renderizados en el navegador con
el mismo [`@washy-washy/pdf`](https://github.com/alrayyes/washy-washy-pdf)
que usa el `bun run generate` de la CLI. Ninguno genera nada hasta que
haces clic — filtrar la página nunca dispara un renderizado en segundo
plano.

- **Download for phone** escribe la misma página estrecha, de desplazamiento
  único, que produce la CLI — pensada para leerse desde el móvil junto a la
  máquina.
- **Download to print** escribe en su lugar una hoja A4: una tabla de
  referencia más una tarjeta de detalle por montón, pensada para
  imprimirse y pegarse en algún sitio.

Una sola tarjeta también tiene su propio botón **Download**, para un
montón a la vez. Es solo en formato móvil — el diseño de impresión siempre
dibuja toda la tabla de referencia más la tarjeta de cada montón, así que
no hay forma de acotarlo a un solo montón como sí puede hacer el formato
móvil.

<img class="theme-shot" data-variant="light" src="/docs/media/es/sheet-pdf-download-light.png" alt="Los botones propios de Download y Copy link de una sola tarjeta" />
<img class="theme-shot" data-variant="dark" src="/docs/media/es/sheet-pdf-download-dark.png" alt="Los botones propios de Download y Copy link de una sola tarjeta" />

**Copy link**, junto al botón de descarga de una tarjeta, pone la URL de
esa vista filtrada en tu portapapeles — el mismo recurso de portapapeles
que usa arriba el botón Share de la página, pero acotado a una tarjeta.
