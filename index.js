const canvas = document.querySelector('#canvas');
const _2Pi = 2 * Math.PI;

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

    loadTextures() {
        let loadedCount = 0;
        const textures = [
            './img/p1.png',
            './img/p2.png'
            // './img/p3.png',
            // './img/p4.png',
            // './img/p5.png',
            // './img/p6.png',
            // './img/p7.png',
            // './img/p8.png'
        ];

        this.atomTextures = textures.map(src => {
            const res = {}
            res.img = document.createElement('img');
            res.img.setAttribute('src', src);
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

        }
    }

    spin() {
        let times = 720;
        let speed = 9;
        const spinFn = () => {
            if (times <= 0) {
                this.checkWin();
                return;
            }
            times -= speed;
            this.atomsParams.forEach(p => {
                p.angel += speed;
                if (p.angel == 78 || p.angel === 258) {
                    p.texture = this.atomTextures[Math.round(Math.random() * (this.atomTextures.length - 0.6))];
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

        const checks = new Array(6).fill(0).map((e, i) => check(i, 0));
        const maxNet = Math.max(...checks);
        if (maxNet >= 3) {
            console.log('WIN', checks.indexOf(maxNet));
        } else {
            console.log('LOSE', checks)
        }
    }

    drowAtom(atomsParams) {
        const { texture, elipseParams, angel } = atomsParams;
        const position = this.getElipsePoint(elipseParams, angel);
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

function rollRaund() {
    reactor.spin()
}
