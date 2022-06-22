const STORE = {
    get(key, def) {
        return localStorage.getItem(key) || def;
    },
    set(key, value) {
        localStorage.setItem(key, value)
    }
}


const canvas = document.querySelector('#canvas');
const _2Pi = 2 * Math.PI;
let balance = +STORE.get('balance', 1000);
let bet = +STORE.get('bet', 50);
let saveCoefBonus = +STORE.get('saveCoefBonus', 1);
let bonus2 = +STORE.get('bonus2', 1);


class ElipseParams {
    constructor(a, b, center, rotation, color) {
        this.a = a;
        this.b = b;
        this.center = center;
        this.rotation = rotation;
        this.color = color || 'rgba(0, 0, 0, 0)';
    }
}

class AtomParams {
    constructor(texture, elipseParams, angel) {
        this.texture = texture;
        this.elipseParams = elipseParams;
        this.angel = angel;
    }
}

class Reactor {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.render();
        this.loadTextures();
    }

    createTexture(src) {
        const img = document.createElement('img');
        img.setAttribute('src', src);
        return img;
    }

    loadTextures() {
        let loadedCount = 0;
        const textures = [
            './img/p1.png',
            './img/p2.png',
            './img/p3.png',
            './img/p4.png',
            './img/p5.png'
            // './img/p6.png',
            // './img/p7.png',
            // './img/p8.png'
        ];

        this.hilightTexture = this.createTexture('./img/hilight.png');
        this.hilightWinTexture = this.createTexture('./img/hilight_win.png');



        this.atomTextures = textures.map(src => {
            const res = {}
            res.img = this.createTexture(src);
            res.img.onload = () => {
                loadedCount++;
                res.originalSize = { width: res.img.width, height: res.img.height };
                if (loadedCount === textures.length) {
                    this.loaded = true;
                    this.updateSize();
                }
            }
            return res;
        });
    }

    render() {
        const renderFn = () => {
            this.updateSize();
            this.drowElipse(this.elipse1p);
            this.drowElipse(this.elipse1m);
            this.drowElipse(this.elipse2p);
            this.drowElipse(this.elipse2m);
            this.drowElipse(this.elipse3p);
            this.drowElipse(this.elipse3m);

            if (this.loaded) {
                this.atomsParams.forEach(p => this.drowAtom(p));
            }
            requestAnimationFrame(() => renderFn());
        }
        renderFn();
    }

    updateSize() {
        this.canvasRect = this.canvas.getBoundingClientRect();
        this.canvas.setAttribute('width', this.canvasRect.width);
        this.canvas.setAttribute('height', this.canvasRect.height);
        this.center = { x: this.canvasRect.width / 2, y: this.canvasRect.height / 2 };
        const A = this.canvasRect.height / 2 * 0.8;
        const B = this.canvasRect.width / 2 * 0.4;
        const scale = 0.03;
        const Ap = A * (1 + scale);
        const Bp = B * (1 + scale);
        const Am = A * (1 - scale);
        const Bm = B * (1 - scale);

        this.elipse1 = new ElipseParams(A, B, this.center, Math.PI / 2 - Math.PI / 3);
        this.elipse1p = new ElipseParams(Ap, Bp, this.center, Math.PI / 2 - Math.PI / 3, 'rgb(96, 99, 254)');
        this.elipse1m = new ElipseParams(Am, Bm, this.center, Math.PI / 2 - Math.PI / 3, 'rgb(5, 154, 143)');

        this.elipse2 = new ElipseParams(A, B, this.center, Math.PI / 2);
        this.elipse2p = new ElipseParams(Ap, Bp, this.center, Math.PI / 2, 'rgb(91, 102, 254)');
        this.elipse2m = new ElipseParams(Am, Bm, this.center, Math.PI / 2, 'rgb(84, 105, 244)');

        this.elipse3 = new ElipseParams(A, B, this.center, Math.PI / 2 + Math.PI / 3);
        this.elipse3p = new ElipseParams(Ap, Bp, this.center, Math.PI / 2 + Math.PI / 3, 'rgb(72, 136, 254)');
        this.elipse3m = new ElipseParams(Am, Bm, this.center, Math.PI / 2 + Math.PI / 3, 'rgb(55, 123, 211)');

        if (this.loaded) {
            if (!this.atomsParams) {
                this.atomsParams = [
                    new AtomParams(this.atomTextures[0], this.elipse1, 15),
                    new AtomParams(this.atomTextures[0], this.elipse1, 195),
                    new AtomParams(this.atomTextures[0], this.elipse2, 15),
                    new AtomParams(this.atomTextures[0], this.elipse2, 195),
                    new AtomParams(this.atomTextures[0], this.elipse3, 15),
                    new AtomParams(this.atomTextures[0], this.elipse3, 195)
                ]
            }

            this.atomsParams[0].elipseParams = this.elipse1;
            this.atomsParams[1].elipseParams = this.elipse1;
            this.atomsParams[2].elipseParams = this.elipse2;
            this.atomsParams[3].elipseParams = this.elipse2;
            this.atomsParams[4].elipseParams = this.elipse3;
            this.atomsParams[5].elipseParams = this.elipse3;

            this.atomsParams.forEach(p => {
                const size = this.canvasRect.width * 0.08;
                p.texture.width = size;
                p.texture.height = size / p.texture.originalSize.width * p.texture.originalSize.height;
            })

            this.hilightSize = this.canvasRect.width * 0.1;

        }
    }


    updateWinCef(value) {
        if (value) {
            this.winCoef = value;
        }
        xCoefDiv.innerHTML = `x${this.winCoef}`;

        if (this.winCoef > 1) {
            xCoefDiv.classList.add('x_coef_active')
        } else {
            xCoefDiv.classList.remove('x_coef_active')
        }
    }

    spin() {
        if (this.locked) { return; }
        if (bet > balance) {
            bet = balance;
            updateBet();
        }

        if (balance === 0) {
            balance = 500;
            updateBalance();
        }
        balance -= bet;
        updateBalance();
        this.locked = true;
        if (!this.bonus1) {
            this.updateWinCef(1);
        } else {
            this.bonus1 = false;
        }

       
        let times = 720;
        let speed = 9;

        this.atomsParams.forEach(a => a.hilight = null);

        const spinFn = () => {
            if (times <= 0) {
                this.checkWin();
                return;
            }
            times -= speed;
            this.atomsParams.forEach(p => {
                p.angel += speed;
                if (p.angel == 78 || p.angel === 258) {
                    p.texture = this.atomTextures[Math.round(Math.random() * (this.bonus2 ? 3 : this.atomTextures.length - 0.6))];
                }

                if (p.angel >= 360) {
                    p.angel = p.angel % 360;
                }
            })
            requestAnimationFrame(() => spinFn());
        }
        spinFn();
    }

    checkWin() {
        const row = [
            this.atomsParams[0],
            this.atomsParams[5],
            this.atomsParams[3],
            this.atomsParams[1],
            this.atomsParams[4],
            this.atomsParams[2]
        ];

        const check = (i, size) => {
            const nextIndex = ((i + 1) === 6) ? 0 : (i + 1);
            if (row[i].texture.img.src === row[nextIndex].texture.img.src && size < 6) {
                return check(nextIndex, size + 1)
            } else {
                return size;
            }
        }

        const checks = new Array(6).fill(0).map((e, i) => check(i, 1));
        const maxNet = Math.max(...checks);
        const maxNetStartIndex = checks.indexOf(maxNet);

        row.forEach((a) => a.hilight = this.hilightTexture);

        if (maxNet >= 3) {
            for (let i = maxNetStartIndex; i < maxNetStartIndex + maxNet; i++) {
                row[i % 6].hilight = this.hilightWinTexture;
            }


            balance += bet * maxNet;

            updateBalance();

            this.updateWinCef(this.winCoef + 1);

            setTimeout(() => {
                for (let i = maxNetStartIndex; i < maxNetStartIndex + maxNet; i++) {
                    row[i % 6].hilight = this.hilightTexture;
                    row[i % 6].texture = this.atomTextures[Math.round(Math.random() * (this.bonus2 ? 3 : this.atomTextures.length - 0.6))];
                }
                this.checkWin();
            }, 1000);
            console.log('WIN');
        } else {
            console.log('LOSE', checks)
            this.locked = false;
            this.bonus2 = false;
        }
    }

    drowAtom(atomsParams) {
        const { texture, elipseParams, angel } = atomsParams;
        const position = this.getElipsePoint(elipseParams, angel);


        if (atomsParams.hilight) {
            this.ctx.drawImage(atomsParams.hilight, position.x - this.hilightSize / 2, position.y - this.hilightSize / 2, this.hilightSize, this.hilightSize);
        }

        this.ctx.drawImage(texture.img, position.x - texture.width / 2, position.y - texture.height / 2, texture.width, texture.height);
    }



    drowElipse(elipseParams) {
        this.ctx.beginPath();

        this.ctx.strokeStyle = elipseParams.color;
        this.ctx.lineWidth = 3;
        const zeroPoint = this.getElipsePoint(elipseParams, 0);
        this.ctx.moveTo(zeroPoint.x, zeroPoint.y);
        for (let f = 0; f < 361; f++) {
            const point = this.getElipsePoint(elipseParams, f);
            this.ctx.lineTo(point.x, point.y);
        }

        this.ctx.stroke();
    }

    /**
     * 
     * @param {*} a 
     * @param {*} b 
     * @param {*} center 
     * @param {*} rotation 
     * @param {number 0 - 360} angel 
     * @returns {x, y}
     */
    getElipsePoint(elipseParams, angel) {
        const { a, b, center, rotation } = elipseParams;
        const x = a * Math.sin(angel / 360 * _2Pi);
        const y = b * Math.cos(angel / 360 * _2Pi);
        const rX = x * Math.cos(rotation) - y * Math.sin(rotation);
        const rY = x * Math.sin(rotation) + y * Math.cos(rotation);

        const final = {
            x: rX + center.x,
            y: rY + center.y
        }

        return final;
    }

}

