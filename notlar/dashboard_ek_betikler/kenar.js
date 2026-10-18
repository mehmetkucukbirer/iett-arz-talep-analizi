/* ===================================================================
   KENAR ÇUBUĞU + AMBLEM + ARAMA KISAYOLU                  (7. seans)

   Paketlenmiş şablona DOKUNMAZ; mevcut yapının üstüne stil ve küçük
   davranışlar ekler. `menu.js` (hamburger) kaldırıldıktan sonra yazıldı.

   Yapılanlar
     1. Menü öğelerine hover + AKTİF durumu (kaydırdıkça kendiliğinden)
     2. Her öğenin altına tek satırlık SADE AÇIKLAMA — dashboard'u ilk kez
        gören biri "Değerlendirilemeyen" ne demek anlasın diye
     3. Uzun teknik kaynak metni katlandı ("Veri kaynakları" düğmesi) —
        menüde slogan gibi duruyordu, ama silinmedi: veri kaynağını beyan
        etmek raporun bir parçası
     4. ⭐ İETT amblemi geri getirildi (kodu `menu.js`'ten taşındı; o betik
        kaldırılınca amblem de kaybolmuştu)
     5. ⭐ "Hat incelemesi"nde arama kutusuna yazıp ENTER'a basınca ilk
        eşleşen hattın paneli doğrudan açılıyor — ayrıca tıklamaya gerek yok
   =================================================================== */
