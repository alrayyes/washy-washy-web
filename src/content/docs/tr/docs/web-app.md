---
title: Web uygulamasını kullanma
description: Ana sayfadaki filtreler, ziyaretler arasında neyin kalıcı olduğu ve bir yapılandırma yüklemenin yerleşik örnekle nasıl bir ilişkisi olduğu.
---

Web uygulaması [washy-washy.ryankes.eu](https://washy-washy.ryankes.eu)
adresinde yayında. CLI ile aynı [çizelge ve makine dosyalarını](/tr/docs/chart-and-machine/)
okur, bir PDF yerine bir sayfa olarak oluşturur.

## Yerleşik ve etkin yapılandırma

Ana sayfa (`/`), uydurma bir örnek çizelge ve makineyle birlikte gelir —
CLI'nin kendi README dosyasında gösterilen aynı örnek veriler. İlk kez gelen
bir ziyaretçinin gördüğü budur ve başka hiçbir şey etkin değilken her
sayfanın döndüğü varsayılan da budur.

Bir yapılandırma yüklemek onun yerine geçer. Her sayfada bulunan
başlıktaki "Upload config" düğmesi ile [`/config`](https://washy-washy.ryankes.eu/config/)
sayfasındaki daha kapsamlı yükleme/indirme bölümü, ikisi de aynı
`{ machine, chart }` JSON dosyasını kabul eder (bkz.
[çizelge ve makine dosyaları](/tr/docs/chart-and-machine/)), onu doğrular ve
tarayıcının `localStorage`'ında saklar. O andan itibaren, siz temizleyene
kadar her sayfa yerleşik yapılandırma yerine bu yapılandırmayı okur.

`/config` veya [`/config/machine`](https://washy-washy.ryankes.eu/config/machine/)
üzerinde düzenleme yapmak da aynı şekilde çalışır: bir kaydetme işlemi,
düzenlenen yapılandırmayı aynı depolama alanına yazar. Burada hiçbir şey bir
sunucuya gönderilmez — bir yapılandırma tarayıcınızdan asla çıkmaz ve farklı
bir tarayıcı ya da temizlenmiş site verisi sizi yeniden yerleşik örneğe
götürür.

`/config` sayfasında ayrıca, o an etkin olan yapılandırmayı — yerleşik ya da
özel — tam olarak yükleyebileceğiniz aynı JSON şeklinde dışa aktaran bir
indirme bağlantısı da bulunur. Bu, bir kopyayı başka bir yerde düzenlemenin
ya da yapılandırmanızı başka birine vermenin gidiş-dönüş yoludur.

<img class="theme-shot" data-variant="light" src="/docs/media/tr/config-chart-cards-light.png" alt="Yapılandırma sayfası: salt okunur makine özeti, yükleme/indirme denetimleri ve düzenlenebilir kart olarak her yığın" />
<img class="theme-shot" data-variant="dark" src="/docs/media/tr/config-chart-cards-dark.png" alt="Yapılandırma sayfası: salt okunur makine özeti, yükleme/indirme denetimleri ve düzenlenebilir kart olarak her yığın" />

## Tema değiştirici

Başlıkta ayrıca, her sayfada "Upload config" düğmesinin yanında bir
açık/koyu tema değiştirici bulunur. Dokunulmadığı sürece site, bu özellik
var olmadan önceki gibi işletim sisteminizin ya da tarayıcınızın
`prefers-color-scheme` ayarını izler. Tıklamak bunun yerine `localStorage`'da
saklanan açık bir seçim belirler; bu seçim de siz tekrar tıklayana kadar her
sayfada ve her gelecekteki ziyarette o işletim sistemi ayarının önüne geçer.
Bu bir seçici değil, iki durumlu bir anahtardır: ayrı bir "sisteme dön"
seçeneği yoktur.

## Klavye ile gezinme

Site ayrıca, başlıkta bir kez tanımlandığı için her sayfada — bu belgeler
dahil — çalışan bir avuç vim tarzı kısayola da yanıt verir:

- `j` ve `k` sayfayı aşağı ve yukarı kaydırır.
- `g` `g` (iki kez `g` tuşuna basmak) en üste atlar.
- `G` (shift-g) en alta atlar.
- `/` sayfanın kendi arama alanına odaklanır — örneğin ana sayfadaki yığın
  araması — ve alana bir eğik çizgi yazmaz.
- `?` (shift-?) bunların tümünü listeleyen bir yardım katmanı açar; `Esc`
  veya dışına tıklamak onu tekrar kapatır.

Aynı katman, klavye yerine fare ya da ekran okuyucu kullanan herkes için
başlıktaki `?` düğmesinden de açılır. Bir metin alanına, bir textarea'ya,
bir seçime (select) ya da düzenlenebilir başka bir şeye yazarken bu
kısayolların hiçbiri tetiklenmez — normal yazma her zaman kazanır.

## Filtreler

Ana sayfa, istediğiniz kesime göre (tam çizelge, yalnızca yıkama, yalnızca
ütü) ve serbest metinli bir yığın aramasına göre filtreler; ayrıca
varsayılan olarak kapalı olan bir "Advanced" (gelişmiş) açılır bölümü, tam
bir program, sıcaklık ya da sıkma hızına göre filtrelemeyi ve bir deterjan
aramasını sağlar. Bunların hepsi aynı listeyi daraltır; bir yığının
görünmesi için etkin olan her filtreyle eşleşmesi gerekir.

Program, sıcaklık ve sıkma hızı seçim kutuları, yığın araması ve Advanced
bölümünde zaten seçtiğiniz diğer her şey göz önüne alındığında, yine de en
az bir yığını görünür bırakacak değerleri sunar — böylece sizi boş bir
çizelgeye götürecek bir kombinasyon seçemezsiniz. Diğer filtreleri
değiştirdikçe listeler canlı olarak güncellenir ve bir alanda eşleşebilecek
hiçbir şey kalmadığında, boş seçenekler göstermek yerine kendini devre dışı
bırakır.

Filtreler, bir yapılandırmanın yaptığı gibi ziyaretler arasında
`localStorage`'da kalıcı olur. Filtrelenmiş bir görünüm ayrıca
paylaşılabilir: adres çubuğu `cut`, `pile`, `program`, `temperature`,
`spin` ve `detergent` değerlerini sorgu parametreleri olarak taşır ve
bunlardan herhangi birini taşıyan bir URL, önceki bir ziyaretten kaydedilmiş
olana kesin olarak üstün gelir — bu URL'yi paylaşan düğme için aşağıdaki
Paylaşım bölümüne bakın.

<img class="theme-shot" data-variant="light" src="/docs/media/tr/sheet-filters-light.png" alt="Advanced filtreleri açık, yalnızca yıkama seçili" />
<img class="theme-shot" data-variant="dark" src="/docs/media/tr/sheet-filters-dark.png" alt="Advanced filtreleri açık, yalnızca yıkama seçili" />

## Paylaşım

PDF indirme düğmelerinin yanında **Share this view** bulunur; bu, geçerli
sayfa URL'sini olduğu gibi gönderir — filtreler dahil, çünkü adres çubuğu
bunları zaten sorgu parametreleri olarak taşır (yukarıdaki Filtreler
bölümüne bakın), dolayısıyla paketlenecek fazladan bir şey yoktur.

Etkin bir özel makineniz ya da çizelgeniz varsa (bkz.
[Yerleşik ve etkin yapılandırma](#yerleşik-ve-etkin-yapılandırma)), bağlantı
bu kurulumun tamamını da sıkıştırılmış bir `#config=` parçası olarak taşır.
Bağlantıyı açan kişi, `localStorage`'ınıza hiç dokunmamış bir tarayıcıda
bile, yalnızca filtrelerinizi değil, tam olarak makinenizi ve çizelgenizi
alır. Burada da hiçbir şey bir sunucuya dokunmaz: bir URL parçası (fragment)
hiçbir zaman ağ üzerinden gönderilmez, dolayısıyla bağlantının kendisi,
yüklenen bir yapılandırma dosyasında olduğu gibi aktarımın tamamı olmayı
sürdürür. Sayfa onu okuyup kaydettikten sonra, parçayı adres çubuğundan
temizler — oradan yeniden yükleme yaptığınızda ya da tekrar
paylaştığınızda, tek seferlik bağlantıyı değil sitenin normal kısa URL'sini
alırsınız. Bozulmuş ya da elle düzenlenmiş bir bağlantı, geçersiz bir
yapılandırma yüklemesiyle aynı satır/sütun kapsamlı hatayı gösterir ve
sayfa bozulmak yerine zaten etkin olan neyse ona geri döner. Hiçbir özel
şey etkin değilken bağlantı öncekiyle aynıdır — yalnızca filtreler.

Önce tarayıcının yerel paylaşım sayfasını dener (`navigator.share` —
Mesajlar, WhatsApp, AirDrop, işletim sisteminin sunduğu her ne ise), yalnızca
bu API kullanılamadığında ya da kullanılabilir olup gerçekten
başarısız olduğunda, bir kartın kendi Copy link düğmesinin yaptığı gibi
"Copied!" göstererek URL'yi panoya kopyalamaya geri döner. Paylaşım
sayfasını iptal etmek ikisi de değildir: yalnızca o yöntemi reddetmektir,
dolayısıyla başka hiçbir şey olmaz ve arkanızdan hiçbir şey kopyalanmaz.

## PDF dışa aktarma

Ana sayfada, ikisi de sayfada o an filtrelenmiş olan neyse onunla sınırlı
ve CLI'nin `bun run generate` komutunun kullandığı aynı
[`@washy-washy/pdf`](https://github.com/alrayyes/washy-washy-pdf) ile
istemci tarafında oluşturulan iki indirme düğmesi bulunur. Siz tıklayana
kadar hiçbiri hiçbir şey oluşturmaz — sayfayı filtrelemek arka planda
hiçbir zaman bir oluşturma işlemi tetiklemez.

- **Download for phone**, CLI'nin ürettiği aynı dar, tek kaydırmalı sayfayı
  yazar — makinenin yanında telefonunuzdan okumak için tasarlanmıştır.
- **Download to print** ise bunun yerine bir A4 sayfası yazar: bir referans
  tablosu artı her yığın için bir ayrıntı kartı, yazdırılıp asılmak üzere
  tasarlanmıştır.

Tek bir kartın da, bir seferde bir yığın için kendi **Download** düğmesi
vardır. Bu yalnızca telefon biçimindedir — yazdırma düzeni her zaman tüm
referans tablosunu ve her yığının kartını çizer, dolayısıyla telefon
biçiminin yapabildiği gibi bunu tek bir yığına indirgemenin bir yolu
yoktur.

<img class="theme-shot" data-variant="light" src="/docs/media/tr/sheet-pdf-download-light.png" alt="Tek bir kartın kendi Download ve Copy link düğmeleri" />
<img class="theme-shot" data-variant="dark" src="/docs/media/tr/sheet-pdf-download-dark.png" alt="Tek bir kartın kendi Download ve Copy link düğmeleri" />

Bir kartın indirme düğmesinin yanındaki **Copy link**, o filtrelenmiş
görünümün URL'sini panonuza koyar — yukarıdaki sayfa düzeyindeki Share
düğmesinin kullandığı aynı pano yedeği, tek bir karda sınırlı olarak.
