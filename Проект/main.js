const goodListName = document.querySelector('.goods-header .column-name')
const goodsList = document.querySelector('.solo-goods');
const sideCart = document.querySelector('.cart-goods')
const sideCartTotal = document.querySelector('.total')

const menuNavItems = document.querySelectorAll('.navigation-link');
const addButtons = document.querySelectorAll('.add-button')
const trashAllbtn = document.querySelector('.trash-all')

const overlay = document.querySelector('.overlay')
const modalSection = document.querySelector('.modal')
const menu = document.querySelector('.menu')
const empty = document.querySelector('.empty')
const cartCount = document.querySelector('.count')
const cartOrder = document.querySelector('.cart-order')

let localList = []
let localData = JSON.parse(localStorage.getItem('cart'))

if (localData){
    localList = localData
    localData.forEach((localGood)=>{
        localCard=createShortCard(localGood)
        sideCart.append(localCard);
    })
    const localTotalPrice = localData.reduce((sum, item) => sum + item.price * item.count, 0);
    sideCartTotal.textContent = `${localTotalPrice}.-`
    empty.classList.add('hidden')
    cartOrder.classList.remove('hidden')
    cartCount.textContent = localData.reduce((sum, item) => sum + item.count, 0);
}
else{
    empty.classList.remove('hidden')
    cartOrder.classList.add('hidden')
}

let allGoods = []
function getGoods(){
    fetch('db/db.json').then(res => res.json()).then(result => {allGoods = result; renderGoodList(allGoods, 'Все меню')})
}

function saveList(arr){
    localStorage.setItem('cart', JSON.stringify(arr))
}


const cart = {
    cartGoods: localList,
    addCartId(id){
        const goodItem = this.cartGoods.find(good => good.id === id);
        if (goodItem){
            this.plusGood(id);
        }else{
            const {id: idx, name, description, weight, price, img, dju} = allGoods.find(good => good.id === id);
            this.cartGoods.push({id: idx, name, description, weight, price, count: 1, img, dju})
            this.cartRender();
            saveList(this.cartGoods)
        }
    },
    cartRender(){
        sideCart.textContent = '';
        this.cartGoods.forEach(good => {
            const {name, id, description, price, weight, count, img, dju} = good;
            const cartGood = createShortCard(good);
            sideCart.append(cartGood);
        })
        const totalPrice = this.cartGoods.reduce((sum, item) => sum + item.price * item.count, 0);
        cartCount.textContent = this.cartGoods.reduce((sum, item) => sum + item.count, 0);

        sideCartTotal.textContent = `${totalPrice}.-`
        if (this.cartGoods.length){
            empty.classList.add('hidden')
            cartOrder.classList.remove('hidden')
        }
        else{
            empty.classList.remove('hidden')
            cartOrder.classList.add('hidden')
        }
    },
    plusGood(id){
        const elem = this.cartGoods.find(el => el.id === id);
        if (elem){
            elem.count++;
        }
        this.cartRender();
        saveList(this.cartGoods)
    },
    minusGood(id){
        const elem = this.cartGoods.find(el => el.id === id);
        if (elem.count === 1){
            this.deleteGood(id);
        }else{
            elem.count--;
        }
        this.cartRender();
        saveList(this.cartGoods)
    },
    deleteGood(id){
        this.cartGoods = this.cartGoods.filter(el => el.id !== id);
        this.cartRender();
        saveList(this.cartGoods)
    },
    deleteAll(){
        this.cartGoods.forEach(good =>{
            this.deleteGood(good.id)
        })
    }
    
}

document.body.addEventListener('click', (e) =>{
    const target = e.target.closest('.add-button');
    if (target) {
        cart.addCartId(target.dataset.id);
    }
})

sideCart.addEventListener('click', (e) =>{
    const target = e.target;
    if (target.tagName == 'BUTTON'){
        const className = target.className;
        const id = target.dataset.id;
        switch(className){
            case 'trash-one':
                cart.deleteGood(id);
                break;
            case 'minus':
                cart.minusGood(id);
                break;
            case 'plus':
                cart.plusGood(id);
                break;
        }
    }
})

