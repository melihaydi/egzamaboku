// Yerel Egzama & Dermatoloji Bilgi Motoru
// Bu modül canlı/internete bağlı bir yapay zeka modeli DEĞİLDİR: tarayıcıda, tamamen
// yerel olarak çalışan, kürasyonu yapılmış kanıta dayalı bir soru-cevap eşleştirme
// motorudur. Amaç, kullanıcıya hızlı ve güvenilir eğitici bilgi sunmaktır; hiçbir
// zaman tanı koymaz ve hekim muayenesinin yerine geçmez.

export interface KnowledgeEntry {
  id: string;
  topic: string;
  keywords: string[];
  answer: string;
  urgent?: boolean;
}

function normalize(text: string): string {
  return text
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s]/g, ' ');
}

export const knowledgeBase: KnowledgeEntry[] = [
  {
    id: 'kb-what-is-eczema',
    topic: 'Egzama (Atopik Dermatit) Nedir?',
    keywords: ['egzama nedir', 'atopik dermatit nedir', 'egzama ne demek', 'egzama hastaligi', 'egzama'],
    answer: 'Egzama (atopik dermatit), cilt bariyerinin zayıflaması ve bağışıklık sisteminin aşırı tepki vermesi sonucu ortaya çıkan kronik, tekrarlayan bir cilt iltihabıdır. Kızarıklık, kuruluk, kaşıntı, soyulma ve zaman zaman sıvı sızdıran lezyonlarla seyreder. Genetik yatkınlık (özellikle filaggrin geninde varyasyonlar), bozulmuş cilt bariyer fonksiyonu ve tip-2 bağışıklık yanıtının aşırı aktivasyonu ana mekanizmalardır. Bulaşıcı değildir.'
  },
  {
    id: 'kb-eczema-cure',
    topic: 'Egzama İyileşir mi / Geçer mi?',
    keywords: ['egzama gecer mi', 'egzama iyilesir mi', 'egzama kalici mi', 'egzama tedavi edilir mi', 'egzama tamamen gecer mi', 'kesin cozum'],
    answer: 'Egzamanın kesin/kalıcı bir tedavisi yoktur; ancak doğru bakım ve tedaviyle büyük ölçüde kontrol altına alınabilir. Birçok çocukta yaşla birlikte belirtiler belirgin şekilde hafifler veya geriler. Yetişkinlerde amaç genellikle "tamamen ortadan kaldırmak" değil, düzenli nemlendirme, tetikleyicilerden kaçınma ve gerektiğinde ilaç tedavisiyle alevlenmesiz, kontrollü bir dönem sürdürmektir.'
  },
  {
    id: 'kb-causes',
    topic: 'Egzamanın Nedenleri',
    keywords: ['egzama nedeni', 'egzama sebebi', 'neden olur', 'genetik', 'filaggrin', 'bariyer bozuklugu'],
    answer: 'Egzama tek bir nedene bağlı değildir; genetik yatkınlık (filaggrin gen mutasyonları cilt bariyerini zayıflatır), bozulmuş cilt bariyeri (nem kaybının artması), aşırı aktif tip-2 bağışıklık yanıtı (IL-4, IL-13, IL-31 sitokinleri) ve çevresel tetikleyicilerin bir araya gelmesiyle ortaya çıkar. Genellikle astım ve alerjik rinit ile birlikte görülen "atopik triad"ın bir parçasıdır.'
  },
  {
    id: 'kb-flare-management',
    topic: 'Alevlenme Anında Ne Yapılmalı',
    keywords: ['alevlenme sirasinda', 'alevlenme aninda', 'alevlendiginde ne yapmali', 'yeni alevlenme', 'aniden kotulesti'],
    answer: 'Alevlenme sırasında: kaşınan bölgeyi kazımak yerine soğuk kompresle yatıştırın, seramid içerikli bariyer kremi normalden daha sık (günde 3-4 kez) uygulayın, hekiminiz reçete ettiyse topikal kortizon/kalsinörin inhibitörünü kullanın, tahriş edici temaslardan (sıcak su, sert sabun, yün) kaçının ve şiddetli/dirençli alevlenmelerde ıslak sargı tedavisini değerlendirin. Sarı akıntı, yayılan ağrılı kabarcık veya ateş eşlik ederse vakit kaybetmeden hekime başvurun.'
  },
  {
    id: 'kb-triggers',
    topic: 'Egzama Tetikleyicileri',
    keywords: ['tetikleyici', 'alevlenme nedeni', 'neyi tetikler', 'ne tetikler', 'triggers'],
    answer: 'Sık görülen tetikleyiciler: sert sabunlar ve deterjanlar (SLS içerenler), sentetik parfüm ve esanslar, yün ve sentetik kumaşlar, aşırı terleme, düşük nem/kuru hava, ani sıcaklık değişimleri, ev tozu akarları, stres, uykusuzluk ve bazı gıdalar (kişiye özgü). Kişisel tetikleyicilerinizi belirlemek için bu uygulamadaki Beslenme ve Çevresel Alevlenme modüllerini düzenli kullanmanız faydalı olur.'
  },
  {
    id: 'kb-moisturizing',
    topic: 'Nemlendirme Rutini',
    keywords: ['nemlendirici', 'nemlendirme', 'soak and seal', 'krem ne siklikta', 'nasil nemlendirmeliyim', 'cildim kuru', 'kuru cilt', 'ne surmeliyim', 'hangi krem'],
    answer: 'Altın standart yöntem "Islat ve Mühürle" (Soak and Seal): ılık suyla 10-15 dakika banyo/duş yapılır, cilt havluyla hafifçe (ovmadan) kurulanır ve banyodan sonraki ilk 3 dakika içinde bol miktarda seramid içerikli nemlendirici uygulanır. Günde en az 2 kez, kuruluk hissedildiğinde daha sık nemlendirme önerilir. Parfümsüz, boyasız, seramid/gliserin bazlı ürünler tercih edilmelidir.'
  },
  {
    id: 'kb-redness',
    topic: 'Kızarıklık (Eritem)',
    keywords: ['kizariklik', 'cildim kizardi', 'kizarik', 'eritem', 'kizarma'],
    answer: 'Kızarıklık (eritem), egzamada iltihaplanmış kan damarlarının genişlemesiyle oluşur ve genellikle kaşıntı/ısı artışıyla birlikte görülür. Ani ve yaygın kızarıklık bir alevlenmeye işaret edebilir: nemlendiriciyi artırmak, tahriş edici temaslardan kaçınmak ve gerekirse reçeteli topikal tedaviyi kullanmak faydalı olur. Kızarıklığın seyrini objektif olarak takip etmek için Cilt Fotoğraf Analizi sekmesini kullanabilirsiniz; sarı/yeşilimsi akıntı veya ateş eşlik ediyorsa enfeksiyon açısından hekime başvurun.'
  },
  {
    id: 'kb-bathing',
    topic: 'Banyo Süresi ve Su Sıcaklığı',
    keywords: ['banyo', 'dus', 'su sicakligi', 'ilik su', 'kac dakika banyo'],
    answer: 'Banyo/duş suyu ılık olmalı (yaklaşık 32-34°C); sıcak su cildin doğal yağ tabakasını daha fazla çözerek kuruluğu artırır. Süre 10-12 dakikayı geçmemelidir. Sert ovma yerine hafif dokunuşla yıkanma ve banyo sonrası havluyla "vurarak" (ovmadan) kurulama, cilt bariyerini korumaya yardımcı olur.'
  },
  {
    id: 'kb-wet-wrap',
    topic: 'Islak Sargı Tedavisi',
    keywords: ['islak sargi', 'wet wrap', 'wwt'],
    answer: 'Islak Sargı Tedavisi (WWT), şiddetli veya tedaviye dirençli alevlenmelerde kullanılan yoğun bir nemlendirme yöntemidir: ılık banyo sonrası reçeteli krem ve nemlendirici uygulanır, üzerine ıslak-sıkılmış pamuklu bir iç katman ve kuru bir dış katman giydirilir, 2-8 saat veya gece boyu bekletilir. Kaşıntı-kazıma döngüsünü hızla kırar ve ilaç emilimini artırır. Şiddetli alevlenmelerde hekim kontrolünde uygulanması önerilir.'
  },
  {
    id: 'kb-topical-steroids',
    topic: 'Topikal Kortizon Kullanımı ve FTU',
    keywords: ['kortizon', 'topikal steroid', 'ftu', 'parmak bogumu birimi', 'kortizon miktari'],
    answer: 'Topikal kortizonlu kremler egzamanın akut alevlenmelerinde iltihabı hızla baskılar. Doğru dozaj için "Parmak Boğumu Birimi" (FTU) kullanılır: yetişkin işaret parmağının ucundan ilk boğuma kadar sıkılan krem miktarı (~0,5 gram) iki yetişkin avuç içi büyüklüğündeki alanı kaplamaya yeterlidir. Uzun süreli ve kontrolsüz kullanım cilt incelmesine (atrofi) yol açabileceğinden, hekiminizin belirlediği güç ve süreye uyulmalıdır.'
  },
  {
    id: 'kb-calcineurin',
    topic: 'Kalsinörin İnhibitörleri (Takrolimus/Pimekrolimus)',
    keywords: ['takrolimus', 'pimekrolimus', 'kalsinorin', 'steroid olmayan krem'],
    answer: 'Takrolimus ve Pimekrolimus, steroid olmayan topikal kalsinörin inhibitörleridir; özellikle yüz ve boyun gibi ciltin ince olduğu bölgelerde, uzun süreli kullanımda cilt atrofisi riski taşımadıkları için tercih edilirler. Proaktif idame tedavisinde (haftada 2 gün önceden tutulan bölgelere uygulama) alevlenme sıklığını azalttıkları gösterilmiştir. Uygulama sonrası geçici yanma hissi görülebilir.'
  },
  {
    id: 'kb-proactive',
    topic: 'Proaktif vs Reaktif Tedavi',
    keywords: ['proaktif tedavi', 'reaktif tedavi', 'idame tedavi'],
    answer: 'Reaktif tedavi yalnızca alevlenme sırasında ilaç uygulamayı, proaktif tedavi ise lezyon klinik olarak iyileşmiş görünse bile sık tutulum gösteren bölgelere haftada 2 gün düşük/orta doz kortizon veya kalsinörin inhibitörü uygulamayı ifade eder. Çalışmalar proaktif idamenin yıllık alevlenme sıklığını belirgin şekilde azalttığını göstermektedir.'
  },
  {
    id: 'kb-dupixent',
    topic: 'Dupixent (Dupilumab)',
    keywords: ['dupixent', 'dupilumab', 'biyolojik tedavi', 'il-4', 'il-13', 'enjeksiyon 14 gun'],
    answer: 'Dupixent (Dupilumab), orta-şiddetli atopik dermatitte kullanılan bir biyolojik ilaçtır; tip-2 enflamasyonu tetikleyen IL-4 ve IL-13 sitokin sinyallerini bloke eder. 14 günde bir subkütan enjeksiyon şeklinde uygulanır. Klinik çalışmalarda hastaların önemli bir kısmı EASI-75 (lezyon şiddetinde %75 iyileşme) düzeyine ulaşmıştır. En sık yan etkiler enjeksiyon bölgesi reaksiyonu ve konjonktivittir (göz kuruluğu/kızarıklığı); organ toksisitesi riski düşüktür.'
  },
  {
    id: 'kb-cibinqo',
    topic: 'Cibinqo (Abrocitinib) ve JAK İnhibitörleri',
    keywords: ['cibinqo', 'abrocitinib', 'jak inhibitor', 'jak1'],
    answer: 'Cibinqo (Abrocitinib), günde bir kez alınan oral bir JAK1 inhibitörüdür; hücre içi JAK-STAT sinyal yolunu bloke ederek enflamasyonu ve kaşıntıyı hızlıca azaltabilir. JAK inhibitörü sınıfının tamamı için FDA, ciddi enfeksiyon, kardiyovasküler olay, tromboz (pıhtı) ve malignite riskleri konusunda uyarı (kutulu uyarı) yayınlamıştır; bu nedenle düzenli kan tahlili (tam kan sayımı, lipid profili) takibi ve hekim kontrolü gereklidir.'
  },
  {
    id: 'kb-cyclosporine',
    topic: 'Siklosporin (Cyclosporine)',
    keywords: ['siklosporin', 'cyclosporine', 'immunsupresan'],
    answer: 'Siklosporin, şiddetli ve dirençli egzama vakalarında kullanılan sistemik bir immünsüpresandır; T hücre aktivasyonunu baskılayarak hızlı ve etkili alevlenme kontrolü sağlar. Böbrek fonksiyonlarını ve kan basıncını etkileyebildiğinden düzenli laboratuvar takibi gerektirir ve genellikle uzun vadeli değil, kısa-orta vadeli bir köprü tedavisi olarak kullanılır.'
  },
  {
    id: 'kb-prednisone',
    topic: 'Prednizon ve Sistemik Kortikosteroidler',
    keywords: ['prednizon', 'prednison', 'sistemik kortikosteroid', 'oral steroid'],
    answer: 'Prednizon gibi oral kortikosteroidler şiddetli akut alevlenmelerde hızlı rahatlama sağlayabilir, ancak uzun süreli kullanımları kemik erimesi, kan şekeri yüksekliği, tansiyon artışı gibi yan etkiler ve ilaç kesildikten sonra "rebound" alevlenme riski taşır. Bu nedenle genellikle kısa süreli kürler halinde kullanılır ve dozun aniden değil, hekim rehberliğinde kademeli olarak azaltılması (tapering) önemlidir.'
  },
  {
    id: 'kb-phototherapy',
    topic: 'Fototerapi',
    keywords: ['fototerapi', 'uvb', 'isik tedavisi'],
    answer: 'Fototerapi (özellikle dar bant UVB), orta-şiddetli egzamada topikal tedavilere yeterli yanıt alınamadığında kullanılan bir tedavi seçeneğidir. Cildin bağışıklık tepkisini düzenleyerek enflamasyonu azaltır. Genellikle haftada 2-3 seans halinde, bir dermatoloji kliniğinde uygulanır ve düzenli deri kontrolü gerektirir.'
  },
  {
    id: 'kb-patch-test',
    topic: 'Yama Testi (Patch Testing)',
    keywords: ['yama testi', 'patch test', 'alerji testi', 'kontakt alerji testi'],
    answer: 'Yama testi, cilde belirli kimyasalların (parfüm, metal, koruyucu vb.) yapıştırılarak 48-96 saat gözlemlenmesiyle kontakt alerjenlerin tespit edildiği bir testtir. Özellikle egzama belirli bölgelerde tekrarlıyorsa veya belirli bir ürünle ilişkiliyse, kontakt dermatit şüphesinde dermatolog tarafından önerilir.'
  },
  {
    id: 'kb-contact-dermatitis',
    topic: 'Kontakt Dermatit ile Atopik Dermatit Farkı',
    keywords: ['kontakt dermatit', 'temas dermatit', 'atopik dermatit farki'],
    answer: 'Atopik dermatit genellikle çocuklukta başlayan, genetik yatkınlıklı, vücudun kıvrım bölgelerini (diz/dirsek içi) tutan kronik bir hastalıktır. Kontakt dermatit ise belirli bir maddeyle (parfüm, nikel, lateks, bitki vb.) doğrudan temas sonucu, temas edilen bölgede sınırlı olarak ortaya çıkar ve tetikleyici madde uzaklaştırılınca genellikle geriler. İkisi birlikte de görülebilir; ayrım için yama testi faydalı olabilir.'
  },
  {
    id: 'kb-dyshidrotic',
    topic: 'Dishidrotik Egzama (Pompholyx)',
    keywords: ['dishidrotik', 'pompholyx', 'el ayak kabarcik'],
    answer: 'Dishidrotik egzama, el ayaları, parmak yanları ve ayak tabanlarında küçük, yoğun kaşıntılı su kabarcıklarıyla seyreden bir egzama alt tipidir. Stres, terleme, nikel/kobalt maruziyeti ve mevsim değişiklikleriyle tetiklenebilir. Tedavide güçlü topikal kortizonlar, ıslak sargı ve tetikleyiciden kaçınma kullanılır.'
  },
  {
    id: 'kb-seborrheic',
    topic: 'Seboreik Dermatit',
    keywords: ['seboreik dermatit', 'kepek', 'saclı deri kizarikligi'],
    answer: 'Seboreik dermatit, yağ bezlerinin yoğun olduğu bölgelerde (saçlı deri, kaşlar, burun kenarları) Malassezia mayasıyla ilişkili, kepeklenme ve hafif kızarıklıkla seyreden ayrı bir cilt hastalığıdır. Atopik dermatitten farklı olarak genellikle daha az kaşıntılıdır ve antifungal şampuan/kremlerle tedavi edilir.'
  },
  {
    id: 'kb-nummular',
    topic: 'Nummuler Egzama',
    keywords: ['nummuler egzama', 'madeni para egzama', 'yuvarlak lezyon'],
    answer: 'Nummuler egzama, genellikle bacaklarda ve kollarda görülen, madeni para şeklinde yuvarlak, keskin sınırlı, kaşıntılı ve bazen sızıntılı lezyonlarla karakterizedir. Kuru cilt ve düşük nem sıklıkla tetikleyicidir; yoğun nemlendirme ve topikal kortizon tedavisinin temelini oluşturur.'
  },
  {
    id: 'kb-vs-psoriasis',
    topic: 'Egzama ile Sedef Hastalığı (Psoriasis) Farkı',
    keywords: ['sedef', 'psoriasis', 'egzama farki psoriasis'],
    answer: 'Egzama genellikle daha ince, kırmızı ve yoğun kaşıntılı plaklarla, kıvrım bölgelerinde (diz/dirsek içi) görülür. Sedef hastalığında ise lezyonlar daha kalın, gümüşi-beyaz pullu ve genellikle dizlerin/dirseklerin dış yüzeyi, saçlı deri ve tırnaklarda görülür; kaşıntı daha az belirgin olabilir. Kesin ayrım için dermatolog muayenesi gereklidir.'
  },
  {
    id: 'kb-vs-fungal',
    topic: 'Egzama ile Mantar Enfeksiyonu Farkı',
    keywords: ['mantar enfeksiyonu', 'tinea', 'egzama mantar farki'],
    answer: 'Mantar enfeksiyonları (tinea) genellikle halka şeklinde, kenarları belirgin şekilde kızarık/kabarık, merkeze doğru iyileşen lezyonlarla seyreder ve tek taraflı olabilir. Egzama ise simetrik dağılım gösterme eğilimindedir ve halka şeklinde keskin sınır oluşturmaz. Yanlış tedavi (örn. mantara kortizon uygulamak) durumu kötüleştirebileceğinden, emin değilseniz dermatoloğa danışılmalıdır.'
  },
  {
    id: 'kb-children',
    topic: 'Çocuklarda Egzama',
    keywords: ['cocuklarda egzama', 'bebek egzama', 'pediatrik atopik dermatit', 'cocugumda', 'cocugumun', 'cocugum', 'bebegimde', 'bebegimin'],
    answer: 'Bebeklerde egzama genellikle yüz, kafa derisi ve gövdenin dış yüzeylerinde başlar; çocukluk döneminde ise diz/dirsek içi gibi kıvrım bölgelerine kayar. Çoğu çocukta yaşla birlikte belirtiler hafifler. Düzenli nemlendirme, ılık kısa banyolar, pamuklu giysiler ve tetikleyicilerden kaçınma tedavinin temelini oluşturur; şiddetli vakalarda çocuk dermatoloğu/pediatrik alerji uzmanı takibi önerilir.'
  },
  {
    id: 'kb-pregnancy',
    topic: 'Hamilelikte Egzama',
    keywords: ['hamilelik egzama', 'gebelik egzama', 'hamile egzama tedavisi'],
    answer: 'Hamilelikte hormonal değişiklikler egzamayı alevlendirebilir. Nemlendiriciler ve düşük-orta güçte topikal kortizonlar genellikle güvenli kabul edilir; ancak sistemik tedaviler (biyolojikler, JAK inhibitörleri, sistemik kortikosteroidler) hamilelik döneminde hekim ile birlikte dikkatle değerlendirilmelidir. Herhangi bir ilaç değişikliği öncesi mutlaka takip eden kadın doğum ve dermatoloji uzmanına danışılmalıdır.'
  },
  {
    id: 'kb-stress',
    topic: 'Stres ve Egzama İlişkisi',
    keywords: ['stres egzama', 'psikolojik egzama', 'stres tetikleyici'],
    answer: 'Stres, vücutta kortizol ve enflamatuar sitokin salınımını etkileyerek egzama alevlenmelerini tetikleyebilir; ayrıca kaşıntı-stres-kazıma döngüsü belirtileri şiddetlendirebilir. Nefes egzersizleri, düzenli uyku, hafif egzersiz ve gerektiğinde profesyonel destek, stres yönetiminde ve dolayısıyla cilt sağlığında faydalı olabilir.'
  },
  {
    id: 'kb-diet',
    topic: 'Beslenme, Histamin ve Egzama',
    keywords: ['beslenme egzama', 'histamin egzama', 'gida egzama iliskisi', 'diyet egzama'],
    answer: 'Bazı kişilerde yüksek histaminli gıdalar (eski peynirler, şarküteri ürünleri, fermente gıdalar) veya belirli alerjenler kaşıntı/alevlenme ile zamansal olarak ilişkilendirilebilir; ancak bu bir korelasyondur, kesin neden-sonuç ilişkisi değildir ve kişiden kişiye büyük farklılık gösterir. Gerçek bir gıda alerjisi şüphesi varsa, kısıtlayıcı diyete başlamadan önce mutlaka bir alerji uzmanına danışılmalıdır.'
  },
  {
    id: 'kb-sleep',
    topic: 'Uyku ve Gece Kaşıntısı',
    keywords: ['gece kasinti', 'uyku egzama', 'uykusuzluk kasinti'],
    answer: 'Vücut ısısının geceleri doğal olarak yükselmesi ve kortizol seviyesinin düşmesi kaşıntıyı artırabilir. Serin ve nemli bir oda ortamı, yatmadan önce yoğun nemlendirici uygulaması, pamuklu/nefes alan kıyafetler ve gerekirse hekim önerisiyle gece antihistaminik kullanımı gece kaşıntısını azaltmaya yardımcı olabilir.'
  },
  {
    id: 'kb-infection-signs',
    topic: 'Enfeksiyon Belirtileri (Acil)',
    urgent: true,
    keywords: ['enfeksiyon belirtisi', 'sari akinti', 'irin', 'eczema herpeticum', 'stafilokok'],
    answer: 'Sarı/bal rengi kabuklanma, irin akıntısı, ani yayılan ağrılı su toplayan kabarcıklar (Eczema Herpeticum riski) veya ateşle birlikte hızlı kötüleşme, sekonder bakteriyel veya viral enfeksiyona işaret edebilir. Bu belirtiler görüldüğünde vakit kaybetmeden bir hekime veya acil servise başvurmalısınız. Bu asistan tanı koyamaz; lütfen bu belirtilerle profesyonel değerlendirme alın.'
  },
  {
    id: 'kb-emergency',
    topic: 'Ne Zaman Doktora Başvurmalı',
    urgent: true,
    keywords: ['doktora ne zaman', 'acil durum', 'ne zaman hastaneye', 'tehlikeli belirti'],
    answer: 'Yüksek ateş ile birlikte cilt kızarıklığı, yüz/dudak/boğazda aniden gelişen şiddetli şişlik, hızla yayılan su toplayan kabarcıklar, göz çevresinde şiddetli ağrı veya görme bulanıklığı, ya da sarı/bal rengi iltihaplı akıntı görülmesi durumunda vakit kaybetmeden tıbbi yardım alınmalıdır; bu durumlarda beklemeden bir hekime veya acil servise başvurun.'
  },
  {
    id: 'kb-hand-eczema',
    topic: 'El Egzaması ve El Yıkama',
    keywords: ['el egzamasi', 'el yikama', 'meslek egzama'],
    answer: 'Sık el yıkama, dezenfektan kullanımı ve suyla uzun temas, el egzamasını tetikleyen en önemli faktörlerdendir. Her el yıkamadan sonra nemlendirici uygulamak, ev işlerinde pamuklu iç astarlı eldiven giymek ve mümkünse sabun yerine yumuşak, parfümsüz temizleyiciler kullanmak el bariyerini korumaya yardımcı olur.'
  },
  {
    id: 'kb-sun',
    topic: 'Güneş Işığı ve UV Etkisi',
    keywords: ['gunes egzama', 'uv etkisi', 'gunes isigi cilt'],
    answer: 'Ilımlı güneş ışığı bazı kişilerde egzamayı hafifletebilir (fototerapinin dayandığı prensip budur), ancak aşırı güneşlenme cildi kurutup tahriş edebilir ve bariyer hasarını artırabilir. Güneşe çıkarken egzamalı ciltlerde tahriş yapmayan, mineral bazlı (çinko oksit/titanyum dioksit) güneş kremleri tercih edilmesi önerilir.'
  },
  {
    id: 'kb-antihistamines',
    topic: 'Antihistaminikler',
    keywords: ['antihistaminik', 'alerji hapi', 'kasinti hapi', 'hidroksizin', 'setirizin', 'loratadin'],
    answer: 'Antihistaminikler, histamin reseptörlerini bloke ederek alerjik kaşıntıyı azaltabilir. Egzamada kaşıntının çoğu histamin dışı yollarla (sitokinler, sinir uçları) tetiklendiğinden etkileri sınırlı olabilir; ancak sedatif (uyku getirici) tipleri (örn. hidroksizin) özellikle gece kaşıntısını ve uyku kalitesini dolaylı olarak iyileştirebilir. Hangi tipin ve dozun uygun olduğuna hekiminiz karar vermelidir.'
  },
  {
    id: 'kb-itch-management',
    topic: 'Kaşıntı Yönetimi',
    keywords: ['kasinti yonetimi', 'kasintiyi durdurmak', 'kasinma kazima dongusu', 'kasinti nasil gecer', 'kasinti', 'kasiniyor', 'kasiniyorum', 'kasintim var', 'cok kasiniyor'],
    answer: 'Kaşıntı-kazıma döngüsünü kırmak egzama yönetiminin temelidir: cildi soğutmak (soğuk kompres), tırnakları kısa tutmak, gece pamuklu eldiven giymek, yoğun nemlendirme, dikkat dağıtma teknikleri ve gerektiğinde hekim önerisiyle antihistaminik/topikal tedavi kullanmak kaşıntıyı azaltabilir. Kazımak cilt bariyerine ek hasar vererek döngüyü şiddetlendirir.'
  },
  {
    id: 'kb-barrier-repair',
    topic: 'Cilt Bariyeri Onarımı',
    keywords: ['bariyer onarimi', 'cilt bariyeri', 'bariyer fonksiyonu', 'skin barrier'],
    answer: 'Cilt bariyeri, epidermisin en dış tabakasındaki lipidler (seramid, kolesterol, yağ asitleri) ve korneositlerden oluşan koruyucu yapıdır. Egzamada bu bariyer hem genetik hem çevresel nedenlerle zayıflar ve nem kaybı (TEWL) artar. Seramid/kolesterol/yağ asidi içeren nemlendiriciler, aşırı yıkamadan kaçınma ve tahriş edici maddelerden uzak durma bariyerin onarılmasına yardımcı olur.'
  },
  {
    id: 'kb-irritants',
    topic: 'Tahriş Edici Maddeler (İrritanlar)',
    keywords: ['irritan', 'tahris edici', 'hangi maddeler tahris eder'],
    answer: 'Yaygın irritanlar: sabun ve deterjanlar (özellikle SLS/SLES içerenler), yün/sentetik kumaşlar, parfüm ve esanslar, alkol bazlı ürünler, klorlu havuz suyu, aşırı sıcak su ve bazı temizlik kimyasallarıdır. İrritanlar alerjik olmasa da cilt bariyerini doğrudan tahriş ederek egzamayı kötüleştirebilir; hipoalerjenik, parfümsüz ürünler tercih edilmelidir.'
  },
  {
    id: 'kb-allergies',
    topic: 'Alerjiler ve Egzama İlişkisi',
    keywords: ['alerji egzama iliskisi', 'alerjik egzama', 'atopi'],
    answer: 'Egzama, astım ve alerjik rinit ile birlikte "atopik yürüyüş" olarak adlandırılan bir örüntünün parçası olabilir. Bazı hastalarda belirli gıda veya çevresel alerjenler semptomları tetikleyebilir, ancak egzamanın kendisi çoğunlukla bir alerjik reaksiyondan çok bariyer disfonksiyonu kaynaklıdır. Gerçek alerji şüphesinde alerji uzmanınca deri testi veya kan testi (IgE) önerilebilir.'
  },
  {
    id: 'kb-daily-skincare',
    topic: 'Günlük Cilt Bakımı Rutini',
    keywords: ['gunluk cilt bakimi', 'gunluk rutin', 'cilt bakim adimlari'],
    answer: 'Genel bir günlük rutin: sabah hafif temizlik + nemlendirici + (reçeteliyse) topikal tedavi + güneş koruyucu; akşam ılık duş/banyo + 3 dakika içinde bariyer kremi + gerekiyorsa ıslak sargı veya yoğun gece bakımı. Tutarlılık, tek bir "mucize ürün"den daha önemlidir; rutini uygulamaya bu uygulamadaki Günlük Bakım Listesi üzerinden devam edebilirsiniz.'
  },
  {
    id: 'kb-clinical-guidelines',
    topic: 'Klinik Rehberler ve Kanıta Dayalı Yaklaşım',
    keywords: ['klinik rehber', 'kanita dayali tedavi', 'dermatoloji rehberi', 'guideline'],
    answer: 'Amerikan Dermatoloji Akademisi (AAD) ve Avrupa (EADV) kılavuzları, egzama tedavisinde basamaklı bir yaklaşımı önerir: temel nemlendirme ve tetikleyiciden kaçınma → topikal kortikosteroid/kalsinörin inhibitörü → orta-şiddetli vakalarda fototerapi veya sistemik tedaviler (biyolojikler, JAK inhibitörleri). Tedavi seçimi hastalık şiddetine, yaşa ve eşlik eden durumlara göre hekim tarafından bireyselleştirilir.'
  },
  {
    id: 'kb-scorad',
    topic: 'SCORAD ve EASI Skorları',
    keywords: ['scorad', 'easi', 'siddet skoru', 'klinik skor'],
    answer: 'SCORAD (SCORing Atopic Dermatitis) ve EASI (Eczema Area and Severity Index), egzamanın klinik şiddetini standart olarak ölçmek için hekimlerin kullandığı puanlama sistemleridir; etkilenen vücut alanı, lezyon şiddeti (kızarıklık, ödem, kabuklanma vb.) ve kaşıntı/uyku etkisini birlikte değerlendirirler. Bu uygulama tam SCORAD/EASI hesaplamaz; Cilt Fotoğraf Analizi sekmesi fotoğraftan ölçülebilen görsel bileşenleri (kızarıklık, soyulma, şişlik, kabuklanma, etkilenen alan), Alevlenme Raporu sekmesi ise senin puanladığın kaşıntı/uyku gibi öznel belirtileri ayrı ayrı gösterir.'
  }
];

