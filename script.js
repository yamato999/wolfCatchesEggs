const canvas = document.querySelector('canvas'); //создаем канвас
const c = canvas.getContext('2d');
canvas.width = innerWidth;
canvas.height = innerHeight;
const count = document.getElementById('counter');
const currentLives = document.getElementById('current-lives');
const leftTop = document.getElementById('button-1');
const leftBot = document.getElementById('button-2');
const rightTop = document.getElementById('button-3');
const rightBottom = document.getElementById('button-4');
let gameOverScreen = document.getElementById("game-over-screen");
let restartButton = document.getElementById("restart-button");
let recordDocument = document.getElementById('Record');
let bestRecord = 0;

class Background{ //класс фона, который затем мы будем отрисовывать
    constructor() {
        this.position = {
            x: 0,
            y: 0
        }
        const image = new Image();
        image.src = './img/Screenshot_10.png';
        image.onload = () => {
            this.image = image;
            this.width = canvas.width;
            this.height = canvas.height
        }
    }
        draw(){ //функция рисования на канвасе
            if(this.image){
                c.drawImage(
                    this.image,
                    this.position.x,
                    this.position.y,
                    this.width,
                    this.height
                )
            }
    }
}
class Wolf { // класс волка для отрисовки
    constructor() {
        this.position = {
            x: 375,
            y: 375
        }

        const image = new Image();
        image.src = './img/wolf-left-bottom.png';
        image.onload = () => {
            this.image = image;
            this.width = image.width * 1.2;
            this.height = image.height * 1.2
        }
    }
        draw(){ //функция рисования на канвасе
            if(this.image){
                c.drawImage(
                    this.image,
                    this.position.x,
                    this.position.y,
                    this.width,
                    this.height
                )
            }
    }

}

class Egg{
    constructor(positionX, positionY, velocityX, velocityY) {
        this.position = {
            x: positionX,
            y: positionY
        }
        this.velocity = {
            x: velocityX,
            y: velocityY
        }

        const image = new Image();
        image.src = './img/egg.png';
        image.onload = () => { //здесь мы задаем свойства изображения только после того, как оно прогрузится
            this.image = image;
            this.width = image.width * 0.08;
            this.height = image.height * 0.08
        }
    }
    draw() { //отрисовываем
        if (this.image) {
            c.drawImage(
                this.image,
                this.position.x,
                this.position.y,
                this.width,
                this.height
            )
        }
    }
    update() { //и с каждым кадром мы будем обновлять позицию яйца - учитывая его скорость и направление
        this.draw()
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }

}

let wolf = new Wolf();
let background = new Background();
let fps = 100;
let frames = 0;
let difficulty = 25;
let counter = 0;
const eggData = { //объект, в котором хранятся точки спавна и направление движения каждого яцйа (вида)
    topLeft: { positionX: 110, positionY: 210, velocityX: 3.5, velocityY: 1.8  },
    bottomLeft: { positionX: 110, positionY: 400, velocityX: 3.5, velocityY: 1.8 },
    topRight: { positionX: 1350, positionY: 220, velocityX: -3.5, velocityY: 1.8 },
    bottomRight: { positionX: 1300, positionY: 420, velocityX: -3.5, velocityY: 1.8 }
};
const { topLeft, bottomLeft, topRight, bottomRight } = eggData; //деструктуризация
let eggs = [];
let gameStopped = false;
let lives = 3;

