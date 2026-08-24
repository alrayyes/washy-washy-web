---
title: Çizelge ve makine dosyaları
description: Çizelgenizdeki her alan, makine dosyasının çamaşır makinenizi ve ütünüzü nasıl tanımladığı ve karıştırma kurallarının aynı tamburu neyin paylaşabileceğine nasıl karar verdiği.
---

Tek bir JSON nesnesi her şeyi tanımlar: çamaşır makineniz ve ütünüz `machine`
altında, çamaşır yığınlarınızın her biri ise `chart` altında birer girdi
olarak yer alır. Hem CLI hem de web uygulamasının yükleme özelliği tam olarak
bu şekli kabul eder — bu, [`@washy-washy/core`](https://github.com/alrayyes/washy-washy-core)'un
`parseConfig` fonksiyonunun doğruladığı şekildir.

```json
{
  "machine": { "washer": { "..." }, "iron": { "..." } },
  "chart": [{ "clothing_type": "..." }]
}
```

## Çizelge

`chart` altındaki her girdi bir yığındır:

| Alan              | İçinde ne var                                                                 |
| ----------------- | ----------------------------------------------------------------------------- |
| `clothing_type`   | Yığına verdiğiniz isim — bu, kart başlığıdır                                  |
| `detergent`       | Hangi deterjan ve ne kadar                                                    |
| `fabric_softener` | `yes` veya `no`                                                               |
| `temperature`     | Makinenizin sunduğu bir sıcaklık                                              |
| `spin`            | Makinenizin sunduğu bir sıkma hızı                                            |
| `duration`        | Yaklaşık ne kadar sürdüğü, `~H:MM` biçiminde                                  |
| `program`         | Panelde yazdığı gibi birebir yazılmış bir kadran konumu                       |
| `options`         | Dikey çizgiyle ayrılmış opsiyon düğmeleri; hiçbiri yoksa boş                  |
| `ironing`         | `yes` veya `no` — hiç ütülenip ütülenmediği                                   |
| `ironing_notes`   | Düz metin: nasıl ütülendiği, ya da neden ütülenmediği. Çoğunlukla boş         |
| `iron_setting`    | Bir termostat konumu. `ironing` `no` olduğunda boş                            |
| `drying`          | Düz metin: nasıl kurutulduğu                                                  |
| `colour_group`    | `white`, `colour`, `dark`, `sport` veya `any`                                 |
| `mix_tags`        | Dikey çizgiyle ayrılmış: `lint-shedder`, `lint-magnet`, `dye-bleeder`, `solo` |
| `notes`           | Bilinmesi gereken başka her şey                                               |

Makineyle ilgili her değer — `program`, `temperature`, `spin`, `options`,
`iron_setting` — kendi `machine` tanımınızın sunduklarına göre kontrol edilir;
böylece bir yazım hatası, kadranı gitmediği bir yere çevirmenizi söyleyen bir
kart üretmek yerine, ilgili satır ve sütunla birlikte hata verir.

## Makine

`machine.washer`, kadranın etiketlerini fiziksel sırayla listeler; ayrıca
ekranın sunduğu sıcaklıkları, sıkma hızlarını ve opsiyon düğmelerini de
içerir. `machine.iron` ise termostatın konumlarını en soğuktan en sıcağa
doğru listeler. Her etiketi, hangi dilde olursa olsun, önünüzde yazdığı gibi
birebir kopyalayın — burada hiçbir zaman bir panel etiketi çevrilmez, çünkü
makinenin başında dururken geri çevirmeniz gereken bir çizelge, hiç çizelge
olmamasından daha kötüdür.

`washer.programs` sıralaması taşıyıcı bir öneme sahiptir: ilk girdi, saat on
ikide çizilen kapalı konumdur ve diğer her çentiğin açısı listede bulunduğu
yerden gelir. Birini atlamak yalnızca onu kaldırmakla kalmaz — ondan sonraki
her çentiği de kaydırır.

Web uygulamasının kendi [`/config/machine`](https://washy-washy.ryankes.eu/config/machine/)
düzenleyicisi de aynı şekli yazar — oradaki program listesini yeniden
sıralamak, JSON dizisini yeniden sıralamakla tamamen aynı şeyi yapar:

<img class="theme-shot" data-variant="light" src="/docs/media/tr/machine-editor-light.png" alt="Makine düzenleyicisinin sıkma hızları, düğmeler ve ütü ayarları tablosu" />
<img class="theme-shot" data-variant="dark" src="/docs/media/tr/machine-editor-dark.png" alt="Makine düzenleyicisinin sıkma hızları, düğmeler ve ütü ayarları tablosu" />

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

## Birlikte nelerin yıkanabileceği

İki yığın, yalnızca aşağıdakilerin tümü geçerliyse aynı tamburu
paylaşabilir; bunlar sırayla kontrol edilir — başarısız olan ilk madde, bir
uyumluluk tablosunun göstereceği nedendir:

1. İkisinden hiçbiri `solo` olarak etiketlenmemiştir.
2. Biri `lint-shedder` ise, diğeri de olmalıdır.
3. `colour_group` değerleri eşleşir (`any` her şeyle eşleşir).
4. `program`, `temperature`, `spin` ve `options` kümesi birebir aynıdır.

Fiziksel olarak ayarladığınız her şey — program, sıcaklık, sıkma hızı,
opsiyonlar, yumuşatıcı konulup konulmayacağı ve ütünün termostatının nereyi
gösterdiği — uyuştuğunda, yığınlar tek bir kadran çizimini paylaşarak tek bir
kartta birleşir. Düz metin alanları (`detergent`, `drying`, `notes`)
bilinçli olarak bu kontrolün dışında tutulur — iki yığın farklı deterjan
istese bile aynı kartı paylaşabilir ve kart, her iki satırı da ait olduğu
yığına karşı listeler.