export interface AssistantReply {
  text: string;
  matchedTopic?: string;
  urgent?: boolean;
  source?: 'kb' | 'greeting' | 'thanks' | 'gemini' | 'online' | 'none';
}

const GREETING_KEYWORDS = ['merhaba', 'selam', 'iyi gunler', 'gunaydin', 'iyi aksamlar', 'nasilsin'];
const THANKS_KEYWORDS = ['tesekkur', 'sagol', 'sagolun', 'elinize saglik'];

// Çok kısa/yaygın Türkçe işlev kelimeleri (soru eki, bağlaç vb.) hemen her cümlede geçebileceğinden
// kısmi eşleşme puanlamasında hiçbir zaman tek başına anlamlı bir sinyal sayılmaz.
const STOP_WORDS = new Set(['mi', 'mu', 'mu', 'ne', 'nedir', 'ile', 'de', 'da', 've', 'veya', 'icin', 'gibi', 'var', 'yok', 'ki', 'bu', 'su', 'bir', 'cok', 'nasil', 'olur', 'olan']);

// Türkçe eklerin (kaşıntı/kaşıntım/kaşıntıyı gibi) kök üzerinden yakalanmasına izin verir:
// soru kelimesi, anahtar kelime kökü ile başlıyorsa eşleşme sayılır. Tersi (kısa bir soru
// kelimesinin uzun bir anahtar kelimenin öneki olması, örn. "ne" -> "nemlendirici") KASITLI
// olarak kontrol edilmez; aksi halde "ne" gibi kısa/yaygın kelimeler alakasız konularla eşleşir.
function wordMatches(questionWords: string[], keywordWord: string): boolean {
  if (keywordWord.length < 4) return questionWords.includes(keywordWord);
  return questionWords.some(w => w.startsWith(keywordWord));
}