const reactor = new Reactor(canvas);


function bonus1Activate() {
    if (reactor.bonus1) {
        return;
    }
    if (saveCoefBonus > 0) {
        saveCoefBonus--;
        reactor.bonus1 = true;
        updateBonuses();
    }
}
function bonus2Activate() {
    if (reactor.bonus2) {
        return;
    }
    if (bonus2 > 0) {
        bonus2--;
        reactor.bonus2 = true;
        updateBonuses();
    }
}

function updateBonuses() {
    STORE.set('saveCoefBonus', saveCoefBonus);
    STORE.set('bonus2', bonus2);
    document.querySelectorAll('.bonus-row .bonus-btn span')[0].innerHTML = saveCoefBonus;
    document.querySelectorAll('.bonus-row .bonus-btn span')[1].innerHTML = bonus2;
}

function updateBet() {
    if (bet == 0) { bet = 50 }
    STORE.set('bet', bet);
    document.querySelector('.bet span').innerHTML = bet;
}

function updateBalance() {
    STORE.set('balance', balance);
    document.querySelectorAll('.balace span').forEach(e => e.innerHTML = balance);
}

updateBet();
updateBalance();
updateBonuses();

function betPlus() {
    bet += 50;
    if (bet > balance) {
        bet = balance;
    }
    if (balance < 50) {
        balance = 1000;
    }
    updateBet();
}

