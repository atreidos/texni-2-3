// ========== ВСЕ ЦЕНЫ И НАСТРОЙКИ В ОДНОМ ОБЪЕКТЕ (удобно расширять) ==========
var prices = {
  // Услуги: базовая цена и сколько экранов входит в базу
  landing:    { basePrice: 19000, baseScreens: 6 },
  visitor:   { basePrice: 14000, baseScreens: 5 },
  calculator: { basePrice: 27000, baseScreens: 5 },
  corporate: { basePrice: 37000, baseScreens: 8 },
  // «Другое»: база 1 экран, цена вводится вручную
  other:     { basePrice: 0, baseScreens: 1 },
  // Доплата за каждый экран сверх базы, ₽
  extraScreen: 2800,
  // Надбавки за опции, ₽
  telegram: 4500,
  seo: 5500,
  design: 9000,
  // Срочность: множитель к итогу (+50% = 1.5)
  urgencyMultiplier: 1.5
};

// Элементы формы (получаем один раз при загрузке)
var elService = document.getElementById("service");
var elOtherPriceWrap = document.getElementById("other-price-wrap");
var elOtherPrice = document.getElementById("other-price");
var elScreens = document.getElementById("screens");
var elScreensValue = document.getElementById("screens-value");
var elOptTelegram = document.getElementById("opt-telegram");
var elOptSeo = document.getElementById("opt-seo");
var elOptDesign = document.getElementById("opt-design");
var elOptUrgency = document.getElementById("opt-urgency");
var elTotalPrice = document.getElementById("total-price");
var btnOffer = document.getElementById("btn-offer");
var btnPrint = document.getElementById("btn-print");

// Показать или скрыть поле «Ваша цена» для услуги «Другое»
function toggleOtherPrice() {
  if (elService.value === "other") {
    elOtherPriceWrap.style.display = "block";
  } else {
    elOtherPriceWrap.style.display = "none";
  }
}

// Получить базовую цену и лимит экранов для выбранной услуги
function getServiceData() {
  var key = elService.value;
  var basePrice = prices[key].basePrice;
  var baseScreens = prices[key].baseScreens;
  if (key === "other") {
    basePrice = Number(elOtherPrice.value) || 0;
  }
  return { basePrice: basePrice, baseScreens: baseScreens };
}

// Посчитать итоговую цену
function calcTotal() {
  var data = getServiceData();
  var basePrice = data.basePrice;
  var baseScreens = data.baseScreens;
  var screens = Number(elScreens.value) || 1;

  // База + доплата за экраны сверх базы
  var screenTotal = basePrice;
  if (screens > baseScreens) {
    screenTotal = basePrice + (screens - baseScreens) * prices.extraScreen;
  }

  // Добавляем опции
  var add = 0;
  if (elOptTelegram.checked) add += prices.telegram;
  if (elOptSeo.checked) add += prices.seo;
  if (elOptDesign.checked) add += prices.design;

  var total = screenTotal + add;

  // Срочность: +50% к итогу
  if (elOptUrgency.checked) {
    total = total * prices.urgencyMultiplier;
  }

  return Math.round(total);
}

// Обновить отображаемое значение ползунка и итог
function updateDisplay() {
  elScreensValue.textContent = elScreens.value;
  elTotalPrice.textContent = calcTotal().toLocaleString("ru-RU");
}

// Собрать все данные формы для заявки
function getFormData() {
  var data = getServiceData();
  var screens = Number(elScreens.value) || 1;
  var total = calcTotal();
  return {
    service: elService.options[elService.selectedIndex].text,
    basePrice: data.basePrice,
    baseScreens: data.baseScreens,
    screens: screens,
    telegram: elOptTelegram.checked,
    seo: elOptSeo.checked,
    design: elOptDesign.checked,
    urgency: elOptUrgency.checked,
    total: total
  };
}

// Текст заявки для alert
function getOfferText(data) {
  var parts = [];
  parts.push("ЗАЯВКА НА КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ");
  parts.push("");
  parts.push("Услуга: " + data.service);
  parts.push("Экранов/страниц: " + data.screens);
  parts.push("Telegram + форма: " + (data.telegram ? "да" : "нет"));
  parts.push("SEO базовая: " + (data.seo ? "да" : "нет"));
  parts.push("Уникальный дизайн: " + (data.design ? "да" : "нет"));
  parts.push("Срочность 3–5 дней: " + (data.urgency ? "да" : "нет"));
  parts.push("");
  parts.push("Итого: " + data.total.toLocaleString("ru-RU") + " ₽");
  return parts.join("\n");
}

// Обработчик: получить КП
function onOfferClick() {
  var data = getFormData();
  var text = getOfferText(data);
  alert(text);
  console.log("Данные калькулятора (для заявки):", data);
}

// Обработчик: печать
function onPrintClick() {
  window.print();
}

// Подписка на все изменения формы и кнопки
function init() {
  toggleOtherPrice();
  updateDisplay();

  elService.addEventListener("change", function () {
    toggleOtherPrice();
    updateDisplay();
  });

  elOtherPrice.addEventListener("input", updateDisplay);
  elOtherPrice.addEventListener("change", updateDisplay);

  elScreens.addEventListener("input", updateDisplay);
  elScreens.addEventListener("change", updateDisplay);

  elOptTelegram.addEventListener("change", updateDisplay);
  elOptSeo.addEventListener("change", updateDisplay);
  elOptDesign.addEventListener("change", updateDisplay);
  elOptUrgency.addEventListener("change", updateDisplay);

  btnOffer.addEventListener("click", onOfferClick);
  btnPrint.addEventListener("click", onPrintClick);
}

// Запуск после загрузки страницы
document.addEventListener("DOMContentLoaded", init);
