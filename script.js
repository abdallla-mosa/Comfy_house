//variables 

const productsCenter = document.querySelector('.products-center');
const cartContent = document.querySelector('.cart-content');
const cartDom = document.querySelector('.cart');
const carBtn = document.querySelector('.cart-btn');
const clearCartBtn = document.querySelector('.clear-cart');
const closeCartBtn = document.querySelector('.close-cart');
const addToCartBtn = document.querySelector('.bag-btn');
const removeItem = document.querySelector('.remove-item');
const overLay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const itemAmount = document.querySelector('.item-amount');
const TotalPrice = document.querySelector('.cart-footer h3 span');
let cart = [];
let buttonsDOM = []
// getting peoducts 
class Prosucts {
	async getProducts() {
		const result = await fetch('Products.json')
		const data = await result.json()
		const products = data.items.map(item => {
			const { title, price } = item.fields
			const { id } = item.sys
			const image = item.fields.image.fields.file.url;
			return { title, price, id, image }
		})
		return products
	}
}

//dispaly products 
class Ui {
	displayProducts(products) {
		products.forEach(element => {
			productsCenter.innerHTML += `
				<div class="img-container">
				<div class="product">
					<img class="product-img " src="${element.image}">
					<button data-id="${element.id}" class="bag-btn">add To cart <i class="fa fa-cart-shopping"></i></button>
					<h3>${element.title}</h3>
					<h4>$${element.price}</h4>
				</div>
			</div>
				`;
		});
	}

	getBagButtons() {
		const buttons = [...document.querySelectorAll('.bag-btn')];
		buttonsDOM = buttons;
		buttons.forEach(button => {
			let id = button.dataset.id;
			let inCart = cart.find(item => item.id === id);
			if (inCart) {
				button.innerText = "In Cart";
				button.disabled = true
			}
			button.addEventListener('click', event => {
				event.target.innerText = "In Cart";
				event.target.disabled = true
				//get product from products  
				let cartItem = { ...Storage.getProduct(id), amount: 1 };
				cart = [...cart, cartItem];
				// save cart 
				Storage.saveCart(cart);
				// set cart values
				this.setCartValues(cart);
				//diplay cart 
				this.addCartItem(cartItem);
				this.openCart()
			})
		})
	}
	setCartValues(cart) {
		let TempTotal = 0;
		let ItemsTotal = 0;
		cart.map(item => {
			TempTotal += item.price * item.amount;
			ItemsTotal += item.amount
		})
		TotalPrice.innerText = parseFloat(TempTotal.toFixed(2));
		cartItems.innerText = ItemsTotal;
	}
	addCartItem(item) {
		const div = document.createElement("div");
	cartContent.innerHTML += `
	<div class="cart-item">
		<img src=${item.image} alt="">
		 <div>
		 <h4>${item.title}</h4>
		 <h5>${item.price}</h5>
			<span  class="remove-item" data-id="${item.id}">remove</span>
		</div>
		<div >
			<i class="fa fa-chevron-up" data-id="${item.id}"></i>
			<span class="item-amount" id="item-amount">${item.amount}</span>
			<i class="fa fa-chevron-down" data-id="${item.id}"></i>
		</div>
	</div>
			`;
	}

	setupApp() {
		cart = Storage.getCart();
		this.setCartValues(cart)
		this.popuplateCart(cart)
		carBtn.addEventListener('click', this.openCart)
		closeCartBtn.addEventListener('click', this.closeCart)
		this.cartLogic()
	}
	popuplateCart(cart) {
		cart.forEach(item => {
			this.addCartItem(item)
		})
	}
	
	closeCart() {
		cartDom.classList.remove('showCart')
		overLay.classList.remove('transparentBcg')
	}
	
	openCart() {
		cartDom.classList.add('showCart')
		overLay.classList.add('transparentBcg')
	}
	cartLogic() {
		clearCartBtn.addEventListener('click', () => {
			this.clearCart()
		})
		cartContent.addEventListener('click', event => {
			if (event.target.classList.contains("remove-item")){
				let removeItem = event.target;
				let id = removeItem.dataset.id;
				cartContent.removeChild(removeItem.parentElement.parentElement);
				this.removeItem(id)
			}
			else if(event.target.classList.contains('fa-chevron-up')){
				let Additem=event.target;
				let id = Additem.dataset.id;
				let tempItem= cart.find(item=> item.id ===id)
				tempItem.amount = tempItem.amount + 1;
				Additem.nextElementSibling.innerText=tempItem.amount;
				Storage.saveCart(cart)
				this.setCartValues(cart)
			}
			else if(event.target.classList.contains('fa-chevron-down')){
 let lowerAmount= event.target;
	let id = lowerAmount.dataset.id;
	let tempItem= cart.find(item => item.id === id);
	tempItem.amount = tempItem.amount - 1;
	if(tempItem.amount > 0){
		Storage.saveCart(cart)
		lowerAmount.previousElementSibling.innerText = tempItem.amount;
		this.setCartValues(cart)
	}
	else{
		cartContent.removeChild(lowerAmount.parentElement.parentElement)
		this.removeItem(id)
	}
}
		});
	}
	clearCart() {
		let cartItems = cart.map(item => item.id);
		cartItems.forEach(id => this.removeItem(id))
		cartContent.innerHTML = '';
		this.closeCart()
	}
	//remove item
	removeItem(id) {
		cart = cart.filter(item => item.id !== id);
		this.setCartValues(cart)
		buttonsDOM.map(button => {
			if (button.dataset.id === id) {
				button.innerHTML = `Add To Cart <i class="fas fa-cart-shopping"></i>`;
				button.disabled = false;
			}
		}
		)
		Storage.saveCart(cart)
	}
	
}
// store Data
class Storage {
	static saveProducts(products) {
		localStorage.setItem('products', JSON.stringify(products))
	}
	static getProduct(id) {
		let products = JSON.parse(localStorage.getItem('products'));
		return products.find(item => item.id === id);
	}
	static saveCart(cart) {
		localStorage.setItem('cart', JSON.stringify(cart))
	}
	static getCart() {
		return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];
	}
}
// loading some functionality
const products = new Prosucts;
window.addEventListener('DOMContentLoaded', () => {
	const ui = new Ui()
	ui.setupApp()
	// get All products
	products.getProducts().then(products => {
		ui.displayProducts(products)
		Storage.saveProducts(products)
	}).then(() => {
		ui.getBagButtons()
	})
})