trashAllbtn.addEventListener('click', ()=>{
    cart.deleteAll()
})

menuNavItems.forEach((link) => {
    link.addEventListener('click', (e) => {
        e.preventDefault()
        const field = link.dataset.field;
        if (field){
            const value = link.textContent;
            filterCards(field, value);
            return
        }
        renderGoodList(allGoods, 'Все меню');
    })
})

function renderGoodList(data, t){
    goodListName.textContent = t
    goodsList.textContent = '';
    const cards = data.map(good => createCard(good));
    goodsList.append(...cards);
    document.body.classList.add('show-goods');
}

function filterCards(field, value){
    renderGoodList(allGoods.filter(good => good[field] === value), value)
}

function createShortCard(good) {
    const cartGood = document.createElement('div');
    cartGood.className = 'short-card';
    cartGood.dataset.id = good.id;
    cartGood.innerHTML = `
            <div class="short-card-info">
                <img src="${good.img}" alt="${good.name}">
                <div class="name"><a href="#">${good.name}</a></div>
                <button class="trash-one" data-id="${good.id}"></button>
            </div>
            <div class="price-and-button">
                <div class="price">${good.price}.-</div>
                <div class="button-group">
                    <ul class="control-amount">
                        <li>
                            <button class="minus" data-id="${good.id}">-</button>
                            <input type="text" name="amount" value="${good.count}" disabled="" data-id="${good.id}">
                            <button class="plus" data-id="${good.id}">+</button>
                        </li>
                    </ul>
                </div>
            </div>            
            `;

    cartGood.querySelector('a').addEventListener('mouseup', ()=>{
        const modal = updateModal(good)
        modalSection.append(modal)
        modal.classList.add('show')
        overlay.classList.add('show')
        document.body.style = "overflow: hidden;"
        menu.style = "pointer-events: none;"
    })
    return cartGood;
}

function updateModal(objCard){
    const modal = document.querySelector('.modal-box')
    modal.innerHTML = `
    <button class="close-modal" data-id="${objCard.id}"><span></span></button>
    <img src="${objCard.img}" alt="${objCard.name}">
    <div class="about-modal">
        <div class="modal-header">
            <div class="name">${objCard.name}</div>
            <div class="weight">${objCard.weight}гр</div>
        </div>
        <div class="description">${objCard.description}</div>
        <div class="bju">${objCard.dju}</div>
        <div class="price-and-button">
            <div class="price">${objCard.price}.–</div>
            <div class="button-group">
                <button class="add-button" data-id="${objCard.id}">
                    Добавить
                </button>
            </div>
        </div>
    </div>
    `
    modal.querySelector('.close-modal').addEventListener('click', ()=>{
        modal.innerHTML = ''
        overlay.classList.remove('show')
        document.body.style = "overflow: visible;"
        menu.style = ""
    })

    return modal
}


function createCard(objCard){
    const card = document.createElement('div')
    card.className ='good-card'
    card.innerHTML = `
    <img class="card-img" src="${objCard.img}" alt="${objCard.name}">
	<div class="good-info">
		<div class="name">${objCard.name}</div>
		<div class="good-weight">${objCard.weight}гр</div>
	</div>
	<div class="price-and-button">
		<div class="price">${objCard.price}.-</div>
		<div class="button-group">
			<button class="add-button" data-id="${objCard.id}">
				Добавить
			</button>
		</div>
	</div>
    `

    card.querySelector('.card-img').addEventListener('mouseup', ()=>{
        const modal = updateModal(objCard)
        modalSection.append(modal)
        modal.classList.add('show')
        overlay.classList.add('show')
        document.body.style = "overflow: hidden;"
        menu.style = "pointer-events: none;"
    })
    return card
}

getGoods()
