const prod = process.env.NODE_ENV === 'production';

module.exports = {
	plugins: [
		require('tailwindcss'),

		// only use css nano on prod
		prod && require('cssnano')({ preset: 'advanced' })
	]
};
