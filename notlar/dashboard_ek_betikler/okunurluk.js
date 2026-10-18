/* ============================================================================
   OKUNURLUK KATMANI — dashboard'u hem uzmana hem genel okura açar
   ----------------------------------------------------------------------------
   Dört iş yapar, hiçbiri veriyi değiştirmez; sadece ekrandaki sunumu düzeltir:

     1) KAPASİTE REFERANSI. "145,5" tek başına anlamsız — neye göre çok?
        Yanına kapasiteyi ve bir çubuk koyuyoruz: "146 / 110".
     2) ONDALIK TEMİZLİĞİ. Yarım insan, ondalık otobüs yok. Kişi ve araç
        sayıları tam sayıya yuvarlanıyor. (Süre ve doluluk oranı ondalık kalır.)
     3) EYLEM ÖZETİ. Her tablonun başına tek cümle: kaç hatta, hangi saatte,
        toplam ne yapılmalı.
     4) TERİM BALONCUKLARI. "anlık yolcu", "araç-saat" gibi terimlerin üstüne
        gelince açıklaması çıkıyor — uzmanı rahatsız etmez, yeni okuru kurtarır.

   Paketlenmiş şablona dokunulmuyor. Betik çalışmazsa dashboard eskisi gibi çalışır.
   ========================================================================== */
