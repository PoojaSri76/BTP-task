const cds = require('@sap/cds');

module.exports = cds.service.impl(async function () {
    console.log("inside this:", this.name);
    const { Books, Authors, Orders, Customer } = this.entities;

    // Before handlers
    // Create for authors for validation
    this.before('CREATE', 'Authors', (req, res) => {
        console.log("request data", req.data);
        const { name, country } = req.data;
        if (!name || !country) {
            return req.reject(400, "All fields must be specified")
        }
    })
    // Create for Books for 0 values
    this.before('CREATE', 'Books', async (req, res) => {
        const { price, stock, name, author_ID } = req.data;
        if (price <= 0) {
            return req.reject(400, "Price should be greater than 0")
        }
        if (stock <= 0) {
            return req.reject(400, "Stock should not be empty")
        }
        //  book already exist
        const existing = await SELECT.one.from('Books').where({ name: name });
        if (existing) {
            return req.reject(400, "Book already exist")
        }
        // Increase price for foreign authors
        const author = await SELECT.one.from(Authors).where({ ID: author_ID });
        if (author.country != "INDIA") {
            req.data.price += Math.round(req.data.price * 0.1);
        }
    })

    // Delete on author, if book exist
    this.before('DELETE', Authors, async (req, res) => {
        const { ID } = req.data;
        // const {ID} = req.params[0]
        console.log(ID);

        const existing = await SELECT.one.from(Books).where({ author_ID: ID });
        console.log(existing);

        if (existing) {
            return req.error(400, "Cannot delete this author, the author has books")
        }
    })

    // update on books, prevent reducing price
    this.before('UPDATE', Books, async (req) => {
        // const {ID} = req.data;
        const oldData = await SELECT.one.from(Books).where({ ID: req.data.ID });
        // console.log(oldData);
        if (!oldData) {
            return req.reject(400, "The book in this ID is not available")
        }
        // if (req.data.name != oldData.name || req.data.author_ID != oldData.author_ID) {
        //     req.reject(400, "Book title or author cannot be changed")
        // }
        if (req.data.price <= oldData.price) {
            return req.reject(400, "New price value must not be lesser or equal to current value");
        }
    })
    // Add discount to price
    this.before('CREATE', Orders, async (req) => {
        const { book_ID, quantity } = req.data;
        const bookDetail = await SELECT.one.from(Books).where({ ID: book_ID });
        console.log(bookDetail);
        req.data.total = bookDetail.price * quantity;
        req.data.status = "Pending";
    })

    // On handlers
    // Read for books for in stock
    this.on('READ', Books, async (req) => {
        // console.log("inside read - on handler");
        const result = await SELECT.from('Books').where({ stock: { '>': 0 } }).orderBy({ name: 'asc' });
        return result
    })
    // read for authors using orderby
    this.on('READ', Books, async (req) => {
        console.log("inside read - on handler");
        const result = await SELECT.from('Authors').orderBy({ name: 'asc' });
        return result
    })
    // Update for books, increase price on stock increase
    this.on('UPDATE', Books, async (req, next) => {
        const { stock } = req.data;
        const current = await SELECT.one.from(Books).where({ ID: req.data.ID })
        if (current.stock < req.data.stock && req.data.price == undefined) {
            const result = await UPDATE(Books)
                .set({ stock: stock, price: current.price * 1.05 })
                .where({ ID: req.data.ID })
            return result
        } else {
            await next();
        }
    })
    // After handlers
    // Read for books, add discount
    this.after('READ', 'Books', (result) => {
        const data = result.map(e => {
            if (e.price >= 200 && e.price < 500) {
                e.discount = 5
            } else if (e.price >= 500 && e.price < 1000) {
                e.discount = 10
            }
        })
        return data
        // each.price>500 ? each.discout=10 : each.discout = 5;
    })
    // Read for author, count books
    this.after('READ', Authors, async (result) => {
        const data = await Promise.all(result.map(async (e) => {
            const totalBooks = await SELECT.from(Books).where({ author_ID: e.ID });
            e.bookCount = totalBooks.length || 0;
            return e
        }))
        return data
    })
    // Update in Books, stock alert
    this.after('UPDATE', Books, async (data, req) => {
        const current = await SELECT.from(Books).where({ ID: req.data.ID });
        if (current.stock <= 5) {
            return req.warn(`${current.name} book is running low`)
        }
    })

    // actions
    // mark book inactive
    this.on('bookStatus', async (req) => {
        const { ID } = req.data;
        const result = await UPDATE(Books).set({ status: 'Inactive' }).where({ ID: ID });
        return result;
    })
    // bulk update in book price based on country
    this.on('increasePricesByCountry', async (req) => {
        const { country, percentage } = req.data;
        // implicit join using association name
        const selectedBooks = await SELECT.from(Books).columns('ID', 'price')
            .where({ 'author.country': country })
        if (!selectedBooks) {
            return req.reject(400, `No books from ${country}`)
        }
        for (const e of selectedBooks) {
            const updatedPrice = Math.round(e.price * (1 + percentage / 100))
            console.log(updatedPrice);
            const query = UPDATE(Books)
                .set({ price: updatedPrice })
                .where({ ID: e.ID });
            await cds.run(query)
        }
    })
    // change the order status as completed and reduce stock
    this.on('orderCompleted', async (req) => {
        const { ID } = req.data;
        const order = await SELECT.one.from(Orders).where({ID});
        if (!order) {
            return req.reject(400, "Invalid order ID")
        }
        const orderStatusQuery = await UPDATE(Orders)
            .set({ status: "Completed" })
            .where({ ID });
        const stockReduceQuery = await UPDATE(Books)
        .set({stock:{'-=':order.quantity}})
        .where({ID : order.book_ID})
    })

    // Functions
    // Get all books by an author
    this.on('getBookByAuthor', async (req)=>{
        const {author} = req.data;
        const result = await SELECT.from(Books).where({author_ID : author});
        return result
    })
    // Get customers who ordered a specific book
    this.on('getCustomerByBook', async (req)=>{
        const {bookID} = req.data;
        const orders = await SELECT.from(Orders).where({book:bookID});
        if (!orders) {
            return null
        }
        console.log(orders);
        const customers = await Promise.all(
            orders.map(async (e) => {
                return await SELECT.one.from(Customer).where({ID: e.customer_ID})
            })
        )
        return customers
    })

})