function scoreKeyword(question: string, questionWords: string[], keyword: string): number {
  if (question.includes(keyword)) {
    return keyword.split(' ').length * 3; // tam ifade eşleşmesi en güçlü sinyaldir
  }
  const keywordWords = keyword.split(' ').filter(w => !STOP_WORDS.has(w));
  if (keywordWords.length === 0) return 0;
  const matchedCount = keywordWords.filter(kw => wordMatches(questionWords, kw)).length;
  if (matchedCount === 0) return 0;
  if (matchedCount === keywordWords.length) return keywordWords.length * 2; // anlamlı kelimelerin tümü farklı sırayla mevcut
  return matchedCount; // kısmi eşleşme
}

const MIN_MATCH_SCORE = 2;

export function getAssistantReply(rawQuestion: string): AssistantReply {
  const question = normalize(rawQuestion);

  if (!question.trim()) {
    return { text: 'Egzama, cilt bakımı veya kullandığınız tedaviler hakkında bir soru yazabilirsiniz.' };
  }

  const questionWords = question.split(/\s+/).filter(Boolean);

  let bestEntry: KnowledgeEntry | null = null;
  let bestScore = 0;

  for (const entry of knowledgeBase) {
    let score = 0;
    for (const keyword of entry.keywords) {
      score += scoreKeyword(question, questionWords, keyword);
    }
    if (score > bestScore) {
      bestScore = score;
      bestEntry = entry;
    }
  }

  // Bilgi tabanında gerçek bir konu eşleşmesi bulunduysa, mesajın başında bir
  // selamlama olsa bile (Örn: "Merhaba, kaşıntım çok fazla ne yapmalıyım?")
  // asıl soru yanıtlanır; selamlama asla asıl soruyu görmezden gelmez.
  if (bestEntry && bestScore >= MIN_MATCH_SCORE) {
    return { text: bestEntry.answer, matchedTopic: bestEntry.topic, urgent: bestEntry.urgent, source: 'kb' };
  }

  // Konuyla ilgili bir eşleşme bulunamadıysa ve mesaj kısa/yalnızca selamlama niteliğindeyse
  if (questionWords.length <= 4 && GREETING_KEYWORDS.some(k => question.includes(k))) {
    return {
      text: 'Merhaba! Egzama, cilt bariyeri, tedaviler (Dupixent, Cibinqo, Siklosporin, Prednizon vb.) veya günlük bakım hakkında istediğiniz soruyu sorabilirsiniz.',
      source: 'greeting'
    };
  }

  if (THANKS_KEYWORDS.some(k => question.includes(k))) {
    return { text: 'Rica ederim! Başka bir sorunuz olursa buradayım. Ciddi veya beklenmedik belirtilerde her zaman hekiminize danışmayı unutmayın.', source: 'thanks' };
  }

  return {
    text: 'Bu konuda hazır bir yanıtım yok. Sorunuzu farklı veya daha basit kelimelerle tekrar dener misin? Ciddi veya hızla kötüleşen belirtiler için lütfen bir dermatoloğa başvurun.',
    source: 'none'
  };
}

