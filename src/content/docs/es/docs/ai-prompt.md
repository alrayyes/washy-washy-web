---
title: Genera una configuración con una IA conversacional
description: Un prompt listo para copiar y pegar que convierte fotos de tu lavadora y tu plancha, más una descripción de tu ropa, en un archivo de configuración que esta aplicación puede cargar.
---

Esta página es solo documentación — la aplicación web no procesa imágenes
ni hace llamadas a ninguna IA por su cuenta. Tú pegas este prompt y tus
propias fotos en la herramienta de chat de IA que ya uses, y subes lo que
te devuelva a través del botón "Upload config" de la cabecera, igual que
cualquier otro archivo de configuración.

## Consigue el formato exacto

Abre [`/config`](https://washy-washy.ryankes.eu/config/) y usa su enlace
**Download**. Eso descarga la configuración activa en ese momento en tu
navegador — el ejemplo incluido, a menos que ya hayas subido o editado uno
— con la forma JSON exacta `{ machine, chart }` que espera la aplicación.
Adjunta ese archivo a tu chat junto con tus fotos, en lugar de describir la
forma de memoria: es el mismo archivo contra el que la aplicación valida tu
respuesta (`parseConfig` de
[`@washy-washy/core`](https://github.com/alrayyes/washy-washy-core)), así
que no hay ningún formato que puedas acertar mal por poco.

## Fotografía tus electrodomésticos

- El panel de tu lavadora — el dial y todos los botones de opción.
- El anillo o dial del termostato de tu plancha.

## El prompt

```text
Attached is a photo of my washing machine's fascia, a photo of my iron's
thermostat, and an example washy-washy config file. Write me the same
"machine" shape for my own appliances, then a "chart" array for the laundry
I describe below, and return the whole thing as one JSON object shaped
exactly like the attached example: { "machine": {...}, "chart": [...] }.

For the machine:
- Copy every label exactly as printed, in whatever language it's in. Do not
  translate anything into English and do not tidy up spelling or
  punctuation — a chart that doesn't match the machine is worse than no
  chart.
- washer.programs is the dial, listed in the order the positions go round
  it, starting at the off position and going clockwise. This order changes
  every other programme's angle in the drawing, so read it off the photo
  rather than grouping the programmes sensibly.
- iron.settings is the thermostat ring, coolest first.

For the chart, one entry per pile of laundry:
- Every machine-facing value has to come out of the machine you just wrote:
  program from washer.programs, temperature from washer.temperatures, spin
  from washer.spins, options from washer.options, iron_setting from
  iron.settings' keys. Spell them exactly as they appear there.
- ironing is "yes" or "no". When it's "no", leave iron_setting empty.
- duration is roughly how long that programme runs on my machine, as
  "~H:MM".

My laundry: <describe it — fabrics, colours, what you own a lot of, what
you line dry, anything with a care label you actually follow>.
```

## Compruébalo, y luego súbelo

Merece la pena revisar dos cosas a mano antes de fiarte del resultado.

Nada en una foto indica cuál es la posición de apagado del dial, así que el
modelo tiene que adivinarlo — si se equivoca, cada dibujo de la guía queda
girado. Empieza por la posición de apagado y cuenta tú mismo en sentido
horario comparando con la foto.

Un modelo indica una temperatura de lavado con total seguridad y a veces se
equivoca. Comprueba cualquier cosa que pudiera estropear una prenda — lana,
seda, cualquier cosa con elastano — contra la etiqueta de cuidado real
antes de fiarte de la guía.

Luego sube el JSON a través del botón "Upload config" de la cabecera. Eso
lo pasa por el mismo `parseConfig` del que vino la descarga: una errata en
el nombre de un programa o un campo que falte falla ahí, señalando el campo
concreto, así que un valor inventado nunca llega a la página que leerías de
pie frente a la máquina.
