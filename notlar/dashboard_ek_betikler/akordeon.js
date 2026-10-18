/* ===================================================================
   HAT DETAY AKORDEONU
   Tablodaki bir satıra tıklandığında o hattın 24 saatlik profilini VE
   hangi saatte kaç sefer eklenmesi/azaltılması gerektiğini satırın
   hemen altında açar. Paketlenmiş şablona dokunmaz.
   =================================================================== */
(function () {
  var VERI = null, acikKod = null, acikGun = "WEEKDAYS";

  /* Yönlü doluluk (`yon_veri.json`, 14_yon_duzeltmesi.py üretir).
     `dashboard_veri.json` yalnızca YÖNSÜZ doluluk taşıyor; harita gidiş ve
     dönüşü ayrı renklendirebilsin diye bu dosya da okunuyor. Tarayıcı
     zaten önbellekte tutuyor (yon.js de aynı dosyayı çekiyor).
     Yoksa harita yönsüz değere düşer — sessizce çalışmaya devam eder. */
  var YONV = null;
  var yonVeriSozu = fetch("yon_veri.json", { cache: "no-cache" })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (v) { YONV = v; return v; })
    .catch(function () { return null; });

  var GUN_KOD = { WEEKDAYS: "I", SATURDAY: "C", SUNDAY: "P" };

  /* Bir hat+gün+saat için [gidiş, dönüş] anlık yolcu. Yönlü veri yoksa
     ikisi de yönsüz değere eşitlenir. */
  function yonluDoluluk(kod, gun, saat, yonsuz) {
    var d = YONV && YONV.detay && YONV.detay[kod] && YONV.detay[kod][GUN_KOD[gun]];
    if (!d) return [yonsuz, yonsuz];
    var r = null;
    d.forEach(function (a) { if (a[0] === saat) r = a; });
    if (!r) return [yonsuz, yonsuz];
    /* detay_alan: s,y,sf,e0,eG,eD,bG,bD,sentetik */
    return [r[4] == null ? r[3] : r[4], r[5] == null ? r[3] : r[5]];
  }

  fetch("dashboard_veri.json").then(function (r) { return r.json(); })
    .then(function (v) {
      VERI = v;
      /* Veri, sayfa çizildikten SONRA gelebiliyor. O durumda gözlemciyi
         tetikleyecek yeni bir DOM değişikliği olmadığı için sadeleştirme hiç
         çalışmıyordu. Veri gelince elle çağırıyoruz; tablo geç çizilirse diye
         kısa bir süre tekrar deniyoruz. */
      sadelestir();
      var kalan = 20;
      var t = setInterval(function () {
        sadelestir();
        if (--kalan <= 0) clearInterval(t);
      }, 400);
    });

  var say = function (n) {
    return n == null ? "—" : Number(n).toLocaleString("tr-TR");
  };
  var ond = function (n, b) {
    return n == null ? "—" : Number(n).toLocaleString("tr-TR",
      { minimumFractionDigits: b, maximumFractionDigits: b });
  };
  var ss = function (s) { return String(s).padStart(2, "0") + ":00"; };
  var say1 = function (v) {
    return v == null ? "—" : Number(v).toLocaleString("tr-TR",
      { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  /* Hat kodunu oku. Rozet metni ("· 3 saat daha") aynı hücrede olduğu için
     onu dışarıda bırakmak gerekiyor; bir kez bulunca satıra yazıp saklıyoruz. */
  function kodBul(tr) {
    /* ⚠️ ÖNBELLEĞE GÜVENİLMEZ. React tabloyu süzerken (arama kutusu, gün tipi
       düğmeleri) aynı <tr> elemanlarını geri dönüştürüp içeriğini değiştiriyor;
       satıra bir kez yazılan `mkKod` eski hatta ait kalıyordu. Sonuç: aramada
       "98KM" yazıp tıklayınca 41N'in paneli açılıyordu. Kod her seferinde
       hücreden yeniden okunuyor; `mkKod` yalnızca dışarıya bilgi olarak yazılıyor. */
    var td = tr.querySelector("td");
    if (!td) return null;
    var ham = td.textContent || "";
    var rz = td.querySelector("[data-mk-rozet]");
    if (rz) ham = ham.replace(rz.textContent, "");
    var k = ham.trim();
    if (VERI && VERI.hatlar && VERI.hatlar[k]) {
      if (tr.dataset) tr.dataset.mkKod = k;
      return k;
    }
    return null;
  }

  function kapat() {
    var v = document.querySelector("tr[data-mk-detay]");
    if (v) v.remove();
    acikKod = null;
  }

  /* --- o hattın önerileri: saat → {ek sefer, ek araç} --- */
  function artirOnerileri(kod) {
    return (VERI.oneri_artir || []).filter(function (r) { return r.h === kod; })
      .sort(function (a, b) { return a.s - b.s; });
  }
  function azaltOnerileri(kod, gun) {
    return (VERI.oneri_azalt || []).filter(function (r) {
      return r.h === kod && r.g === gun;
    }).sort(function (a, b) { return a.s - b.s; });
  }

  /* --- 24 saatlik sütun grafiği; önerili saatler etiketli --- */
  function grafik(g, kap, artirHar) {
    var W = 900, H = 205, sol = 42, sag = 10, ust = 24, alt = 26;
    var pw = W - sol - sag, ph = H - ust - alt;
    var deger = g.doluluk || [];
    var enb = Math.max(kap * 1.2, Math.max.apply(null, deger.map(function (x) {
      return x == null ? 0 : x;
    })) * 1.15, 10);
    var y = function (v) { return ust + ph - (v / enb) * ph; };
    var gen = pw / 24, kal = Math.min(22, gen * 0.6);
    var s = "";

    [0, kap].forEach(function (t) {
      var kritik = t === kap && kap > 0;
      s += '<line x1="' + sol + '" x2="' + (W - sag) + '" y1="' + y(t) + '" y2="' + y(t) +
           '" stroke="' + (kritik ? "var(--kritik)" : "var(--kenar)") +
           '" stroke-width="1"' + (kritik ? ' stroke-dasharray="4 4"' : "") + "/>";
      s += '<text x="' + (sol - 6) + '" y="' + (y(t) + 4) +
           '" text-anchor="end" font-size="10" fill="var(--muted)">' + say(t) + "</text>";
    });

    /* Çubuklar tabandan yukarı yükselerek girer: scaleY(0) → scaleY(1).
       transform-origin taban çizgisine sabitleniyor, yoksa ortadan büyürler.
       Saat sırasına göre kademeli gecikme → soldan sağa dalga etkisi.
       Etiketler de çubukla birlikte belirir. */
    var taban = y(0);
    for (var i = 0; i < 24; i++) {
      var d = deger[i];
      if (d == null) continue;
      var x = sol + i * gen + (gen - kal) / 2;
      var yy = y(d);
      var gec = 18 * i;                        /* ms — kademe */
      s += '<rect class="mk-cubuk" x="' + x + '" y="' + yy + '" width="' + kal +
           '" height="' + Math.max(taban - yy, 1) + '" rx="2" fill="' +
           (d > kap ? "var(--kritik)" : "var(--mavi)") +
           '" style="transform:scaleY(0);transform-origin:' + x.toFixed(1) + "px " +
           taban.toFixed(1) + "px;transition:transform .55s cubic-bezier(.22,1,.36,1) " +
           gec + 'ms"><title>' + ss(i) + " — " + say(Math.round(d)) + " anlık yolcu" +
           (g.sefer && g.sefer[i] != null ? " · " + say(g.sefer[i]) + " sefer" : "") +
           "</title></rect>";
      if (artirHar[i]) {                       /* önerili saatin üstüne +N */
        s += '<text class="mk-etiket" x="' + (x + kal / 2) + '" y="' + (yy - 6) +
             '" text-anchor="middle" font-size="10.5" font-weight="700" ' +
             'fill="var(--kritik)" style="opacity:0;transition:opacity .3s ease ' +
             (gec + 260) + 'ms">+' + artirHar[i].es + "</text>";
      }
    }
    for (var j = 0; j < 24; j += 2) {
      s += '<text x="' + (sol + j * gen + gen / 2) + '" y="' + (H - 8) +
           '" text-anchor="middle" font-size="10" fill="var(--muted)">' + j + "</text>";
    }
    return '<svg viewBox="0 0 ' + W + " " + H + '" style="width:100%;height:auto">' + s + "</svg>";
  }

  /* --- öneri tablosu ---
     Hizalama açıkça yazılıyor: dashboard'un kendi tablo stilleri yoksa
     başlıklarla hücreler kayıyor. İlk sütun sola, sayılar sağa. */
  function oneriTablosu(baslik, satirlar, tur) {
    if (!satirlar.length) return "";
    var TH = function (m, ilk) {
      return '<th style="text-align:' + (ilk ? "left" : "right") +
        ';padding:6px 10px;font-weight:550;white-space:nowrap">' + m + "</th>";
    };
    var TD = function (m, ilk, renk) {
      return '<td style="text-align:' + (ilk ? "left" : "right") +
        ";padding:6px 10px;white-space:nowrap" +
        (renk ? ";color:" + renk + ";font-weight:650" : "") + '">' + m + "</td>";
    };
    var basliklar = tur === "artir"
      ? ["Saat", "Yolcu", "Mevcut sefer", "Anlık yolcu", "Eklenecek sefer", "Gereken araç"]
      : ["Saat", "Yolcu", "Mevcut sefer", "Anlık yolcu", "Önerilen sefer", "Azaltılacak"];
    var bas = "<tr>" + basliklar.map(function (m, i) { return TH(m, i === 0); }).join("") + "</tr>";

    var govde = satirlar.map(function (r) {
      var son = tur === "artir"
        ? TD("+" + r.es, false, "var(--kritik)") + TD("+" + ond(r.ea, 1), false)
        : TD(say(r.os), false) + TD("−" + r.az, false, "var(--mavi)");
      return '<tr style="border-top:1px solid var(--kenar)">' +
        TD(ss(r.s), true) + TD(say(Math.round(r.y)), false) +
        TD(say(r.sf), false) + TD(ond(r.d, 1), false) + son + "</tr>";
    }).join("");

    return '<div style="margin-top:16px"><div style="font-size:12px;font-weight:650;' +
      'color:var(--ink);margin-bottom:7px">' + baslik + "</div>" +
      '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;' +
      'font-size:12px;font-variant-numeric:tabular-nums;table-layout:auto">' +
      '<thead style="color:var(--muted);font-size:10.5px;text-transform:uppercase;' +
      'letter-spacing:.03em">' + bas + "</thead><tbody>" + govde +
      "</tbody></table></div></div>";
  }

  function panel(kod) {
    var h = VERI.hatlar[kod], kap = (VERI.ozet && VERI.ozet.kapasite) || 110;
    var g = h[acikGun] || { doluluk: [], sefer: [], yolcu: [] };
    var toplam = (g.yolcu || []).reduce(function (a, b) { return a + (b || 0); }, 0);
    var sefer = (g.sefer || []).reduce(function (a, b) { return a + (b || 0); }, 0);

    var artir = acikGun === "WEEKDAYS" ? artirOnerileri(kod) : [];
    var azalt = azaltOnerileri(kod, acikGun);
    var artirHar = {};
    artir.forEach(function (r) { artirHar[r.s] = r; });

    var ekSefer = artir.reduce(function (a, r) { return a + r.es; }, 0);
    var enArac = artir.reduce(function (a, r) { return Math.max(a, r.ea || 0); }, 0);
    var azSefer = azalt.reduce(function (a, r) { return a + r.az; }, 0);

    var sekme = ["WEEKDAYS", "SATURDAY", "SUNDAY"].map(function (t) {
      var ad = { WEEKDAYS: "Hafta içi", SATURDAY: "Cumartesi", SUNDAY: "Pazar" }[t];
      var aktif = t === acikGun;
      return '<button data-mk-gun="' + t + '" style="border:1px solid ' +
        (aktif ? "var(--kritik)" : "var(--kenar)") + ";background:" +
        (aktif ? "var(--kritik)" : "transparent") + ";color:" +
        (aktif ? "#fff" : "var(--ink2)") +
        ';border-radius:7px;padding:5px 12px;font:inherit;font-size:12px;cursor:pointer">' +
        ad + "</button>";
    }).join("");

    var kutu = function (b, e, renk) {
      return '<div style="flex:1;min-width:112px"><div style="font-size:19px;font-weight:650;' +
        "color:" + (renk || "var(--ink)") + ';letter-spacing:-.02em">' + b + "</div>" +
        '<div style="font-size:11.5px;color:var(--ink2);margin-top:2px">' + e + "</div></div>";
    };

    /* özet cümle — hangi saatlerde sefer eklenmeli */
    var cumle;
    if (artir.length) {
      var saatler = artir.map(function (r) { return ss(r.s); }).join(" · ");
      cumle = '<div style="margin-top:14px;padding:10px 13px;border-radius:9px;' +
        'background:color-mix(in srgb, var(--kritik) 12%, transparent);' +
        'border-left:3px solid var(--kritik);font-size:12.5px;color:var(--ink)">' +
        "<b>Sefer eklenmesi gereken saatler:</b> " + saatler +
        ' <span style="color:var(--ink2)">— toplam ' + ekSefer +
        " ek sefer, en yoğun saatte " + ond(enArac, 1) + " ek araç</span></div>";
    } else if (acikGun === "WEEKDAYS") {
      cumle = '<div style="margin-top:14px;font-size:12.5px;color:var(--ink2)">' +
        "Bu hatta hafta içi hiçbir saatte kapasite aşımı yok.</div>";
    } else {
      cumle = '<div style="margin-top:14px;font-size:12.5px;color:var(--ink2)">' +
        "Sefer artırma önerisi yalnızca hafta içi için üretiliyor (gerçek ölçüm).</div>";
    }

    return '<div style="padding:18px 20px 20px;background:var(--yuksek);' +
      'border-left:3px solid var(--kritik)">' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-wrap:wrap">' +
        '<div><div style="font-size:15px;font-weight:650;color:var(--ink)">' + kod +
        ' <span style="font-weight:450;color:var(--ink2)">' + (h.ad || "") + "</span></div>" +
        '<div style="font-size:11.5px;color:var(--muted);margin-top:3px">' +
        (h.uzunluk ? h.uzunluk + " km" : "") +
        (h.sefer_suresi ? " · planlanan sefer süresi " + h.sefer_suresi + " dk" : "") +
        "</div></div>" +
        '<div style="display:flex;gap:6px">' + sekme + "</div>" +
      "</div>" +
      '<div style="display:flex;gap:22px;flex-wrap:wrap;margin:16px 0 4px">' +
        kutu(say(Math.round(toplam)), "günlük yolcu") +
        kutu(say(sefer), "günlük sefer") +
        kutu(ekSefer ? "+" + ekSefer : "—", "eklenecek sefer",
             ekSefer ? "var(--kritik)" : null) +
        kutu(azSefer ? "−" + azSefer : "—", "azaltılabilir sefer",
             azSefer ? "var(--mavi)" : null) +
      "</div>" +
      cumle +
      '<div style="margin-top:14px">' + grafik(g, kap, artirHar) + "</div>" +
      '<div style="font-size:11.5px;color:var(--muted);margin-top:6px">' +
      "Kırmızı sütunlar kapasitenin (" + kap + " kişi) üstünde · kesikli çizgi kapasite sınırı · " +
      "sütun üstündeki <b style=\"color:var(--kritik)\">+N</b> o saate eklenecek sefer sayısı." +
      (acikGun !== "WEEKDAYS" ? " ⚠️ Hafta sonu verisi sentetiktir, ölçüm değildir." : "") +
      "</div>" +
      oneriTablosu("Sefer eklenmesi gereken saatler", artir, "artir") +
      oneriTablosu("Sefer azaltılabilecek saatler", azalt, "azalt") +
      '<div style="margin-top:16px">' +
        '<button data-mk-harita="' + kod + '" style="border:1px solid var(--kenar);' +
        "background:none;color:var(--ink2);border-radius:9px;padding:8px 14px;font:inherit;" +
        'font-size:12.5px;cursor:pointer">🗺 Güzergâhı haritada göster</button>' +
        '<div class="mk-harita-kutu" style="margin-top:12px"></div>' +
      "</div>" +
      "</div>";
  }

  /* ==================================================================
     HARİTA — güzergâh + saatlik yoğunluk + duraktan durağa otobüs
     Leaflet ve güzergâh dosyası SADECE harita ilk açıldığında yüklenir
     (guzergahlar.json birkaç MB; sayfa açılışını yavaşlatmasın).
     ⚠️ Harita karoları internet ister; çevrimdışı çalışmaz.
     ================================================================== */
  var GUZ = null, leafletHazir = null;

  function leafletYukle() {
    if (leafletHazir) return leafletHazir;
    leafletHazir = new Promise(function (coz, red) {
      var css = document.createElement("link");
      css.rel = "stylesheet";
      css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(css);
      var js = document.createElement("script");
      js.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      js.onload = coz;
      js.onerror = function () { red(new Error("Leaflet yüklenemedi")); };
      document.head.appendChild(js);
    });
    return leafletHazir;
  }

  /* Yola oturtulmuş rota geometrisi (12_rota_yollari.py üretiyor).
     Dosya YOKSA sessizce null döner ve harita eski davranışına — duraktan
     durağa düz çizgi — devam eder. Yani betik hiç çalıştırılmasa da bozulmaz. */
  var ROTA = null, rotaDenendi = false;
  function rotaYukle() {
    if (rotaDenendi) return Promise.resolve(ROTA);
    rotaDenendi = true;
    return fetch("rota_yollari.json")
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (g) { ROTA = g; return g; })
      .catch(function () { return null; });
  }

  function guzergahYukle() {
    if (GUZ) return Promise.resolve(GUZ);
    return fetch("guzergahlar.json").then(function (r) {
      if (!r.ok) throw new Error("guzergahlar.json yok");
      return r.json();
    }).then(function (g) { GUZ = g; return g; });
  }

  function renkSkala(d, kap) {
    if (d == null) return "#9aa0ad";
    var t = Math.max(0, Math.min(1, d / (kap * 2)));
    var ara = [[0, [47, 111, 208]], [0.5, [232, 163, 61]], [1, [217, 43, 38]]];
    var a = ara[0], b = ara[1];
    for (var i = 0; i < ara.length - 1; i++)
      if (t >= ara[i][0] && t <= ara[i + 1][0]) { a = ara[i]; b = ara[i + 1]; }
    var p = (t - a[0]) / ((b[0] - a[0]) || 1);
    var c = a[1].map(function (x, i) { return Math.round(x + (b[1][i] - x) * p); });
    return "rgb(" + c[0] + "," + c[1] + "," + c[2] + ")";
  }

  function haritaAc(kod, kutu) {
    kutu.innerHTML = '<div style="padding:22px;color:var(--ink2);font-size:13px">' +
                     "Harita yükleniyor…</div>";
    Promise.all([leafletYukle(), guzergahYukle(), rotaYukle()]).then(function () {
      var yollar = GUZ[kod];
      if (!yollar || !yollar.G) {
        kutu.innerHTML = '<div style="padding:22px;color:var(--muted);font-size:13px">' +
          "Bu hat için güzergâh koordinatı yok.</div>";
        return;
      }
      haritaCiz(kod, kutu, yollar);
    }).catch(function (e) {
      kutu.innerHTML = '<div style="padding:22px;color:var(--muted);font-size:13px">' +
        "Harita açılamadı: " + e.message +
        " — harita karoları internet bağlantısı gerektirir.</div>";
    });
  }

  /* Durak noktaları ve ipuçları için stil. Leaflet'in kendi tooltip görünümü
     (beyaz kutu + oklu köşe) karanlık temayla çakışıyordu; tamamen yeniden
     yazıldı. Bir kez enjekte ediliyor. */
  function duraklarStil() {
    if (document.getElementById("mk-harita-stil")) return;
    var st = document.createElement("style");
    st.id = "mk-harita-stil";
    st.textContent = [
      ".mk-durak-nk{cursor:default;transition:r .12s ease}",
      ".leaflet-tooltip.mk-durak-ip,.leaflet-tooltip.mk-uc-ip{",
      "background:rgba(14,16,20,.94);border:1px solid rgba(255,255,255,.14);",
      "color:#f3f4f6;border-radius:7px;box-shadow:0 4px 16px rgba(0,0,0,.45);",
      "font:600 11.5px/1.25 system-ui,-apple-system,'Segoe UI',sans-serif;",
      "padding:5px 9px;white-space:nowrap}",
      ".leaflet-tooltip.mk-durak-ip::before,.leaflet-tooltip.mk-uc-ip::before{display:none}",
      /* uç duraklar: kalıcı etiket, biraz daha sakin */
      ".leaflet-tooltip.mk-uc-ip{background:rgba(14,16,20,.86);font-weight:700;",
      "font-size:10.5px;letter-spacing:.02em;text-transform:uppercase;",
      "border-color:rgba(255,255,255,.2)}",
      /* Leaflet'in varsayılan beyaz zoom düğmeleri karanlık temada göz alıyordu */
      ".leaflet-bar a{background:rgba(20,23,28,.92)!important;color:#e8eaed!important;",
      "border-color:rgba(255,255,255,.12)!important}",
      ".leaflet-bar a:hover{background:rgba(32,36,43,.95)!important}",
      ".leaflet-control-attribution{background:rgba(14,16,20,.7)!important;",
      "color:#8b9099!important;font-size:10px!important}",
      ".leaflet-control-attribution a{color:#a9aeb9!important}",
      /* --- yön seçici + değerler --- */
      ".mk-yon-cubuk{display:flex;align-items:center;gap:16px;flex-wrap:wrap;",
      "margin-top:12px;padding-top:12px;border-top:1px solid var(--kenar)}",
      ".mk-yon-sec{display:inline-flex;background:var(--yuksek);border:1px solid var(--kenar);",
      "border-radius:9px;padding:2px;gap:2px}",
      ".mk-yon-sec button{display:inline-flex;align-items:center;gap:6px;border:0;",
      "background:transparent;color:var(--ink2);font:inherit;font-size:12px;cursor:pointer;",
      "padding:6px 12px;border-radius:7px;transition:background .15s,color .15s}",
      ".mk-yon-sec button:hover{color:var(--ink)}",
      ".mk-yon-sec button.sec{background:var(--surface);color:var(--ink);font-weight:600;",
      "box-shadow:0 1px 3px rgba(0,0,0,.35)}",
      ".mk-yon-deger{display:flex;gap:18px;flex-wrap:wrap;margin-left:auto;",
      "font-size:12px;color:var(--ink2)}",
      ".mk-yon-deger span{display:inline-flex;align-items:center;gap:6px}",
      ".mk-yon-deger b{font-variant-numeric:tabular-nums;font-size:14px;color:var(--ink)}",
      ".mk-dg-not{font-family:'IBM Plex Mono',monospace;font-size:9.5px;",
      "letter-spacing:.12em;color:var(--muted)}",
      ".mk-yon-sec button{max-width:230px;overflow:hidden;text-overflow:ellipsis;",
      "white-space:nowrap}",
      /* gidiş düz, dönüş kesik — çizgideki ayrımın aynısı */
      ".mk-p{display:inline-block;width:16px;height:0;border-top:2.5px solid currentColor;",
      "opacity:.75;flex:0 0 auto}",
      ".mk-p-d{border-top-style:dashed}",
      ".mk-ip-yon{display:block;font-weight:400;font-size:9.5px;opacity:.6;",
      "text-transform:uppercase;letter-spacing:.08em;margin-top:2px}"
    ].join("");
    document.head.appendChild(st);
  }

  function haritaCiz(kod, kutu, yollar) {
    var h = VERI.hatlar[kod], kap = (VERI.ozet && VERI.ozet.kapasite) || 110;
    var g = h[acikGun] || { doluluk: [] };
    var saat = 8, durakNo = 0, oynat = null, otobusOynat = null;
    /* Hangi yön gösteriliyor: "G" | "D".
       "İki yön" seçeneği KALDIRILDI — iki rotayı üst üste çizmek haritayı
       kalabalıklaştırıyordu ve karşılaştırma zaten sağdaki iki sayıdan
       okunuyor. Tek seferde tek yön. */
    var yonSecim = "G";
    var yol = yollar.G;
    /* ⚠️ HTML şablonunda kullanıldığı için BURADA tanımlanmalı. Önce aşağıda,
       katmanlar kurulurken tanımlanmıştı; `var` hoisting sadece bildirimi
       yukarı taşır, değeri değil → şablon çalışırken `undefined` oluyordu ve
       harita "Cannot read properties of undefined (reading 'G')" ile açılmıyordu. */
    var yonAd = (YONV && YONV.kalkis_adi && YONV.kalkis_adi[kod]) || {};

    kutu.innerHTML =
      '<div class="mk-hrt" style="height:380px;border-radius:10px;overflow:hidden"></div>' +
      '<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-top:12px">' +
        '<button class="mk-saat-oynat" style="border:1px solid var(--kenar);background:none;' +
        'color:var(--ink2);border-radius:8px;padding:6px 12px;font:inherit;font-size:12px;' +
        'cursor:pointer">▶ Günü oynat</button>' +
        '<b class="mk-saat-yazi" style="font-size:19px;font-variant-numeric:tabular-nums;' +
        'min-width:70px">08:00</b>' +
        '<input type="range" class="mk-saat" min="0" max="23" value="8" ' +
        'style="flex:1;min-width:160px;accent-color:var(--kritik)">' +
        '<button class="mk-otobus" style="border:1px solid var(--kenar);background:none;' +
        'color:var(--ink2);border-radius:8px;padding:6px 12px;font:inherit;font-size:12px;' +
        'cursor:pointer">🚌 Otobüsü izle</button>' +
        '<button class="mk-canli" style="border:1px solid var(--kenar);background:none;' +
        'color:var(--ink2);border-radius:8px;padding:6px 12px;font:inherit;font-size:12px;' +
        'cursor:pointer">🔴 Canlı konumlar</button>' +
        '<button class="mk-trafik" style="border:1px solid var(--kenar);background:none;' +
        'color:var(--ink2);border-radius:8px;padding:6px 12px;font:inherit;font-size:12px;' +
        'cursor:pointer">🚦 Trafik</button>' +
      "</div>" +
      '<div class="mk-canli-not" style="margin-top:9px;font-size:12px;color:var(--muted)"></div>' +
      /* Alttaki durak gezgini (◀ ▶ + kaydırıcı) KALDIRILDI — duraklar artık
         haritada nokta olarak duruyor, adları da üstlerine gelince çıkıyor.
         Yerine saatlik doluluk skalası kondu: noktaların rengi buradan okunuyor. */
      /* Yön seçici + o saatteki iki yönün değeri. Renk skalası aynı kalıyor;
         iki yön kendi değerine göre ayrı renkleniyor. */
      '<div class="mk-yon-cubuk">' +
        '<div class="mk-yon-sec">' +
          '<button data-mk-rota="G" class="sec"><i class="mk-p mk-p-g"></i>' +
          (yonAd.G || "Gidiş") + "</button>" +
          '<button data-mk-rota="D"><i class="mk-p mk-p-d"></i>' +
          (yonAd.D || "Dönüş") + "</button>" +
        "</div>" +
        '<div class="mk-yon-deger">' +
          '<span>gidiş <b class="mk-dg-g">—</b></span>' +
          '<span>dönüş <b class="mk-dg-d">—</b></span>' +
          '<span class="mk-dg-not">kişi/sefer</span>' +
        "</div>" +
      "</div>" +
      '<div class="mk-lejant" style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;' +
      'margin-top:10px">' +
        '<span style="font-family:\'IBM Plex Mono\',monospace;font-size:9.5px;' +
        'letter-spacing:.12em;color:var(--muted)">KİŞİ / SEFER</span>' +
        '<span class="mk-skala" style="display:flex;align-items:center;gap:0;' +
        'border-radius:20px;overflow:hidden;height:8px;width:170px"></span>' +
        '<span style="font-size:11px;color:var(--muted);font-variant-numeric:tabular-nums">' +
        '0 <b style="color:var(--ink2);margin:0 4px">' + kap + '</b> ' + (kap * 2) + '+</span>' +
      "</div>" +
      '<p style="color:var(--muted);font-size:11.5px;margin-top:9px;line-height:1.55">' +
      "Renk <b>hat bazındadır, durak bazında değil</b> — İstanbulkart otobüste biniş durağını " +
      "kaydetmiyor. Otobüsün konumu gerçek GPS izi değil, duraklar arası ara değerdir." +
      "</p>";

    var S = function (s) { return kutu.querySelector(s); };
    var hrt = L.map(S(".mk-hrt"), { scrollWheelZoom: false });
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      maxZoom: 19, subdomains: "abcd",
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · &copy; CARTO'
    }).addTo(hrt);

    /* ==================== ROTA + DURAKLAR ====================
       Tasarım kararları (üç denemede oturdu):
       · ÇİZGİ renk TAŞIR — yoğunluk çizgide de görünsün. Altında koyu bir
         "kılıf" var (casing): açık harita zemininde çizginin kenarı belirsiz
         kalıyordu, kılıf onu her zeminde okunur yapıyor.
       · DURAK = BEYAZ dolu + çizgiyle aynı renkte halka. Metro haritalarının
         dili. Önce dolu renkli nokta denendi; çizgiyle aynı renk olduğu için
         çizginin içinde kayboluyordu.
       · GİDİŞ düz, DÖNÜŞ kesik çizgi — ikisi birlikte gösterildiğinde ayırt
         edilsin. Her biri KENDİ yoğunluğuna göre renkleniyor; gidiş ve dönüş
         doluluğu çoğu hatta belirgin farklı (Bölüm 6.13).
       · Duraklar uzakken seyreltiliyor (aşağıda) — 64 nokta yan yana gelince
         tek bir bant gibi görünüyordu.                                      */
    var yol_geo = (ROTA || {})[kod] || {};
    duraklarStil();

    var KAT = {};      /* yön → {kilif, cizgi, duraklar[]} */
    ["G", "D"].forEach(function (y) {
      if (!yollar[y]) return;
      /* guzergahlar.json [boylam, enlem, ad] · rota_yollari.json [boylam, enlem] */
      var kaynak = yol_geo[y] || yollar[y];
      var nk = kaynak.map(function (p) { return [p[1], p[0]]; });
      var kilif = L.polyline(nk, { color: "#0f1318", weight: 7, opacity: 0.22,
        lineJoin: "round", lineCap: "round" }).addTo(hrt);
      var cz = L.polyline(nk, { color: "#888", weight: 3.5, opacity: 0.95,
        dashArray: y === "D" ? "9 7" : null,
        lineJoin: "round", lineCap: "round" }).addTo(hrt);

      var noktalar = yollar[y].map(function (p, i) {
        var uc = i === 0 || i === yollar[y].length - 1;
        /* Halka rengi SABİT KOYU, doluluk rengi değil. Renkli halka açık
           harita zemininde de renkli çizginin üstünde de silik kalıyordu;
           yoğunluk bilgisi zaten çizgide. Nokta sadece "burada durak var"
           diyor ve her zeminde okunuyor. */
        var m = L.circleMarker([p[1], p[0]], {
          radius: uc ? 6.5 : 3.8, weight: uc ? 3 : 1.8,
          color: "#1b2029", fillColor: "#fff", fillOpacity: 1,
          className: "mk-durak-nk" + (uc ? " mk-uc-nk" : ""), mkUc: uc, mkYon: y
        }).addTo(hrt);
        m.bindTooltip((p[2] || "Durak " + (i + 1)) +
          '<span class="mk-ip-yon">' + (y === "G" ? "gidiş" : "dönüş") + "</span>", {
          direction: "top", offset: [0, -8], className: "mk-durak-ip", opacity: 1
        });
        if (uc) {
          /* Bazı güzergâhlarda son durağın adı boş geliyor; boş metinli
             kalıcı etiket hiç çizilmiyordu. Yedek: karşı yönün ilk durağı
             zaten bu yönün varış noktasıdır. */
          var ucAd = p[2] || (i === 0 ? (yonAd[y] || "") :
                              (yonAd[y === "G" ? "D" : "G"] || ""));
          m.bindTooltip(ucAd, { permanent: true,
            direction: i === 0 ? "right" : "left", offset: [i === 0 ? 11 : -11, 0],
            className: "mk-uc-ip", opacity: 1 });
        }
        m.on("mouseover", function () {
          m.setStyle({ radius: uc ? 8.5 : 5.4, weight: uc ? 4 : 2.4 }); m.bringToFront();
        });
        m.on("mouseout", function () {
          m.setStyle({ radius: uc ? 6.5 : 3.6, weight: uc ? 3.5 : 2 });
        });
        return m;
      });
      KAT[y] = { kilif: kilif, cizgi: cz, duraklar: noktalar };
    });

    var cizgi = ["G", "D"].filter(function (y) { return KAT[y]; })
      .map(function (y) { return KAT[y].cizgi; });
    var duraklar = (KAT.G || KAT.D).duraklar;

    hrt.fitBounds(cizgi[0].getBounds(), { padding: [34, 34] });
    setTimeout(function () {
      hrt.invalidateSize(); duraklariSeyrelt(); ucEtiketleriAc();
    }, 60);

    /* --- yakınlaştırmaya göre seyreltme ---
       Ekranda iki nokta arası en az 16 piksel kalsın; uç duraklar hep görünür.
       Görsel kalabalık eleman BOYUTUNDA değil ARALIĞINDA çözülür. */
    var MIN_PX = 16;
    function duraklariSeyrelt() {
      ["G", "D"].forEach(function (y) {
        if (!KAT[y]) return;
        var acikYon = yonSecim === y;
        var son = null;
        KAT[y].duraklar.forEach(function (m) {
          var uc = m.options.mkUc;
          var goster = acikYon;
          if (goster && !uc) {
            var pk = hrt.latLngToLayerPoint(m.getLatLng());
            if (son) {
              var dx = pk.x - son.x, dy = pk.y - son.y;
              goster = Math.sqrt(dx * dx + dy * dy) >= MIN_PX;
            }
            if (goster) son = pk;
          }
          if (goster && !hrt.hasLayer(m)) m.addTo(hrt);
          else if (!goster && hrt.hasLayer(m)) hrt.removeLayer(m);
        });
        [KAT[y].kilif, KAT[y].cizgi].forEach(function (c) {
          if (acikYon && !hrt.hasLayer(c)) c.addTo(hrt);
          else if (!acikYon && hrt.hasLayer(c)) hrt.removeLayer(c);
        });
        KAT[y].duraklar.forEach(function (m) {
          if (m.options.mkUc && hrt.hasLayer(m)) m.bringToFront();
        });
      });
    }
    hrt.on("zoomend", duraklariSeyrelt);
    /* Kalıcı uç etiketleri: Leaflet bunları katman eklenirken açıyor, ama
       katman `addTo` sırasında tooltip henüz bağlı olmadığı için ikinci uçta
       hiç çizilmiyordu. Elle açmak ikisini de garantiye alıyor. */
    function ucEtiketleriAc() {
      ["G", "D"].forEach(function (y) {
        if (!KAT[y]) return;
        KAT[y].duraklar.forEach(function (m) {
          if (!m.options.mkUc) return;
          if (hrt.hasLayer(m)) { m.openTooltip(); m.bringToFront(); }
          else m.closeTooltip();
        });
      });
    }

    var otobus = L.marker([yol[0][1], yol[0][0]], { zIndexOffset: 1000,
      icon: L.divIcon({ className: "", iconSize: [30, 30], iconAnchor: [15, 15],
        html: '<div style="width:30px;height:30px;border-radius:50%;background:#fff;' +
              "border:3px solid #d92b26;box-shadow:0 2px 10px rgba(0,0,0,.4);display:flex;" +
              'align-items:center;justify-content:center;font-size:15px">🚌</div>' }) });
    /* ⚠️ Otobüs BAŞLANGIÇTA HARİTAYA EKLENMİYOR. İlk durağın tam üstüne
       oturuyor ve hem uç durak noktasını hem kalıcı etiketini örtüyordu —
       bir uç belirgin, diğeri görünmez oluyordu. Yalnızca "Otobüsü izle"
       açıkken görünüyor. */

    function saatCiz() {
      var d = g.doluluk[saat];
      /* Trafik modunda rota çizgisi nötr griye döner. Aynı çizgi hem doluluğu
         hem trafiği anlatamaz — iki anlam üst üste binince ikisi de okunmaz. */
      /* Her yön KENDİ doluluğuna göre renkleniyor — çizgi de, duraklar da.
         Trafik modunda çizgi nötr griye döner: aynı çizgi hem doluluğu hem
         trafiği anlatamaz, iki anlam üst üste binince ikisi de okunmaz. */
      var iki = yonluDoluluk(kod, acikGun, saat, d);
      ["G", "D"].forEach(function (y, i) {
        if (!KAT[y]) return;
        var c = trafikModu ? "#98a2ad" : renkSkala(iki[i], kap);
        KAT[y].cizgi.setStyle({ color: c });   /* duraklara DOKUNULMUYOR — koyu halka sabit */
      });
      var yaz = function (s, v) {
        var e = S(s); if (!e) return;
        e.textContent = v == null ? "—" : say1(v);
        e.style.color = v > kap ? "var(--kritik)" : "var(--ink)";
      };
      yaz(".mk-dg-g", iki[0]);
      yaz(".mk-dg-d", iki[1]);
      S(".mk-saat-yazi").textContent = ss(saat);
    }
    function durakCiz(merkezle) {
      durakNo = Math.max(0, Math.min(yol.length - 1, durakNo));
      var p = yol[durakNo];
      otobus.setLatLng([p[1], p[0]]);
      /* Durak adı artık haritadaki noktanın kendi ipucunda; otobüs hangi durakta
         ise onun ipucu açılıyor. (Eski alt gezgin kaldırıldı.) */
      if (duraklar && duraklar[durakNo]) duraklar[durakNo].openTooltip();
      if (merkezle && !hrt.getBounds().contains([p[1], p[0]])) hrt.panTo([p[1], p[0]]);
    }
    function otobusDur() {
      clearInterval(otobusOynat); otobusOynat = null;
      S(".mk-otobus").textContent = "🚌 Otobüsü izle";
      if (hrt.hasLayer(otobus)) hrt.removeLayer(otobus);
      ucEtiketleriAc();
    }

    /* ⚠️ Öznitelik adı `data-mk-rota`; `data-mk-yon` KULLANILAMAZ — `yon.js`
       ANLIK YOLCU hücrelerini onunla damgalıyor, seçici 40 hücreyi yakalıyordu. */
    [].slice.call(kutu.querySelectorAll("[data-mk-rota]")).forEach(function (b) {
      b.onclick = function () {
        yonSecim = b.getAttribute("data-mk-rota");
        kutu.querySelectorAll("[data-mk-rota]").forEach(function (x) {
          x.className = x === b ? "sec" : "";
        });
        duraklariSeyrelt();
        ucEtiketleriAc();
      };
    });

    S(".mk-saat").oninput = function (e) {
      clearInterval(oynat); oynat = null;
      S(".mk-saat-oynat").textContent = "▶ Günü oynat";
      saat = +e.target.value; saatCiz();
    };
    S(".mk-saat-oynat").onclick = function () {
      if (oynat) { clearInterval(oynat); oynat = null; this.textContent = "▶ Günü oynat"; return; }
      this.textContent = "❚❚ Duraklat";
      oynat = setInterval(function () {
        saat = (saat + 1) % 24; S(".mk-saat").value = saat; saatCiz();
      }, 750);
    };
    S(".mk-otobus").onclick = function () {
      if (otobusOynat) { otobusDur(); return; }
      this.textContent = "❚❚ Durdur";
      if (!hrt.hasLayer(otobus)) otobus.addTo(hrt);
      otobusOynat = setInterval(function () {
        durakNo = (durakNo + 1) % yol.length; durakCiz(true);
      }, 850);
    };


    /* ---------------- CANLI ARAÇ KONUMLARI ----------------
       Tarayıcı İETT API'sine doğrudan bağlanamıyor (CORS engeli, ölçüldü).
       `11_canli_kopru.py` araya girip cevabı izinli başlıkla iletiyor.
       Köprü çalışmıyorsa katman kendini kapatır ve nedenini yazar.
       ⚠️ Konumlar ŞU ANA aittir, seçili saate değil. */
    var canliKatman = L.layerGroup().addTo(hrt), canliZaman = null;

    /* ÖLÇÜLDÜ (12 Ağu 2026): İETT anlık konum servisi DAKİKADA BİR tazeleniyor,
       yeni veri her dakikanın ~5. saniyesinde geliyor ve araçların hepsi birden
       güncelleniyor. 15 saniyede bir sormak 4 isteğin 3'ünü boşa harcıyordu —
       servisin kotası da bu yüzden doluyor (aşılınca "Rate limit exceeded").
       30 saniye: her tazelenmeyi yakalar, isteği yarıya indirir. */
    var TAZELEME = 30000;

    function canliCek() {
      var adresler = ["canli?hat=" + encodeURIComponent(kod),
                      "http://localhost:8770/canli?hat=" + encodeURIComponent(kod)];
      var dene = function (i) {
        if (i >= adresler.length) return Promise.reject(new Error("köprü yok"));
        return fetch(adresler[i]).then(function (r) {
          if (!r.ok) throw new Error("durum " + r.status);
          return r.json();
        }).catch(function () { return dene(i + 1); });
      };
      return dene(0);
    }

    /* --- aracın hangi yöne gittiğini bul ---
       ANA KAYNAK: API'nin `guzergahkodu` alanı yönü zaten taşıyor —
       "98_G_D7742" = hat _ YÖN _ güzergâh varyantı. Ortadaki harf G/D.
       Aynı harf `guzergahlar.json`'daki YON alanında da kullanılıyor, yani
       rota çizgisiyle birebir tutuyor. Köprü bunu `yonkod` diye iletiyor.

       YEDEK: köprünün eski sürümü `yonkod` göndermiyorsa aşağıdaki eski
       isim eşleştirme yöntemi devreye girer, katman çalışmaya devam eder.
       Ölçüldü (12 Ağu 2026, 49 hat / 286 araç): isim yöntemi varyant
       güzergâhlarda şaşırabiliyor (14R), harf şaşırmıyor. */
    function buyuk(t) { return (t || "").toLocaleUpperCase("tr").replace(/\s+/g, " ").trim(); }

    function yonKodundan(a) {
      var p = String(a.yonkod || a.guzergahkodu || "").split("_");
      var harf = (p.length > 2 ? p[1] : p[0] || "").toUpperCase();
      return (harf === "G" || harf === "D") ? harf : null;
    }

    function isimdenYon(a) {
      var hedef = buyuk(a.yon);
      if (!hedef) return null;
      var uc = {};
      ["G", "D"].forEach(function (y) {
        if (yollar[y] && yollar[y].length) uc[y] = buyuk(yollar[y][yollar[y].length - 1][2]);
      });
      for (var y in uc) {
        if (!uc[y]) continue;
        var k = uc[y].slice(0, 7);                    /* ilk kelime yeterli */
        if (hedef.indexOf(k) >= 0 || uc[y].indexOf(hedef.slice(0, 7)) >= 0) return y;
      }
      return null;
    }

    /* önce harf, tutmazsa isim; ikisi de yoksa null → nokta gri kalır */
    /* --- EN GÜVENİLİR YÖNTEM: aracın gerçekten nereye gittiği ---------------
       ÖLÇÜLDÜ (12 Ağu 2026): bazı hatlarda kaynak veride yön YOK. 98'de hafta
       içi 61 kalkışın 51'i tek bir varyant (98_G_D7742) altında; tarifede
       161 G / 15 D, gerçekleşen arşivde 43 G / 5 D. Bir hat 51 gidiş yapıp
       6 dönüş yapamaz — İETT gerçek servisi varyant kodunda tutuyor, G/D
       harfi güncellenmemiş. Hem isim eşleştirme hem harf bu yüzden şaşırıyor.

       Araç iki ölçüm arasında NEREYE gittiyse gerçek yön odur. Rotanın o
       noktadaki gidiş açısıyla karşılaştırıp hangisine yakınsa onu seçiyoruz. */
    var sonYon = {};        /* plaka -> hareketten belirlenmiş yön */

    function yonAcisi(p1, p2) {
      var dx = (p2[1] - p1[1]) * Math.cos(p1[0] * Math.PI / 180);
      return Math.atan2(dx, p2[0] - p1[0]) * 180 / Math.PI;
    }
    function aciFark(a, b) {
      var d = Math.abs(a - b) % 360;
      return d > 180 ? 360 - d : d;
    }
    function hareketYonu(a, o) {
      /* 60 metrenin altında yer değiştirmede açı gürültülü — karar verme */
      if (!o || o.m < 60) return null;
      var h = yonAcisi(o.p1, o.p2), en = null, enFark = 999;
      ["G", "D"].forEach(function (y) {
        if (!yollar[y]) return;
        var r = gidisAcisi(a, y);
        if (r == null) return;
        var f = aciFark(h, r);
        if (f < enFark) { enFark = f; en = y; }
      });
      /* iki yöne de benzemiyorsa (dolambaçlı kesim, GPS gürültüsü) susuyoruz */
      return enFark < 60 ? en : null;
    }

    function yonBelirle(a) { return yonKodundan(a) || isimdenYon(a); }

    /* aracın bulunduğu noktada rotanın gidiş açısı (0 = kuzey, saat yönünde) */
    function gidisAcisi(a, yon) {
      var nk = yollar[yon];
      if (!nk || nk.length < 2) return null;
      var enYakin = 0, enKisa = Infinity;
      for (var i = 0; i < nk.length; i++) {
        var dx = (nk[i][0] - a.boylam) * Math.cos(a.enlem * Math.PI / 180);
        var dy = nk[i][1] - a.enlem;
        var d = dx * dx + dy * dy;
        if (d < enKisa) { enKisa = d; enYakin = i; }
      }
      var i0 = Math.min(enYakin, nk.length - 2);
      var p1 = nk[i0], p2 = nk[i0 + 1];
      var ddx = (p2[0] - p1[0]) * Math.cos(a.enlem * Math.PI / 180);
      var ddy = p2[1] - p1[1];
      return Math.atan2(ddx, ddy) * 180 / Math.PI;
    }

    /* Yön renkleri. Doğrulandı (OKLab ΔE ×100): normal görüş 40,6 · renk körlüğü 15,1
       — ikisi de eşiğin üstünde. Ayrıca rota renklerinden (mavi/turuncu/kırmızı)
       yeterince uzak, karışmıyorlar. Yön bilinmiyorsa nötr gri. */
    var YON_RENK = { G: "#16a34a", D: "#7c3aed", "?": "#6b7280" };

    /* ================= TRAFİK KATMANI — otobüs hızından türetilir =============
       Canlı konum servisi her araç için bir GPS zaman damgası veriyor. Aynı
       aracı iki ölçümde yakalayınca aradaki mesafeyi geçen süreye bölüyoruz:
       hız. Otobüsler böylece hareketli trafik sensörüne dönüşüyor — ticari
       trafik servisleri de aynı yöntemi kullanır ("yüzen araç verisi").

       İki sınır var, ikisi de ekranda yazılı:
       (a) sadece otobüs geçen yollarda ölçüm var, tüm şehir değil
       (b) durakta bekleyen araç da yavaştır. Durağa 45 m'den yakın ve yavaş
           ölçümler eleniyor; yine de duraktan yeni kalkan araç yavaş sayılabilir.
       ======================================================================= */
    var trafikModu = false;
    var izGecmis = {};        /* plaka -> son GPS konumu ve zamanı */
    var sonHiz = {};          /* plaka -> son ÖLÇÜLEN hız (km/sa) */
    var trafikParca = [];     /* ölçülmüş yol parçaları, 6 dakika yaşar */
    var sonCanli = null;      /* düğmeye basınca yeniden çizebilmek için */

    var TRAFIK_OMUR = 6 * 60 * 1000;   /* ölçüm ne kadar ekranda kalsın */
    var DURAK_ESIK = 45;               /* metre — bu kadar yakınsa durak şüphesi */

    /* Şehir içi otobüsün ölçülmüş ortalaması ~25 km/sa (Bölüm 6.9).
       Bantlar bunun etrafına kuruldu. */
    var TRAFIK_BANT = [
      { ust: 8,   renk: "#dc2626", ad: "durma"  },
      { ust: 16,  renk: "#f97316", ad: "ağır"   },
      { ust: 28,  renk: "#eab308", ad: "yavaş"  },
      { ust: 1e9, renk: "#16a34a", ad: "akıcı"  }
    ];
    function trafikBant(hiz) {
      for (var i = 0; i < TRAFIK_BANT.length; i++) {
        if (hiz < TRAFIK_BANT[i].ust) return TRAFIK_BANT[i];
      }
      return TRAFIK_BANT[TRAFIK_BANT.length - 1];
    }

    /* iki koordinat arası metre — haversine (dünyanın eğriliğini hesaba katar) */
    function metre(en1, bo1, en2, bo2) {
      var R = 6371000, r = Math.PI / 180;
      var de = (en2 - en1) * r, db = (bo2 - bo1) * r;
      var x = Math.sin(de / 2) * Math.sin(de / 2) +
              Math.cos(en1 * r) * Math.cos(en2 * r) * Math.sin(db / 2) * Math.sin(db / 2);
      return 2 * R * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
    }

    /* "2026-08-12 10:00:52" -> ms. Safari boşluklu biçimi çözemiyor, T koyuyoruz. */
    function zamanMs(s) {
      if (!s) return NaN;
      return Date.parse(String(s).replace(" ", "T"));
    }

    function durakUzaklik(a) {
      var en = Infinity;
      ["G", "D"].forEach(function (y) {
        var d = yollar[y];
        if (!d) return;
        for (var i = 0; i < d.length; i++) {
          var m = metre(a.enlem, a.boylam, d[i][1], d[i][0]);
          if (m < en) en = m;
        }
      });
      return en;
    }

    /* Aracın hızı: bir önceki ölçümle karşılaştır. GPS damgası değişmediyse
       servis eski kaydı döndürmüş demektir — ölçüm yapmıyoruz. */
    function aracAnahtar(a) { return a.plaka || a.enlem + "," + a.boylam; }

    function hizOlc(a) {
      var anahtar = aracAnahtar(a);
      var onc = izGecmis[anahtar];
      var simdi = { enlem: a.enlem, boylam: a.boylam, saat: a.saat, t: Date.now() };
      izGecmis[anahtar] = simdi;
      if (!onc || !a.saat || onc.saat === a.saat) return null;

      var dt = (zamanMs(a.saat) - zamanMs(onc.saat)) / 1000;
      if (!isFinite(dt) || dt <= 0) dt = (simdi.t - onc.t) / 1000;   /* yedek: duvar saati */
      if (dt < 8 || dt > 240) return null;          /* çok kısa ölçülemez, çok uzun güvenilmez */

      var m = metre(onc.enlem, onc.boylam, a.enlem, a.boylam);
      var hiz = m / dt * 3.6;
      if (hiz > 120) return null;                    /* GPS sıçraması */
      sonHiz[anahtar] = hiz;
      return { hiz: hiz, m: m, dt: dt,
               p1: [onc.enlem, onc.boylam], p2: [a.enlem, a.boylam] };
    }

    /* Trafik parçaları rota çizgisinin ALTINDA kalmalı, yoksa rotayı örter.
       Leaflet'te katman sırası "pane" ile veriliyor; 350 < overlayPane'in 400'ü. */
    hrt.createPane("mkTrafik");
    hrt.getPane("mkTrafik").style.zIndex = 350;
    var trafikKatman = L.layerGroup().addTo(hrt);

    function trafikCiz() {
      trafikKatman.clearLayers();
      if (!trafikModu) return;
      var simdi = Date.now();
      trafikParca = trafikParca.filter(function (p) { return simdi - p.t < TRAFIK_OMUR; });
      trafikParca.forEach(function (p) {
        /* eski ölçüm soluklaşır: ekrandaki resmin ne kadar taze olduğu görünsün */
        var yas = (simdi - p.t) / TRAFIK_OMUR;
        L.polyline([p.p1, p.p2], {
          pane: "mkTrafik", color: trafikBant(p.hiz).renk, weight: 12,
          opacity: 0.8 * (1 - yas * 0.7), lineCap: "round", interactive: false
        }).addTo(trafikKatman);
      });
    }

    function canliCiz(v) {
      sonCanli = v;
      canliKatman.clearLayers();
      var sayac = {}, olcum = 0, hizliNokta = 0;
      (v.araclar || []).forEach(function (a) {
        var o = hizOlc(a);

        /* Öncelik: gerçek hareket > güzergâh kodundaki harf > durak adı.
           Hareket ölçümü ancak aracın ikinci görülmesinde çıkar, o yüzden
           bulunan yön araç bazında hatırlanıyor. */
        var hy = hareketYonu(a, o);
        if (hy) sonYon[aracAnahtar(a)] = hy;
        var yon = sonYon[aracAnahtar(a)] || yonBelirle(a);
        var aci = yon ? gidisAcisi(a, yon) : null;

        /* Durakta bekleyen araç trafik sanılmasın: yakın VE yavaşsa kaydetme. */
        if (o && !(o.hiz < 10 && durakUzaklik(a) < DURAK_ESIK)) {
          o.t = Date.now();
          trafikParca.push(o);
          olcum++;
        }

        /* Trafik modunda nokta hızı, normalde yönü anlatır. Tek seferde tek
           anlam — yön zaten okla gösteriliyor, bilgi kaybolmuyor.
           Servis dakikada bir tazelendiği için turların yarısında yeni ölçüm
           gelmiyor; o turlarda aracın SON ölçülen hızı kullanılıyor, yoksa
           nokta bir sarıp bir yön rengine dönerdi. */
        var gHiz = o ? o.hiz : sonHiz[aracAnahtar(a)];
        var hizliCiz = trafikModu && gHiz != null;
        if (hizliCiz) hizliNokta++;
        var c = hizliCiz ? trafikBant(gHiz).renk : YON_RENK[yon || "?"];
        if (yon) sayac[yon] = (sayac[yon] || 0) + 1;

        var ok = aci == null ? "" :
          '<div style="position:absolute;left:50%;top:50%;width:0;height:0;' +
          "transform:translate(-50%,-50%) rotate(" + aci.toFixed(0) + "deg);\">" +
          '<div style="position:absolute;left:-3.5px;top:-15px;width:0;height:0;' +
          "border-left:3.5px solid transparent;border-right:3.5px solid transparent;" +
          "border-bottom:6px solid " + c + ';filter:drop-shadow(0 0 1.5px #fff)"></div></div>';

        L.marker([a.enlem, a.boylam], { zIndexOffset: 900,
          icon: L.divIcon({ className: "", iconSize: [26, 26], iconAnchor: [13, 13],
            html: '<div style="position:relative;width:26px;height:26px">' + ok +
                  '<div style="position:absolute;left:5px;top:5px;width:16px;height:16px;' +
                  "border-radius:50%;background:" + c + ";border:2.5px solid #fff;" +
                  'box-shadow:0 0 0 3px ' + c + '3d"></div></div>' }) })
          .addTo(canliKatman)
          .bindTooltip("<b>" + (a.plaka || "—") + "</b><br>→ " + (a.yon || "yön bilinmiyor") +
                       (o ? "<br><b>" + o.hiz.toFixed(0) + " km/sa</b> <span style='opacity:.7'>(" +
                            o.m.toFixed(0) + " m / " + o.dt.toFixed(0) + " sn)</span>"
                          : gHiz != null ? "<br><b>" + gHiz.toFixed(0) + " km/sa</b> " +
                            "<span style='opacity:.7'>(bir önceki ölçüm)</span>" : "") +
                       "<br><span style='opacity:.7'>" + (a.saat || "") + "</span>",
                       { direction: "top", offset: [0, -10] });
      });

      trafikCiz();

      /* Kırılım renkle DEĞİL, renk + yazıyla: renk körlüğünde de okunur kalsın */
      var kirilim = Object.keys(sayac).map(function (y) {
        var ad = yollar[y][yollar[y].length - 1][2] || y;
        return '<span style="white-space:nowrap"><i style="display:inline-block;width:9px;' +
          "height:9px;border-radius:50%;background:" + YON_RENK[y] +
          ';margin-right:5px;vertical-align:-1px"></i><b>' + sayac[y] + " araç</b> → " + ad +
          "</span>";
      }).join(' <span style="opacity:.4">·</span> ');

      var hareketli = Object.keys(sonYon).length;

      var trafikYazi = "";
      if (trafikModu) {
        var efsane = TRAFIK_BANT.map(function (b, i) {
          var alt = i === 0 ? 0 : TRAFIK_BANT[i - 1].ust;
          var aralik = i === TRAFIK_BANT.length - 1 ? alt + "+" : alt + "–" + b.ust;
          return '<span style="white-space:nowrap"><i style="display:inline-block;width:16px;' +
            "height:5px;border-radius:3px;background:" + b.renk +
            ';margin-right:5px;vertical-align:2px"></i>' + b.ad +
            ' <span style="opacity:.65">' + aralik + " km/sa</span></span>";
        }).join(' <span style="opacity:.4">·</span> ');

        trafikYazi =
          '<div style="margin-top:6px">' + efsane + "</div>" +
          '<div style="opacity:.8;margin-top:3px">' +
          (trafikParca.length
            ? "Yol renkleri <b>otobüslerin ölçülen hızından</b> geliyor — bu turda " +
              olcum + " yeni ölçüm, ekranda " + trafikParca.length + " parça. "
            : "Servis konumları <b>dakikada bir</b> tazeliyor; ölçüm için aracın iki kez " +
              "görülmesi gerekiyor — <b>ilk renkler 1–1,5 dakika içinde</b> çıkar. ") +
          "Yalnızca otobüs geçen yollarda veri var; durakta bekleyen araçlar elendi." +
          "</div>";
      }

      S(".mk-canli-not").innerHTML =
        '<span style="color:#16a34a;font-weight:650">● canlı ' + v.olcum + "</span> — " +
        "şu an yolda <b>" + v.adet + " araç</b>" +
        (kirilim ? ". " + kirilim : "") +
        '<div style="opacity:.8;margin-top:3px">' +
        (hareketli ? "Yön <b>" + hareketli + " araçta gerçek hareketten</b> ölçüldü. " : "") +
        (!trafikModu ? "Renk ve ok gidiş yönünü gösterir. "
          : hizliNokta ? "Nokta rengi aracın hızını, ok gidiş yönünü gösterir. "
          : "<b>Ölçüm bekleniyor</b> — noktalar şimdilik yön renginde. ") +
        "Bu konumlar bugüne aittir; yukarıda seçtiğin saate değil.</div>" +
        trafikYazi;
    }

    function canliDur() {
      clearInterval(canliZaman); canliZaman = null;
      canliKatman.clearLayers();
      trafikModu = false; trafikParca = []; izGecmis = {}; sonHiz = {}; sonYon = {};
      trafikKatman.clearLayers();
      S(".mk-trafik").textContent = "🚦 Trafik";
      saatCiz();
      S(".mk-canli").textContent = "🔴 Canlı konumlar";
      S(".mk-canli-not").innerHTML = "";
    }

    S(".mk-trafik").onclick = function () {
      trafikModu = !trafikModu;
      this.textContent = trafikModu ? "🚦 Trafiği kapat" : "🚦 Trafik";
      saatCiz();                                   /* rota rengi nötre dönsün/geri gelsin */
      /* Trafik canlı konumdan besleniyor; kapalıysa kendisi açar. */
      if (trafikModu && !canliZaman) S(".mk-canli").click();
      else if (sonCanli) canliCiz(sonCanli);
      else trafikCiz();
    };

    S(".mk-canli").onclick = function () {
      if (canliZaman) { canliDur(); return; }
      var btn = this;
      btn.textContent = "⏳ bağlanıyor…";
      canliCek().then(function (v) {
        btn.textContent = "❚❚ Canlıyı durdur";
        canliCiz(v);
        canliZaman = setInterval(function () {
          canliCek().then(canliCiz).catch(function () {});
        }, TAZELEME);
      }).catch(function () {
        btn.textContent = "🔴 Canlı konumlar";
        S(".mk-canli-not").innerHTML =
          '<span style="color:var(--uyari,#e8a33d)">Canlı konum köprüsü çalışmıyor.</span> ' +
          "Terminalde <code>python3 11_canli_kopru.py</code> çalıştırıp sayfayı " +
          "<b>localhost:8770</b> üzerinden aç. (Tarayıcı İETT API'sine doğrudan bağlanamıyor.)";
      });
    };

    saatCiz(); durakCiz();
  }

  /* Çubukları yükselt — panel DOM'a girdikten SONRA çağrılmalı, yoksa
     tarayıcı başlangıç durumunu hiç görmez ve geçiş oynamaz. */
  function animasyonBaslat(kap) {
    var calisti = false;
    function ac() {
      if (calisti) return;
      calisti = true;
      kap.querySelectorAll(".mk-cubuk").forEach(function (r) {
        r.style.transform = "scaleY(1)";
      });
      kap.querySelectorAll(".mk-etiket").forEach(function (t) {
        t.style.opacity = "1";
      });
    }
    /* İki kare bekle: tarayıcı başlangıç durumunu görmeden geçişi başlatmasın. */
    requestAnimationFrame(function () { requestAnimationFrame(ac); });
    /* Yedek: sekme görünmezken requestAnimationFrame durdurulur, animasyon hiç
       tetiklenmez ve çubuklar scaleY(0)'da kalırdı. Zamanlayıcı her koşulda çalışır. */
    setTimeout(ac, 90);
  }

  function ac(tr, kod) {
    kapat();
    var yeni = document.createElement("tr");
    yeni.setAttribute("data-mk-detay", kod);
    yeni.innerHTML = '<td colspan="' + tr.children.length + '" style="padding:0">' +
                     panel(kod) + "</td>";
    tr.parentNode.insertBefore(yeni, tr.nextSibling);
    animasyonBaslat(yeni);
    acikKod = kod;
    /* Otomatik kaydırma YOK: sayfa kayınca kullanıcı aynı noktaya tekrar
       tıkladığında başka satıra basmış oluyor, panel kapanmıyor sanıyor. */
  }

  /* ==================================================================
     TEKRAR EDEN HAT SATIRLARINI SADELEŞTİR
     Tablo "hat + saat" listesi olduğu için aynı hat birkaç kez geçiyor.
     İlk satır (liste zaten en kritikten sıralı) kalır, diğerleri gizlenir;
     ilk satıra "· N saat daha" rozeti eklenir. Detaylar zaten panelde.
     ================================================================== */
  function sadelestir() {
    if (!VERI) return;
    document.querySelectorAll("table tbody").forEach(function (tb) {
      var gorulen = {};
      [].slice.call(tb.children).forEach(function (tr) {
        if (tr.hasAttribute("data-mk-detay")) return;
        var td = tr.querySelector("td");
        if (!td) return;
        var kod = kodBul(tr);              /* rozet metnini dışarıda bırakır */
        if (!kod) return;

        if (gorulen[kod]) {                      /* tekrar → gizle, sayacı artır */
          tr.style.display = "none";
          tr.setAttribute("data-mk-gizli", "1");
          gorulen[kod].sayi++;
          var rz = gorulen[kod].tr.querySelector("[data-mk-rozet]");
          if (rz) rz.textContent = "· " + gorulen[kod].sayi + " saat daha";
          return;
        }
        gorulen[kod] = { tr: tr, sayi: 0 };
        if (!td.querySelector("[data-mk-rozet]")) {
          var s = document.createElement("span");
          s.setAttribute("data-mk-rozet", "1");
          s.style.cssText = "display:block;font-size:10px;color:var(--muted);" +
                            "font-weight:450;margin-top:2px;white-space:nowrap";
          td.appendChild(s);
        }
      });
    });
  }

  /* tablo her yeniden çizildiğinde tekrar uygula */
  var zaman = null;
  new MutationObserver(function () {
    clearTimeout(zaman);
    zaman = setTimeout(sadelestir, 120);
  }).observe(document.body, { childList: true, subtree: true });

  document.addEventListener("click", function (e) {
    if (!VERI) return;

    var hrtBtn = e.target.closest && e.target.closest("[data-mk-harita]");
    if (hrtBtn) {                                   /* haritayı aç/kapat */
      e.preventDefault(); e.stopPropagation();
      var kutu = hrtBtn.parentNode.querySelector(".mk-harita-kutu");
      if (kutu.dataset.acik) {
        kutu.innerHTML = ""; delete kutu.dataset.acik;
        hrtBtn.textContent = "🗺 Güzergâhı haritada göster";
      } else {
        kutu.dataset.acik = "1";
        hrtBtn.textContent = "🗺 Haritayı gizle";
        haritaAc(hrtBtn.getAttribute("data-mk-harita"), kutu);
      }
      return;
    }

    var gunBtn = e.target.closest && e.target.closest("[data-mk-gun]");
    if (gunBtn) {
      e.preventDefault(); e.stopPropagation();
      acikGun = gunBtn.getAttribute("data-mk-gun");
      var detay = document.querySelector("tr[data-mk-detay]");
      if (detay && detay.previousSibling) {
        detay.innerHTML = '<td colspan="' + detay.previousSibling.children.length +
                          '" style="padding:0">' + panel(acikKod) + "</td>";
        animasyonBaslat(detay);          /* gün tipi değişince de yükselsin */
      }
      return;
    }
    if (e.target.closest && e.target.closest("tr[data-mk-detay]")) return;

    var tr = e.target.closest && e.target.closest("tr");
    if (!tr || !tr.parentNode || tr.parentNode.tagName !== "TBODY") return;
    var kod = kodBul(tr);
    if (!kod) return;

    /* ⚠️ `stopPropagation` KALDIRILDI. Olay burada kesilince uygulamanın
       kendi satır seçimi hiç çalışmıyordu: "Hat incelemesi"nde arama kutusuna
       hat yazıp satıra tıklanınca üstteki PROFİL KARTI eski hatta kalıyordu.
       Akordeon paneli ile kartın güncellenmesi birbirini engellemiyor —
       ikisi de aynı tıklamayı görsün. */
    /* Kapatma kontrolü kardeş düğüme BAKMAZ: satır aralarına boşluk metni
       girdiğinde `nextSibling` detay satırı olmuyor, kontrol yanlış cevap
       veriyordu → panel kapanmak yerine kapanıp anında yeniden açılıyordu. */
    if (acikKod === kod && document.querySelector("tr[data-mk-detay]")) {
      kapat();
      return;
    }
    acikGun = "WEEKDAYS";
    ac(tr, kod);
  }, true);
})();
