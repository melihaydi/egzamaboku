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
    keywords: ['egzama nedir', 'atopik dermatit nedir', 'egzama ne demek', 'egzama hastaligi'],
    answer: 'Egzama (atopik dermatit), cilt bariyerinin zayıflaması ve bağışıklık sisteminin aşırı tepki vermesi sonucu ortaya çıkan kronik, tekrarlayan bir cilt iltihabıdır. Kızarıklık, kuruluk, kaşıntı, soyulma ve zaman zaman sıvı sızdıran lezyonlarla seyreder. Genetik yatkınlık (özellikle filaggrin geninde varyasyonlar), bozulmuş cilt bariyer fonksiyonu ve tip-2 bağışıklık yanıtının aşırı aktivasyonu ana mekanizmalardır. Bulaşıcı değildir.'
  },
  {
    id: 'kb-causes',
    topic: 'Egzamanın Nedenleri',
    keywords: ['egzama nedeni', 'egzama sebebi', 'neden olur', 'genetik', 'filaggrin', 'bariyer bozuklugu'],
    answer: 'Egzama tek bir nedene bağlı değildir; genetik yatkınlık (filaggrin gen mutasyonları cilt bariyerini zayıflatır), bozulmuş cilt bariyeri (nem kaybının artması), aşırı aktif tip-2 bağışıklık yanıtı (IL-4, IL-13, IL-31 sitokinleri) ve çevresel tetikleyicilerin bir araya gelmesiyle ortaya çıkar. Genellikle astım ve alerjik rinit ile birlikte görülen "atopik triad"ın bir parçasıdır.'
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
    keywords: ['nemlendirici', 'nemlendirme', 'soak and seal', 'krem ne siklikta', 'nasil nemlendirmeliyim'],
    answer: 'Altın standart yöntem "Islat ve Mühürle" (Soak and Seal): ılık suyla 10-15 dakika banyo/duş yapılır, cilt havluyla hafifçe (ovmadan) kurulanır ve banyodan sonraki ilk 3 dakika içinde bol miktarda seramid içerikli nemlendirici uygulanır. Günde en az 2 kez, kuruluk hissedildiğinde daha sık nemlendirme önerilir. Parfümsüz, boyasız, seramid/gliserin bazlı ürünler tercih edilmelidir.'
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
    keywords: ['cocuklarda egzama', 'bebek egzama', 'pediatrik atopik dermatit'],
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
    answer: 'Yüksek ateş ile birlikte cilt kızarıklığı, yüz/dudak/boğazda aniden gelişen şiddetli şişlik, hızla yayılan su toplayan kabarcıklar, göz çevresinde şiddetli ağrı veya görme bulanıklığı, ya da sarı/bal rengi iltihaplı akıntı görülmesi durumunda vakit kaybetmeden tıbbi yardım alınmalıdır. Uygulamadaki "Acil Durum Rehberi" bu belirtileri detaylı olarak değerlendirmenize yardımcı olur.'
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
    id: 'kb-scorad',
    topic: 'SCORAD ve EASI Skorları',
    keywords: ['scorad', 'easi', 'siddet skoru', 'klinik skor'],
    answer: 'SCORAD (SCORing Atopic Dermatitis) ve EASI (Eczema Area and Severity Index), egzamanın klinik şiddetini standart olarak ölçmek için kullanılan puanlama sistemleridir; etkilenen vücut alanı, lezyon şiddeti (kızarıklık, ödem, kabuklanma vb.) ve kaşıntı/uyku etkisini birlikte değerlendirirler. Bu uygulamadaki Görsel Yapay Zeka Analizi modülü her taramada tahmini bir SCORAD değeri hesaplar; bu değerler doktor görüşmelerinde objektif bir takip aracı olarak kullanılabilir.'
  }
];

export interface AssistantReply {
  text: string;
  matchedTopic?: string;
  urgent?: boolean;
}

const GREETING_KEYWORDS = ['merhaba', 'selam', 'iyi gunler', 'gunaydin', 'iyi aksamlar'];
const THANKS_KEYWORDS = ['tesekkur', 'sagol', 'sagolun', 'elinize saglik'];

export function getAssistantReply(rawQuestion: string): AssistantReply {
  const question = normalize(rawQuestion);

  if (!question.trim()) {
    return { text: 'Egzama, cilt bakımı veya kullandığınız tedaviler hakkında bir soru yazabilirsiniz.' };
  }

  if (GREETING_KEYWORDS.some(k => question.includes(k))) {
    return {
      text: 'Merhaba! Egzama, cilt bariyeri, tedaviler (Dupixent, Cibinqo, Siklosporin, Prednizon vb.) veya günlük bakım hakkında istediğiniz soruyu sorabilirsiniz.'
    };
  }

  if (THANKS_KEYWORDS.some(k => question.includes(k))) {
    return { text: 'Rica ederim! Başka bir sorunuz olursa buradayım. Ciddi veya beklenmedik belirtilerde her zaman hekiminize danışmayı unutmayın.' };
  }

  let bestEntry: KnowledgeEntry | null = null;
  let bestScore = 0;

  for (const entry of knowledgeBase) {
    let score = 0;
    for (const keyword of entry.keywords) {
      if (question.includes(keyword)) {
        score += keyword.split(' ').length; // çok kelimeli eşleşmeler daha güçlü sayılır
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestEntry = entry;
    }
  }

  if (bestEntry && bestScore > 0) {
    return { text: bestEntry.answer, matchedTopic: bestEntry.topic, urgent: bestEntry.urgent };
  }

  return {
    text: 'Bu konuda hazır bir yanıtım yok. Sorunuzu farklı kelimelerle tekrar deneyebilir veya "Klinik Bilgi Bankası" sekmesindeki geniş kapsamlı makalelere göz atabilirsiniz. Ciddi veya hızla kötüleşen belirtiler için lütfen bir dermatoloğa başvurun.'
  };
}
