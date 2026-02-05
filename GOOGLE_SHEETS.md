# Интеграция анкеты с Google Sheets

## 1) Создайте Apps Script в вашей таблице
1. Откройте Google Sheets.
2. Создайте/откройте таблицу, куда будут писаться ответы.
3. Меню **Расширения → Apps Script**.
4. Удалите всё в редакторе и вставьте код ниже.

## 2) Код Apps Script (вставить полностью)
```javascript
const SHEET_NAME = "Ответы";
const HEADERS = [
  "Время ответа",
  "Имя",
  "Фамилия",
  "Имя Пары",
  "Фамилия Пары",
  "Первый день",
  "Второй день",
  "Напитки",
  "Еда",
  "Аллергия",
];

const valueOrDash = (value) => {
  const trimmed = (value || "").toString().trim();
  return trimmed ? trimmed : "-";
};

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    }

    const data = e && e.parameter ? e.parameter : {};
    const row = [
      new Date(),
      (data.first_name || "").toString().trim(),
      (data.last_name || "").toString().trim(),
      valueOrDash(data.partner_first_name),
      valueOrDash(data.partner_last_name),
      (data.attendance || "").toString().trim(),
      (data.second_day || "").toString().trim(),
      (data.drinks || "").toString().trim(),
      (data.food || "").toString().trim(),
      (data.allergy || "").toString().trim(),
    ];

    sheet.appendRow(row);
    return ContentService.createTextOutput("ok");
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return ContentService.createTextOutput("ok");
}
```

## 3) Деплой Web App
1. **Deploy → New deployment**
2. **Select type → Web app**
3. **Execute as:** Me
4. **Who has access:** Anyone
5. Нажмите **Deploy**, скопируйте URL вида:
   `https://script.google.com/macros/s/.../exec`

## 4) Подключите URL на сайте
Откройте файл `script.js` и замените константу:
```javascript
const SCRIPT_URL = "PASTE_GOOGLE_SCRIPT_URL_HERE";
```
на ваш URL.

## Проверка
- Отправьте форму.
- В листе **Ответы** появится новая строка.
