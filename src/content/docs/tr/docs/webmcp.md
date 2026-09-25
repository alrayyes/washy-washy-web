---
title: Aracılar için WebMCP araçları
description: Bu sitenin WebMCP destekli bir tarayıcı veya uzantı için kaydettiği beş araç; bir aracının çizelgeni ve makineni doğrudan okumasını, doğrulamasını ve düzenlemesini sağlar.
---

[WebMCP](https://webmachinelearning.github.io/webmcp/), bir sayfanın bir
yapay zeka aracısının doğrudan kendi tarayıcı sekmende, kendi verilerin
üzerinde çağırabileceği araçlar tanımlamasına izin veren deneysel bir
tarayıcı API'si — henüz hiçbir tarayıcının varsayılan olarak
uygulamadığı bir W3C Web Machine Learning Community Group taslağı. Bu,
[bir yapay zeka sohbet aracıyla yapılandırma
oluşturma](/tr/docs/ai-prompt/)'nın otomatikleştirilmiş hâli: indirilen
bir yapılandırmayı yapıştırıp sonucu geri yapıştırmak yerine, WebMCP'yi
anlayan bir aracı, tarayıcında zaten etkin olan yapılandırmayı doğrudan
okur ve yazar — her iki yolun da doğruladığı şekilde doğrulanmış olarak.

Böyle bir tarayıcısı veya uzantısı olmayan kimse için burada hiçbir şey
değişmez: `document.modelContext` basitçe var olmaz ve bu sayfanın beş
aracı hiçbir zaman kaydedilmez. Her iki durumda da hiçbir yapılandırma
hiçbir yere gönderilmez: bir araç çağrısı, buradaki her sayfanın zaten
kullandığı, `localStorage` tabanlı aynı yapılandırmayı okur ve yazar.

## Beş araç

| Araç                   | Yapar                                                                                                                                                                                         |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `washy_get_config`     | Etkin çizelgeyi ve makineyi okur — kendi çizelgeni ya da hazır örneği.                                                                                                                        |
| `washy_validate_chart` | Çizelge satırlarını etkin makineye göre denetler, hiçbir şey kaydetmeden.                                                                                                                     |
| `washy_set_chart`      | Önce doğrulanmış olarak etkin çizelgeyi değiştirir — [`/config`](https://washy-washy.ryankes.eu/config/) sayfasında Kaydet'le aynı.                                                           |
| `washy_set_machine`    | Etkin çamaşır makinesini ve ütüyü değiştirir, mevcut çizelgeyi bunlara göre yeniden doğrular — [`/config/machine`](https://washy-washy.ryankes.eu/config/machine/) sayfasında Kaydet'le aynı. |
| `washy_export_pdf`     | Etkin çizelgeyi PDF olarak oluşturur (telefon veya baskı düzeni), indirilmek yerine veri olarak döner.                                                                                        |

Bunların her biri, sayfadaki düzenleyicilerin kullandığı aynı
[`@washy-washy/core`](https://github.com/alrayyes/washy-washy-core)
doğrulamasından geçer — bir aracının yazdığı ve makinene uymayan bir satır,
çizelge düzenleyicisinin göstereceğiyle aynı satır-ve-sütun hatasıyla
başarısız olur, sessiz bir tahminle değil.

## Kaydedilen değişiklikler sayfayı yeniden yükler

`washy_set_chart` ve `washy_set_machine`, kaydettikten sonra sayfayı
yeniden yükler — tıpkı üstbilgi üzerinden bir yapılandırma yüklemenin
zaten yaptığı gibi. Açık bir düzenleyici ile bir araç çağrısı arasında
canlı bir senkronizasyon yoktur, bu yüzden yeniden yükleme onun
güncellenme şeklidir.

## Kendin dene

WebMCP destekli bir tarayıcı uzantısı kur veya bu sitede tarayıcının
geliştirici konsolunu aç ve `await document.modelContext.getTools()`
çağrısını yap — yerel destek veya bir polyfill mevcut olduğunda, herhangi
birini çağırmadan önce beş aracın tümünü adı ve açıklamasıyla listeler.
