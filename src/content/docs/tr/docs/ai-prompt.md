---
title: Bir yapay zeka sohbet aracıyla yapılandırma oluşturma
description: Çamaşır makinenizin ve ütünüzün fotoğraflarını, çamaşırlarınızın bir açıklamasıyla birlikte, bu uygulamanın yükleyebileceği bir yapılandırma dosyasına dönüştürmek için kopyala-yapıştırla kullanılabilecek bir prompt.
---

Bu sayfa yalnızca belgelendirmedir — web uygulaması hiçbir görüntü işleme
yapmaz ve kendisi hiçbir yapay zeka çağrısı yapmaz. Bu prompt'u ve kendi
fotoğraflarınızı zaten kullandığınız herhangi bir yapay zeka sohbet aracına
yapıştırırsınız ve geri gelen sonucu, diğer her yapılandırma dosyasında
olduğu gibi başlıktaki "Upload config" düğmesiyle yüklersiniz.

## Tam biçimi elde edin

[`/config`](https://washy-washy.ryankes.eu/config/) sayfasını açın ve
**Download** bağlantısını kullanın. Bu, tarayıcınızda o an etkin olan
yapılandırmayı — zaten bir tane yüklemediyseniz ya da düzenlemediyseniz
yerleşik örneği — uygulamanın beklediği tam `{ machine, chart }` JSON
şeklinde indirir. Şekli hafızanızdan tarif etmek yerine bu dosyayı
fotoğraflarınızla birlikte sohbetinize ekleyin: bu, uygulamanın cevabınızı
karşılaştırarak doğruladığı aynı dosyadır ([`@washy-washy/core`](https://github.com/alrayyes/washy-washy-core)'un
`parseConfig` fonksiyonu), dolayısıyla ustaca yanlış gidebilecek bir biçim
yoktur.

## Cihazlarınızın fotoğrafını çekin

- Çamaşır makinenizin ön paneli — kadran ve her opsiyon düğmesi.
- Ütünüzün termostat halkası ya da kadranı.

## Prompt

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

## Kontrol edin, sonra yükleyin

Sonuca güvenmeden önce elle kontrol etmeye değer iki şey var.

Bir fotoğrafta hiçbir şey hangi kadran konumunun kapalı olduğunu söylemez,
bu yüzden modelin tahmin etmesi gerekir — yanlış yaparsa çizelgedeki her
çizim döner. Kapalı konumdan başlayıp fotoğrafa karşı kendiniz saat
yönünde sayın.

Bir model, bir yıkama sıcaklığını tam bir güvenle belirtir ve bazen yanlış
olur. Çizelgeye güvenmeden önce bir kıyafeti mahvedebilecek her şeyi — yün,
ipek, elastan içeren her şey — gerçek bakım etiketiyle karşılaştırarak
kontrol edin.

Ardından JSON'u başlıktaki "Upload config" düğmesiyle yükleyin. Bu,
indirmenin geldiği aynı `parseConfig`'den geçer: bir program adındaki bir
yazım hatası ya da eksik bir alan orada başarısız olur ve ilgili alanı
adlandırır, böylece uydurma bir değer, makinenin önünde durup okuyacağınız
sayfaya asla ulaşmaz.
