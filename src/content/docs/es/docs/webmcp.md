---
title: Herramientas WebMCP para agentes
description: Las cinco herramientas que este sitio registra para un navegador o extensión compatible con WebMCP, para que un agente pueda leer, validar y editar tu tabla y tu máquina directamente.
---

[WebMCP](https://webmachinelearning.github.io/webmcp/) es una API
experimental del navegador — un borrador del Web Machine Learning
Community Group del W3C, que todavía ningún navegador implementa por
defecto — que permite a una página declarar herramientas que un agente de
IA puede llamar directamente, en tu propia pestaña del navegador, contra
tus propios datos. Es la versión automatizada de [generar una
configuración con una herramienta de chat de IA](/es/docs/ai-prompt/): en
lugar de que pegues una configuración descargada y luego pegues el
resultado de vuelta, un agente que entiende WebMCP lee y escribe
directamente la configuración ya activa en tu navegador, validada de la
misma forma que cualquiera de los dos caminos.

Nada de esto cambia lo que hace la aplicación para quien no tenga ese
navegador o extensión: `document.modelContext` simplemente no existirá, y
las cinco herramientas de esta página nunca se registran. Tampoco se envía
ninguna configuración a ningún sitio en ningún caso: una llamada a una
herramienta lee y escribe la misma configuración respaldada por
`localStorage` que ya usa cualquier otra página de aquí.

## Las cinco herramientas

| Herramienta            | Hace                                                                                                                                                                                |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `washy_get_config`     | Lee la tabla y la máquina activas — la tuya propia, o el ejemplo incluido.                                                                                                          |
| `washy_validate_chart` | Comprueba las filas de la tabla contra la máquina activa sin guardar nada.                                                                                                          |
| `washy_set_chart`      | Reemplaza la tabla activa, validada primero — lo mismo que Guardar en [`/config`](https://washy-washy.ryankes.eu/config/).                                                          |
| `washy_set_machine`    | Reemplaza la lavadora y la plancha activas, revalidando la tabla actual contra ellas — lo mismo que Guardar en [`/config/machine`](https://washy-washy.ryankes.eu/config/machine/). |
| `washy_export_pdf`     | Renderiza la tabla activa como PDF (diseño para móvil o para imprimir), devuelto como datos en lugar de descargado.                                                                 |

Cada una de ellas pasa por la misma validación de
[`@washy-washy/core`](https://github.com/alrayyes/washy-washy-core) que
usan los editores de la página — una fila que un agente escriba y que no
encaje con tu máquina falla con el mismo error de fila y columna que
mostraría el editor de la tabla, no con una suposición silenciosa.

## Los cambios guardados recargan la página

`washy_set_chart` y `washy_set_machine` recargan la página en cuanto
guardan, igual que ya hace subir una configuración desde la cabecera — no
hay sincronización en vivo entre un editor abierto y una llamada a una
herramienta, así que una recarga es cómo se pone al día.

## Pruébalo tú mismo

Instala una extensión de navegador compatible con WebMCP, o abre la
consola de las herramientas de desarrollador de tu navegador en este sitio
y llama a `await document.modelContext.getTools()` — en cuanto haya
soporte nativo o un polyfill presente, lista las cinco herramientas por
nombre y descripción antes de que llames a ninguna.
