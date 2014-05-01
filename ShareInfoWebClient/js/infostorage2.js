utils = {
	setParam : function(name, value) {
		localStorage.setItem(name, value);
	},
	getParam : function(name) {
        return localStorage.getItem(name);
	}
};

product = {
	id : "",
	psize : "S",
	pkind : "P",
	echeese : "N",
	num : 0,
	price : 0.00
};
orderdetail = {
	id : "",
	firstname : "",
	lastname : "",
	address : "",
	phone : "",
	saletype : "",
	credittype : "",
	creditno : "",
	creditdate : "",
	totalNumber : 0,
	totalAmount : 0.00
};

cart = {
	//Add product to cart
	addproduct : function(product) {
		var ShoppingCart = utils.getParam("ShoppingCart");
		if (ShoppingCart == null || ShoppingCart == "") {
			//Add product first
			var jsonstr = {
				"productlist" : [{
					"id" : product.id,
					"psize" : product.psize,
					"pkind" : product.pkind,
					"echeese" : product.echeese,
					"num" : product.num,
					"price" : product.price
				}],
				"totalNumber" : product.num,
				"totalAmount" : (product.price * product.num)
			};
			utils.setParam("ShoppingCart", "'" + JSON.stringify(jsonstr));
		} else {

			var jsonstr = JSON.parse(ShoppingCart.substr(1, ShoppingCart.length));
			var productlist = jsonstr.productlist;
			var result = false;
			//Search if there is the product
			for (var i in productlist) {
				if (productlist[i].id == product.id) {
					if (productlist[i].num == null) {
						productlist[i].num = 0;
					}
					productlist[i].num = parseInt(productlist[i].num) + parseInt(product.num);
					result = true;
				}
			}
			if (!result) {
				//Add the product to cart
				productlist.push({
					"id" : product.id,
					"psize" : product.psize,
					"pkind" : product.pkind,
					"echeese" : product.echeese,
					"num" : product.num,
					"price" : product.price
				});
			}
			//Recalculate cost
			if (jsonstr.totalNumber == null) {
				jsonstr.totalNumber = 0;
			}
			if (jsonstr.totalAmount == null) {
				jsonstr.totalAmount = 0;
			}
			jsonstr.totalNumber = parseInt(jsonstr.totalNumber) + parseInt(product.num);
			jsonstr.totalAmount = (parseFloat(jsonstr.totalAmount) + (parseInt(product.num) * parseFloat(product.price))).toFixed(2);
			orderdetail.totalNumber = jsonstr.totalNumber;
			orderdetail.totalAmount = jsonstr.totalAmount;
			//Save the cart
			utils.setParam("ShoppingCart", "'" + JSON.stringify(jsonstr));
		}
	},
	//Modify the quantity of product
	updateproductnum : function(id, num) {
		var ShoppingCart = utils.getParam("ShoppingCart");
		var jsonstr = JSON.parse(ShoppingCart.substr(1, ShoppingCart.length));
		var productlist = jsonstr.productlist;

		for (var i in productlist) {
			if (productlist[i].id == id) {
				jsonstr.totalNumber = parseInt(jsonstr.totalNumber) + (parseInt(num) - parseInt(productlist[i].num));
				jsonstr.totalAmount = (parseFloat(jsonstr.totalAmount) + (parseInt(num) * parseFloat(productlist[i].price)) - (parseInt(productlist[i].num) * parseFloat(productlist[i].price))).toFixed(2);
				productlist[i].num = parseInt(num);

				orderdetail.totalNumber = jsonstr.totalNumber;
				orderdetail.totalAmount = jsonstr.totalAmount;
				utils.setParam("ShoppingCart", "'" + JSON.stringify(jsonstr));
				return;
			}
		}
	},
	//Get all products list
	getproductlist : function() {
        var ShoppingCart = utils.getParam("ShoppingCart");
		var jsonstr = JSON.parse(ShoppingCart.substr(1, ShoppingCart.length));
		var productlist = jsonstr.productlist;
		orderdetail.totalNumber = jsonstr.totalNumber;
		orderdetail.totalAmount = jsonstr.totalAmount;
		return productlist;
	},

	//Check the product is exist
	existproduct : function(id) {
		var ShoppingCart = utils.getParam("ShoppingCart");
		var jsonstr = JSON.parse(ShoppingCart.substr(1, ShoppingCart.length));
		var productlist = jsonstr.productlist;
		var result = false;
		for (var i in productlist) {
			if (productlist[i].id == product.id) {
				result = true;
			}
		}
		return result;
	},

	//Remove from cart
	deleteproduct : function(id) {
		var ShoppingCart = utils.getParam("ShoppingCart");
		var jsonstr = JSON.parse(ShoppingCart.substr(1, ShoppingCart.length));
		var productlist = jsonstr.productlist;
		var list = [];
		for (var i in productlist) {
			if (productlist[i].id == id) {
				jsonstr.totalNumber = parseInt(jsonstr.totalNumber) - parseInt(productlist[i].num);
				jsonstr.totalAmount = (parseFloat(jsonstr.totalAmount) - parseInt(productlist[i].num) * parseFloat(productlist[i].price)).toFixed(2);
			} else {
				list.push(productlist[i]);
			}
		}
		jsonstr.productlist = list;
		orderdetail.totalNumber = jsonstr.totalNumber;
		orderdetail.totalAmount = jsonstr.totalAmount;
		utils.setParam("ShoppingCart", "'" + JSON.stringify(jsonstr));
	}
};

order = {
	//save order to storage
	saveorder : function(orderdetail) {
		localStorage.removeItem("OrderDetails");
		var OrderDetails = utils.getParam("OrderDetails");
		if (OrderDetails == null || OrderDetails == "") {
			var jsonstr = {
				"id" : orderdetail.id,
				"firstname" : orderdetail.firstname,
				"lastname" : orderdetail.lastname,
				"address" : orderdetail.address,
				"phone" : orderdetail.phone,
				"saletype" : orderdetail.saletype,
				"credittype" : orderdetail.credittype,
				"creditno" : orderdetail.creditno,
				"creditdate" : orderdetail.creditdate,
				"totalAmount" : orderdetail.totalAmount
			};
			utils.setParam("OrderDetails", "'" + JSON.stringify(jsonstr));
		}
	},

	//Get all order details
	getorderdetails : function() {
		var OrderDetails = utils.getParam("OrderDetails");
		var order = JSON.parse(OrderDetails.substr(1, OrderDetails.length));
		return order;
	}
};

$.validator.addMethod(
      "regex",
      function(value, element, regexp) {
          var check = false;
          var re = new RegExp(regexp);
          return this.optional(element) || re.test(value);
      },""
);
