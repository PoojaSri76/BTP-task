const cds = require('@sap/cds');
const axios = require('axios');
module.exports = cds.service.impl(async function () {
    console.log(this.name);
    this.on('getLocation', async (req) => {
        const { location } = req.data;
        if (!location) return req.reject(404, "Input not found")
        try {
            const res = await axios.get('https://nominatim.openstreetmap.org/search', {
                params: {
                    q: `${location}`,
                    extratags: 1,
                    addressdetails: 1,
                    format: 'json'
                },
                headers: {
                    'User-Agent': 'cap-app'
                }
            })

            const locationData = res.data[0];
            console.log(locationData);
            if (!locationData) return req.reject(404, "Location not found, Try different location");
            let subDiv;
            if (locationData.addresstype == "country" || locationData.addresstype == "state"){
                let subDivApi = "";
                let reqBody = {};
                if (locationData.addresstype == "country") {
                    // country state city
                    subDivApi = `https://api.countrystatecity.in/v1/countries/${locationData.address.country_code}/states`

                    // countriesnow
                    // subDivApi = `https://countriesnow.space/api/v0.1/countries/states`;
                    // reqBody = {
                    //     "country": locationData.address.country
                    // }
                    // console.log(reqBody);

                } else if (locationData.addresstype == "state") {
                    console.log("state api");
                    subDivApi = `https://api.countrystatecity.in/v1/countries/${locationData.address.country_code}/states/${locationData.extratags.state_code}/cities`
                    // subDivApi = `https://api.countrystatecity.in/v1/countries/IN/states/TN/cities`

                    // countriesnow (post)
                    // subDivApi = `https://countriesnow.space/api/v0.1/countries/state/cities`
                    // reqBody = {
                    //     "country": locationData.address.country,
                    //     "state": locationData.address.state
                    // }
                }
                const res2 = await axios.get(
                    subDivApi,
                    // reqBody,
                    {
                        headers: {
                            'X-CSCAPI-KEY': '5abbaebb89c4c03b03760cceb76f76b845353c4f23f8f9eb5c20e14174b8d3ca'
                        }
                    }
                );

                const child = res2.data;
                console.log(child);
                subDiv = child.map(e => e.name)
                console.log(subDiv.length);
            }

            const output = {
                latitude: locationData.lat,
                longitude: locationData.lon,
                display_name: locationData.display_name,
                boundingbox: locationData.boundingbox,
                sub_division: subDiv || []
            }

            return output
        } catch (error) {
            console.log(error);
        }
    })

    this.on('getStructuredLocation', async (req) => {
        const {
            amenity,
            street,
            city,
            county,
            state,
            country,
            postalcode
        } = req.data;
        if (!amenity && !street && !city && !county && !state && !country && !postalcode) {
            return req.reject(400, "Provide at least one search parameter");
        }
        try {
            const res = await axios.get('https://nominatim.openstreetmap.org/search', {
                params: {
                    amenity,
                    street,
                    city,
                    county,
                    state,
                    country,
                    postalcode,
                    format: 'json'
                },
                headers: {
                    'User-Agent': 'cap-app'
                }
            });
            const data = res.data;
            if (!data) {
                return req.reject(404, "No results found");
            }
            console.log(data);

            return data.map(loc => ({
                latitude: loc.lat,
                longitude: loc.lon,
                display_name: loc.display_name,
                boundingbox: loc.boundingbox
            }));
        } catch (error) {
            console.error(error);
            req.reject(500, error.message);
        }
    });


})



