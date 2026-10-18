/* ===================================================================
   GİRİŞ SAYFASI                                           (7. seans)

   Dashboard açılışta tam ekran bir giriş perdesiyle karşılıyor:
   İETT amblemi, projenin manşet cümlesi ve veri künyesi. SPACE / Enter /
   tıklama / kaydırma ile perde yukarı kayıp panoya geçiyor.

   NEDEN: Manşet metni panonun içindeyken (uzun başlık + paragraf + rozetler)
   ekranın üçte birini kaplıyor ve her bölüme inerken göz yoruyordu. Metin
   yanlış değil — yeri yanlıştı. Anlatı girişe, panoya sayılar kaldı.

   ⚠️ Arka plan görseli DIŞARIDAN ÇEKİLMİYOR. Pano çevrimdışı da açılabilmeli
   (Bölüm 9: "kendi kendine yeter"). Boğaz silueti elle çizilmiş SVG.
   =================================================================== */
(function () {
  if (document.getElementById("mk-giris")) return;

  /* Panodaki manşet bloğu: etiket + H1 + paragraf + amblem.
     Metni buradan alıp girişe taşıyor, sonra bloğu gizliyoruz. */
  function mansetBul() {
    var etiket = [].slice.call(document.querySelectorAll("div,span,p")).find(function (e) {
      return e.children.length === 0 && /MANŞET BULGU/i.test(e.textContent || "");
    });
    if (!etiket) return null;
    var n = etiket.parentElement;
    for (var i = 0; i < 6 && n && n.tagName !== "BODY"; i++) {
      if (n.querySelector("h1")) return n;
      n = n.parentElement;
    }
    return null;
  }

  var SILUET =
    '<svg class="mk-g-siluet" viewBox="0 0 1600 300" preserveAspectRatio="xMidYMax slice" ' +
    'xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<defs>' +
        '<linearGradient id="mkTepe" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0" stop-color="#141922"/><stop offset="1" stop-color="#0a0d12"/>' +
        '</linearGradient>' +
        '<linearGradient id="mkSu" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0" stop-color="#0d1520" stop-opacity=".95"/>' +
          '<stop offset="1" stop-color="#070a0e"/>' +
        '</linearGradient>' +
      '</defs>' +
      /* uzak tepeler */
      '<path fill="url(#mkTepe)" opacity=".55" d="M0 214 L120 196 L240 208 L360 184 ' +
        'L470 200 L560 178 L660 194 L760 176 L880 192 L1000 172 L1120 190 L1240 174 ' +
        'L1360 192 L1480 178 L1600 196 L1600 300 L0 300 Z"/>' +
      /* SÜLEYMANİYE benzeri camii — kubbe + 4 minare */
      '<g fill="#161c26" opacity=".92">' +
        '<rect x="150" y="212" width="4" height="70"/><rect x="176" y="206" width="4" height="76"/>' +
        '<path d="M150 212 l2-26 2 26z"/><path d="M176 206 l2-28 2 28z"/>' +
        '<rect x="252" y="212" width="4" height="70"/><rect x="278" y="206" width="4" height="76"/>' +
        '<path d="M252 212 l2-26 2 26z"/><path d="M278 206 l2-28 2 28z"/>' +
        '<path d="M168 236 q48-56 96 0 z"/>' +
        '<path d="M186 224 q30-34 60 0 z"/>' +
        '<rect x="162" y="234" width="108" height="48"/>' +
      "</g>" +
      /* BOĞAZ KÖPRÜSÜ — iki kule + askı halatları */
      '<g stroke="#1b2430" fill="none" opacity=".95">' +
        '<path d="M600 250 L1080 250" stroke-width="3"/>' +
        '<path d="M660 250 L660 150 M1020 250 L1020 150" stroke-width="5"/>' +
        '<path d="M660 156 Q840 250 1020 156" stroke-width="2.5"/>' +
        '<path d="M600 250 Q630 214 660 156 M1020 156 Q1050 214 1080 250" stroke-width="2"/>' +
        '<g stroke-width="1.2" opacity=".8">' +
          '<path d="M700 250 V186 M740 250 V206 M780 250 V220 M820 250 V228 ' +
                  'M860 250 V228 M900 250 V220 M940 250 V206 M980 250 V186"/>' +
        "</g>" +
      "</g>" +
      /* KIZ KULESİ */
      '<g fill="#161c26" opacity=".92">' +
        '<rect x="1290" y="238" width="26" height="44"/>' +
        '<rect x="1298" y="212" width="10" height="28"/>' +
        '<path d="M1298 212 l5-16 5 16z"/><path d="M1303 196 v-10"/>' +
      "</g>" +
      /* su */
      '<rect x="0" y="250" width="1600" height="50" fill="url(#mkSu)"/>' +
      '<g stroke="#2a3a4d" stroke-width="1" opacity=".35">' +
        '<path d="M120 262 h90 M340 270 h130 M700 264 h160 M1080 272 h120 M1380 262 h110"/>' +
      "</g>" +
    "</svg>";

  /* Manşet cümlesinin vurgulu parçasını ayırır.
     Önce uzun tire aranıyor — cümlenin tasarımı "kurulum — VURGU" biçiminde
     ("Sorun kaç otobüs olduğu değil — hangi saatte, hangi yöne gittiği").
     Tire yoksa son virgülden bölünüyor (eski cümle biçimi için yedek). */
  function vurgula(metin) {
    if (metin.indexOf("—") >= 0) {
      return metin.replace(/—\s*(.+)$/, function (t, son) {
        return '— <em>' + son + "</em>";
      });
    }
    return metin.replace(/,\s*([^,]+)$/, function (t, son) {
      return ', <em>' + son + "</em>";
    });
  }

  function kur() {
    stil();                       /* güvence: perde her hâlükârda stilli açılsın */
    var manset = mansetBul();

    var etiketMetin = "İETT ARZ-TALEP ANALİZİ";
    var baslik = "İstanbul otobüs sisteminde kaynak yetersiz değil, yanlış dağılmış.";
    var paragraf = "";
    if (manset) {
      var h1 = manset.querySelector("h1");
      var pp = manset.querySelector("p");
      if (h1 && h1.textContent.trim()) baslik = h1.textContent.trim();
      if (pp && pp.textContent.trim()) paragraf = pp.textContent.trim();
    }

    var vurgulu = vurgula(baslik);

    var g = document.createElement("div");
    g.id = "mk-giris";
    g.innerHTML =
      '<div class="mk-g-fon"></div>' + SILUET +
      '<div class="mk-g-ic">' +
        '<img class="mk-g-amblem" src="iett-amblem.png" alt="İETT" ' +
        'onerror="this.style.display=\'none\'">' +
        '<div class="mk-g-etiket">' + etiketMetin + "</div>" +
        "<h1>" + vurgulu + "</h1>" +
        (paragraf ? '<p class="mk-g-p">' + paragraf + "</p>" : "") +
        '<div class="mk-g-kunye">' +
          '<span><b>TALEP</b>İBB Açık Veri · Ekim 2024</span>' +
          '<span><b>YÖN</b>İETT kart basış · Ağustos 2026</span>' +
          '<span><b>ARZ</b>İETT SOAP API · 2026 tarifesi</span>' +
        "</div>" +
      "</div>" +
      '<button class="mk-g-devam" type="button">' +
        '<span class="mk-g-tus">space</span>' +
        '<span class="mk-g-yaz">panoya geç</span>' +
        '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" ' +
        'stroke="currentColor" stroke-width="2" stroke-linecap="round" ' +
        'stroke-linejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>' +
      "</button>";
    document.body.appendChild(g);

    /* ⚠️ METİN GEÇ DÜZELİYOR — MANŞET HEMEN GİZLENMEZ.
       `manset.js` başlığı ve paragrafı sonradan yeniden yazıyor (paketlenmiş
       şablondaki ham metin kendi rakamlarıyla çelişiyordu, Bölüm 9 madde 8).
       Erken okuyunca girişe cümlenin TERS hâli düşüyordu:
         ham     → "kaynak yanlış dağılmış değil, yetersiz"
         düzeltilmiş → "kaynak yetersiz değil, yanlış dağılmış"
       Bu yüzden metin bir süre izleniyor; değiştikçe giriş güncelleniyor,
       manşet ancak metin oturduktan sonra gizleniyor. */
    var h1g = g.querySelector("h1"), pg = g.querySelector(".mk-g-p");
    function metniTazele() {
      var m = mansetBul();
      if (!m) return;
      var yh = m.querySelector("h1"), yp = m.querySelector("p");
      if (yh && yh.textContent.trim()) h1g.innerHTML = vurgula(yh.textContent.trim());
      if (yp && yp.textContent.trim()) {
        if (!pg) {
          pg = document.createElement("p");
          pg.className = "mk-g-p";
          h1g.parentNode.insertBefore(pg, h1g.nextSibling);
        }
        pg.textContent = yp.textContent.trim();
      }
    }
    var tazele = 0;
    var tzm = setInterval(function () {
      metniTazele();
      if (++tazele > 16) {                 /* ~3,2 sn sonra metin oturmuş sayılır */
        clearInterval(tzm);
        var m = mansetBul();
        if (m) m.style.display = "none";   /* pano artık sayılarla başlıyor */
      }
    }, 200);

    var kapandi = false;
    function kapat() {
      if (kapandi) return;
      kapandi = true;
      g.classList.add("mk-g-kapali");
      document.body.classList.remove("mk-g-kilit");
      /* geçiş bitince DOM'dan çıkar — arkadaki tıklamaları engellemesin */
      setTimeout(function () { if (g.parentNode) g.parentNode.removeChild(g); }, 900);
      window.removeEventListener("keydown", tus, true);
      window.removeEventListener("wheel", teker, { passive: true });
    }
    function tus(e) {
      if ([" ", "Spacebar", "Enter", "ArrowDown", "PageDown", "Escape"].indexOf(e.key) < 0) return;
      e.preventDefault();
      kapat();
    }
    function teker(e) { if (e.deltaY > 0) kapat(); }

    document.body.classList.add("mk-g-kilit");
    window.addEventListener("keydown", tus, true);
    window.addEventListener("wheel", teker, { passive: true });
    g.addEventListener("click", kapat);
    /* dokunmatik: yukarı sürükleme */
    var y0 = null;
    g.addEventListener("touchstart", function (e) { y0 = e.touches[0].clientY; }, { passive: true });
    g.addEventListener("touchmove", function (e) {
      if (y0 !== null && y0 - e.touches[0].clientY > 30) kapat();
    }, { passive: true });
  }

  function stil() {
    if (document.getElementById("mk-giris-stil")) return;
    var st = document.createElement("style");
    st.id = "mk-giris-stil";
    st.textContent = [
      "body.mk-g-kilit{overflow:hidden}",
      "#mk-giris{position:fixed;inset:0;z-index:9999;overflow:hidden;",
      "background:radial-gradient(120% 90% at 50% 8%,#141a24 0%,#0a0d12 55%,#06080b 100%);",
      "display:flex;flex-direction:column;align-items:center;justify-content:center;",
      "cursor:pointer;transition:transform .8s cubic-bezier(.76,0,.24,1),opacity .8s ease}",
      "#mk-giris.mk-g-kapali{transform:translateY(-100%);opacity:0}",

      /* kırmızı sıcaklık — amblemin arkasından yayılıyor */
      ".mk-g-fon{position:absolute;inset:0;pointer-events:none;",
      "background:radial-gradient(46% 34% at 50% 30%,rgba(237,28,36,.16) 0%,transparent 68%)}",

      ".mk-g-siluet{position:absolute;left:0;right:0;bottom:0;width:100%;height:46vh;",
      "min-height:220px;pointer-events:none;opacity:.9}",

      ".mk-g-ic{position:relative;z-index:2;max-width:820px;padding:0 32px;text-align:center;",
      "animation:mkGiris .9s cubic-bezier(.16,1,.3,1) both}",
      "@keyframes mkGiris{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}",

      ".mk-g-amblem{height:132px;width:auto;display:block;margin:0 auto 26px;",
      "filter:drop-shadow(0 14px 40px rgba(0,0,0,.65)) saturate(1.15)}",
      ".mk-g-etiket{font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:.28em;",
      "color:#8b9099;margin-bottom:18px}",
      "#mk-giris h1{margin:0;font-size:clamp(28px,4.4vw,50px);line-height:1.14;",
      "font-weight:600;letter-spacing:-.025em;color:#f3f4f6;text-wrap:balance}",
      "#mk-giris h1 em{font-style:normal;color:#ed1c24}",
      ".mk-g-p{margin:22px auto 0;max-width:62ch;font-size:15px;line-height:1.72;",
      "color:#a9aeb9;text-wrap:pretty}",

      ".mk-g-kunye{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-top:34px}",
      ".mk-g-kunye span{display:inline-flex;align-items:center;gap:8px;font-size:11.5px;",
      "color:#a9aeb9;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.09);",
      "border-radius:20px;padding:7px 14px;backdrop-filter:blur(6px)}",
      ".mk-g-kunye b{font-family:'IBM Plex Mono',monospace;font-size:9px;letter-spacing:.14em;",
      "color:#6d727d;font-weight:500}",

      ".mk-g-devam{position:absolute;left:50%;bottom:38px;transform:translateX(-50%);z-index:3;",
      "display:flex;align-items:center;gap:11px;background:transparent;border:0;cursor:pointer;",
      "color:#8b9099;font:inherit;font-size:12.5px;padding:10px 16px;border-radius:12px;",
      "transition:color .18s ease,background .18s ease;",
      "animation:mkGirisAlt 1.1s .5s cubic-bezier(.16,1,.3,1) both}",
      "@keyframes mkGirisAlt{from{opacity:0;transform:translate(-50%,14px)}",
      "to{opacity:1;transform:translate(-50%,0)}}",
      ".mk-g-devam:hover{color:#f3f4f6;background:rgba(255,255,255,.05)}",
      ".mk-g-tus{font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:.1em;",
      "text-transform:uppercase;border:1px solid rgba(255,255,255,.18);border-radius:6px;",
      "padding:3px 9px;color:#c8ccd3}",
      ".mk-g-devam svg{animation:mkOk 1.9s ease-in-out infinite}",
      "@keyframes mkOk{0%,100%{transform:translateY(0);opacity:.55}",
      "50%{transform:translateY(5px);opacity:1}}",

      "@media(max-width:640px){.mk-g-amblem{height:96px;margin-bottom:20px}",
      ".mk-g-p{font-size:14px}.mk-g-kunye{gap:7px}}",
      "@media(prefers-reduced-motion:reduce){#mk-giris,.mk-g-ic,.mk-g-devam,",
      ".mk-g-devam svg{animation:none;transition:opacity .2s ease}}"
    ].join("");
    document.head.appendChild(st);
  }

  stil();
  /* Pano React ile çizildiği için manşet hazır olana kadar bekle; gelmezse
     yine de girişi kur (metin yedeğiyle). */
  var dene = 0;
  var t = setInterval(function () {
    if (mansetBul() || ++dene > 24) { clearInterval(t); kur(); }
  }, 120);
})();