const WIKIPEDIA_LANG = 'tr';
const ONLINE_FETCH_TIMEOUT_MS = 6000;

interface WikiSearchResult {
  title: string;
}

// Yavaş veya kopan bir bağlantıda kullanıcı "İnternette aranıyor..." durumunda sonsuza
// kadar takılı kalmasın diye her ağ isteğine sınırlı bir süre tanınır.
async function fetchWithTimeout(url: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ONLINE_FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

async function searchWikipediaTitle(query: string): Promise<string | null> {
  const url = `https://${WIKIPEDIA_LANG}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*&srlimit=1`;
  const res = await fetchWithTimeout(url);
  if (!res.ok) return null;
  const data = await res.json();
  const results: WikiSearchResult[] = data?.query?.search;
  if (!results || results.length === 0) return null;
  return results[0].title;
}

async function fetchWikipediaSummary(title: string): Promise<string | null> {
  const url = `https://${WIKIPEDIA_LANG}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
  const res = await fetchWithTimeout(url);
  if (!res.ok) return null;
  const data = await res.json();
  return data?.extract || null;
}

// Yerel bilgi tabanında gerçek bir eşleşme bulunamadığında son çare olarak Wikipedia'da
// arama yapar (ücretsiz, anahtarsız, herkese açık API). Bu bir Google araması DEĞİLDİR
// (Google Arama API'si ücretli bir anahtar ve sunucu taraflı bir proxy gerektirir, bu
// istemci-taraflı uygulamada bulunmuyor); ancak yerel kürasyonlu bilgi tabanının kapsamını
// gerçek, canlı bir internet kaynağıyla genişletilmiş bir soru-cevap kapasitesine ulaştırır.
export async function searchOnlineFallback(rawQuestion: string): Promise<AssistantReply | null> {
  try {
    const title = await searchWikipediaTitle(rawQuestion);
    if (!title) return null;
    const summary = await fetchWikipediaSummary(title);
    if (!summary) return null;
    return {
      text: `${summary}\n\n(Bu yanıt Wikipedia'dan otomatik olarak bulundu; bu uygulamanın kürasyonlu bilgi tabanının parçası değildir. Sağlıkla ilgili kararlar için mutlaka bir hekime danışın.)`,
      matchedTopic: title,
      source: 'online'
    };
  } catch {
    return null;
  }
}

