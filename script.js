// ========== ВСЕ ЦЕНЫ И НАСТРОЙКИ В ОДНОМ ОБЪЕКТЕ (удобно расширять) ==========
var prices = {
  // Услуги: базовая цена и сколько экранов входит в базу
  landing:    { basePrice: 19000, baseScreens: 6 },
  visitor:    { basePrice: 14000, baseScreens: 5 },
  calculator: { basePrice: 27000, baseScreens: 5 },
  corporate:  { basePrice: 37000, baseScreens: 8 },
  // «Другое»: база 1 экран, цена вводится вручную
  other:      { basePrice: 0, baseScreens: 1 },
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
var elService       = document.getElementById("service");
var elOtherPriceWrap = document.getElementById("other-price-wrap");
var elOtherPrice    = document.getElementById("other-price");
var elScreens       = document.getElementById("screens");
var elScreensValue  = document.getElementById("screens-value");
var elOptTelegram   = document.getElementById("opt-telegram");
var elOptSeo        = document.getElementById("opt-seo");
var elOptDesign     = document.getElementById("opt-design");
var elOptUrgency    = document.getElementById("opt-urgency");
var elTotalPrice    = document.getElementById("total-price");
var btnOffer        = document.getElementById("btn-offer");
var btnPrint        = document.getElementById("btn-print");
var btnReset        = document.getElementById("btn-reset");

// Модальное окно
var modal           = document.getElementById("modal");
var closeModalBtn   = document.getElementById("close-modal");
var btnSendRequest  = document.getElementById("btn-send-request");
var clientName      = document.getElementById("client-name");
var clientPhone     = document.getElementById("client-phone");
var clientTelegram  = document.getElementById("client-telegram");
var modalMsg        = document.getElementById("modal-msg");

// Показать или скрыть поле «Ваша цена» для услуги «Другое»
// Упрощено: одна строка вместо if/else с двумя display
function toggleOtherPrice() {
  elOtherPriceWrap.style.display = elService.value === "other" ? "block" : "none";
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
  var screens = Number(elScreens.value) || 1;

  // База + доплата за экраны сверх базы
  var extraScreens = screens > data.baseScreens ? screens - data.baseScreens : 0;
  var screenTotal = data.basePrice + extraScreens * prices.extraScreen;

  // Добавляем опции
  var optionsTotal = 0;
  if (elOptTelegram.checked) optionsTotal += prices.telegram;
  if (elOptSeo.checked) optionsTotal += prices.seo;
  if (elOptDesign.checked) optionsTotal += prices.design;

  var total = screenTotal + optionsTotal;

  // Срочность: +50% к итогу
  if (elOptUrgency.checked) {
    total *= prices.urgencyMultiplier;
  }

  return Math.round(total);
}

// Собрать выбранные позиции и отрендерить список под итогом
function renderBreakdown() {
  var elBreakdown = document.getElementById("price-breakdown");
  var data = getServiceData();
  var screens = Number(elScreens.value) || 1;
  var extraScreens = screens > data.baseScreens ? screens - data.baseScreens : 0;
  var total = calcTotal();
  var html = "";

  var serviceLabel = elService.options[elService.selectedIndex].text.split(" —")[0];
  html += "<li><span class='bd-label'>" + serviceLabel + "</span><span class='bd-price'>" + data.basePrice.toLocaleString("ru-RU") + " ₽</span></li>";

  if (extraScreens > 0) {
    html += "<li><span class='bd-label'>Доп. экраны ×" + extraScreens + "</span><span class='bd-price'>+" + (extraScreens * prices.extraScreen).toLocaleString("ru-RU") + " ₽</span></li>";
  }
  if (elOptTelegram.checked) {
    html += "<li><span class='bd-label'>Telegram + форма</span><span class='bd-price'>+" + prices.telegram.toLocaleString("ru-RU") + " ₽</span></li>";
  }
  if (elOptSeo.checked) {
    html += "<li><span class='bd-label'>SEO базовая</span><span class='bd-price'>+" + prices.seo.toLocaleString("ru-RU") + " ₽</span></li>";
  }
  if (elOptDesign.checked) {
    html += "<li><span class='bd-label'>Уникальный дизайн</span><span class='bd-price'>+" + prices.design.toLocaleString("ru-RU") + " ₽</span></li>";
  }
  if (elOptUrgency.checked) {
    html += "<li><span class='bd-label'>Срочность</span><span class='bd-price'>+50%</span></li>";
  }

  html += "<li class='bd-total'><span class='bd-label'>Итого</span><span class='bd-price'>" + total.toLocaleString("ru-RU") + " ₽</span></li>";
  elBreakdown.innerHTML = html;
}

// Обновить ползунок и итог
function updateDisplay() {
  elScreensValue.textContent = elScreens.value;
  elTotalPrice.textContent = calcTotal().toLocaleString("ru-RU");
  renderBreakdown();
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

// Обработчик: открыть модальное окно вместо alert
function onOfferClick() {
  var data = getFormData();
  console.log("Данные калькулятора (сохранены для заявки):", data);
  
  // Очищаем поля и сообщения при открытии
  clientName.value = "";
  clientPhone.value = "";
  clientTelegram.value = "";
  modalMsg.className = "modal-msg";
  modalMsg.textContent = "";
  
  modal.classList.add("active");
}

function closeOfferModal() {
  modal.classList.remove("active");
}

function onSendRequestClick() {
  var name = clientName.value.trim();
  var phone = clientPhone.value.trim();
  
  if (!name || !phone) {
    modalMsg.textContent = "Ошибка: заполните Имя и Телефон!";
    modalMsg.className = "modal-msg error";
    return;
  }
  
  // Если всё заполнено
  modalMsg.textContent = "Заявка отправлена!";
  modalMsg.className = "modal-msg success";
}

// Обработчик: печать
function onPrintClick() {
  window.print();
}

// Обработчик: сброс калькулятора к базовому состоянию
function onResetClick() {
  var confirmed = window.confirm("Вы уверены?");
  if (!confirmed) return;

  elOptTelegram.checked = false;
  elOptSeo.checked = false;
  elOptDesign.checked = false;
  elOptUrgency.checked = false;
  elScreens.value = 5;

  updateDisplay();
}

// Подписка на все изменения формы и кнопки
function init() {
  toggleOtherPrice();
  updateDisplay();

  elService.addEventListener("change", function () {
    toggleOtherPrice();
    updateDisplay();
  });

  // «input» срабатывает при каждом вводе символа — «change» для числового поля лишний
  elOtherPrice.addEventListener("input", updateDisplay);

  // «input» на range срабатывает при каждом движении ползунка — «change» дублировал его
  elScreens.addEventListener("input", updateDisplay);

  elOptTelegram.addEventListener("change", updateDisplay);
  elOptSeo.addEventListener("change", updateDisplay);
  elOptDesign.addEventListener("change", updateDisplay);
  elOptUrgency.addEventListener("change", updateDisplay);

  btnOffer.addEventListener("click", onOfferClick);
  btnPrint.addEventListener("click", onPrintClick);
  btnReset.addEventListener("click", onResetClick);
  
  closeModalBtn.addEventListener("click", closeOfferModal);
  btnSendRequest.addEventListener("click", onSendRequestClick);
  
  // Закрытие по клику вне окна
  window.addEventListener("click", function(event) {
    if (event.target === modal) {
      closeOfferModal();
    }
  });
}

// Запуск после загрузки страницы
document.addEventListener("DOMContentLoaded", init);
