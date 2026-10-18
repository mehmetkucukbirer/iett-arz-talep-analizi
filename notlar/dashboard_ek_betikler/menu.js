/* ===================================================================
   HAMBURGER MENÜ
   Soldaki sabit paneli açılır-kapanır hale getirir ve menü öğelerini
   biraz toparlar. Paketlenmiş şablona dokunmaz — mevcut <aside>'ı
   bulup üstüne davranış ve stil ekler.
   =================================================================== */
(function () {
  var ANAHTAR = "mk-menu-acik";

  function kur() {
    var aside = document.querySelector("aside");
    var nav = aside && aside.querySelector("nav");
    if (!aside || !nav || document.getElementById("mk-burger")) return false;

    /* --- stiller --- */
    var st = document.createElement("style");
    st.textContent = [

      /* hamburger düğmesi */
      "#mk-burger{position:fixed;top:14px;left:14px;z-index:60;width:38px;height:38px;",
      "display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;",
      "border:1px solid var(--kenar);border-radius:10px;background:var(--surface);",
      "cursor:pointer;padding:0;transition:background .15s,border-color .15s}",
      "#mk-burger:hover{border-color:var(--kritik)}",
      "#mk-burger i{display:block;width:16px;height:1.5px;background:var(--ink);",
      "border-radius:2px;transition:transform .22s ease,opacity .18s ease}",
      "body:not(.mk-kapali) #mk-burger i:nth-child(1){transform:translateY(5.5px) rotate(45deg)}",
      "body:not(.mk-kapali) #mk-burger i:nth-child(2){opacity:0}",
      "body:not(.mk-kapali) #mk-burger i:nth-child(3){transform:translateY(-5.5px) rotate(-45deg)}",

      /* menü öğeleri */
      "aside nav{display:flex;flex-direction:column;gap:2px}",
      "aside nav a{position:relative;border-radius:9px!important;padding:9px 12px!important;",
      "transition:background .14s,color .14s}",
      "aside nav a:hover{background:var(--yuksek)!important;color:var(--ink)!important}",
      "aside nav a.mk-aktif{background:var(--yuksek)!important;color:var(--ink)!important;font-weight:600}",
      "aside nav a.mk-aktif::before{content:'';position:absolute;left:0;top:9px;bottom:9px;",
      "width:2.5px;border-radius:2px;background:var(--kritik)}",

      /* logo alanı hamburger'e yer açsın */
      "aside > :first-child{padding-left:48px}",

      /* dar ekran: panel üste biner */
      "@media(max-width:900px){aside{position:fixed!important;top:0;left:0;bottom:0;z-index:55;",
      "overflow-y:auto;background:var(--surface);border-right:1px solid var(--kenar);",
      "box-shadow:0 0 40px rgba(0,0,0,.35)}}"
    ].join("");
    document.head.appendChild(st);

    /* --- düğme --- */
    /* Paneli aç/kapat.
       Not: margin/opacity/transform uygulamanın kendi stilleri tarafından
       eziliyor (inline !important bile tutmuyor). Deneyerek bulundu:
       güvenilir çalışan tek özellik `display`. O yüzden animasyon yok. */
    var ana = aside.nextElementSibling;          /* <main> */

    function uygula(kapali) {
      if (kapali) aside.style.setProperty("display", "none", "important");
      else aside.style.removeProperty("display");
      /* menü kapalıyken içerik hamburger'in altına girmesin */
      if (ana) {
        if (kapali) ana.style.setProperty("padding-left", "58px", "important");
        else ana.style.removeProperty("padding-left");
      }
      document.body.classList.toggle("mk-kapali", kapali);
    }

    /* hamburger, panelin logosunun üstüne binmesin (CSS kuralı eziliyor) */
    var logo = aside.firstElementChild;
    if (logo) logo.style.setProperty("padding-left", "46px", "important");

    var b = document.createElement("button");
    b.id = "mk-burger";
    b.setAttribute("aria-label", "Menüyü aç/kapat");
    b.innerHTML = "<i></i><i></i><i></i>";
    b.onclick = function () {
      var kapali = !document.body.classList.contains("mk-kapali");
      uygula(kapali);
      try { localStorage.setItem(ANAHTAR, kapali ? "0" : "1"); } catch (e) {}
    };
    document.body.appendChild(b);

    /* dar ekranda varsayılan kapalı, geniş ekranda kullanıcının tercihi */
    var tercih = null;
    try { tercih = localStorage.getItem(ANAHTAR); } catch (e) {}
    uygula(tercih === null ? window.innerWidth <= 900 : tercih === "0");

    /* --- kaydırınca aktif bölümü işaretle --- */
    var baglar = [].slice.call(nav.querySelectorAll('a[href^="#"]'));
    var bolumler = baglar.map(function (a) {
      return document.getElementById(a.getAttribute("href").slice(1));
    });
    function isaretle() {
      var y = window.scrollY + 140, aktif = 0;
      bolumler.forEach(function (s, i) { if (s && s.offsetTop <= y) aktif = i; });
      baglar.forEach(function (a, i) { a.classList.toggle("mk-aktif", i === aktif); });
    }
    addEventListener("scroll", isaretle, { passive: true });
    isaretle();

    /* dar ekranda bir bağlantıya tıklayınca menü kapansın */
    baglar.forEach(function (a) {
      a.addEventListener("click", function () {
        if (window.innerWidth <= 900) document.body.classList.add("mk-kapali");
      });
    });
    return true;
  }

  /* ==================================================================
     MANŞET BLOĞUNA İETT AMBLEMİ
     Sağdaki boşluğa büyük, soluk bir amblem koyar. Uygulama yeniden
     çizerse tekrar eklenir.
     ================================================================== */
  function amblem() {
    if (document.getElementById("mk-amblem")) return;

    /* "MANŞET BULGU" etiketinden yukarı çıkıp manşet bloğunu bul.
       Kök elemana yapışmamak için boyut sınırı: geniş ama kısa olan blok. */
    var etiket = [].slice.call(document.querySelectorAll("div,span,p")).find(function (e) {
      return e.children.length === 0 && /MANŞET BULGU/i.test(e.textContent || "");
    });
    if (!etiket) return;

    var manset = null, n = etiket;
    for (var i = 0; i < 6 && n; i++) {
      var r = n.getBoundingClientRect();
      if (r.width > 700 && r.height > 200 && r.height < 700) { manset = n; break; }
      n = n.parentElement;
    }
    if (!manset) return;

    if (getComputedStyle(manset).position === "static") manset.style.position = "relative";

    var img = document.createElement("img");
    img.id = "mk-amblem";
    img.src = "iett-amblem.png";
    img.alt = "İETT";
    /* Amblem dikey (291x540). Genişlikten boyutlandırınca bloğu taşıyordu;
       yüksekliğe göre ölçekleniyor, blok da taşmayı kesiyor. */
    /* right:%14 → metnin bittiği yer ile bloğun sağ kenarı arasındaki boşlukta
       kabaca ortalanıyor. Renk canlı kalsın diye opaklık yüksek + doygunluk artırıldı. */
    manset.style.overflow = "hidden";
    img.style.cssText = [
      "position:absolute", "right:14%", "top:50%", "transform:translateY(-50%)",
      "height:84%", "width:auto", "max-width:30%", "opacity:.9",
      "pointer-events:none", "user-select:none", "z-index:0",
      "filter:saturate(1.25) drop-shadow(0 8px 26px rgba(0,0,0,.5))"
    ].join(";");
    img.onerror = function () { img.remove(); };
    manset.appendChild(img);

    /* metin amblemin üstünde kalsın */
    [].slice.call(manset.children).forEach(function (c) {
      if (c !== img && getComputedStyle(c).position === "static") {
        c.style.position = "relative";
        c.style.zIndex = "1";
      }
    });
  }

  /* uygulama React ile çizildiği için hazır olana kadar dene */
  var dene = setInterval(function () { if (kur()) { amblem(); clearInterval(dene); } }, 300);
  setTimeout(function () { clearInterval(dene); }, 15000);

  /* yeniden çizimlerde amblemi geri koy */
  var z = null;
  new MutationObserver(function () {
    clearTimeout(z); z = setTimeout(amblem, 250);
  }).observe(document.body, { childList: true, subtree: true });
})();
