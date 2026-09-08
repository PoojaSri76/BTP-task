
module.exports = (srv)=>{
    // console.log(srv);
    
    const{Vehicles} = srv.entities;
    srv.on("overallSummary", async (req)=>{
        const count = await SELECT.from(Vehicles).columns("state", 
            {func:"count",args:["*"], as : "count"})
            .groupBy("state");
        console.log(count);
        return count
    })
}