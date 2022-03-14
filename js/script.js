'use stric'; //Соврменный режим (вначале главного файла)

// 1-урок
// 8 типов данных: 1. Простые типы , 2. Комлпексные (объекты)
// int, string, boolean, null, undefined, symbol, BigInt - Простые типы
// массивы, функции, объекты, регулярные выражения, ошибки - Специальные объекты
//  confirm - вопрос да или нет
// promt - для точного ответа (пользователь может написать ответ) -> тип данных string если добавить + впереди, то это будет инт
// const answer = +prompt("Are you ok?", "yes or no");
// console.log(answer + 123);
// const answers = [];
// answers[0] = prompt("What is your name?", "");
// answers[1] = prompt("How old are you?", "");
// answers[2] = prompt("Where are you from?", "");
// document.write(answers); // Для того чтобы удалить все на сайте и вывести это -> устаревший вариант
// console.log(typeof(answers));
// `` - косыми ковычками пишем ссылку на переменное или объект
// const category = 'toys';
// console.log(`htpps://someurl.com/${category}`);
// const userName = "Dias";
// alert(`Salem, ${userName}`);
// унарный плюс - если ставим плюс перед каким то типам данных
// let incr = 10,
//     decr = 10;
// console.log(incr++); постпрефикс - сперва выводит начальное значние, а только потом делает операцию
// console.log(--decr); префикс - сразу же делает операцию только потом выводит
// console.log(5%2);
// == (сравниваем значение) === строгое сравнение по типу данных

let a = 10,
    b= 5;

if(a>b){
    print("YES");
}
