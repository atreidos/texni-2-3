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

// Элементы модального окна
var modalOverlay = document.getElementById("modal-overlay");
var modalClose = document.getElementById("modal-close");
var leadForm = document.getElementById("lead-form");
var modalFormContent = document.getElementById("modal-form-content");
var modalSuccess = document.getElementById("modal-success");

var inputName = document.getElementById("lead-name");
var inputPhone = document.getElementById("lead-phone");
var fieldName = inputName.parentElement;
var fieldPhone = inputPhone.parentElement;

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

// Обновить ползунок и итог; скрыть устаревший результат при изменении формы
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

// Функции для работы с модальным окном
function openModal() {
  modalOverlay.classList.add("active");
  // Блокируем скролл на фоне
  document.body.style.overflow = "hidden";
  
  // Сбрасываем состояния при каждом открытии
  modalFormContent.style.display = "block";
  modalSuccess.style.display = "none";
  leadForm.reset();
  removeError(inputName, fieldName);
  removeError(inputPhone, fieldPhone);
}

function closeModal() {
  modalOverlay.classList.remove("active");
  // Возвращаем скролл
  document.body.style.overflow = "";
}

function showError(input, fieldWrap) {
  input.classList.add("error-input");
  fieldWrap.classList.add("error");
}

function removeError(input, fieldWrap) {
  input.classList.remove("error-input");
  fieldWrap.classList.remove("error");
}

// Обработчик: открыть модалку при клике на "Получить КП"
function onOfferClick() {
  openModal();
}

// Обработчик отправки формы в модалке
leadForm.addEventListener("submit", function(e) {
  e.preventDefault(); // Останавливаем перезагрузку страницы
  
  var isValid = true;
  var nameVal = inputName.value.trim();
  var phoneVal = inputPhone.value.trim();
  
  // Проверка имени на пустоту
  if (nameVal === "") {
    showError(inputName, fieldName);
    isValid = false;
  } else {
    removeError(inputName, fieldName);
  }
  
  // Проверка телефона на пустоту
  if (phoneVal === "") {
    showError(inputPhone, fieldPhone);
    isValid = false;
  } else {
    removeError(inputPhone, fieldPhone);
  }
  
  // Если всё заполнено, отправляем заявку
  if (isValid) {
    var calcData = getFormData();
    console.log("Отправка заявки...", {
      name: nameVal,
      phone: phoneVal,
      tg: document.getElementById("lead-tg").value,
      calcData: calcData
    });
    
    // Прячем форму, показываем блок с галочкой
    modalFormContent.style.display = "none";
    modalSuccess.style.display = "block";
  }
});

// Закрытие по клику на крестик
modalClose.addEventListener("click", closeModal);

// Закрытие по клику на темный фон
modalOverlay.addEventListener("click", function(e) {
  // e.target — элемент, по которому реально кликнули
  // Если клик был именно по фону (не по самой плашке внутри), закрываем
  if (e.target === modalOverlay) {
    closeModal();
  }
});

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
}

// Запуск после загрузки страницы
document.addEventListener("DOMContentLoaded", init);