(function () {
  "use strict";

  var VERI = null, KAP = 110;

  /* Terim → açıklama. Ekranda geçen jargonun tamamı burada. */
  var SOZLUK = {
    "anlık yolcu":
      "Otobüste aynı anda bulunduğu tahmin edilen kişi sayısı. Kart verisi 'kaç kişi bindi' diyor; " +
      "uzun hatlarda koltuk birden fazla kez dolduğu için biniş sayısı bu orana bölünüyor.",
    "araç-saat":
      "Bir aracın bir saat çalışması. 3 araç 2 saat çalışırsa 6 araç-saat eder. " +
      "Filo büyüklüğü değil, iş yükü ölçüsüdür.",
    "hat+saat":
      "Bir hattın belirli bir saatteki durumu. Örneğin '11ÜS · 17:00' tek bir hat+saat.",
    "doluluk":
      "Sefer başına düşen yolcu. Kapasite karşılaştırması için devir katsayısına bölünmüş " +
      "haline 'anlık yolcu' diyoruz.",
    "devir":
      "Bir koltuğun tek seferde kaç farklı kişiye hizmet ettiği. Tuzla'da binen Kartal'da inerse " +
      "yerine başkası biner — koltuk iki kez dolmuş olur.",
    "sentetik":
      "Gerçek ölçüm değil, hesapla üretilmiş veri. Ekim 2024 dosyasında hafta sonu günleri " +
      "olmadığı için hafta içi eğrisinden türetildi."
  };

  function sayi(n) { return n.toLocaleString("tr-TR"); }

  /* --- 1 + 2 · tablo hücrelerini düzelt ---------------------------------- */
  function tablolar() {
    [].slice.call(document.querySelectorAll("table")).forEach(function (t) {
      var bas = t.querySelector("thead tr");
      if (!bas) return;
      var basliklar = [].slice.call(bas.cells).map(function (c) {
        return (c.textContent || "").toLocaleUpperCase("tr").trim();
      });

      var iAnlik = basliklar.indexOf("ANLIK YOLCU");
      var iArac  = basliklar.indexOf("EK ARAÇ");
      var iYeni  = basliklar.indexOf("YENİ DOLULUK");
      if (iAnlik < 0 && iArac < 0 && iYeni < 0) return;

      [].slice.call(t.querySelectorAll("tbody tr")).forEach(function (tr) {
        /* aynı satır iki kez işlenmesin — MutationObserver tekrar tetikliyor */
        if (tr.dataset.mkOkunur) return;
        tr.dataset.mkOkunur = "1";

        if (iAnlik >= 0 && tr.cells[iAnlik]) kapasiteliHucre(tr.cells[iAnlik]);
        [iArac, iYeni].forEach(function (i) {
          if (i >= 0 && tr.cells[i]) yuvarla(tr.cells[i]);
        });
      });
    });
  }

  function oku(h) {
    /* "145,5" ya da "+14,1" → 145.5 / 14.1 */
    var m = (h.textContent || "").replace(/\./g, "").replace(",", ".").match(/-?\d+(\.\d+)?/);
    return m ? parseFloat(m[0]) : null;
  }

  function yuvarla(h) {
    var v = oku(h);
    if (v == null) return;
    var artili = /^\s*[+]/.test(h.textContent);
    h.textContent = (artili ? "+" : "") + Math.round(Math.abs(v)) * (v < 0 ? -1 : 1);
  }

  function kapasiteliHucre(h) {
    var v = oku(h);
    if (v == null) return;
    var oran = Math.min(v / KAP, 2);          /* çubuk en fazla iki kat gösterir */
    var renk = v > KAP ? "#dc2626" : v < 20 ? "#2a78d6" : "#16a34a";

    h.innerHTML =
      '<div style="display:flex;align-items:baseline;gap:5px;justify-content:flex-end">' +
        '<b style="font-variant-numeric:tabular-nums">' + Math.round(v) + "</b>" +
        '<span style="opacity:.5;font-size:.85em">/ ' + KAP + "</span>" +
      "</div>" +
      '<div style="height:3px;border-radius:2px;background:currentColor;opacity:.13;' +
      'margin-top:3px;position:relative">' +
        '<div style="position:absolute;inset:0 auto 0 0;width:' + (oran / 2 * 100).toFixed(0) +
        '%;background:' + renk + ';border-radius:2px;opacity:1"></div>' +
      "</div>";
  }

  /* --- 3 · eylem özetleri ------------------------------------------------ */
  function ozetCumlesi(baslikMetni, cumle) {
    /* Bölüm başlığı paketlenmiş şablonda h2/h3 değil, düz bir <div>. O yüzden
       etiket adına değil METNE göre arıyoruz: metni tam olarak başlık olan,
       çocuğu olmayan eleman. Özeti onun ATASININ sonuna ekliyoruz ki
       açıklama satırının altına düşsün. */
    var etiket = [].slice.call(document.querySelectorAll("div,span,h2,h3,p")).find(function (e) {
      return e.children.length === 0 &&
             new RegExp("^\\s*" + baslikMetni + "\\s*$", "i").test(e.textContent || "");
    });
    if (!etiket) return;
    var kap = etiket.parentElement;
    if (!kap || kap.querySelector(".mk-ozet")) return;
    var bas = kap.lastElementChild;

    var d = document.createElement("div");
    d.className = "mk-ozet";
    d.style.cssText = [
      "margin:10px 0 4px", "padding:11px 14px", "border-radius:9px",
      "background:color-mix(in oklab, var(--kritik,#d92b26) 9%, transparent)",
      "border:1px solid color-mix(in oklab, var(--kritik,#d92b26) 22%, transparent)",
      "font-size:14.5px", "line-height:1.5"
    ].join(";");
    d.innerHTML = "<b>Özetle:</b> " + cumle;
    kap.appendChild(d);
  }

  function ozetler() {
    if (!VERI) return;

    var art = VERI.oneri_artir || [];
    if (art.length) {
      var saatSefer = {}, hatlar = {};
      art.forEach(function (r) {
        saatSefer[r.s] = (saatSefer[r.s] || 0) + r.es;
        hatlar[r.h] = 1;
      });
      var enSaat = Object.keys(saatSefer).sort(function (a, b) {
        return saatSefer[b] - saatSefer[a];
      })[0];
      var enHat = art.slice().sort(function (a, b) { return b.es - a.es; })[0];
      var toplam = art.reduce(function (a, r) { return a + r.es; }, 0);

      ozetCumlesi("SEFER ARTIR",
        "<b>" + Object.keys(hatlar).length + " hatta toplam " + sayi(toplam) + " sefer eklenmeli.</b> " +
        "En çok ihtiyaç <b>" + ("0" + enSaat).slice(-2) + ":00</b>'da (" + sayi(saatSefer[enSaat]) +
        " sefer). Tek bir saatte en kritik hat: <b>" + enHat.h + "</b>, " +
        ("0" + enHat.s).slice(-2) + ":00'da +" + enHat.es + " sefer.");
    }

    var az = (VERI.oneri_azalt || []).filter(function (r) { return r.g === "WEEKDAYS"; });
    if (az.length) {
      var saatAz = {}, azHat = {};
      az.forEach(function (r) { saatAz[r.s] = (saatAz[r.s] || 0) + r.az; azHat[r.h] = 1; });
      var enAz = Object.keys(saatAz).sort(function (a, b) { return saatAz[b] - saatAz[a]; })[0];
      var toplamAz = az.reduce(function (a, r) { return a + r.az; }, 0);

      ozetCumlesi("SEFER AZALT",
        "<b>" + Object.keys(azHat).length + " hatta toplam " + sayi(toplamAz) +
        " sefer azaltılabilir</b> (hafta içi, gerçek ölçüm). En çok boşluk <b>" +
        ("0" + enAz).slice(-2) + ":00</b>'da (" + sayi(saatAz[enAz]) + " sefer). " +
        "Bu seferler zirve saatlere kaydırılabilir — yeni araç almaya gerek kalmadan.");
    }
  }

  /* --- 4 · terim baloncukları -------------------------------------------- */
  function terimler() {
    var kokler = [].slice.call(document.querySelectorAll("th, p, .mk-ozet, li"));
    kokler.forEach(function (e) {
      if (e.dataset.mkTerim) return;
      var metin = (e.textContent || "").toLocaleLowerCase("tr");
      var bulunan = Object.keys(SOZLUK).find(function (t) { return metin.indexOf(t) >= 0; });
      if (!bulunan) return;
      e.dataset.mkTerim = "1";
      /* Kelimenin kendisini sarmak paketlenmiş DOM'u bozabilir; onun yerine
         elemanın tamamına başlık veriyoruz — uzun basınca da görünür. */
      e.title = bulunan.toLocaleUpperCase("tr") + " — " + SOZLUK[bulunan];
      e.style.cursor = "help";
      e.style.textDecoration = "underline dotted color-mix(in oklab, currentColor 35%, transparent)";
      e.style.textUnderlineOffset = "3px";
    });
  }

  /* --- çalıştır ----------------------------------------------------------- */
  function uygula() {
    tablolar();
    ozetler();
    terimler();
  }

  fetch("dashboard_veri.json")
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (v) {
      if (v) { VERI = v; KAP = (v.ozet && v.ozet.kapasite) || 110; }
    })
    .catch(function () {})
    .then(function () {
      var dene = setInterval(uygula, 400);
      setTimeout(function () { clearInterval(dene); }, 15000);
      var z = null;
      new MutationObserver(function () {
        clearTimeout(z); z = setTimeout(uygula, 250);
      }).observe(document.body, { childList: true, subtree: true });
    });
})();
