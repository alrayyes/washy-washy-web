---
title: Создание конфигурации с помощью ИИ-чата
description: Готовый к копированию промпт, который превращает фотографии вашей стиральной машины и утюга вместе с описанием вашего белья в файл конфигурации, который может загрузить это приложение.
---

Эта страница — чистая документация: само веб-приложение не обрабатывает
изображения и не делает никаких обращений к ИИ. Вы вставляете этот промпт
и свои собственные фотографии в любой уже используемый вами ИИ-чат и
загружаете результат через кнопку «Upload config» в шапке — так же, как
любой другой файл конфигурации.

## Получить точный формат

Откройте [`/config`](https://washy-washy.ryankes.eu/config/) и
воспользуйтесь там ссылкой **Download**. Она скачивает конфигурацию,
активную сейчас в вашем браузере, — встроенный пример, если вы ещё не
загрузили или не отредактировали свою, — в точном JSON-формате
`{ machine, chart }`, который ожидает приложение. Прикрепите этот файл к
своему чату вместе с фотографиями, вместо того чтобы описывать формат по
памяти: это тот же файл, по которому приложение проверяет ваш ответ
(`parseConfig` из
[`@washy-washy/core`](https://github.com/alrayyes/washy-washy-core)), так
что нет формата, который можно было бы незаметно исказить.

## Сфотографируйте свою технику

- Панель вашей стиральной машины — регулятор и каждую кнопку опций.
- Кольцо или регулятор термостата вашего утюга.

## Промпт

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

## Проверьте, затем загрузите

Прежде чем доверять результату, стоит вручную проверить две вещи.

Ничто на фотографии не говорит, какое положение регулятора соответствует
«выключено», так что модели приходится это угадывать — если она ошибётся,
каждый рисунок в таблице окажется повёрнутым не туда. Начните сами с
положения «выключено» и пересчитайте по часовой стрелке, сверяясь с
фотографией.

Модель называет температуру стирки с полной уверенностью и иногда всё
равно ошибается. Проверьте по настоящему ярлыку по уходу всё, что может
испортить вещь, — шерсть, шёлк, всё с эластаном, — прежде чем доверять
таблице.

Затем загрузите JSON через кнопку «Upload config» в шапке. Это пропустит
его через тот же `parseConfig`, из которого пришло и скачивание: опечатка
в названии программы или отсутствующее поле приведут там к ошибке с
указанием конкретного поля, так что выдуманное значение никогда не
попадёт на страницу, которую вы читаете, стоя перед машиной.
