/* ===================================================================
   YÖN BOYUTU + SEFER TARİFESİ                             (7. seans)

   Paketlenmiş React şablonuna DOKUNMAZ. İki iş yapar:

   1) "Sefer artır" tablosundaki ANLIK YOLCU sütununu çift bara çevirir
      (G / D, kapasiteyi aşan kısım kırmızı, sayı yazısı yok).

   2) Satıra tıklayınca açılan akordeon panelindeki 24 saatlik GRAFİĞİ
      kaldırır, yerine İETT'nin kendi tarife sayfasındaki düzende bir
      SEFER TARİFESİ tablosu koyar: her yön bir blok, sarı başlık,
      İş Günleri / Cumartesi / Pazar sütunları, kırmızı saatler.
      Önerilen yeni kalkışlar yeşil ve `+` işaretiyle araya girer.

   Verisi: cikti/yon_veri.json  (14_yon_duzeltmesi.py üretir)
   Dosya yoksa sessizce hiçbir şey yapmaz — dashboard eskisi gibi çalışır.
   =================================================================== */
(function () {
  var VERI = null;
  var KAPASITE = 110;

  function el(tag, stil, metin) {
    var e = document.createElement(tag);
    if (stil) e.setAttribute("style", stil);
    if (metin != null) e.textContent = metin;
    return e;
  }
  function sayi(v, n) {
    if (v == null) return "—";
    return v.toLocaleString("tr-TR", { minimumFractionDigits: n || 0,
                                       maximumFractionDigits: n || 0 });
  }

  /* --- stiller ------------------------------------------------------ */
  function stilEkle() {
    if (document.getElementById("mk-yon-stil")) return;
    var st = el("style");
    st.id = "mk-yon-stil";
    st.textContent = [
      /* ---------- ANLIK YOLCU sütunundaki çift bar ---------- */
      ".mk-yb{position:relative;display:flex;flex-direction:column;gap:5px;",
      "min-width:118px;padding:2px 0}",
      ".mk-yb-sat{display:flex;align-items:center;gap:7px}",
      ".mk-yb-sat i{font-family:'IBM Plex Mono',monospace;font-size:9px;font-style:normal;",
      "line-height:1;width:8px;flex:0 0 auto;color:var(--ink2);opacity:.75}",
      ".mk-yb-iz{flex:1;height:6px;border-radius:3px;background:currentColor;opacity:.11}",
      ".mk-yb-sar{flex:1;position:relative;height:6px}",
      ".mk-yb-sar>.mk-yb-iz{position:absolute;inset:0}",
      ".mk-yb-dol{position:absolute;left:0;top:0;height:6px;border-radius:3px;",
      "display:flex;overflow:hidden;transition:width .25s ease}",
      ".mk-yb-dol>span{display:block;height:100%}",
      ".mk-yb-tek{justify-content:center;min-height:14px}",
      ".mk-yb-kap{position:absolute;top:0;bottom:0;width:1px;",
      "background:repeating-linear-gradient(to bottom,var(--ink2) 0 2px,transparent 2px 4px);",
      "opacity:.55;pointer-events:none}",

      /* ---------- SEFER TARİFESİ — İETT sayfasının düzeni ----------
         Karanlık temanın içinde bilerek AÇIK renkli: resmi tarife belgesi
         gibi görünsün, analizden ayrıştığı belli olsun. */
      ".mk-tr-sar{display:flex;gap:18px;flex-wrap:wrap;margin:4px 0 6px}",
      ".mk-tr-blok{flex:1 1 320px;min-width:290px;background:#fff;border-radius:10px;",
      "overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.35)}",
      ".mk-tr-bas{background:#FDD100;color:#111;font-weight:700;font-size:13px;",
      "letter-spacing:.02em;text-align:center;padding:13px 10px;line-height:1.3}",
      ".mk-tr-tbl{width:100%;border-collapse:collapse;table-layout:fixed}",
      ".mk-tr-tbl th{background:#F2F2F2;color:#333;font-weight:600;font-size:12.5px;",
      "text-align:center;padding:11px 6px;border-bottom:1px solid #E5E5E5;",
      "border-right:1px solid #E5E5E5}",
      ".mk-tr-tbl th.orta{background:#EAEAEA}",
      ".mk-tr-tbl th:last-child,.mk-tr-tbl td:last-child{border-right:0}",
      ".mk-tr-tbl td{text-align:center;padding:9px 4px;font-size:13.5px;",
      "color:#E4002B;border-bottom:1px solid #EFEFEF;border-right:1px solid #EFEFEF;",
      "font-variant-numeric:tabular-nums;background:#fff}",
      ".mk-tr-tbl tr:last-child td{border-bottom:0}",
      /* kapasitesi aşan saatler — kırmızı kalıyor, arkası hafif tonlanıyor */
      ".mk-tr-tbl td.dolu{background:#FFF1F2;font-weight:700}",
      /* çok boş saatler — geri plana çekiliyor */
      ".mk-tr-tbl td.bos{color:#9AA0A6}",
      /* önerilen yeni kalkış */
      ".mk-tr-tbl td.yeni{color:#0B7A47;font-weight:700;background:#E9F7EF}",
      /* hafta sonu önerisi: aynı yeşil ama KESİK çerçeve — talebi sentetik
         olan öneri, gerçek ölçüme dayananla aynı görünmemeli (Bölüm 7). */
      ".mk-tr-tbl td.yeni.sentetik{background:#F1F8F4;border:1px dashed #0B7A47}",
      /* çıkarılabilecek kalkış — üstü çizili, turuncu */
      ".mk-tr-tbl td.cikar{color:#B45309;background:#FEF3E2;text-decoration:line-through;",
      "text-decoration-thickness:1.5px}",
      ".mk-tr-not{display:flex;gap:16px;flex-wrap:wrap;align-items:center;",
      "font-size:11.5px;color:var(--ink2);margin:10px 0 2px}",
      ".mk-tr-not i{display:inline-block;width:22px;height:13px;border-radius:3px;",
      "margin-right:6px;vertical-align:-2px;border:1px solid #E5E5E5}",
      ".mk-tr-dip{color:var(--muted);font-size:11.5px;line-height:1.6;margin-top:6px}",
      ".mk-tr-baslik{font-size:13px;color:var(--ink2);margin:2px 0 10px}",
      "@media(max-width:760px){.mk-tr-blok{flex:1 1 100%}}",

      /* ---------- DETAYLAR ---------- */
      ".mk-dt-cubuk{display:flex;justify-content:flex-end;margin-top:10px}",
      ".mk-dt-dugme{font-size:12px;padding:7px 14px;border-radius:8px;cursor:pointer;",
      "background:var(--surface);border:1px solid var(--kenar2);color:var(--ink2);",
      "transition:background .15s,color .15s,border-color .15s}",
      ".mk-dt-dugme:hover{background:var(--yuksek);color:var(--ink);border-color:var(--kritik)}",
      ".mk-dt-dugme.acik{background:var(--yuksek);color:var(--ink);border-color:var(--kritik)}",
      ".mk-dt{margin-top:14px;padding-top:14px;border-top:1px solid var(--kenar)}",
      ".mk-dt-sekme{display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap}",
      ".mk-dt-sekme button{font-size:12px;padding:6px 13px;border-radius:7px;cursor:pointer;",
      "background:transparent;border:1px solid var(--kenar2);color:var(--ink2)}",
      ".mk-dt-sekme button.sec{background:var(--kritik);border-color:var(--kritik);color:#fff;",
      "font-weight:600}",
      ".mk-dt-ozet{display:flex;gap:22px;flex-wrap:wrap;font-size:12.5px;",
      "color:var(--ink2);margin-bottom:12px}",
      ".mk-dt-ozet b{color:var(--ink);font-size:15px;font-weight:600;margin-right:5px}",
      ".mk-dt-uyari{font-size:11.5px;color:var(--uyari);margin-bottom:10px;",
      "background:color-mix(in oklab,var(--uyari) 10%,transparent);padding:8px 11px;",
      "border-radius:7px;border:1px solid color-mix(in oklab,var(--uyari) 30%,transparent)}",
      ".mk-dt-tbl{width:100%;border-collapse:collapse;font-size:12.5px}",
      ".mk-dt-tbl th{text-align:left;font-family:'IBM Plex Mono',monospace;font-size:10px;",
      "letter-spacing:.09em;color:var(--muted);font-weight:500;padding:0 8px 8px;",
      "border-bottom:1px solid var(--kenar2);white-space:nowrap}",
      ".mk-dt-tbl th.sag{text-align:right}",
      ".mk-dt-tbl td{padding:5px 8px;border-bottom:1px solid var(--kenar);",
      "vertical-align:middle}",
      ".mk-dt-tbl td.sag{text-align:right;font-variant-numeric:tabular-nums}",
      ".mk-dt-tbl td.sa{font-family:'IBM Plex Mono',monospace;color:var(--muted);font-size:11px}",
      ".mk-dt-tbl tr.zirve td{background:color-mix(in oklab,var(--kritik) 8%,transparent)}",
      ".mk-dt-bar{display:flex;align-items:center;gap:7px}",
      ".mk-dt-bar .iz{flex:1;height:6px;border-radius:3px;background:currentColor;",
      "opacity:.11;position:relative;min-width:40px}",
      ".mk-dt-bar .sar{flex:1;position:relative;height:6px;min-width:40px}",
      ".mk-dt-bar .sar>.iz{position:absolute;inset:0}",
      ".mk-dt-bar .dol{position:absolute;left:0;top:0;height:6px;border-radius:3px;",
      "display:flex;overflow:hidden}",
      ".mk-dt-bar .dol>span{display:block;height:100%}",
      ".mk-dt-bar em{font-style:normal;font-variant-numeric:tabular-nums;font-size:11.5px;",
      "min-width:30px;text-align:right;color:var(--ink2)}",
      ".mk-dt-bar em.dolu{color:var(--kritik);font-weight:600}"
    ].join("");
    document.head.appendChild(st);
  }

  /* ================= 1) ANLIK YOLCU — çift bar ====================== */

  /* Bar iki parçalı: kapasiteye kadar sakin renk, aşan kısım kırmızı.
     "Ne kadar aşıyor" rakam okumadan görünüyor. */
  function barDoldur(dol, deger, enb) {
    var v = deger || 0;
    var icKadar = Math.min(v, KAPASITE);
    var asan = Math.max(0, v - KAPASITE);
    var sakin = v < 20 ? "var(--mavi)" : "var(--iyi)";
    dol.style.width = (100 * Math.min(v, enb) / enb) + "%";
    if (icKadar > 0) dol.appendChild(el("span", "flex:" + icKadar + ";background:" + sakin));
    if (asan > 0) dol.appendChild(el("span", "flex:" + asan + ";background:var(--kritik)"));
  }

  /* Azaltma bölümünün kendi gün tipi süzgeci var (Hafta içi / Cumartesi / Pazar).
     Seçili olan `background: var(--marka)` ile işaretli — bar hesabı buna göre
     yapılıyor, yoksa cumartesi satırına hafta içi doluluğu yazılırdı.
     (İlk sürümde "gün tipi DOM'dan okunamıyor" sanılıp azaltma tablosu dışarıda
     bırakılmıştı; süzgeç sonradan fark edildi.) */
  var GUN_KOD = { "Hafta içi": "I", "Cumartesi": "C", "Pazar": "P" };

  function aktifGun(kapsam) {
    var sec = null;
    [].slice.call(kapsam.querySelectorAll("button")).forEach(function (b) {
      var ad = (b.textContent || "").trim();
      if (!GUN_KOD[ad]) return;
      var bg = (b.getAttribute("style") || "") + getComputedStyle(b).backgroundColor;
      if (/--marka|--kritik/.test(b.getAttribute("style") || "")) sec = GUN_KOD[ad];
    });
    return sec || "I";
  }

  function tabloBarlari() {
    if (!VERI) return;
    ["artir", "azalt"].forEach(function (id) {
      var k = document.getElementById(id);
      if (k) bolumBarlari(k, id === "azalt" ? aktifGun(k) : "I");
    });
  }

  function bolumBarlari(kapsam, gun) {
    /* Gün tipi değiştiyse eski barlar geçersiz — damga silinip yeniden çiziliyor.
       ⚠️ Damga adı `mkYonGun`; SAKIN `mkGun` KULLANMA. `akordeon.js`'in tıklama
       işleyicisi `e.target.closest("[data-mk-gun]")` ile gün tipi düğmesi arıyor.
       Damgayı `data-mk-gun` diye bölüme basınca satıra her tıklamada olay yukarı
       çıkarken BÖLÜMÜN KENDİSİ gün düğmesi sanılıyor, `stopPropagation` ile
       kesiliyor ve panel hiç açılmıyordu. Bulunması bir saat aldı. */
    if (kapsam.dataset.mkYonGun !== gun) {
      [].slice.call(kapsam.querySelectorAll('[data-mk-yon="1"]')).forEach(function (c) {
        delete c.dataset.mkYon;
      });
      kapsam.dataset.mkYonGun = gun;
    }
    [].slice.call(kapsam.querySelectorAll("table")).forEach(function (t) {
      var bas = t.querySelector("thead tr");
      if (!bas) return;
      var basliklar = [].slice.call(bas.cells).map(function (c) {
        return (c.textContent || "").toLocaleUpperCase("tr").trim();
      });
      var iAnlik = basliklar.indexOf("ANLIK YOLCU");
      var iHat = basliklar.indexOf("HAT");
      var iSaat = basliklar.indexOf("SAAT");
      if (iAnlik < 0 || iHat < 0 || iSaat < 0) return;

      var enb = KAPASITE * 2;
      var kayit = [];
      [].slice.call(t.querySelectorAll("tbody tr")).forEach(function (tr) {
        var hc = tr.cells[iHat], sc = tr.cells[iSaat], ac = tr.cells[iAnlik];
        if (!hc || !sc || !ac) return;
        var hat = ((hc.querySelector(".sc-interp") || hc).textContent || "").trim();
        var m = (sc.textContent || "").match(/(\d{1,2}):/);
        if (!m) return;
        /* Doluluk `detay`den okunuyor — orada üç gün tipi de var.
           `hatlar` yalnızca hafta içini taşıyor. */
        var dt = VERI.detay && VERI.detay[hat] && VERI.detay[hat][gun];
        var ad = VERI.kalkis_adi && VERI.kalkis_adi[hat];
        var r = null;
        if (dt) dt.forEach(function (a) { if (a[0] === +m[1]) r = detaySatir(a); });
        var adG = (ad && ad.G) || "GİDİŞ", adD = (ad && ad.D) || "DÖNÜŞ";
        if (r && r.eG != null && r.eD != null) {
          enb = Math.max(enb, r.eG, r.eD);
          kayit.push([tr, { G: adG, D: adD }, r]);
        } else if (r && (r.bG === 0 || r.bD === 0) && (r.bG || r.bD)) {
          /* O SAATTE TEK YÖN ÇALIŞIYOR. 14ES gibi hatlarda tarifede sabah
             yalnızca gidiş seferi var, dönüşler öğleden sonra başlıyor.
             Doluluk hesaplanabiliyor ama tek yön için — bunu "—" diye
             göstermek "veri yok" izlenimi veriyordu. Artık çalışan yönün
             harfi ve sebebi yazılı. */
          var tekY = r.bD === 0 ? "G" : "D";
          enb = Math.max(enb, r.e0 || 0);
          kayit.push([tr, null, {
            yonsuz: r.e0, tek: tekY,
            ad: tekY === "G" ? adG : adD,
            not: "bu saatte tarifede yalnızca " +
                 (tekY === "G" ? "gidiş" : "dönüş") + " seferi var — " +
                 (tekY === "G" ? "dönüş" : "gidiş") + " seferleri günün " +
                 "başka saatlerinde"
          }]);
        } else if (ac.dataset.mkYon !== "1") {
          var sv = (ac.textContent || "").replace(/\./g, "").replace(",", ".")
                     .match(/-?\d+(\.\d+)?/);
          if (!sv) return;
          enb = Math.max(enb, parseFloat(sv[0]));
          kayit.push([tr, null, { yonsuz: parseFloat(sv[0]) }]);
        }
      });
      if (!kayit.length) return;

      kayit.forEach(function (k) {
        var hucre = k[0].cells[iAnlik];
        if (!hucre || hucre.dataset.mkYon === "1") return;
        var h = k[1], r = k[2];
        var kap = el("div", null); kap.className = "mk-yb";
        var barlar = h
          ? [["G", r.eG, h.G, r.bG], ["D", r.eD, h.D, r.bD]]
          : r.tek
            ? [[r.tek, r.yonsuz, r.ad + " — " + r.not, null]]
            : [["—", r.yonsuz, "yön ayrılamadı — iki yönün ortalaması", null]];
        if (!h) kap.classList.add("mk-yb-tek");
        barlar.forEach(function (p) {
          var sat = el("div", null); sat.className = "mk-yb-sat";
          sat.appendChild(el("i", null, p[0]));
          var sar = el("div", null); sar.className = "mk-yb-sar";
          sar.appendChild(el("div", null)).className = "mk-yb-iz";
          var dol = el("div", null); dol.className = "mk-yb-dol";
          barDoldur(dol, p[1], enb);
          sar.appendChild(dol);
          sat.appendChild(sar);
          sat.title = p[2] + " — " + sayi(p[1]) + " kişi/sefer" +
                      (p[3] != null ? " · " + p[3] + " sefer" : "");
          kap.appendChild(sat);
        });
        var oran = (KAPASITE / enb).toFixed(4);
        var kz = el("div", "left:calc(13px + (100% - 13px) * " + oran + ")");
        kz.className = "mk-yb-kap";
        kz.title = "kapasite " + KAPASITE;
        kap.appendChild(kz);
        hucre.textContent = "";
        hucre.appendChild(kap);
        hucre.dataset.mkYon = "1";
      });
    });
  }

  /* ================= 2) SEFER TARİFESİ TABLOSU ====================== */

  var GUNLER = [["I", "İş Günleri"], ["C", "Cumartesi"], ["P", "Pazar"]];

  function tarifeKur(hat) {
    var tarife = VERI.tarife && VERI.tarife[hat];
    if (!tarife) return null;
    var adlar = (VERI.kalkis_adi && VERI.kalkis_adi[hat]) || {};
    var h = VERI.hatlar[hat];

    /* saatlik doluluk — yön ayrımı varsa yönlü, yoksa tek değer */
    var dolu = {};
    if (h) h.saat.forEach(function (r) { dolu[r.s] = r; });

    /* GÜN TİPİNE göre doluluk. `hatlar` yalnızca hafta içini taşıyor; cumartesi
       ve pazar `detay` bloğundan okunuyor (satırlar DİZİ, alan sırası
       `detay_alan`da). 8. seansta gerekti: hafta sonuna öneri koyuyorsak o
       saatin neden kapasite üstü olduğu da aynı tabloda görünmeli. */
    var A = VERI.detay_alan || [];
    var iS = A.indexOf("s"), iE0 = A.indexOf("e0"),
        iEG = A.indexOf("eG"), iED = A.indexOf("eD");
    var doluGun = { I: dolu, C: {}, P: {} };
    var _dt = (VERI.detay && VERI.detay[hat]) || {};
    ["I", "C", "P"].forEach(function (g) {
      if (!_dt[g] || iS < 0) return;
      var hedef = doluGun[g];
      _dt[g].forEach(function (r) {
        if (hedef[r[iS]]) return;          /* hafta içi zaten `hatlar`dan geldi */
        hedef[r[iS]] = { s: r[iS], e0: r[iE0], eG: r[iEG], eD: r[iED] };
      });
    });

    /* çıkarılabilecek kalkışlar: gün tipi → "HH:MM" → 1 */
    var cikarlar = {};
    var _c = (VERI.cikar && VERI.cikar[hat]) || {};
    Object.keys(_c).forEach(function (g) {
      cikarlar[g] = {};
      _c[g].forEach(function (t) { cikarlar[g][t] = 1; });
    });

    /* bu hattın önerileri: "saat|yön" → yeni kalkışlar (hafta içi) */
    /* Önerilen yeni kalkışlar HER YÖN İÇİN ayrı geliyor (`yeniG` / `yeniD`).
       Önce yalnızca kritik yöne ekleme yapılıyordu; iki yön de kapasiteyi
       aşan saatlerde (öneri satırlarının %22'si) ikinci yönün saatleri
       tarifede kırmızı görünüp hiç yeşil kalkış çıkmıyordu. */
    /* 8. seans: anahtar artık "GÜN|YÖN|dakika". Öneriler hafta sonu için de
       üretiliyor; hangi gün sütununa gireceğini `x.g` (I/C/P) söylüyor.
       Değer 1 = gerçek (hafta içi), 2 = sentetik talebe dayanan (hafta sonu). */
    var yeniler = {};
    VERI.oneri.forEach(function (x) {
      if (x.h !== hat) return;
      var g = x.g || "I", t2 = x.sentetik ? 2 : 1;
      (x.yeniG || []).forEach(function (t) { yeniler[g + "|G|" + t] = t2; });
      (x.yeniD || []).forEach(function (t) { yeniler[g + "|D|" + t] = t2; });
      /* yön ayrımı uygulanamayan satır — tek liste, iki bloğa da yazılır */
      (x.yeni || []).forEach(function (t) { yeniler[g + "|-|" + t] = t2; });
    });

    var kok = el("div");
    var bas = el("div", null); bas.className = "mk-tr-baslik";
    bas.appendChild(el("b", "color:var(--ink);font-weight:600", hat));
    bas.appendChild(document.createTextNode(" sefer tarifesi — yeşil ve `+` işaretli " +
      "saatler önerilen yeni kalkışlar. Kesik çerçeveli olanlar hafta sonu " +
      "önerisidir; talep sentetik olduğu için ayrı gösterilir."));
    kok.appendChild(bas);

    var sar = el("div", null); sar.className = "mk-tr-sar";

    ["G", "D"].forEach(function (kod) {
      var gunler = tarife[kod];
      if (!gunler) return;

      var blok = el("div", null); blok.className = "mk-tr-blok";
      blok.appendChild(el("div", null, (adlar[kod] || "") + " KALKIŞ"))
        .className = "mk-tr-bas";

      /* her gün sütununa KENDİ önerileri karışıyor, sıralı. 8. seansa kadar
         yalnızca "I" sütunu öneri alıyordu — hafta sonu boş görünüyordu. */
      var sutunlar = GUNLER.map(function (g) {
        var liste = (gunler[g[0]] || []).map(function (t) { return [t, 0]; });
        Object.keys(yeniler).forEach(function (k) {
          var p = k.split("|");
          if (p[0] !== g[0]) return;
          if (p[1] === kod || p[1] === "-") liste.push([p[2], yeniler[k]]);
        });
        liste.sort(function (a, b) { return a[0] < b[0] ? -1 : 1; });
        return liste;
      });

      var tbl = el("table", null); tbl.className = "mk-tr-tbl";
      var thead = el("thead"), tr = el("tr");
      GUNLER.forEach(function (g, i) {
        var th = el("th", null, g[1]);
        if (i === 1) th.className = "orta";
        tr.appendChild(th);
      });
      thead.appendChild(tr); tbl.appendChild(thead);

      var tb = el("tbody");
      var enUzun = Math.max.apply(null, sutunlar.map(function (s) { return s.length; }));
      for (var i = 0; i < enUzun; i++) {
        var satir = el("tr");
        sutunlar.forEach(function (s, si) {
          var p = s[i];
          var td = el("td", null, p ? (p[1] ? "+" + p[0] : p[0]) : "");
          if (p) {
            if (p[1]) {
              td.className = p[1] === 2 ? "yeni sentetik" : "yeni";
              td.title = p[1] === 2
                ? "önerilen yeni kalkış — talebi SENTETİK (Bölüm 7)"
                : "önerilen yeni kalkış";
            } else if (cikarlar[GUNLER[si][0]] && cikarlar[GUNLER[si][0]][p[0]]) {
              /* azaltma listesinden gelen kalkış — üstü çizili */
              td.className = "cikar";
              td.title = "çıkarılabilecek kalkış (azaltma listesi)";
            } else {
              /* Renk artık ÜÇ sütunda da var: hafta sonuna öneri koyuyorsak
                 o saatin neden kırmızı olduğu da görünmeli. Hafta sonu değerleri
                 sentetik talepten gelir, ipucunda öyle yazıyor. */
              var d = doluGun[GUNLER[si][0]][+p[0].slice(0, 2)];
              var v = d ? (kod === "G" ? d.eG : d.eD) : null;
              if (d && v == null) v = d.e0;
              if (v != null) {
                if (v > KAPASITE) { td.className = "dolu"; }
                else if (v < 20) { td.className = "bos"; }
                td.title = sayi(v) + " kişi/sefer" + (si ? " (sentetik talep)" : "");
              }
            }
          }
          satir.appendChild(td);
        });
        tb.appendChild(satir);
      }
      tbl.appendChild(tb);
      blok.appendChild(tbl);
      sar.appendChild(blok);
    });

    if (!sar.children.length) return null;
    kok.appendChild(sar);

    var lej = el("div", null); lej.className = "mk-tr-not";
    [["background:#E9F7EF;border-color:#0B7A47", "önerilen yeni kalkış"],
     ["background:#F1F8F4;border:1px dashed #0B7A47", "hafta sonu önerisi (sentetik talep)"],
     ["background:#FEF3E2;border-color:#B45309", "çıkarılabilecek kalkış"],
     ["background:#FFF1F2;border-color:#E4002B", "kapasite üstü saat"],
     ["background:#fff", "normal"],
     ["background:#fff;color:#9AA0A6", "boş (20 kişi/sefer altı)"]]
      .forEach(function (p) {
        var d = el("span");
        d.appendChild(el("i", p[0]));
        d.appendChild(document.createTextNode(p[1]));
        lej.appendChild(d);
      });
    kok.appendChild(lej);

    var dip = el("div", null); dip.className = "mk-tr-dip";
    dip.innerHTML =
      "Tarife İETT'nin planlanan sefer saatlerinden geliyor ve resmi sayfayla " +
      "dakika dakika örtüşüyor. Renkler yalnızca <b>İş Günleri</b> sütununda — " +
      "doluluk yalnızca hafta içi ölçüldü.<br>" +
      "⚠️ <b style='color:var(--ink)'>Dakika yerleşimi ölçüm değil, karardır.</b> " +
      "Talep saatlik olduğu için saat içindeki dağılım bilinmiyor. Benimsenen ilke: " +
      "<b style='color:var(--ink)'>mevcut kalkışlara dokunma</b>, en büyük aralığın " +
      "ortasına ekle — yolcunun alıştığı saatler korunur, sadece araları sıklaşır.";
    kok.appendChild(dip);

    /* --- DETAYLAR düğmesi (sağ alt) --- */
    var detay = VERI.detay && VERI.detay[hat];
    if (detay) {
      var cub = el("div", null); cub.className = "mk-dt-cubuk";
      var dgm = el("button", null, "Detaylar  ▾"); dgm.className = "mk-dt-dugme";
      cub.appendChild(dgm);
      kok.appendChild(cub);

      var kutu = el("div", "display:none"); kutu.className = "mk-dt";
      kok.appendChild(kutu);

      dgm.addEventListener("click", function () {
        var acik = kutu.style.display !== "none";
        kutu.style.display = acik ? "none" : "";
        dgm.textContent = acik ? "Detaylar  ▾" : "Detaylar  ▴";
        dgm.classList.toggle("acik", !acik);
        if (!acik && !kutu.children.length) detayKur(kutu, hat, detay, adlar);
      });
    }
    return kok;
  }

  /* --- DETAYLAR paneli: üç gün tipi × iki yön × saat saat -------------
     "Hat incelemesi" bölümünün verdiği her şeyi, üstüne yön kırılımını
     ekleyerek aynı yerde gösteriyor. */
  var GUN_AD = { I: "İş Günleri", C: "Cumartesi", P: "Pazar" };

  /* Detay satırları yer kazanmak için DİZİ olarak geliyor (yon_veri.json
     "detay_alan" sırası). Burada okunabilir nesneye çevriliyor. */
  function detaySatir(a) {
    return { s: a[0], y: a[1], sf: a[2], e0: a[3], eG: a[4], eD: a[5],
             bG: a[6], bD: a[7], sentetik: a[8] === 1 };
  }

  function detayKur(kutu, hat, detay, adlar) {
    var sekme = el("div", null); sekme.className = "mk-dt-sekme";
    var govde = el("div");
    kutu.appendChild(sekme);
    kutu.appendChild(govde);

    var kodlar = ["I", "C", "P"].filter(function (k) { return detay[k]; });

    function ciz(kod) {
      govde.textContent = "";
      var satirlar = detay[kod].map(detaySatir);
      var toplamY = 0, toplamS = 0, enb = KAPASITE;
      satirlar.forEach(function (r) {
        toplamY += r.y || 0; toplamS += r.sf || 0;
        enb = Math.max(enb, r.eG || 0, r.eD || 0, r.e0 || 0);
      });

      var ozet = el("div", null); ozet.className = "mk-dt-ozet";
      [[sayi(toplamY), "günlük yolcu"], [sayi(toplamS), "günlük sefer"],
       [satirlar.length, "dolu saat"]].forEach(function (p) {
        var d = el("div");
        d.appendChild(el("b", null, String(p[0])));
        d.appendChild(document.createTextNode(p[1]));
        ozet.appendChild(d);
      });
      govde.appendChild(ozet);

      /* Hafta sonu talebi sentetik — rakamların yanında bu uyarı olmadan
         gösterilmesi projenin Bölüm 7'deki taahhüdüne aykırı olurdu. */
      if (satirlar.some(function (r) { return r.sentetik; })) {
        govde.appendChild(el("div", null,
          "⚠ Bu gün tipinin YOLCU sayıları sentetik — hafta içi eğrisinden " +
          "türetildi (cumartesi %72, pazar %52). Sefer saatleri ve yön oranı " +
          "gerçek ölçüm. Sefer ekleme önerileri hafta sonu için de üretiliyor " +
          "(8. seans) ama bu belirsizlikle okunmalı: ölçülen gerçek çarpanlar " +
          "%79/%58, yani model hafta sonu talebini olduğundan AZ gösteriyor."
        )).className = "mk-dt-uyari";
      }

      var tbl = el("table", null); tbl.className = "mk-dt-tbl";
      var thead = el("thead"), tr = el("tr");
      [["SAAT", ""], ["YOLCU", "sag"], ["SEFER", "sag"],
       [(adlar.G || "GİDİŞ"), ""], [(adlar.D || "DÖNÜŞ"), ""]].forEach(function (b) {
        var th = el("th", null, b[0]); th.className = b[1]; tr.appendChild(th);
      });
      thead.appendChild(tr); tbl.appendChild(thead);

      var tb = el("tbody");
      var zirve = satirlar.reduce(function (a, b) {
        return (b.eG || b.e0 || 0) > (a.eG || a.e0 || 0) ||
               (b.eD || 0) > (a.eD || a.e0 || 0) ? b : a;
      }, satirlar[0] || {});

      satirlar.forEach(function (r) {
        var st = el("tr");
        if (r === zirve) st.className = "zirve";
        st.appendChild(el("td", null, ss(r.s))).className = "sa";
        st.appendChild(el("td", null, sayi(r.y))).className = "sag";
        st.appendChild(el("td", null, String(r.sf))).className = "sag";
        [["G", r.eG, r.bG], ["D", r.eD, r.bD]].forEach(function (p) {
          var td = el("td");
          var v = p[1] != null ? p[1] : (p[0] === "G" ? r.e0 : null);
          if (v == null) { td.appendChild(el("span", "color:var(--muted)", "—")); }
          else {
            var kap = el("div", null); kap.className = "mk-dt-bar";
            var sar = el("div", null); sar.className = "sar";
            sar.appendChild(el("div", null)).className = "iz";
            var dol = el("div", null); dol.className = "dol";
            barDoldur(dol, v, enb);
            sar.appendChild(dol); kap.appendChild(sar);
            var em = el("em", null, sayi(v));
            if (v > KAPASITE) em.className = "dolu";
            kap.appendChild(em);
            td.appendChild(kap);
            td.title = (p[0] === "G" ? adlar.G : adlar.D) + " · " + sayi(v) +
                       " kişi/sefer" + (p[2] != null ? " · " + p[2] + " sefer" : "");
          }
          st.appendChild(td);
        });
        tb.appendChild(st);
      });
      tbl.appendChild(tb);
      govde.appendChild(tbl);

      var dip = el("div", null); dip.className = "mk-tr-dip";
      dip.innerHTML = "Barlar araçtaki tahmini <b style='color:var(--ink)'>anlık " +
        "yolcu</b> (biniş ÷ devir). Kırmızı kısım kapasiteyi (" + KAPASITE +
        ") aşan miktar. Vurgulu satır o gün tipinin en yoğun saati. " +
        "<b style='color:var(--ink)'>—</b> o saatte tek yön çalışıyor ya da " +
        "tarifesi yön ayrımına uygun değil.";
      govde.appendChild(dip);
    }

    kodlar.forEach(function (k, i) {
      var b = el("button", null, GUN_AD[k]);
      if (i === 0) b.className = "sec";
      b.addEventListener("click", function () {
        sekme.querySelectorAll("button").forEach(function (x) {
          x.className = "";
        });
        b.className = "sec";
        ciz(k);
      });
      sekme.appendChild(b);
    });
    if (kodlar.length) ciz(kodlar[0]);
  }

  function ss(s) { return (s < 10 ? "0" + s : s) + ":00"; }

  /* Akordeon panelindeki grafiği tarifeyle değiştir.
     Panel `05_...`'in değil, `akordeon.js`'in ürünü; yapısına dokunmadan
     yalnızca SVG taşıyan blok (ve hemen ardındaki açıklama satırı) değiştiriliyor. */
  function panelleriDonustur() {
    if (!VERI) return;
    ["artir", "azalt"].forEach(function (id) {
      var k = document.getElementById(id);
      if (k) bolumPanelleri(k);
    });
  }

  function bolumPanelleri(kapsam) {
    [].slice.call(kapsam.querySelectorAll("tbody tr")).forEach(function (tr) {
      var svg = tr.querySelector("svg");
      if (!svg || tr.dataset.mkTarife === "1") return;

      var onceki = tr.previousElementSibling;
      if (!onceki) return;
      var hc = onceki.cells && onceki.cells[0];
      if (!hc) return;
      var hat = ((hc.querySelector(".sc-interp") || hc).textContent || "").trim();
      var tablo = tarifeKur(hat);
      if (!tablo) { tr.dataset.mkTarife = "1"; return; }

      /* Grafiği taşıyan en dış blok: panelin doğrudan çocuğu olan div.
         ⚠️ Grafik KALDIRILMIYOR — Mehmet "saatlik grafik de güzel, dursun,
         tarife ekstrası olsun" dedi. Tarife tablosu grafiğin (ve hemen
         ardındaki "Kırmızı sütunlar…" açıklamasının) ALTINA giriyor:
         grafik genel görünümü, tarife somut dakikaları veriyor. */
      var blok = svg;
      while (blok.parentElement && blok.parentElement.parentElement !== tr.cells[0]) {
        blok = blok.parentElement;
      }
      if (!blok.parentElement) return;
      var sonraki = blok.nextElementSibling;
      if (sonraki && /Kırmızı sütunlar/.test(sonraki.textContent || "")) {
        blok = sonraki;                      /* açıklamanın da altına geç */
      }
      blok.parentElement.insertBefore(tablo, blok.nextSibling);
      tr.dataset.mkTarife = "1";
    });
  }

  /* ================= çalıştır ======================================= */
  /* `cache:"no-cache"` — dosya boru hattı her çalıştığında yenileniyor.
     Tarayıcı önbellekten okuyunca eski şemayla karşılaşıp panel boş kalıyordu. */
  fetch("yon_veri.json", { cache: "no-cache" })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (v) {
      if (!v) return;
      VERI = v;
      stilEkle();
      var dene = setInterval(function () {
        tabloBarlari();
        panelleriDonustur();
      }, 300);
      setTimeout(function () { clearInterval(dene); }, 15000);
      /* Panel dönüşümü GECİKMESİZ: akordeon paneli açıldığı anda grafiği
         değiştiriyoruz, yoksa kullanıcı grafiğin bir an görünüp kaybolduğunu
         görüyor. İşlem `data-mk-tarife` damgasıyla korunduğu için ucuz.
         Bar dönüşümü ise gecikmeli — `okunurluk.js` aynı hücreyi kuruyor,
         önce onun bitmesi gerekiyor. */
      var z = null;
      new MutationObserver(function () {
        panelleriDonustur();
        clearTimeout(z);
        z = setTimeout(tabloBarlari, 120);
      }).observe(document.body, { childList: true, subtree: true });
    })
    .catch(function () {});
})();
