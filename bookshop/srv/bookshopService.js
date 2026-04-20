
module.exports = (srv)=>{
    const {Books} = srv.entities;
    srv.on('bookInstock', async()=>{
        const data = await SELECT.from(Books).where({stock:{'>':2000}});
        return data
    })
}