function animate() {  //функция покадровой анимации

    if(!gameStopped){
        setTimeout(function() {
            requestAnimationFrame(animate);

            background.draw();
            wolf.draw();
            eggs.forEach(egg => {
                egg.draw();
                egg.update()// отрисовка каждого яйца на экране
            });
            eggs.forEach((egg, i) => { //логика коллизии, проверяем каждое яйцо и если оно совпадает с положением корзины волка - удаляем яйцо и увеличиваем кол-во пойманных яиц
                if(isEqualWithTolerance(wolf.position.y + wolf.height - 80, egg.position.y, 15)&&
                    isEqualWithTolerance(wolf.position.x, egg.position.x, 15) ||
                    isEqualWithTolerance(wolf.position.x + wolf.width - 30, egg.position.x, 15) &&
                    isEqualWithTolerance(wolf.position.y + 25, egg.position.y, 15) ||
                    isEqualWithTolerance(wolf.position.y + 80, egg.position.y, 15) &&
                    isEqualWithTolerance(wolf.position.x + 20, egg.position.x, 15) ||
                    isEqualWithTolerance(wolf.position.y + wolf.height - 100, egg.position.y, 15) &&
                    isEqualWithTolerance(wolf.position.x + wolf.width - 30, egg.position.x, 15))
                {
                    eggs.splice(i,1);
                    playSound();
                    counter++; //а также это значит, что мы поймали яйцо и мы инкрементируем переменную-счетчик
                }


            });
            spawnEggs();  //вызываем функцию спавна яйца.
            frames++;
            eggs.forEach((egg, i) => {           //как яйцо достигает краев канваса - яйцо удаляется из массива
                if(egg.position.y >= canvas.height || egg.position.x < 0 || egg.position.x >= canvas.width){
                    eggs.splice(i,1);
                    lives--;
                }
            })
        }, fps);//за счет тайм-аута вызова функции мы можем контролировать скорость обновления этих кадров и тем самым регулировать скорость игры
        count.textContent = `Поймано яиц: ${counter.toString()}`;
        currentLives.textContent = `Осталось жизней: ${lives.toString()}`;//отображаем кол-во пойманных яиц
        if(lives === 0){
            gameStopped = true;
        }
    } else{ //когда игра заканчивается - мы пишем логику обновления рекорда
        if(counter > bestRecord){
            bestRecord = counter;
        }
        recordDocument.textContent = `Ваш рекорд: ${bestRecord.toString()}`;
        gameOverScreen.style.display = "block"; //и делаем видимым наше окно GameOver
    }

}
function isEqualWithTolerance(num1, num2, tolerance) {  //функция сравнения с погрешностью - нужна при проверке на коллизию яйца и волка
    const diff = Math.abs(num1 - num2);
    return diff <= tolerance;
}
function spawnEggs(){  //функция спавна яйца
    let rnd = Math.floor(Math.random() * 4) //от 0 до 3 число
    if(frames % difficulty === 0){ //за счет этого выражения мы регулируем частоту спавна яйца
        switch (rnd) { //в зависимости от рандомного числа мы рандомно выбираем в каком месте заспавнить яйцо

            case 0: eggs.push(new Egg(topLeft.positionX, topLeft.positionY, topLeft.velocityX, topLeft.velocityY));
            break;
            case 1: eggs.push(new Egg(topRight.positionX, topRight.positionY, topRight.velocityX, topRight.velocityY));
                break;
            case 2: eggs.push(new Egg(bottomLeft.positionX, bottomLeft.positionY, bottomLeft.velocityX, bottomLeft.velocityY));
                break;
            case 3: eggs.push(new Egg(bottomRight.positionX, bottomRight.positionY, bottomRight.velocityX, bottomRight.velocityY));
                break;


        }
    }
    if(frames % 150 === 0){  //каждый 150 кадр мы увеличиваем частоту появления яйца
        difficulty-= 1;
    }
}
function playSound() {
    let audio = document.getElementById("bell-ring");
    audio.play();
}

animate();
addEventListener("keydown", ({key}) =>{  //ивент-лисенер - двигаем волка (перемещаем по 4 паттернам)
    switch(key){
        case 'q':  //на каждую кнопку - меняем изображение и задаем позицию, затем создаем видимость прожатия кнопки сбоку
            console.log('q')
            wolf.image.src = './img/wolf-left-top.png';
            wolf.position.x = 400;
            wolf.position.y = 300;
            leftTop.classList.add("brighten");
            setTimeout(function() {
                leftTop.classList.remove("brighten");
                console.log('1')
            }, 200);
            break;
        case 'e':
            console.log('e');
            wolf.image.src = './img/wolf-right-top.png';
            wolf.position.x = 920;
            wolf.position.y = 300;
            rightTop.classList.add("brighten");
            setTimeout(function() {
                rightTop.classList.remove("brighten");
                console.log('1')
            }, 200);
            break;
        case 'a':
            console.log('a');
            wolf.image.src = './img/wolf-left-bottom.png';
            wolf.position.x = 375;
            wolf.position.y = 375;
            leftBot.classList.add("brighten");
            setTimeout(function() {
                leftBot.classList.remove("brighten");
                console.log('1')
            }, 200);
            break;
        case 'd':
            console.log('d');
            wolf.image.src = './img/wolf-right-bot.png';
            wolf.position.x = 900;
            wolf.position.y = 350;
            rightBottom.classList.add("brighten");
            setTimeout(function() {
                rightBottom.classList.remove("brighten");
                console.log('1')
            }, 200);


    }
})
restartButton.addEventListener("click", function() { //кнопка рестарта, здесь обновляем все данные и заново запускаем игру
    gameOverScreen.style.display = "none";
    gameStopped = false;
    c.clearRect(0, 0, canvas.width, canvas.height);
    lives = 3;
    counter = 0;
    eggs = [];
    animate();

});

window.addEventListener('click', () =>{ //запускаем бэкграунд музыку по клику на экрану
    let audio = document.getElementById("background-sound");
    audio.play();
})