(function () {
  /* Menü öğesi → tek satırlık sade açıklama. Metin, konuyu hiç bilmeyen
     birinin anlayacağı dilde; jargon yok. */
  var ACIKLAMA = {
    "Genel bakış": "sistemin özeti",
    "Sefer artır": "otobüs eklenmesi gerekenler",
    "Sefer azalt": "boş giden seferler",
    "Hat incelemesi": "tek bir hattı ara",
    "Değerlendirilemeyen": "verisi yetersiz hatlar",
    "Yöntem ve kısıtlar": "sayılar nereden geliyor"
  };

  function el(tag, cls, metin) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (metin != null) e.textContent = metin;
    return e;
  }

  /* ------------------------------------------------------------------ */
  function stil() {
    if (document.getElementById("mk-kenar-stil")) return;
    var st = document.createElement("style");
    st.id = "mk-kenar-stil";
    st.textContent = [
      "aside{padding:22px 14px 16px!important;gap:0!important}",

      /* logo satırı menü öğeleriyle aynı sol hizada */
      "aside>:first-child{padding:0 10px 16px!important;margin-bottom:14px;",
      "border-bottom:1px solid var(--kenar)}",

      /* --- menü öğeleri --- */
      "aside nav{gap:2px!important}",
      "aside nav a{position:relative;font-size:13px!important;line-height:1.25;",
      "padding:9px 10px!important;border-radius:8px!important;",
      "transition:background .15s ease,color .15s ease}",
      "aside nav a>span:first-child{width:6px!important;height:6px!important;",
      "opacity:.5;transition:opacity .15s ease,transform .15s ease}",
      /* ⚠️ Açıklama metni DOM'a eleman olarak EKLENMİYOR, CSS ile üretiliyor.
         Sebep: `okunurluk.js` bölüm özetlerini yerleştirmek için "metni tam
         olarak SEFER AZALT olan, çocuğu olmayan eleman" arıyor. Menü metnini
         bir <span> içine sarınca o arama menü öğesini bölüm başlığı sanıp
         özet kutusunu MENÜNÜN İÇİNE koydu. Metin düğümüne dokunmuyoruz. */
      "aside nav a{flex-wrap:wrap}",
      "aside nav a::after{content:attr(data-mk-alt);flex-basis:100%;",
      "padding-left:16px;font-size:10.5px;line-height:1.3;color:var(--muted);",
      "transition:color .15s ease}",
      "aside nav a[data-mk-alt='']::after{display:none}",
      "aside nav a:hover{background:var(--yuksek);color:var(--ink)!important}",
      "aside nav a:hover>span:first-child{opacity:.85}",
      "aside nav a:hover::after{color:var(--ink2)}",
      "aside nav a.mk-aktif{background:var(--yuksek);color:var(--ink)!important}",
      "aside nav a.mk-aktif{font-weight:600}",
      "aside nav a.mk-aktif::after{color:var(--ink2);font-weight:400}",
      "aside nav a.mk-aktif>span:first-child{opacity:1;transform:scale(1.15)}",
      "aside nav a.mk-aktif::before{content:'';position:absolute;left:0;top:8px;bottom:8px;",
      "width:2.5px;border-radius:0 2px 2px 0;background:currentColor;opacity:.9}",

      /* --- alt blok --- */
      "aside>:last-child{gap:8px!important;padding-top:14px;",
      "border-top:1px solid var(--kenar)}",

      /* kaynak kutusu katlanır */
      ".mk-kaynak-dgm{width:100%;text-align:left;background:transparent;border:0;",
      "font:inherit;font-size:10.5px;color:var(--muted);cursor:pointer;padding:2px 12px;",
      "display:flex;align-items:center;justify-content:space-between;gap:8px;",
      "transition:color .15s ease}",
      ".mk-kaynak-dgm:hover{color:var(--ink2)}",
      ".mk-kaynak-dgm i{font-style:normal;font-size:9px;opacity:.7}",
      "aside>:last-child>div:first-of-type{padding:12px 13px!important;",
      "font-size:10.5px!important;line-height:1.5!important}",
      "aside>:last-child>div:first-of-type>div+div{margin-top:9px!important;",
      "padding-top:9px;border-top:1px solid var(--kenar)}",
      "aside>:last-child>div:first-of-type b{display:block;",
      "font-family:'IBM Plex Mono',monospace;font-size:9px!important;letter-spacing:.12em;",
      "text-transform:uppercase;color:var(--muted)!important;font-weight:500!important;",
      "margin-bottom:3px}",

      /* tema düğmesi */
      "aside>:last-child>button:last-child{width:100%;text-align:center;",
      "font-size:12px!important;padding:10px 12px!important;color:var(--ink2);",
      "transition:background .15s ease,border-color .15s ease,color .15s ease}",
      "aside>:last-child>button:last-child:hover{background:var(--surface)!important;",
      "border-color:var(--kenar2)!important;color:var(--ink)}"
    ].join("");
    document.head.appendChild(st);
  }

  /* --- menü öğelerine açıklama satırı ------------------------------- */
  function aciklamalar() {
    [].slice.call(document.querySelectorAll("aside nav a")).forEach(function (a) {
      var ad = (a.textContent || "").trim();
      var alt = ACIKLAMA[ad] || "";
      if (a.getAttribute("data-mk-alt") === alt) return;
      a.setAttribute("data-mk-alt", alt);
    });
  }

  /* --- kaynak kutusunu katla ---------------------------------------- */
  function kaynakKatla() {
    var alt = document.querySelector("aside>:last-child");
    if (!alt || alt.querySelector(".mk-kaynak-dgm")) return;
    var kutu = alt.querySelector("div");
    if (!kutu || !/Talep/.test(kutu.textContent || "")) return;

    var dgm = el("button", "mk-kaynak-dgm");
    dgm.appendChild(el("span", null, "Veri kaynakları"));
    dgm.appendChild(el("i", null, "▾"));
    kutu.style.display = "none";
    alt.insertBefore(dgm, kutu);
    dgm.addEventListener("click", function () {
      var acik = kutu.style.display !== "none";
      kutu.style.display = acik ? "none" : "";
      dgm.querySelector("i").textContent = acik ? "▾" : "▴";
    });
  }

  /* --- aktif bölüm: kaydırdıkça değişir ----------------------------- */
  function aktifTakip() {
    var baglar = [].slice.call(document.querySelectorAll("aside nav a[href^='#']"));
    if (!baglar.length) return;
    var bolumler = baglar.map(function (a) {
      return { a: a, el: document.getElementById(a.getAttribute("href").slice(1)) };
    }).filter(function (x) { return x.el; });
    if (!bolumler.length) return;

    function guncelle() {
      var secili = bolumler[0];
      bolumler.forEach(function (x) {
        if (x.el.getBoundingClientRect().top <= 140) secili = x;
      });
      baglar.forEach(function (a) { a.classList.remove("mk-aktif"); });
      secili.a.classList.add("mk-aktif");
    }
    if (window.__mkKenarKaydir) window.removeEventListener("scroll", window.__mkKenarKaydir);
    window.__mkKenarKaydir = guncelle;
    window.addEventListener("scroll", guncelle, { passive: true });
    baglar.forEach(function (a) {
      a.addEventListener("click", function () { setTimeout(guncelle, 60); });
    });
    guncelle();
  }

  /* --- İETT amblemi (kodu menu.js'ten taşındı) ----------------------- */
  function amblem() {
    if (document.getElementById("mk-amblem")) return;
    var etiket = [].slice.call(document.querySelectorAll("div,span,p")).find(function (e) {
      return e.children.length === 0 && /MANŞET BULGU/i.test(e.textContent || "");
    });
    if (!etiket) return;

    /* ⚠️ ÖLÇÜYE BAKMA. `menu.js` bloğu "genişliği 700px'den büyük ata" diye
       arıyordu; kod buradan taşındığı için hata da taşınmıştı ve amblem hiç
       eklenmiyordu — ölçülen zincir: 49x33 → 0x130 → 80x1342, hiçbiri kurala
       uymuyor. Sebep: paketleyicinin ara sarmalayıcıları dejenere kutu
       üretiyor (genişlik 0). `manset.js`'in yöntemi doğru olan: YAPIYA bak —
       etiketten yukarı çıkarken İÇİNDE h1 BULUNAN ilk ata, manşet bloğudur.
       Ekran genişliğinden ve sarmalayıcılardan bağımsız çalışır. */
    var manset = null, n = etiket.parentElement;
    for (var i = 0; i < 6 && n && n.tagName !== "BODY"; i++) {
      if (n.querySelector("h1")) { manset = n; break; }
      n = n.parentElement;
    }
    if (!manset) return;

    if (getComputedStyle(manset).position === "static") manset.style.position = "relative";
    manset.style.overflow = "hidden";

    var img = document.createElement("img");
    img.id = "mk-amblem";
    img.src = "iett-amblem.png";
    img.alt = "İETT";
    /* Amblem dikey (291x540). Genişlikten boyutlandırınca bloğu taşıyordu;
       yüksekliğe göre ölçekleniyor. right:%14 → metnin bittiği yerle sağ kenar
       arasındaki boşlukta ortalanıyor. */
    img.style.cssText = [
      "position:absolute", "right:14%", "top:50%", "transform:translateY(-50%)",
      "height:84%", "width:auto", "max-width:30%", "opacity:.9",
      "pointer-events:none", "user-select:none", "z-index:0",
      "filter:saturate(1.25) drop-shadow(0 8px 26px rgba(0,0,0,.5))"
    ].join(";");
    img.onerror = function () { img.remove(); };
    manset.appendChild(img);

    [].slice.call(manset.children).forEach(function (c) {
      if (c !== img && getComputedStyle(c).position === "static") {
        c.style.position = "relative";
        c.style.zIndex = "1";
      }
    });
  }

  /* --- arama kutusunda ENTER → ilk eşleşen hattın panelini aç -------- */
  /* Kullanıcı "98KM" yazıp Enter'a basınca ayrıca satıra tıklaması gerekmesin.
     Tablo React tarafından süzülüyor; Enter'da ilk görünür satıra tıklama
     olayı gönderiyoruz — `akordeon.js` paneli o olayla açıyor. */
  function aramaKisayolu() {
    var s = document.getElementById("hatlar");
    if (!s) return;
    var inp = s.querySelector("input[type='text'],input:not([type])");
    if (!inp || inp.dataset.mkEnter === "1") return;
    inp.dataset.mkEnter = "1";
    inp.addEventListener("keydown", function (e) {
      if (e.key !== "Enter") return;
      e.preventDefault();
      /* React süzmeyi bitirsin diye bir tık bekle */
      setTimeout(function () {
        var tbl = s.querySelector("table");
        if (!tbl) return;
        var satir = [].slice.call(tbl.querySelectorAll(":scope > tbody > tr"))
          .find(function (tr) {
            return tr.offsetHeight > 0 && !tr.hasAttribute("data-mk-detay") &&
                   tr.cells && tr.cells.length > 1;
          });
        if (!satir) return;
        satir.cells[1].dispatchEvent(new MouseEvent("click",
          { bubbles: true, cancelable: true, view: window }));
        satir.scrollIntoView({ block: "center", behavior: "smooth" });
      }, 60);
    });
  }

  function uygula() {
    stil();
    aciklamalar();
    kaynakKatla();
    aktifTakip();
    amblem();
    aramaKisayolu();
  }

  uygula();
  var dene = setInterval(uygula, 400);
  setTimeout(function () { clearInterval(dene); }, 15000);
  var z = null;
  new MutationObserver(function () {
    clearTimeout(z);
    z = setTimeout(uygula, 150);
  }).observe(document.body, { childList: true, subtree: true });
})();