function betMinus() {
    bet -= 50;
    if (bet <= 0) {
        bet = 50;
    }
    updateBet();
}


function rollRaund() {
    reactor.spin()
}


function acept() {
    document.querySelector('.terms').classList.add('terms_hidden');
    setTimeout(() => {
        document.querySelector('.terms').style.display = 'none';
    }, 300)
}

function play() {
    document.querySelector('.menu').classList.add('terms_hidden');
    setTimeout(() => {
        document.querySelector('.menu').style.display = 'none';
    }, 300)
}

function menu() {
    try {
        document.querySelector('.shop_active').classList.remove('shop_active');
    } catch (e) { }
    document.querySelector('.menu').classList.remove('terms_hidden');
    document.querySelector('.menu').style.display = 'flex';
}

function shop() {
    document.querySelector('.shop').classList.add('shop_active');
}

function buyBlue() {
    if (balance < 300) { return; }
    balance -= 300;
    bonus2++;
    updateBonuses();
    updateBalance();
}

function buyYellow() {
    if (balance < 500) { return; }
    balance -= 500;
    saveCoefBonus++;
    updateBonuses();
    updateBalance();
}

function checkRotate() {
    requestAnimationFrame(() => checkRotate());

    const a = document.querySelector('.wrapper').getBoundingClientRect().width / document.querySelector('.wrapper').getBoundingClientRect().height;

    try {

        if (a > 0.8) {
            document.querySelector('.rotatescreent').style.display = 'flex';
        } else {
            document.querySelector('.rotatescreent').style.display = 'none';
        }
    } catch (e) { }
}

checkRotate();