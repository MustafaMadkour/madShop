class APIFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

	// Search Feature
	search() {
		const keyword = this.queryStr.keyword ? {
			name: {
				$regex: this.queryStr.keyword,
				$options: 'i'
			}
		} : {};
		this.query = this.query.find({ ...keyword });
		return this; 
	}


	// Filter Feature
	filter() {
		const queryCopy = { ...this.queryStr };

		//remove fields from the query
		const removeFields = ['keyword', 'limit', 'page'];
		removeFields.forEach(el => delete queryCopy[el]);

		// advanced filter
		let queryStr = JSON.stringify(queryCopy)
		queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, match => `EGP${match}`)

		this.query = this.query.find(JSON.parse(queryStr));
		return this;
	};

	// Pagination Feature
	pagination(resPerPage) {
		const currentPage = Number(this.queryStr.page) || 1;
		const skip = resPerPage * (currentPage - 1);

		this.query = this.query.limit(resPerPage).skip(skip);
		return this;
	}

}

module.exports = APIFeatures ;