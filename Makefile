public:
	npm run build:og
	bundle exec jekyll build

clean:
	rm -rf ./public

serve:
	bundle exec jekyll serve
