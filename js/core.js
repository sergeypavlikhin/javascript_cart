/**
 * Created by Sergey on 04.05.2017.
 */
(function () {
    var context = {};

    const ATTR_ID = "data-id";
    const DEFAULT_WIDTH = "100%";
    const POOL_SIZE = 7;

    var listPool = new ProductPool();
    var cartPool = new ProductPool();

    var adapter = new Adapter();

    DragManager.onDragCancel = function(dragObject) {
        adapter.cancel(dragObject);
    };
    DragManager.onDragEnd = function(dragObject) {
        adapter.end(dragObject);
    };
    DragManager.onDragStart = function(dragObject, dropElem) {
        adapter.start(dragObject);
    };

    renderStand();

    function Adapter() {
        this.cancel = function (dragObject) {
            var dragElem = dragObject.elem;
            dragElem.removeAttribute("style");
            dragElem.style.width = DEFAULT_WIDTH;
            dragObject.avatar.rollback();
        };
        this.start = function (dragObject) {
            var elem = dragObject.elem;
            var computedWidth = document.getElementById("list-box").offsetWidth;
            elem.style.width = (computedWidth - 40) + "px";
        };
        this.end =  function (dragObject) {
            if(cartPool.getSize() == POOL_SIZE) {
                dragObject.avatar.rollback();
                alert("You could buy more than " + POOL_SIZE + " items")
                return;
            }
            var dragElem = dragObject.elem;
            addToCart(dragElem);
        };
    }

    //---------------///

    function addToCart(elem) {
        if(cartPool.getSize() < POOL_SIZE){
            elem.removeAttribute("style");
            elem.style.width = DEFAULT_WIDTH;

            var attrId = elem.getAttribute(ATTR_ID);
            context.cartbox.appendChild(elem);

            exchange(attrId, listPool, cartPool);
            updatePriceList(cartPool.getTotal());
        }
    }

    /**
     * Перетаскивает элемент из {@param source} в {@param destination} элемент с id {@param id}
     * @param id
     * @param source
     * @param destination
     */
    function exchange(id, source, destination) {
        destination.takeFrom(id, source);
    }

    function updatePriceList(total) {
        context.pricelist.innerHTML = total.toFixed(2);
        /*
         var current = +context.pricelist.innerHTML;
         var sign = current >= total ? -1.0 : 1.0;
         var step =  0.1 * sign;
         console.log(step);
         var interval = setInterval(function () {
         if(step > 0 ? (current < total) : (current > total)){
         context.pricelist.innerHTML = current.toFixed(2);
         current += step;
         }else{
         clearInterval(interval);
         }
         }, 1);*/

    }

    function renderStand() {
        var docFragment = document.createDocumentFragment();

        context.container = createElement('container', 'container');
        context.listbox = createElement('list-box ', 'list-box');    //available elements
        context.cartbox = createElement('cart-box droppable','cart-box');      //cart

        context.pricelist = createElement('pricelist', 'pricelist');
        context.pricelist.innerHTML = "0";

        context.cartbox.appendChild(context.pricelist);

        getProducts().forEach(function (item) {
            var prod = new Product(item);
            var product = createElement('product draggable');
            var productTitle = createElement('product-title');

            product.setAttribute(ATTR_ID, item.id);
            productTitle.innerHTML = item.title + " (" + prod.getCost().toFixed(2) + "$)";

            product.append(productTitle);
            context.listbox.append(product);

            var removeLink = createElement("removeLink", "removeLink");
            removeLink.innerHTML = "Remove";
            removeLink.onclick = function () {

                context.cartbox.removeChild(product);
                context.listbox.appendChild(product);

                exchange(item.id, cartPool, listPool);
                updatePriceList(cartPool.getTotal());
            };
            product.append(removeLink);
            listPool.add(prod);
        });

        context.container.append(context.listbox);
        context.container.append(context.cartbox);

        docFragment.appendChild(context.container);

        document.body.appendChild(docFragment);
    }

    function createElement(styleClass, id) {
        var element = document.createElement('div');
        element.setAttribute('class', styleClass);
        if(id){
            element.setAttribute('id', id);
        }
        return element;
    }

    function getProducts() {
        return [
            {id: 1, title: "Audi A4", cost: 9.98},
            {id: 2, title: "BMW 335i", cost: 9.98},
            {id: 3, title: "Lada Priora", cost: 9.98},
            {id: 4, title: "MacBook", cost: 9.98},
            {id: 5, title: "Vodka", cost: 9.98},
            {id: 6, title: "Audi A4", cost: 9.98},
            {id: 7, title: "BMW 335i", cost: 9.98},
            {id: 8, title: "Lada Priora", cost: 9.98},
            {id: 9, title: "MacBook", cost: 9.98},
            {id: 10, title: "Vodka", cost: 9.98},
            {id: 11, title: "Audi A4", cost: 9.98}
        ];
    }
    function Product(props) {
        var id = props['id'];
        var title = props['title'];
        var cost = props['cost'];

        this.getId = function () {
            return id;
        };
        this.getTitle = function () {
            return title;
        };
        this.getCost = function () {
            return cost;
        };
    }

    function ProductPool() {
        var pool = {};
        var self = this;
        var total = 0;
        var size = 0;

        this.add = function (elem) {
            if( elem instanceof Product){
                var element = pool[elem.getId()];
                if(!element){
                    pool[elem.getId()] = elem;
                    total += elem.getCost();
                    size++;
                }
            }
        };

        this.remove = function (elem) {
            if( elem instanceof Product){
                if(size > 0){
                    var element = pool[elem.getId()];
                    if(element){
                        delete pool[elem.id];
                        total -= elem.getCost();
                        size--;
                    }
                }
            }
        };

        this.searchById = function (id) {
            return pool[id];
        };
        this.takeFrom = function (id, pool) {
            var elem = pool.searchById(id);
            self.add(elem);
            pool.remove(elem);
        };
        this.getTotal = function () {
            return total;
        };
        this.getSize = function () {
            return size;
        };
    }
})();