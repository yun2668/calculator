"use strict";

// 取得畫面與所有按鈕
const display = document.getElementById("display");
const buttons = document.querySelectorAll("button");

// 儲存目前算式
let expression = "";

// 顯示內容
function updateDisplay(value) {
  display.value = value || "0";
}

// 判斷是否為運算符號
function isOperator(value) {
  return ["+", "-", "*", "/"].includes(value);
}

// 加入數字、小數點或運算符號
function appendValue(value) {
  const lastCharacter = expression.slice(-1);

  // 處理運算符號
  if (isOperator(value)) {
    // 第一個字元只允許負號
    if (expression === "") {
      if (value === "-") {
        expression = "-";
      }

      updateDisplay(expression);
      return;
    }

    // 避免連續出現兩個運算符號
    if (isOperator(lastCharacter)) {
      expression = expression.slice(0, -1) + value;
    } else {
      expression += value;
    }

    updateDisplay(formatExpression(expression));
    return;
  }

  // 處理小數點
  if (value === ".") {
    const currentNumber = expression.split(/[+\-*/]/).pop();

    // 同一個數字只能有一個小數點
    if (currentNumber.includes(".")) {
      return;
    }

    // 若直接按小數點，自動變成 0.
    if (
      expression === "" ||
      isOperator(lastCharacter)
    ) {
      expression += "0.";
    } else {
      expression += ".";
    }

    updateDisplay(formatExpression(expression));
    return;
  }

  // 加入數字
  expression += value;
  updateDisplay(formatExpression(expression));
}

// 將程式運算符號轉成畫面符號
function formatExpression(value) {
  return value
    .replaceAll("*", "×")
    .replaceAll("/", "÷");
}

// 清除全部
function clearCalculator() {
  expression = "";
  updateDisplay("0");
}

// 刪除最後一個字元
function deleteLastCharacter() {
  expression = expression.slice(0, -1);
  updateDisplay(formatExpression(expression));
}

// 百分比
function calculatePercent() {
  if (expression === "") {
    return;
  }

  try {
    const result = evaluateExpression(expression);
    expression = String(result / 100);
    updateDisplay(expression);
  } catch (error) {
    showError();
  }
}

// 執行計算
function calculateResult() {
  if (expression === "") {
    return;
  }

  // 移除最後一個無效的運算符號
  while (isOperator(expression.slice(-1))) {
    expression = expression.slice(0, -1);
  }

  if (expression === "") {
    updateDisplay("0");
    return;
  }

  try {
    const result = evaluateExpression(expression);

    if (!Number.isFinite(result)) {
      throw new Error("無效的計算結果");
    }

    // 避免浮點數出現過多小數位
    const roundedResult =
      Math.round((result + Number.EPSILON) * 10000000000) /
      10000000000;

    expression = String(roundedResult);
    updateDisplay(expression);
  } catch (error) {
    showError();
  }
}

// 安全檢查後執行算式
function evaluateExpression(value) {
  // 僅允許數字、小數點及四則運算符號
  const validExpression = /^[0-9+\-*/.() ]+$/;

  if (!validExpression.test(value)) {
    throw new Error("算式包含不允許的字元");
  }

  /*
    Function 用來計算經過檢查的四則運算式。
    此處只允許數字與基本運算符號。
  */
  return Function(`"use strict"; return (${value})`)();
}

// 顯示錯誤
function showError() {
  expression = "";
  updateDisplay("錯誤");
}

// 按鈕操作
buttons.forEach((button) => {
  button.addEventListener("click", () => {
    const value = button.dataset.value;
    const action = button.dataset.action;

    if (value !== undefined) {
      appendValue(value);
      return;
    }

    switch (action) {
      case "clear":
        clearCalculator();
        break;

      case "delete":
        deleteLastCharacter();
        break;

      case "percent":
        calculatePercent();
        break;

      case "calculate":
        calculateResult();
        break;

      default:
        break;
    }
  });
});

// 鍵盤操作
document.addEventListener("keydown", (event) => {
  const key = event.key;

  if (/^[0-9]$/.test(key)) {
    appendValue(key);
    return;
  }

  if (["+", "-", "*", "/", "."].includes(key)) {
    appendValue(key);
    return;
  }

  if (key === "Enter" || key === "=") {
    event.preventDefault();
    calculateResult();
    return;
  }

  if (key === "Backspace") {
    deleteLastCharacter();
    return;
  }

  if (key === "Escape") {
    clearCalculator();
    return;
  }

  if (key === "%") {
    calculatePercent();
  }
});