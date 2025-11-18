/* -----------------------------
   안정화 버전 v4 - app.js
   모든 계산 / 이벤트 로직 포함
------------------------------ */

/* ---------- DOM ---------- */
const container = document.getElementById("productContainer");
const template = document.getElementById("productTemplate");

/* ---------- 고정값 ---------- */
const CO2 = 200 * 220;
const CUSTOMS_FEE = 33000;
const BL_FEE = 22000;
const LOGISTICS = 110000;

/* ---------- 환율 ---------- */
function getRate() {
  const v = parseFloat(document.getElementById("exchangeRate").value);
  return v > 0 ? v : 200;
}

/* ---------- 제품 카드 생성 ---------- */
function addProduct() {
  const node = document.importNode(template.content, true);
  container.appendChild(node);
  calc();
  saveData();
}

/* ---------- 제품 삭제 ---------- */
container.addEventListener("click", (e) => {
  if (e.target.classList.contains("remove-btn")) {
    if (document.querySelectorAll(".product-card").length <= 1) {
      alert("최소 1개 제품이 필요합니다.");
      return;
    }
    e.target.closest(".product-card").remove();
    calc();
    saveData();
  }
});

/* ---------- 계산 로직 ---------- */
function calc() {
  const rate = getRate();
  let totalCBM = 0;
  let totalBoxes = 0;
  let finalTotal = 0;

  document.querySelectorAll(".product-card").forEach((card) => {
    const price = parseFloat(card.querySelector(".p-price").value) || 0;
    const qty = parseFloat(card.querySelector(".p-qty").value) || 0;
    const delivery = parseFloat(card.querySelector(".p-delivery").value) || 0;
    const labor = parseFloat(card.querySelector(".p-labor").value) || 0;
    const dutyRate = parseFloat(card.querySelector(".p-duty").value) || 0;

    const boxType = card.querySelector(".p-box").value;
    const boxCount = parseFloat(card.querySelector(".p-boxcount").value) || 0;

    /* 개당 택배비 */
    const delUnit = qty ? delivery / qty : 0;
    card.querySelector(".p-delivery-unit").textContent =
      delUnit.toFixed(2) + " RMB";

    /* 박스당 CBM 계산 */
    const preset = {
      large: { l: 64, w: 43, h: 48 },
      medium: { l: 53, w: 35, h: 43 },
      small: { l: 45, w: 35, h: 37 },
    }[boxType];

    const cbm = preset
      ? (preset.l * preset.w * preset.h) / 1_000_000 * boxCount
      : 0;

    card.querySelector(".p-cbm").textContent = cbm.toFixed(4);

    totalCBM += cbm;
    totalBoxes += boxCount;

    /* 박스 비용 */
    const BOX_PRICE = { large: 13, medium: 11, small: 9 }[boxType] || 0;
    const boxCostPerUnit = qty ? (BOX_PRICE * boxCount) / qty : 0;

    /* 총 RMB */
    const rmbTotal = (price + labor + delUnit + boxCostPerUnit) * qty;

    /* KRW 기본 */
    const krwBase = rmbTotal * rate;

    /* 관세 */
    const duty = krwBase * (dutyRate / 100);

    /* 물류비 배분 */
    const logisticsShare = totalCBM
      ? (cbm / totalCBM) * (totalCBM * LOGISTICS)
      : 0;

    /* 기본비 배분 (CO2, 통관, BL) */
    const baseTotal = CO2 + CUSTOMS_FEE + BL_FEE;
    const baseShare = totalCBM ? (cbm / totalCBM) * baseTotal : 0;

    /* 제품별 총 */
    const unitCost = (krwBase + duty + logisticsShare + baseShare) / (qty || 1);
    const finalUnit = unitCost / 0.9; // 마진 제외한 단가 → VAT 포함

    finalTotal += finalUnit * qty;
  });

  document.getElementById("totalCBM").textContent = totalCBM.toFixed(4);
  document.getElementById("totalBoxes").textContent = totalBoxes;
  document.getElementById("finalTotal").textContent =
    (Math.round(finalTotal / 100) * 100).toLocaleString() + " 원";

  updateFloatingBar();
}

/* ---------- 플로팅바 ---------- */
function updateFloatingBar() {
  document.getElementById("floatPrice").textContent =
    document.getElementById("finalTotal").textContent;
}

/* ---------- 전체 리셋 ---------- */
function resetAll() {
  if (!confirm("전체 입력값을 초기화할까요?")) return;

  localStorage.removeItem("importEstimatorData");
  document.getElementById("exchangeRate").value = "";

  document.querySelectorAll(".product-card").forEach((x) => x.remove());
  addProduct();
  calc();
}

/* ---------- 저장 ---------- */
function saveData() {
  const data = {
    rate: document.getElementById("exchangeRate").value,
    products: [],
  };

  document.querySelectorAll(".product-card").forEach((card) => {
    data.products.push({
      name: card.querySelector(".p-name").value,
      price: card.querySelector(".p-price").value,
      qty: card.querySelector(".p-qty").value,
      delivery: card.querySelector(".p-delivery").value,
      labor: card.querySelector(".p-labor").value,
      duty: card.querySelector(".p-duty").value,
      boxType: card.querySelector(".p-box").value,
      boxCount: card.querySelector(".p-boxcount").value,
    });
  });

  localStorage.setItem("importEstimatorData", JSON.stringify(data));
}

/* ---------- 불러오기 ---------- */
function loadData() {
  const saved = localStorage.getItem("importEstimatorData");
  if (!saved) {
    addProduct();
    return;
  }

  const data = JSON.parse(saved);
  document.getElementById("exchangeRate").value = data.rate || "";

  document.querySelectorAll(".product-card").forEach((x) => x.remove());

  data.products.forEach((item) => {
    const node = document.importNode(template.content, true);
    container.appendChild(node);

    const card = container.lastElementChild;
    card.querySelector(".p-name").value = item.name;
    card.querySelector(".p-price").value = item.price;
    card.querySelector(".p-qty").value = item.qty;
    card.querySelector(".p-delivery").value = item.delivery;
    card.querySelector(".p-labor").value = item.labor;
    card.querySelector(".p-duty").value = item.duty;
    card.querySelector(".p-box").value = item.boxType;
    card.querySelector(".p-boxcount").value = item.boxCount;
  });

  calc();
}

/* ---------- 이벤트 바인딩 ---------- */
document.getElementById("addProductBtn").addEventListener("click", addProduct);
document.getElementById("resetBtn").addEventListener("click", resetAll);

document.getElementById("scrollTopBtn").addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

document.body.addEventListener("input", () => {
  calc();
  saveData();
});

/* ---------- 실행 ---------- */
loadData();
