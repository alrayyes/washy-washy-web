---
title: توليد إعداد باستخدام أداة محادثة بالذكاء الاصطناعي
description: مُطالبة جاهزة للنسخ واللصق لتحويل صور غسالتك ومكواتك، إضافة إلى وصف لغسيلك، إلى ملف إعداد يمكن لهذا التطبيق تحميله.
---

هذه الصفحة توثيقية فقط — لا يعالج تطبيق الويب أي صور ولا يجري أي استدعاءات للذكاء الاصطناعي بنفسه. تلصق هذه المُطالبة وصورك الخاصة في أي أداة محادثة بالذكاء الاصطناعي تستخدمها بالفعل، وترفع ما يعود إليك عبر زر "رفع إعداد" في الترويسة، تمامًا كأي ملف إعداد آخر.

## الحصول على الشكل الدقيق

افتح [`/config`](https://washy-washy.ryankes.eu/config/) واستخدم رابط **التنزيل** فيها. يُنزّل ذلك الإعداد النشط حاليًا في متصفحك — المثال المرفق، ما لم تكن قد رفعت أو عدّلت واحدًا بالفعل — على هيئة شكل JSON بالضبط `{ machine, chart }` الذي يتوقعه التطبيق. أرفق هذا الملف في محادثتك مع صورك، بدلاً من وصف الشكل من الذاكرة: فهو نفس الملف الذي يتحقق التطبيق من إجابتك مقابله (دالة `parseConfig` الخاصة بـ[`@washy-washy/core`](https://github.com/alrayyes/washy-washy-core))، فلا يوجد شكل يمكن أن يُخطأ فيه بشكل دقيق وغير ملحوظ.

## صوّر أجهزتك

- اللوحة الأمامية لغسالتك — القرص وكل زر خيارات.
- حلقة أو قرص منظم حرارة مكواتك.

## المُطالبة

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

## تحقّق منها، ثم ارفعها

هناك أمران يستحقان التحقق اليدوي قبل أن تثق بالنتيجة.

لا شيء في الصورة يوضّح أي وضع على القرص هو وضع الإيقاف، لذا يضطر النموذج إلى التخمين — وإن أخطأ، تنحرف كل الرسومات في المخطط. ابدأ من وضع الإيقاف واعدّ بنفسك باتجاه عقارب الساعة مقارنةً بالصورة.

يذكر النموذج درجة حرارة الغسيل بثقة تامة وقد يكون مخطئًا أحيانًا. تحقق من أي شيء قد يُتلف قطعة ملابس — الصوف، الحرير، أي شيء يحتوي على إيلاستان — مقابل بطاقة العناية الفعلية قبل أن تثق بالمخطط.

بعد ذلك ارفع ملف JSON عبر زر "رفع إعداد" في الترويسة. يُشغّل ذلك الملف عبر نفس `parseConfig` التي جاء منها ملف التنزيل: فأي خطأ إملائي في اسم برنامج أو حقل ناقص يفشل هناك، مع تسمية الحقل المحدَّد، بحيث لا تصل قيمة مُختلَقة أبدًا إلى الصفحة التي ستقف أمام الجهاز تقرأها.
