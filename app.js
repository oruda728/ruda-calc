/* 난독화 버전 app.js */
(function () {
  "use strict";
  const c = document.getElementById("productContainer"),
    t = document.getElementById("productTemplate"),
    C = 16500,
    B = 11000,
    L = 110000;

  function g() {
    const v = parseFloat(document.getElementById("exchangeRate").value);
    return v > 0 ? v : 200;
  }

  function h() {
    const n = document.importNode(t.content, true);
    c.appendChild(n);
    k();
    q();
  }

  c.addEventListener("click", function (e) {
    if (e.target.classList.contains("remove-btn")) {
      if (document.querySelectorAll(".product-card").length <= 1) {
        alert("최소 1개 제품이 필요합니다.");
        return;
      }
      e.target.closest(".product-card").remove();
      k();
      q();
    }
  });

  function k() {
    const r = g();
    const o = r * 220;
    let m = 0,
      b = 0,
      F = 0;

    document.querySelectorAll(".product-card").forEach(function (d) {
      const p = parseFloat(d.querySelector(".p-price").value) || 0;
      const x = p * 1.05;
      const y = parseFloat(d.querySelector(".p-qty").value) || 0;
      const D = parseFloat(d.querySelector(".p-delivery").value) || 0;
      const l = parseFloat(d.querySelector(".p-labor").value) || 0;
      const R = parseFloat(d.querySelector(".p-duty").value) || 0;
      const T = d.querySelector(".p-box").value;
      const N = parseFloat(d.querySelector(".p-boxcount").value) || 0;

      const U = y ? D / y : 0;
      d.querySelector(".p-delivery-unit").textContent =
        U.toFixed(2) + " RMB";

      const P = {
        large: { l: 64, w: 43, h: 48 },
        medium: { l: 53, w: 35, h: 43 },
        small: { l: 45, w: 35, h: 37 },
      }[T];

      const M = P ? ((P.l * P.w * P.h) / 1e6) * N : 0;
      d.querySelector(".p-cbm").textContent = M.toFixed(4);

      m += M;
      b += N;

      const G = { large: 13, medium: 11, small: 9 }[T] || 0;
      const H = y ? (G * N) / y : 0;

      const S = (x + l + U + H) * y;
      const K = S * r;
      const V = K * (R / 100);

      const j = m ? (M / m) * (m * L) : 0;
      const z = o + C + B;
      const J = m ? (M / m) * z : 0;

      const W = (K + V + j + J) / (y || 1);
      const Y = W / 0.9;

      F += Y * y;
    });

    document.getElementById("totalCBM").textContent = m.toFixed(4);
    document.getElementById("totalBoxes").textContent = b;
    document.getElementById("finalTotal").textContent =
      (Math.round(F / 100) * 100).toLocaleString() + " 원";

    E();
  }

  function E() {
    document.getElementById("floatPrice").textContent =
      document.getElementById("finalTotal").textContent;
  }

  function O() {
    if (!confirm("전체 입력값 초기화?")) return;

    localStorage.removeItem("importEstimatorData");
    document.getElementById("exchangeRate").value = "";

    document.querySelectorAll(".product-card").forEach(function (x) {
      x.remove();
    });
    h();
    k();
  }

  function q() {
    const w = {
      rate: document.getElementById("exchangeRate").value,
      products: [],
    };

    document.querySelectorAll(".product-card").forEach(function (d) {
      w.products.push({
        name: d.querySelector(".p-name").value,
        price: d.querySelector(".p-price").value,
        qty: d.querySelector(".p-qty").value,
        delivery: d.querySelector(".p-delivery").value,
        labor: d.querySelector(".p-labor").value,
        duty: d.querySelector(".p-duty").value,
        boxType: d.querySelector(".p-box").value,
        boxCount: d.querySelector(".p-boxcount").value,
      });
    });

    localStorage.setItem("importEstimatorData", JSON.stringify(w));
  }

  function Z() {
    const a = localStorage.getItem("importEstimatorData");
    if (!a) {
      h();
      return;
    }

    const w = JSON.parse(a);
    document.getElementById("exchangeRate").value = w.rate || "";

    document.querySelectorAll(".product-card").forEach(function (x) {
      x.remove();
    });

    w.products.forEach(function (v) {
      const n = document.importNode(t.content, true);
      c.appendChild(n);
      const d = c.lastElementChild;

      d.querySelector(".p-name").value = v.name;
      d.querySelector(".p-price").value = v.price;
      d.querySelector(".p-qty").value = v.qty;
      d.querySelector(".p-delivery").value = v.delivery;
      d.querySelector(".p-labor").value = v.labor;
      d.querySelector(".p-duty").value = v.duty;
      d.querySelector(".p-box").value = v.boxType;
      d.querySelector(".p-boxcount").value = v.boxCount;
    });

    k();
  }

  document.getElementById("addProductBtn").addEventListener("click", h);
  document.getElementById("resetBtn").addEventListener("click", O);
  document.getElementById("scrollTopBtn").addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  document.body.addEventListener("input", function () {
    k();
    q();
  });

  Z();
})();
