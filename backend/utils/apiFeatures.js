class ApiFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    search() {
        const keyword = this.queryString.keyword ? {
            name:{
                $regex: this.queryString.keyword,
                $options: 'i',
            },
        }
        : {};

        console.log(keyword);

        this.query = this.query.find({...keyword});
        return this;
    }

    filter() {
        const queryCopy = {...this.queryStr}

        // Removing some fields for category
        const removeFields = ["keyword", "page", "limit"];

        removeFields.forEach((key) => delete queryCopy[key]);

        //Filter for price and rating

        let queryStr = JSON.stringify(queryCopy);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g,key => `$${key}`);
        
        this.query = this.query.find(JSON.parse(queryStr));

       

        return this;
    
}
}

module.exports = ApiFeatures;