// Gemini API'yi DOĞRUDAN tarayıcıdan değil, bir Netlify Function üzerinden çağırır;
// böylece API anahtarı sunucu tarafında (ortam değişkeni) kalır ve istemci koduna hiç sızmaz.
// Fonksiyon dağıtılmamışsa (örn. yerel `vite dev` ile, Netlify olmadan) bu istek 404 döner
// ve searchOnlineFallback'e (Wikipedia) sorunsuzca geçilir.
async function callGeminiFallback(rawQuestion: string): Promise<AssistantReply | null> {
  try {
    const res = await fetchWithTimeout('/.netlify/functions/gemini-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: rawQuestion })
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.text) return null;
    return {
      text: `${data.text}\n\n(Bu yanıt Gemini AI tarafından oluşturuldu; bu uygulamanın kürasyonlu bilgi tabanının parçası değildir.)`,
      matchedTopic: 'Gemini AI',
      source: 'gemini'
    };
  } catch {
    return null;
  }
}

// Önce yerel bilgi tabanında arar; gerçek bir konu eşleşmesi, selamlama veya teşekkür
// bulunamazsa sırasıyla Gemini AI'ya (varsa) ve ardından Wikipedia'ya (son çare) başvurarak
// yanıt kapsamını genişletir.
export async function getAssistantReplyWithFallback(rawQuestion: string): Promise<AssistantReply> {
  const localReply = getAssistantReply(rawQuestion);
  if (localReply.source !== 'none') {
    return localReply;
  }

  const geminiReply = await callGeminiFallback(rawQuestion);
  if (geminiReply) return geminiReply;

  const onlineReply = await searchOnlineFallback(rawQuestion);
  return onlineReply || localReply;
}
